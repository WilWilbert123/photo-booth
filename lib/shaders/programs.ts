// ─── Shared vertex shader ───────────────────────────────────────────────────
export const VERT = /* glsl */`
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying   vec2 v_uv;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = a_texCoord;
  }
`;

// ─── Master color-grading fragment shader ───────────────────────────────────
export const MASTER_COLOR_GRADE_FRAG = /* glsl */`
  precision mediump float;

  uniform sampler2D u_texture;
  uniform float     u_time;          // seconds (for animated grain)

  // ── Tonal adjustments ──
  uniform float u_brightness;        // -1 to +1
  uniform float u_contrast;          // 0..4,  1=normal
  uniform float u_saturation;        // 0..4,  1=normal
  uniform float u_temperature;       // -1=cool .. +1=warm
  uniform float u_tint;              // -1=green .. +1=magenta
  uniform float u_hue;               // degrees -180..180
  uniform float u_shadows;           // -1..+1
  uniform float u_highlights;        // -1..+1

  // ── Special looks ──
  uniform float u_sepia;             // 0..1
  uniform float u_fade;              // 0..1  (lifts blacks)
  uniform float u_vignette;          // 0..1
  uniform float u_vignette_warm;     // 0=black, 1=warm-brown
  uniform float u_grain;             // 0..1
  uniform float u_bloom;             // 0..1

  // ── Color overlay ──
  uniform float u_overlay_r;
  uniform float u_overlay_g;
  uniform float u_overlay_b;
  uniform float u_overlay_a;
  uniform float u_overlay_mode;     // 0=off,1=screen,2=multiply,3=soft-light

  varying vec2 v_uv;

  // ── Helpers ──────────────────────────────────────────────────────────────

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  vec3 adjustSaturation(vec3 c, float s) {
    float l = luma(c);
    return mix(vec3(l), c, s);
  }

  vec3 adjustContrast(vec3 c, float contrast) {
    return (c - 0.5) * contrast + 0.5;
  }

  vec3 adjustTemperature(vec3 c, float t) {
    // Warm = push red up, blue down; Cool = opposite
    c.r += t * 0.1;
    c.b -= t * 0.1;
    return c;
  }

  vec3 adjustTint(vec3 c, float tint) {
    c.g -= tint * 0.08;
    c.r += tint * 0.04;
    c.b += tint * 0.04;
    return c;
  }

  vec3 hueRotate(vec3 c, float deg) {
    float angle = deg * 3.14159265 / 180.0;
    float s = sin(angle), co = cos(angle);
    vec3 w = vec3(0.299, 0.587, 0.114);
    vec3 r;
    r.r = dot(c, vec3(co + (1.0-co)*w.r,        (1.0-co)*w.r - s*w.b,   (1.0-co)*w.r + s*w.g));
    r.g = dot(c, vec3((1.0-co)*w.g + s*w.b,     co + (1.0-co)*w.g,       (1.0-co)*w.g - s*w.r));
    r.b = dot(c, vec3((1.0-co)*w.b - s*w.g,     (1.0-co)*w.b + s*w.r,   co + (1.0-co)*w.b));
    return r;
  }

  vec3 toSepia(vec3 c, float mix_) {
    vec3 sepia = vec3(
      dot(c, vec3(0.393, 0.769, 0.189)),
      dot(c, vec3(0.349, 0.686, 0.168)),
      dot(c, vec3(0.272, 0.534, 0.131))
    );
    return mix(c, sepia, mix_);
  }

  vec3 adjustShadows(vec3 c, float sh) {
    float l = luma(c);
    float shadowMask = 1.0 - smoothstep(0.0, 0.5, l);
    return c + sh * shadowMask * 0.3;
  }

  vec3 adjustHighlights(vec3 c, float hl) {
    float l = luma(c);
    float hiMask = smoothstep(0.5, 1.0, l);
    return c + hl * hiMask * 0.3;
  }

  // Pseudo-random for grain
  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233)) + u_time * 0.1) * 43758.5453);
  }

  // Radial vignette
  float vignette(vec2 uv, float strength) {
    vec2 d = uv - 0.5;
    return 1.0 - smoothstep(0.35, 0.95, length(d) * 1.6) * strength;
  }

  // Bloom: sample 9-tap gaussian and additive blend above threshold
  vec3 bloom(sampler2D tex, vec2 uv, float str) {
    if (str < 0.01) return vec3(0.0);
    vec2 texelSize = vec2(0.004);
    vec3 acc = vec3(0.0);
    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        vec2 offset = vec2(float(x), float(y)) * texelSize;
        vec3 s = texture2D(tex, uv + offset).rgb;
        float lum = luma(s);
        acc += s * max(0.0, lum - 0.65);
      }
    }
    return (acc / 25.0) * str * 2.0;
  }

  // Blend modes
  vec3 blendScreen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
  }
  vec3 blendMultiply(vec3 base, vec3 blend) { return base * blend; }
  vec3 blendSoftLight(vec3 base, vec3 blend) {
    return mix(
      2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
      2.0 * base * (1.0 - blend) + sqrt(base) * (2.0 * blend - 1.0),
      step(0.5, blend)
    );
  }
  vec3 blendColorBurn(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) / max(blend, 0.001);
  }

  // ── Main ─────────────────────────────────────────────────────────────────

  void main() {
    vec4 texColor = texture2D(u_texture, v_uv);
    vec3 c = texColor.rgb;

    // 1. Brightness
    c += u_brightness;

    // 2. Temperature / Tint
    c = adjustTemperature(c, u_temperature);
    c = adjustTint(c, u_tint);

    // 3. Hue rotate
    if (abs(u_hue) > 0.5) c = hueRotate(c, u_hue);

    // 4. Saturation
    c = adjustSaturation(c, u_saturation);

    // 5. Contrast
    c = adjustContrast(c, u_contrast);

    // 6. Shadows / Highlights
    c = adjustShadows(c, u_shadows);
    c = adjustHighlights(c, u_highlights);

    // 7. Fade (lift blacks)
    c = mix(c, vec3(luma(c)) * 0.85 + 0.15, u_fade);

    // 8. Sepia
    c = toSepia(c, u_sepia);

    // 9. Color overlay
    if (u_overlay_a > 0.0) {
      vec3 ov = vec3(u_overlay_r, u_overlay_g, u_overlay_b);
      vec3 blended;
      if (u_overlay_mode < 1.5)       blended = blendScreen(c, ov);
      else if (u_overlay_mode < 2.5)  blended = blendMultiply(c, ov);
      else if (u_overlay_mode < 3.5)  blended = blendSoftLight(c, ov);
      else                            blended = blendColorBurn(c, ov);
      c = mix(c, blended, u_overlay_a);
    }

    // 10. Bloom
    c += bloom(u_texture, v_uv, u_bloom);

    // 11. Vignette
    if (u_vignette > 0.0) {
      float vig = vignette(v_uv, u_vignette);
      vec3 vigColor = mix(vec3(0.0), vec3(0.22, 0.12, 0.04), u_vignette_warm);
      c = mix(vigColor, c, vig);
    }

    // 12. Film grain
    if (u_grain > 0.0) {
      float g = (rand(v_uv) - 0.5) * u_grain * 0.18;
      c += g;
    }

    gl_FragColor = vec4(clamp(c, 0.0, 1.0), texColor.a);
  }
`;

