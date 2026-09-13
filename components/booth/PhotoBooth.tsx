'use client';

import React, { useRef, useState, useCallback } from 'react';
import { CameraPreview } from './CameraPreview';
import { CaptureButton } from './CaptureButton';
import { Countdown } from './Countdown';
import { FlashOverlay } from './FlashOverlay';
import { PoseGuide } from './PoseGuide';
import { EffectPanel } from './EffectPanel';
import { PhotoStripReviewModal } from './PhotoStripReviewModal';
import { usePhotoBooth } from '@/hooks/usePhotoBooth';
import { useBoothStore } from '@/store/boothStore';
import { useCameraStore } from '@/store/cameraStore';
import { RefreshCw, LayoutTemplate, Settings2, Sparkles } from 'lucide-react';
import { BoothMode } from '@/types/booth';
import { useRouter } from 'next/navigation';

const LivePhotoIcon: React.FC<{ className?: string; isActive?: boolean }> = ({ className = 'w-4 h-4', isActive }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" strokeDasharray="2 2" className={isActive ? 'animate-pulse' : ''} />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const PhotoBooth: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastNavTime = useRef<number>(0);
  const [showFlash, setShowFlash] = useState(false);
  const [showMobileEffects, setShowMobileEffects] = useState(false);

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
  }, []);

  const handleOpenSettings = () => {
    const now = Date.now();
    if (now - lastNavTime.current < 500) return;
    lastNavTime.current = now;
    setActiveTab('settings');
    router.push('/settings');
  };

  const [liveVideo, setLiveVideo] = useState<HTMLVideoElement | null>(null);
  const router = useRouter();

  const { 
    isCountingDown, 
    currentCountdown, 
    isCapturing, 
    isProcessing, 
    triggerCaptureSequence,
    retakeSingleShot,
    finalizePhotoStrip
  } = usePhotoBooth(videoRef, triggerFlash, canvasRef);

  const { 
    isFlashEnabled, 
    isPoseGuideEnabled, 
    togglePoseGuide,
    isLivePhotoEnabled,
    toggleLivePhoto,
    mode,
    setMode,
    countdownDuration,
    setCountdownDuration,
    setActiveTab,
    showSequenceReviewModal,
    setShowSequenceReviewModal,
    sequenceCapturedBlobs,
    sequenceShotStatusText,
    clearSequence
  } = useBoothStore();
  
  const { toggleMirror, stream, permissionState, error } = useCameraStore();
  const isCameraActive = Boolean(stream && permissionState === 'granted' && !error);

  const handleVideoAvailable = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    setLiveVideo(video);
  }, []);

  const handleCanvasAvailable = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const handleCaptureClick = () => {
    if (!isCameraActive) return;
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
    <div className="flex-1 w-full h-full p-3 sm:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1600px] mx-auto pb-4 lg:pb-0">

      {/* Left Column: Camera & Controls */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 relative min-h-[360px] sm:min-h-[500px]">
        {/* Main Live Camera Preview Frame */}
        <div className="relative flex-1 w-full rounded-2xl sm:rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[300px] sm:min-h-[450px]">

          <CameraPreview 
            onVideoRefAvailable={handleVideoAvailable} 
            onCanvasRefAvailable={handleCanvasAvailable}
          />

          {/* iOS Live Photo Active Yellow Badge */}
          {isLivePhotoEnabled && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/90 text-zinc-950 font-extrabold text-[11px] tracking-wider uppercase shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping" />
              LIVE PHOTO
            </div>
          )}

          {/* Floating Action Icons (Left) */}
          <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 sm:gap-3 z-10">
            {/* iOS Live Photo Toggle Button */}
            <button 
              onClick={toggleLivePhoto}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all group relative ${
                isLivePhotoEnabled 
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 font-bold shadow-lg shadow-amber-500/20' 
                  : 'bg-zinc-900/50 text-white border-white/20 hover:bg-zinc-900/70'
              }`}
            >
              <LivePhotoIcon isActive={isLivePhotoEnabled} className="w-4 h-4" />
              <div className="hidden sm:block absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Live Photo: {isLivePhotoEnabled ? 'ON' : 'OFF'}
              </div>
            </button>

            <button 
              onClick={cycleMode}
              className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-zinc-900/70 transition-colors group relative"
            >
              <LayoutTemplate className="w-4 h-4" />
              <div className="hidden sm:block absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Mode: {mode}
              </div>
            </button>
            <button 
              onClick={toggleMirror}
              className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-zinc-900/70 transition-colors group relative"
            >
              <RefreshCw className="w-4 h-4" />
              <div className="hidden sm:block absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Flip Camera
              </div>
            </button>
            <button 
              onClick={handleOpenSettings}
              className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-zinc-900/70 transition-colors group relative"
            >
              <Settings2 className="w-4 h-4" />
              <div className="hidden sm:block absolute left-full ml-3 px-2 py-1 bg-zinc-900/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Settings
              </div>
            </button>
          </div>

          {/* Live Per-Shot Status Badge Overlay */}
          {sequenceShotStatusText && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-blue-600/90 backdrop-blur-md text-white font-bold text-xs sm:text-sm tracking-wide shadow-xl animate-bounce">
              {sequenceShotStatusText}
            </div>
          )}

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
          
          {/* Mobile Effects Panel Modal Drawer */}
          {showMobileEffects && (
            <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md lg:hidden flex items-end justify-center p-2 sm:p-4">
              <div className="w-full max-w-md h-[82vh] bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
                <EffectPanel previewVideo={liveVideo} onClose={() => setShowMobileEffects(false)} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="h-20 sm:h-24 bg-white dark:bg-zinc-950 rounded-2xl sm:rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between px-3 sm:px-8 relative shrink-0">
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={togglePoseGuide}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-colors ${isPoseGuideEnabled ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="inline-block">Pose</span>
            </button>
            <button 
              onClick={cycleCountdown}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-colors ${countdownDuration > 0 ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="inline-block">
                {countdownDuration === 0 ? 'Off' : `${countdownDuration}s`}
              </span>
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 z-20">
            <CaptureButton onCapture={handleCaptureClick} disabled={isCapturing || !isCameraActive} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 z-20">
            {/* Mobile Filters & Props Trigger Button */}
            <button 
              onClick={() => setShowMobileEffects(!showMobileEffects)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-full border border-blue-200 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Effects</span>
            </button>
          </div>
        </div>

        {/* Optional Pose Guide Banner Overlay */}
        {isPoseGuideEnabled && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md">
            <PoseGuide onClose={togglePoseGuide} />
          </div>
        )}
      </div>

      {/* Right Column: Effects Panel */}
      <div className="hidden lg:flex h-full">
        <EffectPanel previewVideo={liveVideo} />
      </div>

      {/* Photo Strip Interactive Review & Retake Modal */}
      <PhotoStripReviewModal
        isOpen={showSequenceReviewModal}
        blobs={sequenceCapturedBlobs}
        onFinalize={finalizePhotoStrip}
        onRetakeSingle={retakeSingleShot}
        onRetakeAll={() => {
          setShowSequenceReviewModal(false);
          triggerCaptureSequence();
        }}
        onClose={() => {
          setShowSequenceReviewModal(false);
          clearSequence();
        }}
      />
    </div>
  );
};
