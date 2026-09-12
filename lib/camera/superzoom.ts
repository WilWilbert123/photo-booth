/**
 * Superzoom Animation Controller
 * ────────────────────────────────
 * Automates a keyframe zoom animation on a canvas with various visual modes:
 *   Bounce, Fire, Beats, TV Dramatic
 */

export type SuperzoomMode = 'bounce' | 'fire' | 'beats' | 'tv-dramatic';

export interface SuperzoomOptions {
  mode?: SuperzoomMode;
  /** Total duration in milliseconds (default 1500) */
  durationMs?: number;
  /** Max zoom scale (default 2.5) */
  maxScale?: number;
}

interface Keyframe {
  time: number;  // 0-1 normalized
  scale: number;
  offsetX: number;
  offsetY: number;
}

// ── Easing functions ────────────────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1)       return n1 * t * t;
  else if (t < 2 / d1)  return n1 * (t -= 1.5 / d1) * t + 0.75;
  else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

function pulseEasing(t: number, beats: number): number {
  const beat = Math.floor(t * beats);
  const beatT = (t * beats) - beat;
  return beat / beats + easeOutBounce(beatT) / beats;
}

// ── Mode keyframe generators ─────────────────────────────────────────────────

function bounceKeyframes(maxScale: number): Keyframe[] {
  return [
    { time: 0,    scale: 1,        offsetX: 0, offsetY: 0 },
    { time: 0.5,  scale: maxScale, offsetX: 0, offsetY: 0 },
    { time: 0.75, scale: maxScale * 0.9, offsetX: -0.02, offsetY: 0.02 },
    { time: 1,    scale: maxScale, offsetX: 0, offsetY: 0 },
  ];
}

function beatsKeyframes(maxScale: number): Keyframe[] {
  const frames: Keyframe[] = [{ time: 0, scale: 1, offsetX: 0, offsetY: 0 }];
  const steps = 4;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const pulse = 1 + (maxScale - 1) * (i / steps);
    frames.push({ time: t - 0.01, scale: pulse * 1.05, offsetX: 0, offsetY: 0 });
    frames.push({ time: t,        scale: pulse,         offsetX: 0, offsetY: 0 });
  }
  return frames;
}

function tvDramaticKeyframes(maxScale: number): Keyframe[] {
  return [
    { time: 0,    scale: 1,        offsetX: 0,    offsetY: 0 },
    { time: 0.3,  scale: 1.3,      offsetX: 0,    offsetY: 0 },
    { time: 0.6,  scale: 1.8,      offsetX: 0.04, offsetY: -0.04 },
    { time: 0.85, scale: maxScale * 0.95, offsetX: 0, offsetY: 0 },
    { time: 1,    scale: maxScale, offsetX: 0,    offsetY: 0 },
  ];
}

// ── Interpolation ─────────────────────────────────────────────────────────────

function interpolateKeyframes(keyframes: Keyframe[], t: number): Keyframe {
  if (t <= keyframes[0].time) return { ...keyframes[0] };
  if (t >= keyframes[keyframes.length - 1].time) return { ...keyframes[keyframes.length - 1] };

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i], b = keyframes[i + 1];
    if (t >= a.time && t <= b.time) {
      const local = (t - a.time) / (b.time - a.time);
      const e = easeOutCubic(local);
      return {
        time: t,
        scale:   a.scale   + (b.scale   - a.scale)   * e,
        offsetX: a.offsetX + (b.offsetX - a.offsetX) * e,
        offsetY: a.offsetY + (b.offsetY - a.offsetY) * e,
      };
    }
  }
  return keyframes[keyframes.length - 1];
}

// ── Controller ────────────────────────────────────────────────────────────────

export class SuperzoomController {
  private source: HTMLVideoElement;
  private target: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: SuperzoomMode;
  private durationMs: number;
  private maxScale: number;
  private _rafId: number | null = null;
  private _startTime: number | null = null;
  private _keyframes: Keyframe[] = [];
  private _done = false;

  onComplete?: () => void;

  constructor(source: HTMLVideoElement, target: HTMLCanvasElement, opts: SuperzoomOptions = {}) {
    this.source    = source;
    this.target    = target;
    this.ctx       = target.getContext('2d')!;
    this.mode      = opts.mode      ?? 'bounce';
    this.durationMs = opts.durationMs ?? 1500;
    this.maxScale  = opts.maxScale  ?? 2.5;
  }

  start(): void {
    this._done = false;
    switch (this.mode) {
      case 'bounce':       this._keyframes = bounceKeyframes(this.maxScale);     break;
      case 'beats':        this._keyframes = beatsKeyframes(this.maxScale);      break;
      case 'tv-dramatic':  this._keyframes = tvDramaticKeyframes(this.maxScale); break;
      default:             this._keyframes = bounceKeyframes(this.maxScale);
    }
    this._startTime = null;
    this._tick(performance.now());
  }

  stop(): void {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  private _tick(now: number): void {
    if (this._done) return;
    if (this._startTime === null) this._startTime = now;

    const elapsed = now - this._startTime;
    const t = Math.min(elapsed / this.durationMs, 1);

    const kf = interpolateKeyframes(this._keyframes, t);
    this._drawFrame(kf);

    if (t < 1) {
      this._rafId = requestAnimationFrame((ts) => this._tick(ts));
    } else {
      this._done = true;
      this.onComplete?.();
    }
  }

  private _drawFrame(kf: Keyframe): void {
    const w = this.target.width;
    const h = this.target.height;
    const s = kf.scale;

    // Optionally add a scanline overlay for TV Dramatic
    const addScanlines = this.mode === 'tv-dramatic';

    this.ctx.save();
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.translate(w / 2 + kf.offsetX * w, h / 2 + kf.offsetY * h);
    this.ctx.scale(s, s);
    this.ctx.drawImage(this.source, -w / 2, -h / 2, w, h);
    this.ctx.restore();

    if (addScanlines) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let y = 0; y < h; y += 4) {
        this.ctx.fillRect(0, y, w, 2);
      }
    }

    // Fire mode: add a warm gradient at bottom
    if (this.mode === 'fire') {
      const grad = this.ctx.createLinearGradient(0, h * 0.6, 0, h);
      grad.addColorStop(0, 'rgba(255, 80, 0, 0)');
      grad.addColorStop(1, 'rgba(255, 30, 0, 0.35)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    }
  }
}
