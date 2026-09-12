import { useCallback, useEffect } from 'react';
import { useOfflineStore } from '@/store/offlineStore';

export function usePWAInstall() {
  const {
    installPromptEvent,
    isAppInstalled,
    showIOSInstallModal,
    setInstallPromptEvent,
    setIsAppInstalled,
    setShowIOSInstallModal,
  } = useOfflineStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app running in standalone display mode (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsAppInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setInstallPromptEvent, setIsAppInstalled]);

  const promptInstall = useCallback(async () => {
    if (installPromptEvent) {
      const prompt = installPromptEvent as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
      prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
        setInstallPromptEvent(null);
      }
    } else {
      // Check if on iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
      if (isIOS) {
        setShowIOSInstallModal(true);
      }
    }
  }, [installPromptEvent, setIsAppInstalled, setInstallPromptEvent, setShowIOSInstallModal]);

  return {
    isInstallAvailable: !!installPromptEvent,
    isAppInstalled,
    showIOSInstallModal,
    promptInstall,
    closeIOSModal: () => setShowIOSInstallModal(false),
  };
}
