/** Normalized 4×5 color matrix (row-major).
 *  Each row: [c_R, c_G, c_B, c_A, offset]  — values in 0-1 normalized space.
 *  R' = m[0]*R + m[1]*G + m[2]*B + m[3]*A + m[4]
 *  G' = m[5]*R + m[6]*G + m[7]*B + m[8]*A + m[9]
 *  B' = m[10]*R+ m[11]*G+ m[12]*B+ m[13]*A+ m[14]
 *  A' = m[15]*R+ m[16]*G+ m[17]*B+ m[18]*A+ m[19]
 */
export type ColorMatrix = readonly [
  number, number, number, number, number,
  number, number, number, number, number,
  number, number, number, number, number,
  number, number, number, number, number,
];

export const IDENTITY_MATRIX: ColorMatrix = [
  1,0,0,0,0,
  0,1,0,0,0,
  0,0,1,0,0,
  0,0,0,1,0,
];

export type FilterCategory =
  | 'everyday'
  | 'warm'
  | 'vintage'
  | 'moody'
  | 'monochrome'
  | 'beauty'
  | 'lens'
  | 'video'
  | 'ar';

/** Uniform values fed into the master GLSL color-grading shader */
export interface GLSLUniforms {
  /** Multiplicative saturation: 0=grey, 1=normal, >1=vivid */
  u_saturation: number;
  /** Contrast pivot at 0.5: 0=flat, 1=normal, 2=harsh */
  u_contrast: number;
  /** Additive brightness: -1 to +1, 0=normal */
  u_brightness: number;
  /** Color temperature: -1=cool-blue, 0=neutral, +1=warm-amber */
  u_temperature: number;
  /** Tint axis: -1=green, 0=neutral, +1=magenta */
  u_tint: number;
  /** Hue rotation in degrees */
  u_hue: number;
  /** Shadow lift (positive) or crush (negative): -1 to +1 */
  u_shadows: number;
  /** Highlight roll-off: -1=crush, 0=normal, +1=boost */
  u_highlights: number;
  /** Sepia mix 0-1 */
  u_sepia: number;
  /** Black-lift / fade amount 0-1 */
  u_fade: number;
  /** Vignette strength 0-1 */
  u_vignette: number;
  /** Vignette color: 0=black, 1=warm-brown */
  u_vignette_warm: number;
  /** Grain amount 0-1 */
  u_grain: number;
  /** Bloom/glow intensity 0-1 */
  u_bloom: number;
  /** Overlay RGBA tint */
  u_overlay_r: number;
  u_overlay_g: number;
  u_overlay_b: number;
  u_overlay_a: number;
  /** Blend mode index: 0=none,1=screen,2=multiply,3=soft-light,4=color-burn */
  u_overlay_mode: number;
}

export const DEFAULT_UNIFORMS: GLSLUniforms = {
  u_saturation: 1, u_contrast: 1, u_brightness: 0,
  u_temperature: 0, u_tint: 0, u_hue: 0,
  u_shadows: 0, u_highlights: 0, u_sepia: 0,
  u_fade: 0, u_vignette: 0, u_vignette_warm: 0,
  u_grain: 0, u_bloom: 0,
  u_overlay_r: 0, u_overlay_g: 0, u_overlay_b: 0, u_overlay_a: 0,
  u_overlay_mode: 0,
};

export interface FilterPreset {
  readonly id: string;
  readonly displayName: string;
  readonly category: FilterCategory;
  readonly cssFilter: string;
  readonly uniforms: Partial<GLSLUniforms>;
  readonly colorMatrix?: ColorMatrix;
  readonly thumbnailTint: string;
}

export interface VideoEffectPreset {
  readonly id: string;
  readonly displayName: string;
  readonly category: 'video';
  readonly fragmentShader: string;
  readonly uniformDefaults: Record<string, number | number[]>;
  readonly animated: boolean;
}
