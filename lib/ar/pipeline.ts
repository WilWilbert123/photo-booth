/**
 * AR Pipeline Architecture
 * ─────────────────────────
 * Real-time AR effects powered by MediaPipe Face Mesh + Selfie Segmentation.
 *
 * Install dependencies:
 *   npm install @mediapipe/face_mesh @mediapipe/selfie_segmentation @mediapipe/camera_utils three
 *
 * This module provides:
 *   1. ARPipeline        — orchestrator, initialises all sub-pipelines
 *   2. SelfieSegmenter   — background removal / green screen
 *   3. SkinSmoother      — bilateral-filter beauty mode (Canvas 2D + WebGL)
 *   4. FaceAnchor        — Three.js scene anchored to facial landmarks
 *   5. FaceDistorter     — vertex-displacement shader for humor effects
 */

// ─── Type Stubs (replaced by @mediapipe types when installed) ─────────────────

export interface FaceLandmark { x: number; y: number; z: number; }
export interface SegmentationMask { width: number; height: number; data: Uint8ClampedArray; }

// ─── 1. Selfie Segmentation / Background Removal ─────────────────────────────

export interface SegmentationOptions {
  /** URL of the replacement background image */
  backgroundImageUrl?: string;
  /** Replace background with solid colour (e.g. '#00ff00') */
  backgroundColor?: string;
  /** Feather the mask edge by this many pixels */
  edgeFeather?: number;
}

export class SelfieSegmenter {
  private segmentation: unknown = null; // @mediapipe/selfie_segmentation instance
  private backgroundImage: HTMLImageElement | null = null;
  private offscreen: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;
  private options: SegmentationOptions;

  constructor(options: SegmentationOptions = {}) {
    this.options   = options;
    this.offscreen = document.createElement('canvas');
    this.offCtx    = this.offscreen.getContext('2d')!;
  }

