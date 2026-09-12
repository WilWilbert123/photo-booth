import { create } from 'zustand';
import { BoothMode, BoothState, CountdownSeconds, ThemeMode } from '@/types/booth';

interface BoothActions {
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
  toggleCountdownTimer: () => void;
  setPosePrompt: (prompt: string | null) => void;
  setTheme: (theme: ThemeMode) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  setActiveTab: (tab: 'booth' | 'gallery' | 'settings') => void;
  setStorageLocation: (location: string) => void;
  setMaxStorageSize: (size: string) => void;
  setSelectedStripLayout: (layoutId: string) => void;
}

export const useBoothStore = create<BoothState & BoothActions>((set) => ({
  mode: 'PHOTO',
  countdownDuration: 3,
  isCountingDown: false,
  currentCountdown: 3,
  isCapturing: false,
  isRecording: false,
  recordingSeconds: 0,
  sequenceTotalShots: 4,
  sequenceCurrentShot: 0,
  sequenceCapturedBlobs: [],
  isFlashEnabled: true,
  isSoundEnabled: true,
  isPoseGuideEnabled: false,
  isCountdownTimerEnabled: true,
  currentPosePrompt: null,
  theme: 'light',
  isFullscreen: false,
  activeTab: 'settings',
  storageLocation: 'IndexedDB (Browser)',
  maxStorageSize: '500 MB',
  selectedStripLayout: 'family',

  setSelectedStripLayout: (selectedStripLayout) => set({ selectedStripLayout }),

  setMode: (mode) => set({ mode }),
  setCountdownDuration: (countdownDuration) => set({ countdownDuration }),
  setIsCountingDown: (isCountingDown) => set({ isCountingDown }),
  setCurrentCountdown: (currentCountdown) => set({ currentCountdown }),
  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordingSeconds: (recordingSeconds) => set({ recordingSeconds }),
  startSequence: (sequenceTotalShots) => set({ sequenceTotalShots, sequenceCurrentShot: 0, sequenceCapturedBlobs: [] }),
  addSequenceBlob: (blob) =>
    set((state) => ({
      sequenceCapturedBlobs: [...state.sequenceCapturedBlobs, blob],
      sequenceCurrentShot: state.sequenceCurrentShot + 1,
    })),
  clearSequence: () => set({ sequenceCapturedBlobs: [], sequenceCurrentShot: 0 }),
  toggleFlash: () => set((state) => ({ isFlashEnabled: !state.isFlashEnabled })),
  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
  togglePoseGuide: () => set((state) => ({ isPoseGuideEnabled: !state.isPoseGuideEnabled })),
  toggleCountdownTimer: () => set((state) => ({ isCountdownTimerEnabled: !state.isCountdownTimerEnabled })),
  setPosePrompt: (currentPosePrompt) => set({ currentPosePrompt }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('photobooth_theme', theme);
      } catch {
        // ignore
      }
    }
    set({ theme });
  },
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setStorageLocation: (storageLocation) => set({ storageLocation }),
  setMaxStorageSize: (maxStorageSize) => set({ maxStorageSize }),
}));
