import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EffectCategory, EffectState } from '@/types/effect';

interface EffectActions {
  setActiveEffectId: (id: string) => void;
  setStrength: (strength: number) => void;
  setCategory: (category: EffectCategory) => void;
  setParameter: (paramId: string, value: number) => void;
  resetParameters: () => void;
}

export const useEffectStore = create<EffectState & EffectActions>()(
  persist(
    (set) => ({
      activeEffectId: 'normal',
      strength: 100,
      category: 'all',
      customParameters: {},

      setActiveEffectId: (activeEffectId) => set({ activeEffectId }),
      setStrength: (strength) => set({ strength }),
      setCategory: (category) => set({ category }),
      setParameter: (paramId, value) =>
        set((state) => ({
          customParameters: { ...state.customParameters, [paramId]: value },
        })),
      resetParameters: () => set({ customParameters: {}, strength: 100 }),
    }),
    {
      name: 'photo-booth-effect-storage',
    }
  )
);
