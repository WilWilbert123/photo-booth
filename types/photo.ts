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
    | 'red-hat';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  headerText?: string;
  subtitleText?: string;
  badgeText?: string;
  showDate?: boolean;
  dateText?: string;
  filterId?: string;
  themeId?: string;
}
