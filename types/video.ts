export interface VideoRecord {
  id: string;
  blob: Blob;
  createdAt: number;
  duration: number; // in seconds
  width: number;
  height: number;
  thumbnailBlob?: Blob;
  effectId: string;
  type: 'video' | 'gif' | 'boomerang';
}

export interface VideoRecordingOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  maxDurationSeconds?: number;
  audioEnabled: boolean;
}
