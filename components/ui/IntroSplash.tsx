'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export const IntroSplash: React.FC = () => {
  const [stage, setStage] = useState<'fadeIn' | 'visible' | 'fadeOut' | 'hidden'>('fadeIn');

  useEffect(() => {
    // Stage 1: Fade in for 600ms
    const timer1 = setTimeout(() => {
      setStage('visible');
    }, 600);

    // Stage 2: Hold visible, then trigger fade out after 1800ms
    const timer2 = setTimeout(() => {
      setStage('fadeOut');
    }, 1800);

    // Stage 3: Hide completely after fade out completes (2400ms total)
    const timer3 = setTimeout(() => {
      setStage('hidden');
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (stage === 'hidden') return null;

  return (
    <div
      onClick={() => setStage('fadeOut')}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] transition-opacity duration-700 ease-in-out cursor-pointer select-none ${stage === 'fadeOut' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-700 ease-out transform ${stage === 'fadeIn'
            ? 'opacity-0 scale-95'
            : stage === 'visible'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
      >
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 drop-shadow-2xl">
          <Image
            src="/logo.png"
            alt="PhotoBooth Studio Logo"
            fill
            sizes="(max-width: 768px) 192px, 200px"
            className="object-contain"
            priority
          />
        </div>

      </div>
    </div>
  );
};
