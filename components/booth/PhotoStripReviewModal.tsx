'use client';

import React, { useEffect, useState } from 'react';
import { RotateCw, Check, Sparkles, X, Camera } from 'lucide-react';
import { Button } from '../ui/Button';

interface PhotoStripReviewModalProps {
  isOpen: boolean;
  blobs: Blob[];
  onFinalize: () => void;
  onRetakeSingle: (index: number) => void;
  onRetakeAll: () => void;
  onClose: () => void;
}

export const PhotoStripReviewModal: React.FC<PhotoStripReviewModalProps> = ({
  isOpen,
  blobs,
  onFinalize,
  onRetakeSingle,
  onRetakeAll,
  onClose,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!blobs || blobs.length === 0) {
      setImageUrls([]);
      return;
    }
    const urls = blobs.map((b) => URL.createObjectURL(b));
    setImageUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobs]);

  if (!isOpen || blobs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col gap-6 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors"
          aria-label="Close review"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center sm:text-left pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Photo Strip Review</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Review & Customize Your Shots
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Satisfied with your poses? Tap "Retake" on any photo frame you'd like to replace!
          </p>
        </div>

        {/* 4 Photo Frames Grid Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {imageUrls.map((url, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center gap-2 bg-zinc-100 dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 transition-all hover:border-blue-500/50"
            >
              {/* Image Frame Container */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 shadow-inner">
                <img
                  src={url}
                  alt={`Shot ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Photo Badge Number */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  Photo #{idx + 1}
                </div>
              </div>

              {/* Retake Single Photo Button */}
              <button
                onClick={() => onRetakeSingle(idx)}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 text-xs font-semibold transition-all border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retake #{idx + 1}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Modal Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={onRetakeAll}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Retake All 4 Photos</span>
          </button>

          <Button
            variant="primary"
            size="lg"
            onClick={onFinalize}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Check className="w-5 h-5" />
            <span>Save & Create Photo Strip</span>
          </Button>
        </div>

      </div>
    </div>
  );
};