// ─── Grain / Noise ──────────────────────────────────────────────────────────
export const GRAIN_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_strength;   // 0-1
  uniform float u_size;       // grain size in pixels (1-4)
  varying vec2 v_uv;

  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx + 19.19);
    return fract((p.x + p.y) * p.x);
  }

  void main() {
    vec4 c = texture2D(u_texture, v_uv);
    float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    // More grain in midtones, less in deep blacks/whites
    float grainMask = 4.0 * lum * (1.0 - lum);
    vec2 gUV = floor(v_uv * (1.0 / max(u_size * 0.004, 0.001))) * max(u_size * 0.004, 0.001);
    float g = (hash(gUV + u_time * 0.1) - 0.5) * u_strength * grainMask * 0.35;
    gl_FragColor = vec4(clamp(c.rgb + g, 0.0, 1.0), c.a);
  }
`;

// ─── Bloom / Halo / Soft Light ──────────────────────────────────────────────
export const BLOOM_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_threshold;  // luma threshold 0.5-0.9
  uniform float u_strength;   // 0-1
  uniform float u_radius;     // blur radius 0.002-0.02
  varying vec2 v_uv;

  vec3 gaussianBlur(sampler2D tex, vec2 uv, float r) {
    vec3 acc = vec3(0.0);
    float weight = 0.0;
    for (int x = -3; x <= 3; x++) {
      for (int y = -3; y <= 3; y++) {
        float w = exp(-float(x*x + y*y) * 0.5);
        acc += texture2D(tex, uv + vec2(float(x), float(y)) * r).rgb * w;
        weight += w;
      }
    }
    return acc / weight;
  }

  void main() {
    vec4 base = texture2D(u_texture, v_uv);
    vec3 blurred = gaussianBlur(u_texture, v_uv, u_radius);
    float lum = dot(blurred, vec3(0.299, 0.587, 0.114));
    vec3 bloomColor = blurred * max(0.0, lum - u_threshold) / (1.0 - u_threshold);
    vec3 result = base.rgb + bloomColor * u_strength * 2.0;
    gl_FragColor = vec4(clamp(result, 0.0, 1.0), base.a);
  }
`;

