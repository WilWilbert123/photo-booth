'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    // Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isMacDevice = /macintosh|mac os x/.test(userAgent) && !isIOSDevice;
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsMac(isMacDevice);
    setIsAndroid(isAndroidDevice);

    checkStandalone();

    // Listen for Android / Desktop beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstalling(false);
      setIsInstalledSuccess(true);
      setTimeout(() => setIsInstalledSuccess(false), 5000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    setIsInstalling(true);

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsStandalone(true);
          setIsInstalledSuccess(true);
          setTimeout(() => setIsInstalledSuccess(false), 5000);
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
        setShowInstallModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Brief animation delay to provide visual response for fallback
      await new Promise((res) => setTimeout(res, 800));
      // If browser hasn't fired native prompt or user is on Safari/Mac/iOS:
      setIsInstalling(false);
      setShowInstallModal(true);
    }
  }, [deferredPrompt]);

  const canInstall = !isStandalone;

  return {
    canInstall,
    isStandalone,
    isIOS,
    isMac,
    isAndroid,
    showInstallModal,
    setShowInstallModal,
    isInstalling,
    isInstalledSuccess,
    hasNativePrompt: Boolean(deferredPrompt),
    triggerInstall,
  };
}
