'use client';

import React, { useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon, Settings } from 'lucide-react';
import { useBoothStore } from '@/store/boothStore';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme, activeTab, setActiveTab } = useBoothStore();
  const lastNavTime = useRef<number>(0);

  useEffect(() => {
    if (pathname?.includes('/gallery')) setActiveTab('gallery');
    else if (pathname?.includes('/settings')) setActiveTab('settings');
    else if (pathname?.includes('/booth')) setActiveTab('booth');
  }, [pathname, setActiveTab]);

  const handleNavClick = (e: React.MouseEvent, path: string, id: 'booth' | 'gallery' | 'settings') => {
    e.preventDefault();
    const now = Date.now();
    
    // Prevent duplicate navigation if already on path, if transition is pending, or if double clicked quickly
    if (pathname === path || isPending || now - lastNavTime.current < 400) {
      return;
    }

    lastNavTime.current = now;
    setActiveTab(id);
    
    startTransition(() => {
      router.push(path);
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'booth', label: 'Booth', icon: Camera, path: '/booth' },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, path: '/gallery' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ] as const;

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between p-4 h-dvh sticky top-0 shrink-0 select-none">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center justify-between px-2">
          <Link
            href="/booth"
            prefetch={false}
            onClick={(e) => handleNavClick(e, '/booth', 'booth')}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-8 h-8 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="PhotoBooth Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
              PhotoBooth
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || activeTab === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.path}
                prefetch={false}
                onClick={(e) => handleNavClick(e, item.path, item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                } ${isPending ? 'opacity-80 pointer-events-none' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Theme Toggle */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-100/80 dark:bg-zinc-900/60 rounded-full border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span
          onClick={() => setTheme('light')}
          className={`cursor-pointer transition-colors ${
            theme === 'light' ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Light
        </span>
        <button
          onClick={toggleTheme}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-zinc-900 dark:bg-zinc-700'
          }`}
          aria-label="Toggle Theme"
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              theme === 'dark' ? 'translate-x-4.5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span
          onClick={() => setTheme('dark')}
          className={`cursor-pointer transition-colors ${
            theme === 'dark' ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Dark
        </span>
      </div>
    </aside>
  );
};
