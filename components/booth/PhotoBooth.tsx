'use client';

import React, { useRef, useState, useCallback } from 'react';
import { CameraPreview } from './CameraPreview';
import { CaptureButton } from './CaptureButton';
import { Countdown } from './Countdown';
import { FlashOverlay } from './FlashOverlay';
import { PoseGuide } from './PoseGuide';
import { EffectPanel } from './EffectPanel';
import { usePhotoBooth } from '@/hooks/usePhotoBooth';
import { useBoothStore } from '@/store/boothStore';
import { useCameraStore } from '@/store/cameraStore';
import { RefreshCw, LayoutTemplate, Settings2 } from 'lucide-react';
import { BoothMode } from '@/types/booth';
import { useRouter } from 'next/navigation';

export const PhotoBooth: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [liveVideo, setLiveVideo] = useState<HTMLVideoElement | null>(null);
  const router = useRouter();

  const { isCountingDown, currentCountdown, isCapturing, isProcessing, triggerCaptureSequence } =
    usePhotoBooth(videoRef);

  const { 
    isFlashEnabled, 
    isPoseGuideEnabled, 
    togglePoseGuide,
    mode,
    setMode,
    countdownDuration,
    setCountdownDuration,
    setActiveTab
  } = useBoothStore();
  
  const { toggleMirror } = useCameraStore();

  const [showFlash, setShowFlash] = useState(false);
  const [showMobileEffects, setShowMobileEffects] = useState(false);

  const handleVideoAvailable = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    setLiveVideo(video);
  }, []);

  const handleCaptureClick = () => {
    if (isFlashEnabled) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
    }
    triggerCaptureSequence();
  };

  const cycleMode = () => {
    const modes: BoothMode[] = ['PHOTO', 'POLAROID', '4-SHOT', 'PHOTO_STRIP', 'BOOMERANG', 'GIF'];
    const currentIndex = modes.indexOf(mode);
    setMode(modes[(currentIndex + 1) % modes.length]);
  };

  const cycleCountdown = () => {
    if (countdownDuration === 0) setCountdownDuration(3);
    else if (countdownDuration === 3) setCountdownDuration(5);
    else if (countdownDuration === 5) setCountdownDuration(10);
    else setCountdownDuration(0);
  };

  return (
    <div className="flex-1 w-full h-full p-4 sm:p-6 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">

      {/* Left Column: Camera & Controls */}
      <div className="flex-1 flex flex-col gap-4 relative min-h-[500px]">
        {/* Main Live Camera Preview Frame */}
        <div className="relative flex-1 w-full rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800">

          <CameraPreview onVideoRefAvailable={handleVideoAvailable} />

          {/* Floating Action Icons (Left) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
            <button 
              onClick={cycleMode}
              className="w-10 h-10 rounded-full bg-zinc-900/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-zinc-900/60 transition-colors group relative"
            >
              <LayoutTemplate className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Mode: {mode}
              </div>
            </button>
            <button 
              onClick={toggleMirror}
              className="w-10 h-10 rounded-full bg-zinc-900/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-zinc-900/60 transition-colors group relative"
            >
              <RefreshCw className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Flip Camera
              </div>
            </button>
            <button 
              onClick={() => {
                setActiveTab('settings');
                router.push('/settings');
              }}
              className="w-10 h-10 rounded-full bg-zinc-900/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-zinc-900/60 transition-colors group relative"
            >
              <Settings2 className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Settings
              </div>
            </button>
          </div>

          {/* Animated Countdown Overlay */}
          {isCountingDown && <Countdown count={currentCountdown} />}

          {/* Camera Flash Screen Animation */}
          {showFlash && <FlashOverlay />}

          {/* Processing / Saving Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 shadow-lg" />
              <p className="text-lg font-medium drop-shadow-md">Processing & Saving...</p>
            </div>
          )}
          
          {/* Mobile Effects Panel Overlay */}
          {showMobileEffects && (
            <div className="absolute inset-0 z-40 bg-black/60 lg:hidden flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm h-[80%] flex flex-col">
                <EffectPanel previewVideo={liveVideo} onClose={() => setShowMobileEffects(false)} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="h-24 bg-white dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={togglePoseGuide}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isPoseGuideEnabled ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Pose Guide</span>
            </button>
            <button 
              onClick={cycleCountdown}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${countdownDuration > 0 ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                {countdownDuration === 0 ? 'Off' : `${countdownDuration}s`}
              </span>
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 z-20">
            <CaptureButton onCapture={handleCaptureClick} disabled={isCapturing} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 z-20">
            <button 
              onClick={() => setShowMobileEffects(!showMobileEffects)}
              className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Optional Pose Guide Banner Overlay */}
        {isPoseGuideEnabled && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
            <PoseGuide onClose={togglePoseGuide} />
          </div>
        )}
      </div>

      {/* Right Column: Effects Panel */}
      <div className="hidden lg:flex h-full">
        <EffectPanel previewVideo={liveVideo} />
      </div>
    </div>
  );
};