// ─── Color Leak ─────────────────────────────────────────────────────────────
export const COLOR_LEAK_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_strength;
  uniform float u_hue;        // leak hue 0-360
  varying vec2 v_uv;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec4 base = texture2D(u_texture, v_uv);
    // Radial gradient from top-left corner
    float dist = length(v_uv - vec2(0.0, 1.0));
    float leak = smoothstep(1.2, 0.0, dist) * u_strength;
    // Animated hue drift
    float h = mod(u_hue / 360.0 + u_time * 0.03, 1.0);
    vec3 leakColor = hsv2rgb(vec3(h, 0.85, 1.0));
    // Screen blend
    vec3 result = 1.0 - (1.0 - base.rgb) * (1.0 - leakColor * leak);
    gl_FragColor = vec4(result, base.a);
  }
`;

// ─── Zoom Blur (radial motion blur) ─────────────────────────────────────────
export const ZOOM_BLUR_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_strength;   // 0-1
  uniform vec2  u_center;     // 0.5,0.5 = image center
  varying vec2 v_uv;

  void main() {
    const int SAMPLES = 16;
    vec2 dir = v_uv - u_center;
    float len = length(dir);
    vec3 acc = vec3(0.0);
    float totalW = 0.0;
    for (int i = 0; i < SAMPLES; i++) {
      float t = float(i) / float(SAMPLES - 1);
      float scale = 1.0 - u_strength * 0.12 * t;
      vec2 sampleUV = u_center + dir * scale;
      sampleUV = clamp(sampleUV, 0.0, 1.0);
      float w = 1.0 - t * 0.5;
      acc += texture2D(u_texture, sampleUV).rgb * w;
      totalW += w;
    }
    gl_FragColor = vec4(acc / totalW, 1.0);
  }
`;

// ─── Handheld (Simplex-noise camera shake) ───────────────────────────────────
export const HANDHELD_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_strength;  // 0-1
  varying vec2 v_uv;

  // Value noise 2D
  float hash2(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p.yx + 19.19);
    return fract((p.x + p.y) * p.x);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash2(i), hash2(i + vec2(1,0)), f.x),
      mix(hash2(i + vec2(0,1)), hash2(i + vec2(1,1)), f.x),
      f.y
    );
  }

  void main() {
    float t = u_time * 2.5;
    float dx = (noise(vec2(t, 0.0)) - 0.5) * u_strength * 0.012;
    float dy = (noise(vec2(0.0, t)) - 0.5) * u_strength * 0.012;
    vec2 uv = clamp(v_uv + vec2(dx, dy), 0.0, 1.0);
    gl_FragColor = texture2D(u_texture, uv);
  }
`;

// ─── Wavy (sinusoidal UV warp) ───────────────────────────────────────────────
export const WAVY_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_strength;  // 0-1
  uniform float u_freq;      // wave frequency (4-16)
  uniform float u_speed;     // wave speed
  varying vec2 v_uv;

  void main() {
    float amp = u_strength * 0.025;
    float waveX = sin(v_uv.y * u_freq + u_time * u_speed) * amp;
    float waveY = sin(v_uv.x * u_freq + u_time * u_speed * 1.3) * amp;
    vec2 uv = clamp(v_uv + vec2(waveX, waveY), 0.0, 1.0);
    gl_FragColor = texture2D(u_texture, uv);
  }
`;

