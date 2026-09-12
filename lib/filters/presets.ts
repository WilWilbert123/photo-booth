import { FilterPreset } from '@/types/filter';

/**
 * Complete Instagram-accurate filter preset dictionary.
 * Each preset provides three rendering paths:
 *  1. cssFilter  — fast GPU CSS path (WebKit/Blink)
 *  2. uniforms   — values for the master GLSL color-grading shader
 *  3. colorMatrix— 4×5 matrix for Canvas-2D pixel fallback
 */
export const FILTER_PRESETS: Record<string, FilterPreset> = {

  // ─── Normal ───────────────────────────────────────────────────────────────
  normal: {
    id: 'normal', displayName: 'Normal', category: 'everyday',
    cssFilter: 'none',
    uniforms: {},
    thumbnailTint: '#888888',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  EVERYDAY & MODERN
  // ═══════════════════════════════════════════════════════════════════════════

  clarendon: {
    id: 'clarendon', displayName: 'Clarendon', category: 'everyday',
    cssFilter: 'contrast(1.2) saturate(1.35) brightness(1.1)',
    uniforms: { u_contrast: 1.2, u_saturation: 1.35, u_brightness: 0.08, u_temperature: -0.08, u_shadows: -0.08, u_highlights: 0.06 },
    thumbnailTint: '#4a8fd4',
  },

  juno: {
    id: 'juno', displayName: 'Juno', category: 'everyday',
    cssFilter: 'contrast(1.15) saturate(1.4) brightness(1.02) sepia(0.1) hue-rotate(-5deg)',
    uniforms: { u_contrast: 1.15, u_saturation: 1.4, u_temperature: 0.15, u_tint: 0.05, u_highlights: 0.05 },
    thumbnailTint: '#d4a050',
  },

  lark: {
    id: 'lark', displayName: 'Lark', category: 'everyday',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(1.1) hue-rotate(8deg)',
    uniforms: { u_brightness: 0.08, u_contrast: 0.9, u_saturation: 1.1, u_temperature: -0.06, u_highlights: 0.1 },
    thumbnailTint: '#7bbfcc',
  },

  ludwig: {
    id: 'ludwig', displayName: 'Ludwig', category: 'everyday',
    cssFilter: 'contrast(1.1) saturate(0.85) brightness(1.05) sepia(0.08) hue-rotate(-5deg)',
    uniforms: { u_contrast: 1.1, u_saturation: 0.85, u_brightness: 0.04, u_temperature: 0.08, u_fade: 0.06 },
    thumbnailTint: '#c8a87a',
  },

  perpetua: {
    id: 'perpetua', displayName: 'Perpetua', category: 'everyday',
    cssFilter: 'brightness(1.05) contrast(0.95) saturate(1.05) hue-rotate(5deg)',
    uniforms: { u_brightness: 0.04, u_contrast: 0.95, u_saturation: 1.05, u_temperature: -0.04, u_shadows: 0.04 },
    thumbnailTint: '#6fa885',
  },

  cinema: {
    id: 'cinema', displayName: 'Cinema', category: 'everyday',
    cssFilter: 'contrast(1.2) saturate(0.85) sepia(0.08) brightness(0.95)',
    uniforms: { u_contrast: 1.2, u_saturation: 0.85, u_brightness: -0.04, u_temperature: -0.1, u_shadows: -0.1, u_fade: 0.04, u_vignette: 0.25 },
    thumbnailTint: '#2a6070',
  },

  'simple-standard': {
    id: 'simple-standard', displayName: 'Simple', category: 'everyday',
    cssFilter: 'contrast(1.05) saturate(1.08)',
    uniforms: { u_contrast: 1.05, u_saturation: 1.08 },
    thumbnailTint: '#999999',
  },
  'simple-warm': {
    id: 'simple-warm', displayName: 'Simple Warm', category: 'everyday',
    cssFilter: 'brightness(1.04) saturate(1.12) sepia(0.08)',
    uniforms: { u_brightness: 0.03, u_saturation: 1.12, u_temperature: 0.1 },
    thumbnailTint: '#d4a87a',
  },
  'simple-cool': {
    id: 'simple-cool', displayName: 'Simple Cool', category: 'everyday',
    cssFilter: 'brightness(1.04) saturate(0.95) hue-rotate(10deg)',
    uniforms: { u_brightness: 0.03, u_saturation: 0.95, u_temperature: -0.1 },
    thumbnailTint: '#7aaad4',
  },

  'boost-standard': {
    id: 'boost-standard', displayName: 'Boost', category: 'everyday',
    cssFilter: 'contrast(1.18) saturate(1.25)',
    uniforms: { u_contrast: 1.18, u_saturation: 1.25 },
    thumbnailTint: '#dd6644',
  },
  'boost-warm': {
    id: 'boost-warm', displayName: 'Boost Warm', category: 'everyday',
    cssFilter: 'contrast(1.18) saturate(1.25) sepia(0.1) hue-rotate(-5deg)',
    uniforms: { u_contrast: 1.18, u_saturation: 1.25, u_temperature: 0.15 },
    thumbnailTint: '#dd8833',
  },
  'boost-cool': {
    id: 'boost-cool', displayName: 'Boost Cool', category: 'everyday',
    cssFilter: 'contrast(1.18) saturate(1.25) hue-rotate(10deg)',
    uniforms: { u_contrast: 1.18, u_saturation: 1.25, u_temperature: -0.15 },
    thumbnailTint: '#4488cc',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  WARM & SOFT
  // ═══════════════════════════════════════════════════════════════════════════

  valencia: {
    id: 'valencia', displayName: 'Valencia', category: 'warm',
    cssFilter: 'sepia(0.2) contrast(1.05) brightness(1.08) saturate(1.12) hue-rotate(-12deg)',
    uniforms: { u_sepia: 0.2, u_contrast: 1.05, u_brightness: 0.06, u_saturation: 1.12, u_temperature: 0.18, u_fade: 0.08 },
    thumbnailTint: '#d4a040',
  },

  aden: {
    id: 'aden', displayName: 'Aden', category: 'warm',
    cssFilter: 'sepia(0.08) brightness(1.1) contrast(0.85) saturate(0.85) hue-rotate(8deg)',
    uniforms: { u_sepia: 0.08, u_brightness: 0.08, u_contrast: 0.85, u_saturation: 0.85, u_temperature: -0.06, u_fade: 0.12, u_bloom: 0.06 },
    thumbnailTint: '#b8a8cc',
  },

  mayfair: {
    id: 'mayfair', displayName: 'Mayfair', category: 'warm',
    cssFilter: 'contrast(1.1) saturate(1.15) brightness(1.05) sepia(0.08) hue-rotate(-5deg)',
    uniforms: { u_contrast: 1.1, u_saturation: 1.15, u_brightness: 0.04, u_tint: 0.06, u_temperature: 0.06, u_vignette: 0.2, u_vignette_warm: 0.5 },
    thumbnailTint: '#cc8899',
  },

  rise: {
    id: 'rise', displayName: 'Rise', category: 'warm',
    cssFilter: 'brightness(1.15) contrast(0.9) saturate(1.05) sepia(0.15) hue-rotate(-8deg)',
    uniforms: { u_brightness: 0.12, u_contrast: 0.9, u_saturation: 1.05, u_temperature: 0.2, u_bloom: 0.15, u_fade: 0.08 },
    thumbnailTint: '#f0c860',
  },

  sierra: {
    id: 'sierra', displayName: 'Sierra', category: 'warm',
    cssFilter: 'contrast(0.85) brightness(1.1) saturate(1.1) sepia(0.1)',
    uniforms: { u_contrast: 0.85, u_brightness: 0.08, u_saturation: 1.1, u_temperature: 0.12, u_fade: 0.1, u_vignette: 0.18 },
    thumbnailTint: '#c8a070',
  },

  hefe: {
    id: 'hefe', displayName: 'Hefe', category: 'warm',
    cssFilter: 'contrast(1.2) saturate(1.5) brightness(1.05) sepia(0.12) hue-rotate(-5deg)',
    uniforms: { u_contrast: 1.2, u_saturation: 1.5, u_brightness: 0.04, u_temperature: 0.15, u_vignette: 0.35, u_vignette_warm: 0.8 },
    thumbnailTint: '#c87020',
  },

  amber: {
    id: 'amber', displayName: 'Amber', category: 'warm',
    cssFilter: 'sepia(0.3) contrast(1.1) saturate(1.3) brightness(1.05) hue-rotate(-10deg)',
    uniforms: { u_sepia: 0.3, u_contrast: 1.1, u_saturation: 1.3, u_temperature: 0.25, u_highlights: 0.08 },
    thumbnailTint: '#d4801e',
  },

  rosy: {
    id: 'rosy', displayName: 'Rosy', category: 'warm',
    cssFilter: 'brightness(1.05) contrast(1.05) saturate(1.1) hue-rotate(-10deg) sepia(0.05)',
    uniforms: { u_brightness: 0.04, u_contrast: 1.05, u_saturation: 1.1, u_tint: 0.1, u_temperature: 0.08 },
    thumbnailTint: '#dd8899',
  },

  charms: {
    id: 'charms', displayName: 'Charms', category: 'warm',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(1.05) sepia(0.1)',
    uniforms: { u_brightness: 0.08, u_contrast: 0.9, u_saturation: 1.05, u_temperature: 0.12, u_shadows: 0.08, u_fade: 0.06 },
    thumbnailTint: '#e0a87a',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  VINTAGE, RETRO & FILM EMULATION
  // ═══════════════════════════════════════════════════════════════════════════

  gingham: {
    id: 'gingham', displayName: 'Gingham', category: 'vintage',
    cssFilter: 'brightness(1.05) contrast(0.9) saturate(0.75) hue-rotate(-10deg)',
    uniforms: { u_brightness: 0.04, u_contrast: 0.9, u_saturation: 0.75, u_fade: 0.15, u_temperature: -0.06 },
    thumbnailTint: '#ccccaa',
  },

  reyes: {
    id: 'reyes', displayName: 'Reyes', category: 'vintage',
    cssFilter: 'sepia(0.22) contrast(0.85) brightness(1.1) saturate(0.75)',
    uniforms: { u_sepia: 0.22, u_contrast: 0.85, u_brightness: 0.08, u_saturation: 0.75, u_fade: 0.2, u_grain: 0.15 },
    thumbnailTint: '#c8b890',
  },

  slumber: {
    id: 'slumber', displayName: 'Slumber', category: 'vintage',
    cssFilter: 'sepia(0.3) contrast(0.9) brightness(1.05) saturate(0.85) hue-rotate(-5deg)',
    uniforms: { u_sepia: 0.3, u_contrast: 0.9, u_brightness: 0.04, u_saturation: 0.85, u_temperature: 0.1, u_fade: 0.18 },
    thumbnailTint: '#c0a060',
  },

  nashville: {
    id: 'nashville', displayName: 'Nashville', category: 'vintage',
    cssFilter: 'sepia(0.1) contrast(1.1) brightness(1.1) saturate(1.2) hue-rotate(-15deg)',
    uniforms: { u_sepia: 0.08, u_contrast: 1.1, u_brightness: 0.08, u_saturation: 1.2, u_tint: 0.12, u_temperature: 0.1, u_fade: 0.1 },
    thumbnailTint: '#cc7799',
  },

  '1977': {
    id: '1977', displayName: '1977', category: 'vintage',
    cssFilter: 'sepia(0.5) contrast(1.1) brightness(1.1) saturate(1.3) hue-rotate(-15deg)',
    uniforms: { u_sepia: 0.45, u_contrast: 1.1, u_brightness: 0.08, u_saturation: 1.3, u_temperature: 0.2, u_vignette: 0.15 },
    thumbnailTint: '#c87050',
  },

  kelvin: {
    id: 'kelvin', displayName: 'Kelvin', category: 'vintage',
    cssFilter: 'sepia(0.5) contrast(1.1) brightness(1.15) saturate(1.5) hue-rotate(-20deg)',
    uniforms: { u_sepia: 0.5, u_contrast: 1.1, u_brightness: 0.12, u_saturation: 1.5, u_temperature: 0.35 },
    thumbnailTint: '#f09020',
  },

  earlybird: {
    id: 'earlybird', displayName: 'Earlybird', category: 'vintage',
    cssFilter: 'sepia(0.4) contrast(0.9) brightness(1.0) saturate(0.9)',
    uniforms: { u_sepia: 0.4, u_contrast: 0.9, u_saturation: 0.9, u_fade: 0.12, u_vignette: 0.4, u_vignette_warm: 1.0, u_grain: 0.12 },
    thumbnailTint: '#b09060',
  },

  brannan: {
    id: 'brannan', displayName: 'Brannan', category: 'vintage',
    cssFilter: 'sepia(0.15) contrast(1.4) brightness(0.9) saturate(0.9)',
    uniforms: { u_sepia: 0.15, u_contrast: 1.4, u_brightness: -0.08, u_saturation: 0.9, u_temperature: -0.12, u_shadows: -0.1 },
    thumbnailTint: '#667788',
  },

  sutro: {
    id: 'sutro', displayName: 'Sutro', category: 'vintage',
    cssFilter: 'sepia(0.2) contrast(1.1) brightness(0.85) saturate(1.4) hue-rotate(-30deg)',
    uniforms: { u_sepia: 0.2, u_contrast: 1.1, u_brightness: -0.12, u_saturation: 1.4, u_temperature: -0.15, u_vignette: 0.5, u_vignette_warm: 0.3 },
    thumbnailTint: '#6644aa',
  },

  toaster: {
    id: 'toaster', displayName: 'Toaster', category: 'vintage',
    cssFilter: 'sepia(0.3) contrast(1.5) brightness(0.9) saturate(1.5) hue-rotate(-15deg)',
    uniforms: { u_sepia: 0.3, u_contrast: 1.5, u_brightness: -0.08, u_saturation: 1.5, u_temperature: 0.25, u_vignette: 0.45, u_vignette_warm: 1.0 },
    thumbnailTint: '#cc5500',
  },

  walden: {
    id: 'walden', displayName: 'Walden', category: 'vintage',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(1.1) hue-rotate(20deg) sepia(0.1)',
    uniforms: { u_brightness: 0.1, u_contrast: 0.9, u_saturation: 1.1, u_temperature: -0.2, u_fade: 0.15, u_highlights: 0.1 },
    thumbnailTint: '#66aacc',
  },

  poprocket: {
    id: 'poprocket', displayName: 'Poprocket', category: 'vintage',
    cssFilter: 'contrast(1.4) saturate(1.5) hue-rotate(-170deg) brightness(1.05)',
    uniforms: { u_contrast: 1.4, u_saturation: 1.5, u_hue: -170, u_brightness: 0.04, u_vignette: 0.2 },
    thumbnailTint: '#ee44aa',
  },

  vintage: {
    id: 'vintage', displayName: 'Vintage', category: 'vintage',
    cssFilter: 'sepia(0.35) contrast(1.1) brightness(0.95) saturate(1.1)',
    uniforms: { u_sepia: 0.35, u_contrast: 1.1, u_brightness: -0.04, u_saturation: 1.1, u_fade: 0.1, u_grain: 0.2, u_vignette: 0.3, u_vignette_warm: 0.8 },
    thumbnailTint: '#b08040',
  },

  film: {
    id: 'film', displayName: 'Film', category: 'vintage',
    cssFilter: 'contrast(1.05) saturate(0.9) sepia(0.05) brightness(0.98)',
    uniforms: { u_contrast: 1.05, u_saturation: 0.9, u_sepia: 0.05, u_grain: 0.28, u_shadows: -0.04, u_fade: 0.06 },
    thumbnailTint: '#888870',
  },

  'fade-standard': {
    id: 'fade-standard', displayName: 'Fade', category: 'vintage',
    cssFilter: 'contrast(0.85) brightness(1.1) saturate(0.85)',
    uniforms: { u_contrast: 0.85, u_brightness: 0.08, u_saturation: 0.85, u_fade: 0.2 },
    thumbnailTint: '#aaaaaa',
  },
  'fade-warm': {
    id: 'fade-warm', displayName: 'Fade Warm', category: 'vintage',
    cssFilter: 'contrast(0.85) brightness(1.1) saturate(0.85) sepia(0.12)',
    uniforms: { u_contrast: 0.85, u_brightness: 0.08, u_saturation: 0.85, u_fade: 0.2, u_temperature: 0.12 },
    thumbnailTint: '#ccaa88',
  },
  'fade-cool': {
    id: 'fade-cool', displayName: 'Fade Cool', category: 'vintage',
    cssFilter: 'contrast(0.85) brightness(1.1) saturate(0.85) hue-rotate(10deg)',
    uniforms: { u_contrast: 0.85, u_brightness: 0.08, u_saturation: 0.85, u_fade: 0.2, u_temperature: -0.12 },
    thumbnailTint: '#88aabb',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  HIGH CONTRAST & MOODY
  // ═══════════════════════════════════════════════════════════════════════════

  lofi: {
    id: 'lofi', displayName: 'Lo-Fi', category: 'moody',
    cssFilter: 'contrast(1.5) saturate(1.8) brightness(0.9)',
    uniforms: { u_contrast: 1.5, u_saturation: 1.8, u_brightness: -0.08, u_shadows: -0.15, u_vignette: 0.4 },
    thumbnailTint: '#882244',
  },

  'x-pro-ii': {
    id: 'x-pro-ii', displayName: 'X-Pro II', category: 'moody',
    cssFilter: 'contrast(1.5) saturate(1.4) sepia(0.15) hue-rotate(-10deg)',
    uniforms: { u_contrast: 1.5, u_saturation: 1.4, u_sepia: 0.15, u_temperature: -0.1, u_shadows: -0.2, u_vignette: 0.5, u_vignette_warm: 0.0 },
    thumbnailTint: '#224466',
  },

  amaro: {
    id: 'amaro', displayName: 'Amaro', category: 'moody',
    cssFilter: 'brightness(1.2) contrast(0.9) saturate(1.1) sepia(0.05)',
    uniforms: { u_brightness: 0.16, u_contrast: 0.9, u_saturation: 1.1, u_highlights: 0.2, u_fade: 0.08 },
    thumbnailTint: '#ffddaa',
  },

  hudson: {
    id: 'hudson', displayName: 'Hudson', category: 'moody',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(1.05) hue-rotate(20deg) sepia(0.05)',
    uniforms: { u_brightness: 0.08, u_contrast: 0.9, u_saturation: 1.05, u_temperature: -0.25, u_shadows: -0.1, u_highlights: 0.08 },
    thumbnailTint: '#4488cc',
  },

  crema: {
    id: 'crema', displayName: 'Crema', category: 'moody',
    cssFilter: 'sepia(0.1) contrast(0.95) saturate(0.85) brightness(1.05)',
    uniforms: { u_sepia: 0.1, u_contrast: 0.95, u_saturation: 0.85, u_brightness: 0.04, u_fade: 0.1, u_temperature: 0.06 },
    thumbnailTint: '#e0d8cc',
  },

  moody: {
    id: 'moody', displayName: 'Moody', category: 'moody',
    cssFilter: 'contrast(1.1) saturate(0.85) brightness(0.85) sepia(0.1)',
    uniforms: { u_contrast: 1.1, u_saturation: 0.85, u_brightness: -0.12, u_shadows: -0.12, u_vignette: 0.55, u_vignette_warm: 0.2, u_grain: 0.1 },
    thumbnailTint: '#334455',
  },

  emerald: {
    id: 'emerald', displayName: 'Emerald', category: 'moody',
    cssFilter: 'contrast(1.1) saturate(0.9) brightness(0.95) hue-rotate(10deg) sepia(0.05)',
    uniforms: { u_contrast: 1.1, u_saturation: 0.9, u_brightness: -0.04, u_temperature: -0.2, u_shadows: -0.08, u_vignette: 0.3 },
    thumbnailTint: '#226644',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  MONOCHROME / BLACK & WHITE
  // ═══════════════════════════════════════════════════════════════════════════

  inkwell: {
    id: 'inkwell', displayName: 'Inkwell', category: 'monochrome',
    cssFilter: 'grayscale(1) contrast(1.1) brightness(0.9)',
    uniforms: { u_saturation: 0, u_contrast: 1.1, u_brightness: -0.08, u_shadows: -0.06 },
    thumbnailTint: '#222222',
  },

  moon: {
    id: 'moon', displayName: 'Moon', category: 'monochrome',
    cssFilter: 'grayscale(1) brightness(1.15) contrast(0.9)',
    uniforms: { u_saturation: 0, u_brightness: 0.12, u_contrast: 0.9, u_bloom: 0.08, u_fade: 0.06 },
    thumbnailTint: '#cccccc',
  },

  willow: {
    id: 'willow', displayName: 'Willow', category: 'monochrome',
    cssFilter: 'grayscale(0.8) sepia(0.2) contrast(0.9) brightness(1.05)',
    uniforms: { u_saturation: 0.1, u_sepia: 0.25, u_contrast: 0.9, u_brightness: 0.04, u_fade: 0.12 },
    thumbnailTint: '#c8b8a0',
  },

  gotham: {
    id: 'gotham', displayName: 'Gotham', category: 'monochrome',
    cssFilter: 'grayscale(0.8) contrast(1.5) brightness(0.85) saturate(0.5)',
    uniforms: { u_saturation: 0.08, u_contrast: 1.5, u_brightness: -0.12, u_temperature: -0.2, u_shadows: -0.2, u_vignette: 0.4 },
    thumbnailTint: '#1a2233',
  },
};

/** Ordered list for UI display */
export const FILTER_PRESET_ORDER: string[] = [
  'normal',
  // Everyday
  'clarendon', 'juno', 'lark', 'ludwig', 'perpetua', 'cinema',
  'simple-standard', 'simple-warm', 'simple-cool',
  'boost-standard', 'boost-warm', 'boost-cool',
  // Warm
  'valencia', 'aden', 'mayfair', 'rise', 'sierra', 'hefe', 'amber', 'rosy', 'charms',
  // Vintage
  'gingham', 'reyes', 'slumber', 'nashville', '1977', 'kelvin',
  'earlybird', 'brannan', 'sutro', 'toaster', 'walden', 'poprocket',
  'vintage', 'film', 'fade-standard', 'fade-warm', 'fade-cool',
  // Moody
  'lofi', 'x-pro-ii', 'amaro', 'hudson', 'crema', 'moody', 'emerald',
  // Mono
  'inkwell', 'moon', 'willow', 'gotham',
];

export function getPreset(id: string): FilterPreset | undefined {
  return FILTER_PRESETS[id];
}
