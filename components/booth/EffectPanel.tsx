'use client';

import React, { useState, useEffect } from 'react';
import { EFFECTS_REGISTRY } from '@/lib/effects/registry';
import { useEffectStore } from '@/store/effectStore';
import { EffectCard } from '../effects/EffectCard';
import { EffectCategory as CategoryType } from '@/types/effect';
import { Sparkles, X } from 'lucide-react';

const CATEGORIES: { id: CategoryType | 'all'; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'film',      label: 'Film' },
  { id: 'beauty',    label: 'Beauty' },
  { id: 'color',     label: 'Color' },
  { id: 'lens',      label: 'Lens' },
  { id: 'texture',   label: 'Texture' },
  { id: 'digital',   label: 'Digital' },
];

interface EffectPanelProps {
  onClose?: () => void;
  previewVideo?: HTMLVideoElement | null;
}

export const EffectPanel: React.FC<EffectPanelProps> = ({ onClose, previewVideo }) => {
  const { activeEffectId, category, strength, setActiveEffectId, setCategory, setStrength } =
    useEffectStore();

  // Preload sample.jpg once — shared across all cards
  const [sampleImage, setSampleImage] = useState<HTMLImageElement | null>(null);
  // Gate store-dependent rendering until after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const img = new Image();
    img.src = '/images/sample.jpg';
    img.onload = () => setSampleImage(img);
  }, []);

  const filteredEffects = !mounted
    ? EFFECTS_REGISTRY
    : category === 'all'
      ? EFFECTS_REGISTRY
      : EFFECTS_REGISTRY.filter((e) => e.category === (category as CategoryType));

  const activeEffect = mounted
    ? EFFECTS_REGISTRY.find((e) => e.id === activeEffectId)
    : undefined;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm w-80 shrink-0 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Effects</h3>
          {activeEffect && activeEffect.id !== 'normal' && (
            <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full truncate">
              {activeEffect.name}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0 ml-2"
            aria-label="Close Effects Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Category pills — 2-row wrap ────────────────────── */}
      <div className="px-4 py-2.5 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as CategoryType)}
              suppressHydrationWarning
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
                mounted && category === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Effects grid ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-2 min-h-0">
        <div className="grid grid-cols-3 gap-2 py-1">
          {filteredEffects.map((effect) => (
            <EffectCard
              key={effect.id}
              effect={effect}
              isSelected={activeEffectId === effect.id}
              onSelect={setActiveEffectId}
              previewVideo={previewVideo}
              sampleImage={sampleImage}
            />
          ))}
        </div>
      </div>

      {/* ── Strength slider ────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Intensity</span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums w-9 text-right">
            {strength}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-600"
          style={{
            background: `linear-gradient(to right, #2563eb ${strength}%, #3f3f46 ${strength}%)`,
          }}
        />
        {activeEffect && activeEffect.id !== 'normal' && (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 leading-relaxed line-clamp-2">
            {activeEffect.description}
          </p>
        )}
      </div>
    </div>
  );
};
