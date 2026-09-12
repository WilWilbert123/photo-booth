export type EffectCategory = 
  | 'all'
  | 'instagram'
  | 'film'
  | 'beauty'
  | 'color'
  | 'texture'
  | 'lens'
  | 'digital';

export interface EffectParameter {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  currentValue: number;
}

export interface EffectDefinition {
  id: string;
  name: string;
  category: EffectCategory;
  description: string;
  thumbnailColor?: string;
  cssFilter?: string;
  glShader?: string;
  pixelGrade?: string;
  parameters?: EffectParameter[];
  overlayType?: 'light-leak' | 'grain' | 'dust' | 'vignette' | 'vignette-heavy' | 'scanlines' | 'portrait-blur' | 'real-vintage' | 'beauty-smooth';
}

export interface EffectState {
  activeEffectId: string;
  strength: number; // 0 to 100
  category: EffectCategory;
  customParameters: Record<string, number>;
}