  async init(): Promise<void> {
    // Dynamically import so the app doesn't crash without the package
    try {
      const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation' as never) as never;
      // @ts-expect-error dynamic import
      this.segmentation = new SelfieSegmentation({
        locateFile: (f: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${f}`,
      });
      // @ts-expect-error dynamic import
      this.segmentation.setOptions({ modelSelection: 1 });
      // @ts-expect-error dynamic import
      this.segmentation.onResults((r: { segmentationMask: HTMLCanvasElement; image: HTMLCanvasElement }) => {
        this._onResults(r);
      });
    } catch {
      console.warn('[SelfieSegmenter] @mediapipe/selfie_segmentation not installed. Segmentation disabled.');
    }

    if (this.options.backgroundImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.options.backgroundImageUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });
      this.backgroundImage = img;
    }
  }

  private _onResults(results: { segmentationMask: HTMLCanvasElement; image: HTMLCanvasElement }): void {
    const { width: w, height: h } = results.image;
    this.offscreen.width  = w;
    this.offscreen.height = h;

    // 1. Draw the segmentation mask as clip path
    this.offCtx.save();
    this.offCtx.clearRect(0, 0, w, h);
    this.offCtx.drawImage(results.segmentationMask, 0, 0, w, h);
    this.offCtx.globalCompositeOperation = 'source-in';
    this.offCtx.drawImage(results.image, 0, 0, w, h);

    // 2. Draw background behind the person
    this.offCtx.globalCompositeOperation = 'destination-over';
    if (this.backgroundImage) {
      this.offCtx.drawImage(this.backgroundImage, 0, 0, w, h);
    } else if (this.options.backgroundColor) {
      this.offCtx.fillStyle = this.options.backgroundColor;
      this.offCtx.fillRect(0, 0, w, h);
    }
    this.offCtx.restore();
  }

  /** Send a frame to the segmentation model */
  async send(source: HTMLVideoElement): Promise<void> {
    if (!this.segmentation) return;
    // @ts-expect-error dynamic import
    await this.segmentation.send({ image: source });
  }

  /** Get the composited (person + new background) canvas */
  get output(): HTMLCanvasElement { return this.offscreen; }
}

// ─── 2. Skin Smoother (Bilateral Filter) ─────────────────────────────────────

/**
 * Approximate bilateral filter via repeated box-blur passes on skin-tone pixels.
 * For real bilateral filtering, use the GLSL shader in programs.ts (MASTER_COLOR_GRADE_FRAG).
 */
export class SkinSmoother {
  private offscreen: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.offscreen = document.createElement('canvas');
    this.ctx       = this.offscreen.getContext('2d', { willReadFrequently: true })!;
  }

  /** Apply approximate skin smoothing via multi-pass blur on face region */
  process(source: CanvasImageSource, width: number, height: number, strength: number): HTMLCanvasElement {
    this.offscreen.width  = width;
    this.offscreen.height = height;

    // Draw source
    this.ctx.drawImage(source, 0, 0, width, height);

    // Apply CSS filter blur as a cheap bilateral approximation
    const blurPx = Math.round(strength * 4);
    if (blurPx > 0) {
      this.ctx.filter = `blur(${blurPx}px)`;
      this.ctx.drawImage(source, 0, 0, width, height);
      this.ctx.filter = 'none';
    }

    // Re-draw sharp detail layer on top at reduced opacity to preserve edges
    this.ctx.globalAlpha = 0.35;
    this.ctx.drawImage(source, 0, 0, width, height);
    this.ctx.globalAlpha = 1.0;

    return this.offscreen;
  }
}

// ─── 3. Face Distorter (Vertex Displacement) ─────────────────────────────────

export interface FaceDistortConfig {
  /** Magnify eyes — scale factor > 1 enlarges, < 1 shrinks */
  eyeScale?: number;
  /** Pinch/puff cheeks: -1=pinch, 0=none, +1=puff */
  cheekPinch?: number;
  /** Nose shrink factor 0-1 */
  noseShrink?: number;
}

export const FACE_DISTORT_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec2  u_resolution;

  // Landmark UV positions (updated each frame by JS)
  uniform vec2  u_leftEye;
  uniform vec2  u_rightEye;
  uniform vec2  u_noseTip;
  uniform vec2  u_leftCheek;
  uniform vec2  u_rightCheek;

  // Distortion strengths
  uniform float u_eyeScale;      // default 1.0
  uniform float u_cheekPinch;   // -1 to +1
  uniform float u_noseShrink;   // 0 to 1

  varying vec2 v_uv;

  vec2 magnify(vec2 uv, vec2 center, float radius, float scale) {
    vec2 delta = uv - center;
    float dist = length(delta);
    if (dist > radius) return uv;
    float t = dist / radius;
    float factor = mix(scale, 1.0, t * t);
    return center + delta / factor;
  }

  void main() {
    vec2 uv = v_uv;

    // Eye magnification
    float eyeR = 0.06;
    uv = magnify(uv, u_leftEye,  eyeR, u_eyeScale);
    uv = magnify(uv, u_rightEye, eyeR, u_eyeScale);

    // Cheek distortion
    float cheekR = 0.12;
    vec2 delta = uv - u_leftCheek;
    if (length(delta) < cheekR) {
      uv += normalize(delta) * u_cheekPinch * (cheekR - length(delta)) * 0.18;
    }
    delta = uv - u_rightCheek;
    if (length(delta) < cheekR) {
      uv += normalize(delta) * u_cheekPinch * (cheekR - length(delta)) * 0.18;
    }

    // Nose shrink
    vec2 noseDelta = uv - u_noseTip;
    float noseDist = length(noseDelta);
    if (noseDist < 0.05) {
      float t = 1.0 - noseDist / 0.05;
      uv += noseDelta * u_noseShrink * t * 0.4;
    }

    gl_FragColor = texture2D(u_texture, clamp(uv, 0.0, 1.0));
  }
`;

// ─── 4. Face Anchor (Three.js scene attached to facial landmarks) ──────────────

/**
 * Attaches a Three.js Object3D (glasses, hat, particles, etc.) to the face
 * by mapping MediaPipe Face Mesh landmarks to 3D space.
 *
 * Usage:
 *   const anchor = new FaceAnchorScene(renderer, camera, scene);
 *   anchor.attachObject3D(glassesModel, 'nose-bridge');
 *   // Each frame:
 *   anchor.updateLandmarks(faceLandmarks, videoWidth, videoHeight);
 *   renderer.render(scene, camera);
 */

export type AnchorPoint =
  | 'nose-bridge' | 'left-eye' | 'right-eye'
  | 'forehead' | 'chin' | 'left-ear' | 'right-ear';

// MediaPipe Face Mesh landmark indices for key anchor points
export const ANCHOR_LANDMARK_INDICES: Record<AnchorPoint, number> = {
  'nose-bridge':  6,
  'left-eye':    33,
  'right-eye':   263,
  'forehead':    10,
  'chin':        152,
  'left-ear':    234,
  'right-ear':   454,
};

export interface FaceAnchorScene {
  /** Call once on init with Three.js instances */
  attach(scene: object, camera: object, renderer: object): void;
  /** Register an Object3D to follow a specific anchor point */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachObject3D(object: any, anchor: AnchorPoint): void;
  /** Feed updated landmarks each frame */
  updateLandmarks(landmarks: FaceLandmark[], videoWidth: number, videoHeight: number): void;
  /** Render the Three.js overlay */
  render(): void;
}

export class FaceAnchorController implements FaceAnchorScene {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private three: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scene: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private camera: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderer: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private anchors: Map<AnchorPoint, any> = new Map();

  attach(scene: object, camera: object, renderer: object): void {
    this.scene    = scene;
    this.camera   = camera;
    this.renderer = renderer;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachObject3D(object: any, anchor: AnchorPoint): void {
    this.anchors.set(anchor, object);
    this.scene?.add(object);
  }

  updateLandmarks(landmarks: FaceLandmark[], videoWidth: number, videoHeight: number): void {
    if (!landmarks?.length) return;

    for (const [anchorPoint, object] of this.anchors.entries()) {
      const idx = ANCHOR_LANDMARK_INDICES[anchorPoint];
      const lm  = landmarks[idx];
      if (!lm || !object) continue;

      // Map normalized MediaPipe coords [0,1] → Three.js NDC [-1,1]
      const x = (lm.x - 0.5) * 2;
      const y = -(lm.y - 0.5) * 2;
      const z = -lm.z * 2;

      object.position.set(x, y, z);

      // Estimate head rotation from eye positions
      const leftEye  = landmarks[ANCHOR_LANDMARK_INDICES['left-eye']];
      const rightEye = landmarks[ANCHOR_LANDMARK_INDICES['right-eye']];
      if (leftEye && rightEye) {
        const dx = rightEye.x - leftEye.x;
        const dy = rightEye.y - leftEye.y;
        const roll = Math.atan2(dy, dx);
        const yaw  = (leftEye.x + rightEye.x) / 2 - 0.5;
        object.rotation.set(0, yaw * Math.PI * 0.5, roll);
      }
    }
  }

  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// ─── 5. ARPipeline Orchestrator ───────────────────────────────────────────────

export interface ARPipelineOptions {
  enableSegmentation?: boolean;
  enableSkinSmooth?: boolean;
  enableFaceAnchor?: boolean;
  enableFaceDistort?: boolean;
  segmentation?: SegmentationOptions;
  skinSmoothStrength?: number;
  faceDistort?: FaceDistortConfig;
}

export class ARPipeline {
  segmenter:   SelfieSegmenter;
  skinSmoother: SkinSmoother;
  faceAnchor:  FaceAnchorController;
  private opts: ARPipelineOptions;
  private _ready = false;

  constructor(options: ARPipelineOptions = {}) {
    this.opts         = options;
    this.segmenter    = new SelfieSegmenter(options.segmentation);
    this.skinSmoother = new SkinSmoother();
    this.faceAnchor   = new FaceAnchorController();
  }

  async init(): Promise<void> {
    if (this.opts.enableSegmentation) await this.segmenter.init();
    this._ready = true;
    console.info('[ARPipeline] Initialised. Active modules:', {
      segmentation: this.opts.enableSegmentation,
      skinSmooth:   this.opts.enableSkinSmooth,
      faceAnchor:   this.opts.enableFaceAnchor,
    });
  }

  get ready(): boolean { return this._ready; }

  /**
   * Process a single video frame through enabled AR modules.
   * Returns the output canvas to composite onto the main view.
   */
  processFrame(
    source: HTMLVideoElement,
    width: number,
    height: number
  ): HTMLCanvasElement | null {
    if (!this._ready) return null;

    let current: CanvasImageSource = source;
    let outputCanvas: HTMLCanvasElement | null = null;

    if (this.opts.enableSkinSmooth) {
      outputCanvas = this.skinSmoother.process(
        current, width, height, this.opts.skinSmoothStrength ?? 0.6
      );
      current = outputCanvas;
    }

    if (this.opts.enableSegmentation) {
      // Async — caller should await segmenter.send() separately
      outputCanvas = this.segmenter.output;
    }

    return outputCanvas;
  }
}
