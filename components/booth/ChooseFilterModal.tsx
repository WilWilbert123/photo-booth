'use client';

import React from 'react';
import { FILTER_PRESETS, EXACT_USER_FILTERS } from '@/lib/filters/presets';
import { useEffectStore } from '@/store/effectStore';
import { X, Check, Sparkles } from 'lucide-react';

interface ChooseFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChooseFilterModal: React.FC<ChooseFilterModalProps> = ({ isOpen, onClose }) => {
  const { activeEffectId, setActiveEffectId } = useEffectStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Choose a Filter
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Grid */}
        <div className="p-5 overflow-y-auto no-scrollbar grid grid-cols-3 gap-3">
          {EXACT_USER_FILTERS.map((filterId) => {
            const preset = FILTER_PRESETS[filterId] || {
              displayName: filterId,
              cssFilter: 'none',
              thumbnailTint: '#888888',
            };
            const isSelected = activeEffectId === filterId;

            return (
              <button
                key={filterId}
                onClick={() => {
                  setActiveEffectId(filterId);
                  onClose();
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 group text-center ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/80'
                }`}
              >
                {/* Visual Thumbnail Circle with Filter Applied */}
                <div
                  className="w-14 h-14 rounded-full shadow-inner border border-white/20 mb-2 overflow-hidden relative flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${preset.thumbnailTint || '#666'}, #111)`,
                    filter: preset.cssFilter !== 'none' ? preset.cssFilter : undefined,
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-white uppercase tracking-tighter">
                      {preset.displayName.substring(0, 3)}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {preset.displayName}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/30 text-center">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            Select any filter to instantly preview live in camera and photo strips
          </p>
        </div>
      </div>
    </div>
  );
};
