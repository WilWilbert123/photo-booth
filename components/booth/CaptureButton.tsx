'use client';

import React from 'react';
import { Camera, Video, Sparkles } from 'lucide-react';
import { useBoothStore } from '@/store/boothStore';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled?: boolean;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({
  onCapture,
  disabled = false,
}) => {
  const { mode, isCapturing, isCountingDown, isRecording } = useBoothStore();

  const isBusy = isCapturing || isCountingDown;

  return (
    <button
      onClick={onCapture}
      disabled={disabled || isBusy}
      className={`relative group flex items-center justify-center rounded-full p-2 transition-all duration-300 select-none active:scale-95 focus:outline-none ${
        disabled || isBusy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      aria-label="Capture Photo"
    >
      {/* Outer Glow Ring */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isRecording
            ? 'bg-rose-500/30 animate-ping'
            : 'bg-blue-500/20 group-hover:bg-blue-500/40 group-hover:scale-110'
        }`}
      />

      {/* Outer Border */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/80 flex items-center justify-center p-1.5 shadow-2xl backdrop-blur-md bg-white/10">
        {/* Inner Action Core */}
        <div
          className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-200 shadow-inner ${
            isRecording
              ? 'bg-rose-600 animate-pulse'
              : mode === '4-SHOT' || mode === 'PHOTO_STRIP'
              ? 'bg-gradient-to-tr from-indigo-600 to-blue-500'
              : mode === 'GIF' || mode === 'BOOMERANG'
              ? 'bg-gradient-to-tr from-purple-600 to-pink-500'
              : 'bg-gradient-to-tr from-blue-600 to-blue-500'
          }`}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-white rounded-md" />
          ) : mode === 'VIDEO' ? (
            <Video className="w-8 h-8 text-white" />
          ) : mode === 'GIF' || mode === 'BOOMERANG' ? (
            <Sparkles className="w-8 h-8 text-white" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
    </button>
  );
};
