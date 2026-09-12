'use client';

import React from 'react';
import { Slider } from '../ui/Slider';
import { useEffectStore } from '@/store/effectStore';

export const EffectStrength: React.FC = () => {
  const { strength, setStrength } = useEffectStore();

  return (
    <div className="w-full">
      <Slider
        value={strength}
        onChange={setStrength}
        min={0}
        max={100}
        label="Effect Strength"
      />
    </div>
  );
};
