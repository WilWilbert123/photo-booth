import { EFFECTS_REGISTRY } from './registry';

export class EffectEngine {
  // Offscreen canvases reused across frames to avoid GC pressure
  private _offA: HTMLCanvasElement | null = null;
  private _offB: HTMLCanvasElement | null = null;

  private getOffCanvas(w: number, h: number, slot: 'A' | 'B'): HTMLCanvasElement {
    const key = slot === 'A' ? '_offA' : '_offB';
    let c = this[key] as HTMLCanvasElement | null;
    if (!c || c.width !== w || c.height !== h) {
      c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      (this as Record<string, unknown>)[key] = c;
    }
    return c;
  }

  public renderToCanvas(
    sourceVideo: CanvasImageSource,
    targetCanvas: HTMLCanvasElement,
    effectId: string,
    strength: number = 100,
    isMirrored: boolean = true
  ): void {
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const effect = EFFECTS_REGISTRY.find((e) => e.id === effectId) || EFFECTS_REGISTRY[0];
    const width = targetCanvas.width;
    const height = targetCanvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Mirror transform
    if (isMirrored) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    // --- Render base frame ---
    if (effect.overlayType === 'portrait-blur') {
      ctx.restore();
      this.drawPortraitBlur(ctx, sourceVideo as HTMLVideoElement, width, height, strength, isMirrored);
      return;
    }

    if (effect.glShader === 'pixelate') {
      const pSize = Math.max(4, Math.round(24 * (strength / 100)));
      const w = Math.max(1, Math.ceil(width / pSize));
      const h = Math.max(1, Math.ceil(height / pSize));
      const off = this.getOffCanvas(w, h, 'A');
      const oCtx = off.getContext('2d')!;
      oCtx.save();
      if (isMirrored) { oCtx.translate(w, 0); oCtx.scale(-1, 1); }
      if (effect.cssFilter && effect.cssFilter !== 'none') {
        oCtx.filter = this.scaleFilter(effect.cssFilter, strength);
      }
      oCtx.drawImage(sourceVideo, 0, 0, w, h);
      oCtx.restore();
      
      // Draw pixelated to main canvas
      // Must draw without mirrored transform since offscreen is already mirrored
      ctx.restore(); 
      ctx.save(); // Save again to keep parity with later restore
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, w, h, 0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
    } else if (effect.cssFilter && effect.cssFilter !== 'none') {
      ctx.filter = this.scaleFilter(effect.cssFilter, strength);
      ctx.drawImage(sourceVideo, 0, 0, width, height);
      ctx.filter = 'none';
    } else if (effect.glShader === 'rgbShift') {
      ctx.drawImage(sourceVideo, 0, 0, width, height);
      ctx.restore();
      this.applyRgbShift(ctx, targetCanvas, width, height, strength);
      return;
    } else {
      ctx.drawImage(sourceVideo, 0, 0, width, height);
    }

    ctx.restore();

    // --- Overlays applied after restore (no mirror skew on overlays) ---
    const ov = effect.overlayType as string | undefined;
    if (ov && ov !== 'portrait-blur') {
      this.drawOverlay(ctx, sourceVideo as HTMLVideoElement, targetCanvas, width, height, effect.overlayType!, strength, isMirrored);
    }

    // --- Pixel-level LUT color grades ---
    if (effect.pixelGrade) {
      this.applyPixelGrade(ctx, targetCanvas, width, height, effect.pixelGrade, strength);
    }

    // --- Scanlines for CRT / VHS ---
    if (effect.glShader === 'scanlines') {
      this.drawScanlines(ctx, width, height, strength);
    }
  }

  // ---- CSS filter strength interpolation ----
  private scaleFilter(cssFilter: string, strength: number): string {
    if (strength >= 100) return cssFilter;
    const t = strength / 100;
    // Mix toward identity at lower strengths
    return `opacity(${0.15 + 0.85 * t}) ${cssFilter}`;
  }

