'use client';

import React from 'react';
import { EffectCategory as CategoryType } from '@/types/effect';

interface EffectCategoryProps {
  categories: { id: CategoryType; label: string }[];
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export const EffectCategory: React.FC<EffectCategoryProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/40'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
