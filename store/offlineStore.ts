import { create } from 'zustand';

interface OfflineState {
  isOnline: boolean;
  isServiceWorkerRegistered: boolean;
  isOfflineReady: boolean;
  installPromptEvent: unknown | null;
  isAppInstalled: boolean;
  showIOSInstallModal: boolean;
  updateAvailable: boolean;
}

interface OfflineActions {
  setIsOnline: (isOnline: boolean) => void;
  setIsServiceWorkerRegistered: (registered: boolean) => void;
  setIsOfflineReady: (ready: boolean) => void;
  setInstallPromptEvent: (event: unknown | null) => void;
  setIsAppInstalled: (installed: boolean) => void;
  setShowIOSInstallModal: (show: boolean) => void;
  setUpdateAvailable: (available: boolean) => void;
}

export const useOfflineStore = create<OfflineState & OfflineActions>((set) => ({
  isOnline: true,
  isServiceWorkerRegistered: false,
  isOfflineReady: false,
  installPromptEvent: null,
  isAppInstalled: false,
  showIOSInstallModal: false,
  updateAvailable: false,

  setIsOnline: (isOnline) => set({ isOnline }),
  setIsServiceWorkerRegistered: (isServiceWorkerRegistered) => set({ isServiceWorkerRegistered }),
  setIsOfflineReady: (isOfflineReady) => set({ isOfflineReady }),
  setInstallPromptEvent: (installPromptEvent) => set({ installPromptEvent }),
  setIsAppInstalled: (isAppInstalled) => set({ isAppInstalled }),
  setShowIOSInstallModal: (showIOSInstallModal) => set({ showIOSInstallModal }),
  setUpdateAvailable: (updateAvailable) => set({ updateAvailable }),
}));