// ─── Fisheye / Wide Angle ────────────────────────────────────────────────────
export const FISHEYE_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_strength;  // 0-1, 0=normal, 1=full fisheye
  varying vec2 v_uv;

  void main() {
    vec2 p = v_uv * 2.0 - 1.0;
    float r = length(p);
    float barrel = mix(1.0, 1.0 + r * r * 0.4, u_strength);
    vec2 uv = (p / barrel) * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      gl_FragColor = texture2D(u_texture, uv);
    }
  }
`;

// ─── Lo-Res / Mosaic ─────────────────────────────────────────────────────────
export const LORES_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_pixelSize;  // 0.005 to 0.08 (relative to frame)
  varying vec2 v_uv;

  void main() {
    vec2 uv = floor(v_uv / u_pixelSize) * u_pixelSize + u_pixelSize * 0.5;
    gl_FragColor = texture2D(u_texture, uv);
  }
`;

// ─── Moire / Scanning Line Interference ──────────────────────────────────────
export const MOIRE_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_strength;  // 0-1
  uniform float u_freq;      // line frequency (100-400)
  uniform float u_speed;     // scroll speed
  varying vec2 v_uv;

  void main() {
    vec4 base = texture2D(u_texture, v_uv);
    // Primary scan lines
    float scan1 = sin(v_uv.y * u_freq + u_time * u_speed) * 0.5 + 0.5;
    // Secondary interference pattern (slightly different freq)
    float scan2 = sin(v_uv.y * u_freq * 1.07 - u_time * u_speed * 0.8) * 0.5 + 0.5;
    float moire = scan1 * scan2;
    float darkening = 1.0 - moire * u_strength * 0.35;
    gl_FragColor = vec4(base.rgb * darkening, base.a);
  }
`;

// ─── RGB / Prism Split ───────────────────────────────────────────────────────
export const RGB_SPLIT_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_strength;   // 0-1
  uniform float u_time;       // for animated drift
  uniform float u_animated;   // 0=static, 1=animated
  varying vec2 v_uv;

  void main() {
    float shift = u_strength * 0.022;
    // Optionally animate with time
    float wobble = mix(1.0, sin(u_time * 3.0) * 0.5 + 0.8, u_animated);
    float s = shift * wobble;

    float r = texture2D(u_texture, vec2(v_uv.x + s, v_uv.y)).r;
    float g = texture2D(u_texture, v_uv).g;
    float b = texture2D(u_texture, vec2(v_uv.x - s, v_uv.y)).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

// ─── VHS / Glitch ─────────────────────────────────────────────────────────────
export const VHS_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_strength;   // 0-1
  uniform float u_noise;      // colour noise amount 0-1
  varying vec2 v_uv;

  float rand(float n) { return fract(sin(n * 127.1 + u_time * 0.2) * 43758.5); }
  float rand2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }

  void main() {
    vec2 uv = v_uv;

    // Scanlines (every 2px)
    if (mod(gl_FragCoord.y, 3.0) < 1.0) {
      uv.x += (rand(uv.y) - 0.5) * u_strength * 0.003;
    }

    // Horizontal block tearing (random rows)
    float rowNoise = rand(floor(uv.y * 80.0 + u_time));
    if (rowNoise > 0.97) {
      uv.x += (rand(uv.y * 3.1 + u_time) - 0.5) * u_strength * 0.06;
    }

    uv = clamp(uv, 0.0, 1.0);

    // Chromatic colour drift
    float drift = u_strength * 0.008;
    float r = texture2D(u_texture, vec2(uv.x + drift, uv.y)).r;
    float g = texture2D(u_texture, uv).g;
    float b = texture2D(u_texture, vec2(uv.x - drift, uv.y)).b;
    vec3 col = vec3(r, g, b);

    // Scanline brightness flicker
    float scanline = 1.0 - step(0.5, mod(gl_FragCoord.y, 4.0) / 4.0) * 0.08 * u_strength;
    col *= scanline;

    // Colour noise
    float noise = (rand2(uv + u_time * 0.01) - 0.5) * u_noise * 0.08;
    col += noise;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;
