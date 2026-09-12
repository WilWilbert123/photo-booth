/**
 * Boomerang Engine
 * ────────────────
 * Records N frames from a video source, then plays them back in a ping-pong
 * loop. Supports Classic, SlowMo, Echo, and Duo variants.
 */

export type BoomerangVariant = 'classic' | 'slowmo' | 'echo' | 'duo';

export interface BoomerangOptions {
  /** Number of frames to capture (default 60 ≈ 2 seconds at 30fps) */
  frameCount?: number;
  /** Variant */
  variant?: BoomerangVariant;
  /** Width/height for capture canvas */
  width?: number;
  height?: number;
}

interface CapturedFrame {
  imageData: ImageData;
  timestamp: number;
}

export class BoomerangEngine {
  private frames: CapturedFrame[] = [];
  private captureCanvas: HTMLCanvasElement;
  private captureCtx: CanvasRenderingContext2D;
  private playCanvas: HTMLCanvasElement;
  private playCtx: CanvasRenderingContext2D;

  private _capturing = false;
  private _playing = false;
  private _rafId: number | null = null;

  // Playback state
  private _frameIndex = 0;
  private _direction: 1 | -1 = 1;
  private _variant: BoomerangVariant = 'classic';
  private _playSpeed = 1; // multiplier relative to capture rate
  private _lastPlayTime = 0;

  /** Target milliseconds between playback frames */
  private get frameInterval(): number {
    const base = 33; // ~30fps
    switch (this._variant) {
      case 'slowmo': return base * 2;   // half speed
      case 'duo':    return base * 0.6; // faster
      default:       return base;
    }
  }

  constructor(playCanvas: HTMLCanvasElement, options: BoomerangOptions = {}) {
    const w = options.width  ?? playCanvas.width  ?? 640;
    const h = options.height ?? playCanvas.height ?? 480;

    this.captureCanvas = document.createElement('canvas');
    this.captureCanvas.width  = w;
    this.captureCanvas.height = h;
    this.captureCtx = this.captureCanvas.getContext('2d', { willReadFrequently: true })!;

    this.playCanvas = playCanvas;
    this.playCanvas.width  = w;
    this.playCanvas.height = h;
    this.playCtx = playCanvas.getContext('2d')!;

    this._variant = options.variant ?? 'classic';
  }

  // ── Capture Phase ──────────────────────────────────────────────────────────

  /** Start recording frames from the given video element */
  startCapture(source: HTMLVideoElement, frameCount = 60): Promise<void> {
    return new Promise((resolve) => {
      this.frames = [];
      this._capturing = true;
      const w = this.captureCanvas.width;
      const h = this.captureCanvas.height;

      const captureFrame = () => {
        if (!this._capturing) { resolve(); return; }
        if (this.frames.length >= frameCount) {
          this._capturing = false;
          resolve();
          return;
        }
        this.captureCtx.drawImage(source, 0, 0, w, h);
        const imageData = this.captureCtx.getImageData(0, 0, w, h);
        this.frames.push({ imageData, timestamp: performance.now() });
        requestAnimationFrame(captureFrame);
      };

      requestAnimationFrame(captureFrame);
    });
  }

  stopCapture(): void {
    this._capturing = false;
  }

  get framesCaptured(): number { return this.frames.length; }

  // ── Playback Phase ─────────────────────────────────────────────────────────

  /** Start ping-pong playback loop */
  play(variant: BoomerangVariant = 'classic'): void {
    if (this.frames.length === 0) return;
    this._variant = variant;
    this._playing = true;
    this._frameIndex = 0;
    this._direction = 1;
    this._lastPlayTime = performance.now();
    this._scheduleFrame();
  }

  pause(): void {
    this._playing = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  stop(): void {
    this.pause();
    this.frames = [];
  }

  private _scheduleFrame(): void {
    if (!this._playing) return;
    this._rafId = requestAnimationFrame((now) => {
      const elapsed = now - this._lastPlayTime;
      if (elapsed >= this.frameInterval) {
        this._lastPlayTime = now;
        this._renderCurrentFrame(now);
        this._advanceIndex();
      }
      this._scheduleFrame();
    });
  }

  private _renderCurrentFrame(now: number): void {
    const frame = this.frames[this._frameIndex];
    if (!frame) return;

    const w = this.playCanvas.width;
    const h = this.playCanvas.height;

    if (this._variant === 'echo') {
      // Motion-blur ghost trail: blend current + previous frames
      this.playCtx.putImageData(frame.imageData, 0, 0);
      if (this._frameIndex > 0) {
        this.playCtx.globalAlpha = 0.35;
        const prev = this.frames[Math.max(0, this._frameIndex - 2)];
        if (prev) this.playCtx.putImageData(prev.imageData, 0, 0);
        this.playCtx.globalAlpha = 1.0;
      }
    } else if (this._variant === 'duo') {
      // Rhythmic glitch: on every 5th frame, draw a horizontal offset
      this.playCtx.putImageData(frame.imageData, 0, 0);
      if (this._frameIndex % 5 === 0) {
        const glitchAmt = (Math.random() - 0.5) * 8;
        this.playCtx.drawImage(this.playCanvas, glitchAmt, 0, w, h);
      }
    } else {
      this.playCtx.putImageData(frame.imageData, 0, 0);
    }
  }

  private _advanceIndex(): void {
    if (this.frames.length === 0) return;
    this._frameIndex += this._direction;

    const last = this.frames.length - 1;
    if (this._frameIndex >= last) {
      this._frameIndex = last;
      this._direction = -1; // reverse
    } else if (this._frameIndex <= 0) {
      this._frameIndex = 0;
      this._direction = 1;  // forward
    }
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  /**
   * Render all frames to a GIF-compatible ImageData sequence.
   * Returns blob URLs array; caller encodes with a GIF library.
   */
  getFrameDataURLs(variant: BoomerangVariant = 'classic', maxFrames = 30): string[] {
    const src = [...this.frames];
    // Build ping-pong sequence
    const pingPong = [...src, ...[...src].reverse()];
    const step = Math.max(1, Math.floor(pingPong.length / maxFrames));
    const urls: string[] = [];

    for (let i = 0; i < pingPong.length; i += step) {
      if (urls.length >= maxFrames) break;
      this.captureCtx.putImageData(pingPong[i].imageData, 0, 0);
      urls.push(this.captureCanvas.toDataURL('image/jpeg', 0.8));
    }

    return urls;
  }
}