  // ---- RGB Chromatic Aberration ----
  private applyRgbShift(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    strength: number
  ): void {
    const shift = Math.max(1, Math.round(8 * (strength / 100)));
    const imgData = ctx.getImageData(0, 0, width, height);
    const src = new Uint8ClampedArray(imgData.data);
    const dst = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        // Red channel: shift right
        const rX = Math.min(width - 1, x + shift);
        const ri = (y * width + rX) * 4;
        // Blue channel: shift left
        const bX = Math.max(0, x - shift);
        const bi = (y * width + bX) * 4;

        dst[i]     = src[ri];       // R from right
        dst[i + 1] = src[i + 1];   // G stays
        dst[i + 2] = src[bi + 2];  // B from left
        dst[i + 3] = src[i + 3];
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ---- Portrait / Bokeh Blur ----
  private drawPortraitBlur(
    ctx: CanvasRenderingContext2D,
    sourceVideo: HTMLVideoElement,
    width: number,
    height: number,
    strength: number,
    isMirrored: boolean
  ): void {
    const blurPx = Math.max(4, Math.round(18 * (strength / 100)));

    // Layer 1 – blurred background
    const bgCanvas = this.getOffCanvas(width, height, 'A');
    const bgCtx = bgCanvas.getContext('2d')!;
    bgCtx.save();
    if (isMirrored) { bgCtx.translate(width, 0); bgCtx.scale(-1, 1); }
    bgCtx.filter = `blur(${blurPx}px) brightness(0.93) saturate(1.2) contrast(1.05)`;
    bgCtx.drawImage(sourceVideo, 0, 0, width, height);
    bgCtx.restore();
    ctx.drawImage(bgCanvas, 0, 0);

    // Layer 2 – sharp center with feathered oval mask
    const fgCanvas = this.getOffCanvas(width, height, 'B');
    const fgCtx = fgCanvas.getContext('2d')!;
    fgCtx.clearRect(0, 0, width, height);
    fgCtx.save();
    if (isMirrored) { fgCtx.translate(width, 0); fgCtx.scale(-1, 1); }
    fgCtx.filter = 'contrast(1.05) brightness(1.03) saturate(1.08)';
    fgCtx.drawImage(sourceVideo, 0, 0, width, height);
    fgCtx.restore();

    // Feathered oval gradient mask (destination-in)
    fgCtx.globalCompositeOperation = 'destination-in';
    const cx = width / 2;
    const cy = height * 0.42;
    const rx = width * 0.32;
    const ry = height * 0.38;
    // The gradient must be created at (0,0) since we will translate and scale the context
    const grad = fgCtx.createRadialGradient(0, 0, 0, 0, 0, 1);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.92)');
    grad.addColorStop(0.82, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    fgCtx.save();
    fgCtx.translate(cx, cy);
    fgCtx.scale(rx, ry);
    fgCtx.fillStyle = grad;
    fgCtx.beginPath();
    fgCtx.arc(0, 0, 1, 0, Math.PI * 2);
    fgCtx.fill();
    fgCtx.restore();

    fgCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(fgCanvas, 0, 0);
  }

  // ---- Scanlines for VHS/CRT ----
  private drawScanlines(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    strength: number
  ): void {
    const a = 0.18 * (strength / 100);
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1.5);
    }
    // Slight horizontal noise bands for VHS look
    const bands = Math.floor(3 * (strength / 100));
    ctx.fillStyle = `rgba(255,255,255,${0.04 * (strength / 100)})`;
    for (let b = 0; b < bands; b++) {
      const ry = Math.floor(Math.random() * height);
      ctx.fillRect(0, ry, width, 1);
    }
  }

  // ---- Pixel-level color grade (LUT-style) ----
  private applyPixelGrade(
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
    width: number,
    height: number,
    grade: string,
    strength: number
  ): void {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const t = strength / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      switch (grade) {
        case 'clarendon': {
          // Lift shadows blue, boost contrast & saturation
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const shadowMask = Math.max(0, 1 - lum / 128);
          r = lerp(r, clamp(r * 1.08), t);
          g = lerp(g, clamp(g * 1.05), t);
          b = lerp(b, clamp(b * 1.12 + shadowMask * 18), t);
          break;
        }
        case 'valencia': {
          // Warm amber overlay + faded blacks
          r = lerp(r, clamp(r * 1.06 + 14), t);
          g = lerp(g, clamp(g * 1.02 + 4), t);
          b = lerp(b, clamp(b * 0.9 - 6), t);
          // Fade blacks (lift shadows)
          r = lerp(r, Math.max(r, 30), t * 0.6);
          g = lerp(g, Math.max(g, 22), t * 0.6);
          b = lerp(b, Math.max(b, 18), t * 0.6);
          break;
        }
        case 'paris': {
          // Pastel, reduce contrast, slight pink push
          r = lerp(r, clamp(r * 0.96 + 12), t);
          g = lerp(g, clamp(g * 0.97 + 6), t);
          b = lerp(b, clamp(b * 0.94 + 10), t);
          break;
        }
        case 'film35mm': {
          // Silver halide: slightly desaturated midtones, grain handled separately
          const avg = (r + g + b) / 3;
          r = lerp(r, clamp(lerp(avg, r, 0.88) + 4), t);
          g = lerp(g, clamp(lerp(avg, g, 0.9) + 2), t);
          b = lerp(b, clamp(lerp(avg, b, 0.85) - 2), t);
          break;
        }
        case 'polaroid': {
          // Faded, slightly green shadows, warm highlights
          const lum2 = 0.299 * r + 0.587 * g + 0.114 * b;
          const hi = lum2 / 255;
          r = lerp(r, clamp(r + hi * 10 + 8), t);
          g = lerp(g, clamp(g + 6), t);
          b = lerp(b, clamp(b * 0.88 + 4), t);
          break;
        }
        case 'vhs': {
          // Slightly green tint + noise
          r = lerp(r, clamp(r * 0.95), t);
          g = lerp(g, clamp(g * 1.04), t);
          b = lerp(b, clamp(b * 0.92), t);
          break;
        }
        case 'golden': {
          // Warm amber push
          r = lerp(r, clamp(r * 1.08 + 12), t);
          g = lerp(g, clamp(g * 1.02 + 4), t);
          b = lerp(b, clamp(b * 0.88 - 8), t);
          break;
        }
        case 'cyberpunk': {
          // Cyan-magenta split
          r = lerp(r, clamp(r * 1.15 + 10), t);
          g = lerp(g, clamp(g * 0.8), t);
          b = lerp(b, clamp(b * 1.2 + 20), t);
          break;
        }
        case 'cinematic': {
          // Teal shadows, orange highlights (Hollywood LUT)
          const lum3 = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const shadow = Math.max(0, 1 - lum3 * 2);
          const highlight = Math.max(0, lum3 * 2 - 1);
          r = lerp(r, clamp(r - shadow * 10 + highlight * 18), t);
          g = lerp(g, clamp(g * 0.95), t);
          b = lerp(b, clamp(b + shadow * 22 - highlight * 12), t);
          break;
        }
        case 'noir': {
          // True desaturation then contrast push
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          const contrast = clamp((gray - 128) * 1.35 + 128);
          r = lerp(r, contrast, t);
          g = lerp(g, contrast, t);
          b = lerp(b, contrast, t);
          break;
        }
        case 'korean-glow': {
          // Airy pastel: soft highlights, desat midtones
          r = lerp(r, clamp(r * 1.04 + 10), t);
          g = lerp(g, clamp(g * 1.02 + 6), t);
          b = lerp(b, clamp(b * 1.06 + 14), t);
          break;
        }
        case 'tokyo': {
          // Monochrome with slightly warm channel weighting
          const grayT = Math.round(0.35 * r + 0.5 * g + 0.15 * b);
          const cT = clamp((grayT - 128) * 1.3 + 128);
          r = lerp(r, clamp(cT + 2), t);
          g = lerp(g, cT, t);
          b = lerp(b, clamp(cT - 4), t);
          break;
        }
        case 'cartoon': {
          // Posterize / Quantize colours + boost contrast
          const levels = 6 - 3 * t; // Quantize to fewer levels as strength increases
          const factor = 255 / levels;
          r = Math.round(r / factor) * factor;
          g = Math.round(g / factor) * factor;
          b = Math.round(b / factor) * factor;
          
          // Boost saturation
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          r = clamp(lerp(lum, r, 1.2 + 0.8 * t));
          g = clamp(lerp(lum, g, 1.2 + 0.8 * t));
          b = clamp(lerp(lum, b, 1.2 + 0.8 * t));
          break;
        }
      }

      data[i] = Math.round(r);
      data[i + 1] = Math.round(g);
      data[i + 2] = Math.round(b);
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // ---- All overlay effects ----
  private drawOverlay(
    ctx: CanvasRenderingContext2D,
    sourceVideo: HTMLVideoElement | null,
    targetCanvas: HTMLCanvasElement,
    width: number,
    height: number,
    overlayType: string,
    strength: number,
    isMirrored: boolean
  ): void {
    const a = strength / 100;

    switch (overlayType) {
      case 'real-vintage':
        this.overlayRealVintage(ctx, width, height, a);
        break;
      case 'beauty-smooth':
        this.overlayBeautySmooth(ctx, sourceVideo, width, height, a, isMirrored);
        break;
      case 'vignette':
        this.overlayVignette(ctx, width, height, a, 0.55);
        break;
      case 'vignette-heavy':
        this.overlayVignette(ctx, width, height, a, 0.82);
        break;
      case 'light-leak':
        this.overlayLightLeak(ctx, width, height, a);
        break;
      case 'scanlines':
        this.drawScanlines(ctx, width, height, strength);
        break;
      case 'grain':
        this.overlayFilmGrain(ctx, targetCanvas, width, height, a, 'mono');
        break;
      case 'dust':
        this.overlayDust(ctx, width, height, a);
        break;
    }
  }

  // ---- Authentic vintage: sepia-tint pixel pass + vignette + warm leak + grain ----
  private overlayRealVintage(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    alpha: number
  ): void {
    // 1. Deep warm vignette with brown shadows
    const vig = ctx.createRadialGradient(
      width / 2, height * 0.52, Math.min(width, height) * 0.22,
      width / 2, height * 0.52, Math.max(width, height) * 0.78
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.6, `rgba(28, 14, 4, ${0.38 * alpha})`);
    vig.addColorStop(1, `rgba(8, 3, 0, ${0.82 * alpha})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    // 2. Warm amber overlay (multiplicative-style)
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(255, 215, 130, ${0.18 * alpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    // 3. Sun flare top-left corner leak
    const leak1 = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.55);
    leak1.addColorStop(0, `rgba(255, 180, 60, ${0.55 * alpha})`);
    leak1.addColorStop(0.35, `rgba(255, 130, 30, ${0.25 * alpha})`);
    leak1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leak1;
    ctx.fillRect(0, 0, width, height);

    // 4. Secondary leak — bottom-right (film over-exposure edge)
    const leak2 = ctx.createRadialGradient(width, height, 0, width, height, width * 0.4);
    leak2.addColorStop(0, `rgba(255, 160, 80, ${0.22 * alpha})`);
    leak2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leak2;
    ctx.fillRect(0, 0, width, height);

    // 5. Authentic silver grain (luminance sensitive)
    this.overlayFilmGrain(ctx, null, width, height, alpha * 0.9, 'warm');

    // 6. Horizontal scratch lines (rare)
    if (Math.random() < 0.15 * alpha) {
      const sy = Math.random() * height;
      ctx.strokeStyle = `rgba(255, 240, 200, ${0.25 * alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }
  }

  // ---- Beauty smooth overlay ----
  private overlayBeautySmooth(
    ctx: CanvasRenderingContext2D,
    sourceVideo: HTMLVideoElement | null,
    width: number,
    height: number,
    alpha: number,
    isMirrored: boolean
  ): void {
    if (!sourceVideo) return;
    const soft = this.getOffCanvas(width, height, 'A');
    const sCtx = soft.getContext('2d')!;
    sCtx.clearRect(0, 0, width, height);
    sCtx.save();
    if (isMirrored) { sCtx.translate(width, 0); sCtx.scale(-1, 1); }
    sCtx.filter = `blur(6px) brightness(1.07) contrast(0.9) saturate(1.1)`;
    sCtx.drawImage(sourceVideo, 0, 0, width, height);
    sCtx.restore();

    // Soft-light blend for luminous skin effect
    ctx.globalAlpha = 0.5 * alpha;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(soft, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // Subtle highlight bloom
    const bloom = ctx.createRadialGradient(width / 2, height * 0.35, 0, width / 2, height * 0.35, width * 0.45);
    bloom.addColorStop(0, `rgba(255,245,240, ${0.12 * alpha})`);
    bloom.addColorStop(1, 'rgba(255,245,240,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, width, height);
  }

  // ---- Radial vignette ----
  private overlayVignette(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    alpha: number,
    intensity: number
  ): void {
    const g = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.28,
      width / 2, height / 2, Math.max(width, height) * 0.78
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.55, `rgba(0,0,0,${intensity * 0.4 * alpha})`);
    g.addColorStop(1, `rgba(0,0,0,${intensity * alpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  // ---- Light leak ----
  private overlayLightLeak(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    alpha: number
  ): void {
    const leak = ctx.createLinearGradient(0, 0, width * 0.75, height * 0.6);
    leak.addColorStop(0, `rgba(255, 110, 40, ${0.48 * alpha})`);
    leak.addColorStop(0.18, `rgba(255, 185, 70, ${0.3 * alpha})`);
    leak.addColorStop(0.5, `rgba(255, 220, 120, ${0.12 * alpha})`);
    leak.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, width, height);

    // Secondary orange streak from edge
    const streak = ctx.createLinearGradient(width, height * 0.7, width * 0.6, height);
    streak.addColorStop(0, `rgba(255, 80, 0, ${0.22 * alpha})`);
    streak.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = streak;
    ctx.fillRect(0, 0, width, height);
  }

  // ---- Authentic film grain (luminance-sensitive) ----
  private overlayFilmGrain(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement | null,
    width: number,
    height: number,
    alpha: number,
    mode: 'mono' | 'warm'
  ): void {
    // Sample luminance to drive grain intensity (brighter = less grain visible)
    // We use fixed grain particles for performance
    const count = Math.round(3500 * alpha);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.8 + 0.4;
      const luma = Math.random(); // simplified
      const opacity = (0.06 + 0.1 * (1 - luma)) * alpha;

      if (mode === 'warm') {
        // Warm grain (sepia-tinted)
        const warm = Math.random() > 0.5;
        ctx.fillStyle = warm
          ? `rgba(240, 220, 170, ${opacity})`
          : `rgba(60, 40, 20, ${opacity * 0.6})`;
      } else {
        ctx.fillStyle = Math.random() > 0.5
          ? `rgba(255,255,255,${opacity})`
          : `rgba(0,0,0,${opacity * 0.8})`;
      }
      ctx.fillRect(x, y, size, size);
    }
  }

  // ---- Dust & scratches ----
  private overlayDust(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    alpha: number
  ): void {
    // Fine dust specks
    ctx.fillStyle = `rgba(230,230,230,${0.7 * alpha})`;
    const count = Math.round(60 * alpha);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 1.2 + 0.3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hair scratches
    if (Math.random() < 0.3 * alpha) {
      ctx.strokeStyle = `rgba(200,200,200,${0.4 * alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      const sx = Math.random() * width;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, height);
      ctx.stroke();
    }
  }
}

// ---- Helpers ----
function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const effectEngine = new EffectEngine();
