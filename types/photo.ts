export type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type PhotoType = 'single' | '4-shot' | 'strip' | 'collage' | 'polaroid' | 'gif' | 'boomerang';

export interface PhotoRecord {
  id: string;
  originalBlob: Blob;
  processedBlob: Blob;
  thumbnailBlob: Blob;
  createdAt: number;
  width: number;
  height: number;
  effectId: string;
  effectSettings: Record<string, number | string | boolean>;
  sessionId?: string;
  type: PhotoType;
  liveVideoBlob?: Blob;
  isLivePhoto?: boolean;
  metadata?: {
    cameraId?: string;
    facingMode?: string;
    aspectRatio?: number;
    title?: string;
  };
}

export interface PhotoStripConfig {
  layout:
    | 'vertical-3'
    | 'vertical-4'
    | 'grid-2x2'
    | 'grid-2x3'
    | 'polaroid'
    | 'family'
    | 'couple'
    | 'besties'
    | 'solo'
    | 'single'
    | 'taken'
    | 'korean-vintage'
    | 'vintage-3'
    | 'classic-4'
    | 'pirate-wanted'
    | 'bounty-hunter'
    | 'software-engineer'
    | 'black-hat'
    | 'red-hat'
    | 'neon-cyberpunk'
    | 'y2k-aesthetic'
    | 'gothic-dark'
    | 'fairycore'
    | 'minimalist-beige'
    | 'red-hearts-black'
    | 'red-hearts-pink'
    | 'pastel-floral'
    | 'periwinkle-pet';
  themePattern?: 'none' | 'hearts' | 'celestial' | 'nature' | 'floral' | 'sparkles' | 'cyber' | 'pirate' | 'korean' | 'cherries' | 'bows' | 'stars' | 'leopard' | 'clouds' | 'checkered' | 'butterflies' | 'strawberry' | 'stripes' | 'polka' | 'waves' | 'filmstrip' | 'disco';
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  headerColor?: string;
  borderWidth?: number;
  padding?: number;
  frameRadius?: number;
  headerMargin?: number;
  fitExactEdges?: boolean;
  headerText?: string;
  subtitleText?: string;
  badgeText?: string;
  showDate?: boolean;
  dateText?: string;
  filterId?: string;
  themeId?: string;
  imageOffsets?: Array<{ x: number; y: number }>;
}
