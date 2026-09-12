import { useEffect } from 'react';
import { useOfflineStore } from '@/store/offlineStore';
import { registerServiceWorker } from '@/lib/offline/offlineManager';

export function useOffline() {
  const { isOnline, isOfflineReady, setIsOnline, setIsOfflineReady } = useOfflineStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    registerServiceWorker();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verify service worker readiness
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsOfflineReady(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline, setIsOfflineReady]);

  return {
    isOnline,
    isOfflineReady,
  };
}
