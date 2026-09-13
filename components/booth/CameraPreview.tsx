'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, RefreshCw, Settings, Smartphone, Lock, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useEffects } from '@/hooks/useEffects';
import { Button } from '../ui/Button';

interface CameraPreviewProps {
  onVideoRefAvailable?: (video: HTMLVideoElement) => void;
  onCanvasRefAvailable?: (canvas: HTMLCanvasElement) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  onVideoRefAvailable,
  onCanvasRefAvailable,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

  const { stream, permissionState, error, isLoading, initCamera } = useCamera();
  useEffects(videoRef, canvasRef);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAndroidDevice(/android/i.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (onVideoRefAvailable) {
        onVideoRefAvailable(videoRef.current);
      }
    }
  }, [stream, onVideoRefAvailable]);

  useEffect(() => {
    if (canvasRef.current && onCanvasRefAvailable) {
      onCanvasRefAvailable(canvasRef.current);
    }
  }, [onCanvasRefAvailable]);

  if (permissionState === 'denied' || error || !stream) {
    return (
      <div className="relative w-full h-full min-h-[360px] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden rounded-2xl sm:rounded-[2rem] border border-zinc-800">
        
        {/* Ambient Glow Background Effect */}
        <div className="absolute w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Center Camera Off Card */}
        <div className="relative z-10 flex flex-col items-center max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
              <Camera className="w-10 h-10 animate-pulse text-blue-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-rose-400 shadow-md">
              <CameraOff className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-1.5">
            Camera is Turned Off
          </h3>
          
          <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
            {error || 'Camera permission is required to capture live photos and video strips. Tap below to enable camera access.'}
          </p>

          {/* Primary Action Button (Enable Camera) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              onClick={initCamera}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
              <span>{isLoading ? 'Connecting...' : 'Enable Camera'}</span>
            </button>

            {/* Android / Device Settings Helper Button */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-zinc-700/80 active:scale-95"
            >
              <Settings className="w-4 h-4 text-blue-400" />
              <span>{isAndroidDevice ? 'Android Settings Guide' : 'Permission Settings'}</span>
            </button>
          </div>

        </div>

        {/* Android / Device Camera Permission Guidance Modal */}
        {showGuideModal && (
          <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-left space-y-5 text-white">
              
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {isAndroidDevice ? 'Enable Camera on Android' : 'Enable Camera Permission'}
                  </h4>
                  <p className="text-xs text-zinc-400">Step-by-step browser camera permission setup</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 font-medium">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Look at the browser address bar at the top and tap the <strong className="text-white bg-zinc-800 px-1.5 py-0.5 rounded inline-flex items-center gap-1"><Lock className="w-3 h-3 text-blue-400 inline" /> Lock / Settings Icon</strong>.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Tap <strong className="text-white">Permissions</strong> or <strong className="text-white">Site Settings</strong> &gt; select <strong className="text-white">Camera</strong>.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Switch setting from <em>Blocked</em> to <strong className="text-emerald-400">Allow</strong>.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <div className="flex-1 leading-relaxed">
                    Return here and tap <strong className="text-blue-400">Enable Camera</strong> to start capturing!
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowGuideModal(false);
                    initCamera();
                  }}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Try Enabling Camera Now</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      {/* Hidden raw video element supplying stream to WebGL canvas */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Live Canvas Feed - edge to edge cover without black letterbox bars */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />

      {isLoading && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm text-zinc-300 font-medium">Initializing Camera...</span>
          </div>
        </div>
      )}
    </div>
  );
};
