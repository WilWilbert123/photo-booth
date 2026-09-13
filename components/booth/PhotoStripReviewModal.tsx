'use client';

import React, { useEffect, useState } from 'react';
import { RotateCw, Check, Sparkles, X, Camera, LayoutTemplate, Layers, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { createPhotoStripBlob } from '@/lib/export/strip';
import { getStripPreset } from '@/lib/export/stripPresets';
import { useBoothStore } from '@/store/boothStore';
import { PhotoStripConfig } from '@/types/photo';

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
  const [stripPreviewUrl, setStripPreviewUrl] = useState<string | null>(null);
  const [isGeneratingStrip, setIsGeneratingStrip] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'strip' | 'shots'>('strip');

  const { selectedStripLayout } = useBoothStore();

  useEffect(() => {
    if (!blobs || blobs.length === 0) {
      setImageUrls([]);
      setStripPreviewUrl(null);
      return;
    }

    const urls = blobs.map((b) => URL.createObjectURL(b));
    setImageUrls(urls);

    let isMounted = true;
    setIsGeneratingStrip(true);

    const generateStripPreview = async () => {
      try {
        const preset = getStripPreset(selectedStripLayout);
        const stripBlob = await createPhotoStripBlob(blobs, {
          layout: preset.id as PhotoStripConfig['layout'],
          backgroundColor: preset.backgroundColor || '#FFFFFF',
          borderColor: preset.borderColor || '#FFFFFF',
          borderWidth: 20,
          padding: 20,
          headerText: preset.defaultHeader || '',
          subtitleText: preset.defaultSubtitle || '',
          badgeText: preset.badgeText || '',
          showDate: true,
        });

        if (isMounted) {
          const url = URL.createObjectURL(stripBlob);
          setStripPreviewUrl((oldUrl) => {
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            return url;
          });
        }
      } catch (err) {
        console.error('Failed to generate review strip preview:', err);
      } finally {
        if (isMounted) setIsGeneratingStrip(false);
      }
    };

    generateStripPreview();

    return () => {
      isMounted = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobs, selectedStripLayout]);

  useEffect(() => {
    return () => {
      if (stripPreviewUrl) {
        URL.revokeObjectURL(stripPreviewUrl);
      }
    };
  }, [stripPreviewUrl]);

  if (!isOpen || blobs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors"
          aria-label="Close review"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header & Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-8 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Photo Strip Review</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Preview Assembled Photo Strip
            </h2>
          </div>

          {/* Toggle View Mode Buttons */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start sm:self-auto border border-zinc-200/60 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('strip')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'strip'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Strip Preview</span>
            </button>
            <button
              onClick={() => setViewMode('shots')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'shots'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Shots ({blobs.length})</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'strip' ? (
          /* Strip Layout Preview (Matches User Request & Screenshot!) */
          <div className="w-full bg-zinc-100 dark:bg-zinc-900/90 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[300px] border border-zinc-200/80 dark:border-zinc-800 shadow-inner">
            {isGeneratingStrip ? (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Assembling Strip Layout...</span>
              </div>
            ) : stripPreviewUrl ? (
              <div className="relative flex flex-col items-center justify-center max-w-full">
                <img
                  src={stripPreviewUrl}
                  alt="Assembled Photo Strip Preview"
                  className="max-h-[50vh] sm:max-h-[54vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform hover:scale-[1.01]"
                />

                {/* Quick Shot Retake Toolbar under preview */}
                <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
                    Tap to Retake:
                  </span>
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => onRetakeSingle(idx)}
                      className="group relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 shrink-0 hover:border-blue-500 active:scale-95 transition-all"
                      title={`Retake Shot #${idx + 1}`}
                    >
                      <img src={url} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 py-12">Preview unavailable</div>
            )}
          </div>
        ) : (
          /* Individual Shots Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col items-center gap-2 bg-zinc-100 dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 transition-all hover:border-blue-500/50"
              >
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 shadow-inner">
                  <img
                    src={url}
                    alt={`Shot ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    Shot #{idx + 1}
                  </div>
                </div>

                <button
                  onClick={() => onRetakeSingle(idx)}
                  className="w-full py-1.5 px-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 text-[11px] font-semibold transition-all border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center gap-1 shadow-sm active:scale-95"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retake #{idx + 1}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={onRetakeAll}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Retake All Shots</span>
          </button>

          <Button
            variant="primary"
            size="md"
            onClick={onFinalize}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-xs sm:text-sm font-semibold"
          >
            <Check className="w-4 h-4" />
            <span>Save & Create Photo Strip</span>
          </Button>
        </div>

      </div>
    </div>
  );
};
