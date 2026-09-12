'use client';

import React from 'react';
import { EFFECTS_REGISTRY } from '@/lib/effects/registry';
import { useEffectStore } from '@/store/effectStore';
import { EffectCard } from '../effects/EffectCard';
import { EffectCategory } from '../effects/EffectCategory';
import { EffectCategory as CategoryType } from '@/types/effect';

const CATEGORIES: { id: CategoryType; label: string }[] = [
  { id: 'all', label: 'All Effects' },
  { id: 'instagram', label: 'Instagram Filters' },
  { id: 'film', label: 'Vintage Film' },
  { id: 'beauty', label: 'Beauty & Portrait' },
  { id: 'color', label: 'Color & Grade' },
  { id: 'texture', label: 'Textures' },
  { id: 'lens', label: 'Lens & Optical' },
  { id: 'digital', label: 'Digital & Glitch' },
];

export const EffectCarousel: React.FC = () => {
  const { activeEffectId, category, setActiveEffectId, setCategory } = useEffectStore();

  const filteredEffects =
    category === 'all'
      ? EFFECTS_REGISTRY
      : EFFECTS_REGISTRY.filter((e) => e.category === category);

  return (
    <div className="flex flex-col gap-3 w-full bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 p-3 sm:p-4 rounded-3xl">
      <EffectCategory
        categories={CATEGORIES}
        selectedCategory={category}
        onSelectCategory={setCategory}
      />

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {filteredEffects.map((effect) => (
          <EffectCard
            key={effect.id}
            effect={effect}
            isSelected={activeEffectId === effect.id}
            onSelect={setActiveEffectId}
          />
        ))}
      </div>
    </div>
  );
};
