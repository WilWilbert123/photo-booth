'use client';

import React, { useEffect, useState } from 'react';
import { useBoothStore } from '@/store/boothStore';
import { useCameraStore } from '@/store/cameraStore';
import { useEffectStore } from '@/store/effectStore';
import { Toggle } from '@/components/ui/Toggle';
import { EFFECTS_REGISTRY } from '@/lib/effects/registry';
import { getStorageQuota } from '@/lib/storage/migrations';
import type { StorageQuotaInfo } from '@/types/storage';
import { useInstallPWA } from '@/hooks/useInstallPWA';
import { InstallPromptModal } from '@/components/pwa/InstallPromptModal';
import { 
  Volume2, 
  Aperture, 
  Timer, 
  Info, 
  RotateCw, 
  ChevronDown,
  HardDrive,
  Trash2,
  Database,
  Download,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const [quota, setQuota] = useState<StorageQuotaInfo | null>(null);
  const { canInstall, isStandalone, isIOS, showIOSModal, setShowIOSModal, triggerInstall } = useInstallPWA();

  const loadQuota = () => {
    getStorageQuota()
      .then(q => setQuota(q))
      .catch(err => console.error('Failed to load storage quota:', err));
  };

  useEffect(() => {
    loadQuota();
  }, []);

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear the app cache? This will free up space but might cause the initial load to be slower next time.")) {
      if ('caches' in window) {
        caches.keys()
          .then(keys => Promise.all(keys.map(k => caches.delete(k))))
          .then(() => {
            loadQuota();
            alert("Cache cleared successfully!");
          })
          .catch(() => alert("Failed to clear cache."));
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all photos, videos, and settings? This CANNOT be undone.")) {
      try {
        const req = window.indexedDB.deleteDatabase('PhotoBoothDB');
        req.onsuccess = () => {
          window.localStorage.clear();
          window.location.reload();
        };
        req.onerror = () => {
          alert("Failed to delete database.");
        };
      } catch (err) {
        alert("Failed to clear data.");
      }
    }
  };
  const { 
    isSoundEnabled, 
    isFlashEnabled, 
    isPoseGuideEnabled, 
    isCountdownTimerEnabled, 
    isFullscreen,
    theme, 
    storageLocation,
    maxStorageSize,
    toggleSound, 
    toggleFlash, 
    togglePoseGuide,
    toggleCountdownTimer,
    setIsFullscreen,
    setTheme,
    setStorageLocation,
    setMaxStorageSize
  } = useBoothStore();

  const {
    activeDeviceId,
    resolution,
    devices,
    setActiveDeviceId,
    setResolution,
  } = useCameraStore();

  const {
    activeEffectId,
    strength,
    setActiveEffectId,
    setStrength,
  } = useEffectStore();

  const handleFullscreenToggle = (enabled: boolean) => {
    setIsFullscreen(enabled);
    if (enabled && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (!enabled && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="flex-1 w-full p-6 lg:p-8 flex flex-col gap-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-400 mt-1">
          Customize your photo booth experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Camera, Effects, Storage) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* App Installation Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  {isIOS ? <Smartphone className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Application Installation
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                    {isStandalone
                      ? 'Installed and running as a standalone app'
                      : isIOS
                      ? 'Add to iPhone / iPad Home Screen for full screen mode'
                      : 'Install web application for offline & full screen access'}
                  </p>
                </div>
              </div>

              {isStandalone ? (
                <span className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Installed
                </span>
              ) : (
                <button
                  onClick={triggerInstall}
                  className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                >
                  {isIOS ? <Smartphone className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span>{isIOS ? 'Add to Home Screen' : 'Install Application'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Camera Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Camera</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Camera Device */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-400">
                  Camera Device
                </label>
                <div className="relative">
                  <select
                    value={activeDeviceId || (devices[0]?.deviceId || 'user')}
                    onChange={(e) => setActiveDeviceId(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer pr-10"
                  >
                    {devices.length > 0 ? (
                      devices.map((device, idx) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${idx + 1}`}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="user">Front Camera</option>
                        <option value="environment">Back Camera</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Resolution */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-400">
                  Resolution
                </label>
                <div className="relative">
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer pr-10"
                  >
                    <option value="1080p">1920 × 1080 (Full HD)</option>
                    <option value="720p">1280 × 720 (HD)</option>
                    <option value="4K">3840 × 2160 (4K)</option>
                    <option value="square">1080 × 1080 (Square)</option>
                    <option value="portrait">1080 × 1440 (Portrait)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Effects Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Effects</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              {/* Default Effect */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-400">
                  Default Effect
                </label>
                <div className="relative">
                  <select
                    value={activeEffectId}
                    onChange={(e) => setActiveEffectId(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer pr-10"
                  >
                    {EFFECTS_REGISTRY.map((effect) => (
                      <option key={effect.id} value={effect.id}>
                        {effect.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Effect Strength */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-400">
                  Effect Strength
                </label>
                <div className="flex items-center gap-3 py-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={strength}
                    onChange={(e) => setStrength(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md min-w-[42px] text-center">
                    {strength}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-zinc-500" />
              Storage Management
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-5">
                {/* Storage Usage Progress */}
                {quota && (
                  <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-end mb-1">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Storage Used</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {quota.formattedUsage} / {quota.formattedQuota}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {quota.usagePercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          quota.usagePercentage > 90 ? 'bg-red-500' : 
                          quota.usagePercentage > 75 ? 'bg-amber-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, quota.usagePercentage))}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Storage Location */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-400">
                      Storage Location
                    </label>
                    <div className="relative">
                      <select
                        value={storageLocation}
                        onChange={(e) => setStorageLocation(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer pr-10"
                      >
                        <option value="IndexedDB (Browser)">IndexedDB (Browser)</option>
                        <option value="Local Storage">Local Storage</option>
                        <option value="OPFS (Origin Private FS)">OPFS (Origin Private FS)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Max Storage Size */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-400">
                      Max Storage Size
                    </label>
                    <div className="relative">
                      <select
                        value={maxStorageSize}
                        onChange={(e) => setMaxStorageSize(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer pr-10"
                      >
                        <option value="250 MB">250 MB</option>
                        <option value="500 MB">500 MB</option>
                        <option value="1 GB">1 GB</option>
                        <option value="2 GB">2 GB</option>
                        <option value="Unlimited">Unlimited</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Actions */}
              <div className="flex flex-col gap-3 justify-end lg:border-l lg:border-zinc-100 lg:dark:border-zinc-800 lg:pl-8">
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Clear Data</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Free up space by clearing cache or deleting all app data.
                  </span>
                </div>
                <button
                  onClick={handleClearCache}
                  className="flex items-center gap-2 justify-center w-full px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Clear App Cache
                </button>
                <button
                  onClick={handleClearData}
                  className="flex items-center gap-2 justify-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Data
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Preferences, Theme) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Preferences Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Preferences</h2>
            
            <div className="flex flex-col gap-3">
              <Toggle
                checked={isSoundEnabled}
                onChange={toggleSound}
                label="Sound Effects"
                icon={<Volume2 className="w-5 h-5 text-zinc-400" />}
              />
              <Toggle
                checked={isFlashEnabled}
                onChange={toggleFlash}
                label="Flash Overlay"
                icon={<Aperture className="w-5 h-5 text-zinc-400" />}
              />
              <Toggle
                checked={isCountdownTimerEnabled}
                onChange={toggleCountdownTimer}
                label="Countdown Timer"
                icon={<Timer className="w-5 h-5 text-zinc-400" />}
              />
              <Toggle
                checked={isPoseGuideEnabled}
                onChange={togglePoseGuide}
                label="Pose Guide"
                icon={<Info className="w-5 h-5 text-zinc-400" />}
              />
              <Toggle
                checked={isFullscreen}
                onChange={handleFullscreenToggle}
                label="Fullscreen Mode"
                icon={<RotateCw className="w-5 h-5 text-zinc-400" />}
              />
            </div>
          </div>

          {/* Theme Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Theme</h2>
            
            <div className="flex flex-col gap-3">
              <label 
                className="flex items-center gap-3 cursor-pointer py-1.5 group"
                onClick={() => setTheme('light')}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  theme === 'light' 
                    ? 'border-blue-600 bg-white' 
                    : 'border-zinc-300 dark:border-zinc-600 bg-transparent'
                }`}>
                  {theme === 'light' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  theme === 'light' 
                    ? 'text-zinc-900 dark:text-zinc-100' 
                    : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                }`}>
                  Light Mode
                </span>
              </label>

              <label 
                className="flex items-center gap-3 cursor-pointer py-1.5 group"
                onClick={() => setTheme('dark')}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  theme === 'dark' 
                    ? 'border-blue-600 bg-white' 
                    : 'border-zinc-300 dark:border-zinc-600 bg-transparent'
                }`}>
                  {theme === 'dark' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'text-zinc-900 dark:text-zinc-100' 
                    : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                }`}>
                  Dark Mode
                </span>
              </label>
            </div>
          </div>

        </div>
      </div>

      <InstallPromptModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isIOS={true}
      />
    </div>
  );
}
