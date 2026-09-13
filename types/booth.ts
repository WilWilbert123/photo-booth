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

export interface BoothActions {
  setMode: (mode: BoothMode) => void;
  setCountdownDuration: (duration: CountdownSeconds) => void;
  setIsCountingDown: (isCountingDown: boolean) => void;
  setCurrentCountdown: (count: number) => void;
  setIsCapturing: (isCapturing: boolean) => void;
  setIsRecording: (isRecording: boolean) => void;
  setRecordingSeconds: (seconds: number) => void;
  startSequence: (totalShots: number) => void;
  addSequenceBlob: (blob: Blob) => void;
  clearSequence: () => void;
  toggleFlash: () => void;
  toggleSound: () => void;
  togglePoseGuide: () => void;
  toggleLivePhoto: () => void;
  setIsLivePhotoEnabled: (enabled: boolean) => void;
  toggleCountdownTimer: () => void;
  setPosePrompt: (prompt: string | null) => void;
  setTheme: (theme: ThemeMode) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  setActiveTab: (tab: 'booth' | 'gallery' | 'settings') => void;
  setStorageLocation: (location: string) => void;
  setMaxStorageSize: (size: string) => void;
  setSelectedStripLayout: (layoutId: string) => void;
  replaceSequenceBlob: (index: number, blob: Blob) => void;
  setShowSequenceReviewModal: (show: boolean) => void;
  setRetakeIndex: (index: number | null) => void;
  setSequenceShotStatusText: (text: string | null) => void;
}

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
  isLivePhotoEnabled: boolean;
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
