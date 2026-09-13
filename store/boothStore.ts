import { create } from 'zustand';
import { BoothMode, BoothState, BoothActions, CountdownSeconds, ThemeMode } from '@/types/booth';

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
  showSequenceReviewModal: false,
  retakeIndex: null,
  sequenceShotStatusText: null,
  isFlashEnabled: true,
  isSoundEnabled: true,
  isPoseGuideEnabled: false,
  isLivePhotoEnabled: false,
  isCountdownTimerEnabled: true,
  currentPosePrompt: null,
  theme: 'light',
  isFullscreen: false,
  activeTab: 'booth',
  storageLocation: 'IndexedDB (Browser)',
  maxStorageSize: '500 MB',
  selectedStripLayout: 'family',

  setSelectedStripLayout: (selectedStripLayout) => set({ selectedStripLayout }),
  setShowSequenceReviewModal: (showSequenceReviewModal) => set({ showSequenceReviewModal }),
  setRetakeIndex: (retakeIndex) => set({ retakeIndex }),
  setSequenceShotStatusText: (sequenceShotStatusText) => set({ sequenceShotStatusText }),

  replaceSequenceBlob: (index, blob) =>
    set((state) => {
      const nextBlobs = [...state.sequenceCapturedBlobs];
      nextBlobs[index] = blob;
      return { sequenceCapturedBlobs: nextBlobs };
    }),

  setMode: (mode) => set({ mode }),
  setCountdownDuration: (countdownDuration) => set({ countdownDuration }),
  setIsCountingDown: (isCountingDown) => set({ isCountingDown }),
  setCurrentCountdown: (currentCountdown) => set({ currentCountdown }),
  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecordingSeconds: (recordingSeconds) => set({ recordingSeconds }),
  startSequence: (sequenceTotalShots) => set({ sequenceTotalShots, sequenceCurrentShot: 0, sequenceCapturedBlobs: [], showSequenceReviewModal: false }),
  addSequenceBlob: (blob) =>
    set((state) => ({
      sequenceCapturedBlobs: [...state.sequenceCapturedBlobs, blob],
      sequenceCurrentShot: state.sequenceCurrentShot + 1,
    })),
  clearSequence: () => set({ sequenceCapturedBlobs: [], sequenceCurrentShot: 0, showSequenceReviewModal: false, retakeIndex: null, sequenceShotStatusText: null }),
  toggleFlash: () => set((state) => ({ isFlashEnabled: !state.isFlashEnabled })),
  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
  togglePoseGuide: () => set((state) => ({ isPoseGuideEnabled: !state.isPoseGuideEnabled })),
  toggleLivePhoto: () => set((state) => ({ isLivePhotoEnabled: !state.isLivePhotoEnabled })),
  setIsLivePhotoEnabled: (isLivePhotoEnabled: boolean) => set({ isLivePhotoEnabled }),
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
