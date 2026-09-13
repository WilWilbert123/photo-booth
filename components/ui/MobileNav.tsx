'use client';

import React, { useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon, Settings, Download, Smartphone } from 'lucide-react';
import { useBoothStore } from '@/store/boothStore';
import { useInstallPWA } from '@/hooks/useInstallPWA';
import { InstallPromptModal } from '../pwa/InstallPromptModal';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme, activeTab, setActiveTab } = useBoothStore();
  const lastNavTime = useRef<number>(0);

  const { 
    canInstall, 
    isIOS, 
    isMac, 
    isAndroid, 
    showInstallModal, 
    setShowInstallModal, 
    isInstalling, 
    hasNativePrompt,
    triggerInstall 
  } = useInstallPWA();

  useEffect(() => {
    if (pathname?.includes('/gallery')) setActiveTab('gallery');
    else if (pathname?.includes('/settings')) setActiveTab('settings');
    else if (pathname?.includes('/booth')) setActiveTab('booth');
  }, [pathname, setActiveTab]);

  const handleNavClick = (e: React.MouseEvent, path: string, id: 'booth' | 'gallery' | 'settings') => {
    e.preventDefault();
    const now = Date.now();
    if (pathname === path || isPending || now - lastNavTime.current < 400) {
      return;
    }
    lastNavTime.current = now;
    setActiveTab(id);
    startTransition(() => {
      router.push(path);
    });
  };

  const navItems = [
    { id: 'booth', label: 'Booth', icon: Camera, path: '/booth' },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, path: '/gallery' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ] as const;

  return (
    <>
      {/* Mobile Top Header (Visible on < lg screens) */}
      <header className="lg:hidden w-full h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-40 shrink-0 select-none">
        <Link
          href="/booth"
          prefetch={false}
          onClick={(e) => handleNavClick(e, '/booth', 'booth')}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 relative">
            <img src="/logo.png" alt="PhotoBooth Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
            PhotoBooth
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Install App Button on Header */}
          {canInstall && (
            <button
              onClick={triggerInstall}
              disabled={isInstalling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-sm transition-all active:scale-95 ${
                isInstalling ? 'bg-blue-400 cursor-wait animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isInstalling ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isIOS ? (
                <Smartphone className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isInstalling ? 'Installing...' : isIOS ? 'Add to Home' : 'Install App'}</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-xs font-bold border border-zinc-200 dark:border-zinc-700"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on < lg screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.path}
              prefetch={false}
              onClick={(e) => handleNavClick(e, item.path, item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-200'
              } ${isPending ? 'opacity-80 pointer-events-none' : ''}`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Universal Install Guidance Modal */}
      <InstallPromptModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        isIOS={isIOS}
        isMac={isMac}
        isAndroid={isAndroid}
        hasNativePrompt={hasNativePrompt}
        onInstallClick={triggerInstall}
      />
    </>
  );
};
