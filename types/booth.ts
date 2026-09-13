export type BoothMode = 
  | 'PHOTO'
  | 'VIDEO'
  | 'BOOMERANG'
  | 'GIF'
  | '4-SHOT'
  | 'COLLAGE'
  | 'POLAROID'
  | 'PHOTO_STRIP';

export type CountdownSeconds = 0 | 3 | 5 | 10;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface BoothState {
  mode: BoothMode;
  countdownDuration: CountdownSeconds;
  isCountingDown: boolean;
  currentCountdown: number;
  isCapturing: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  sequenceTotalShots: number;
  sequenceCurrentShot: number;
  sequenceCapturedBlobs: Blob[];
  isFlashEnabled: boolean;
  isSoundEnabled: boolean;
  isPoseGuideEnabled: boolean;
  isCountdownTimerEnabled: boolean;
  currentPosePrompt: string | null;
  theme: ThemeMode;
  isFullscreen: boolean;
  activeTab: 'booth' | 'gallery' | 'settings';
  storageLocation: string;
  maxStorageSize: string;
  selectedStripLayout: string;
  showSequenceReviewModal: boolean;
  retakeIndex: number | null;
  sequenceShotStatusText: string | null;
}
