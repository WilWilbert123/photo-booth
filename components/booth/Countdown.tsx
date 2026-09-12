'use client';

import React from 'react';

interface CountdownProps {
  count: number;
}

export const Countdown: React.FC<CountdownProps> = ({ count }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex items-center justify-center">
        <div className="w-36 h-36 rounded-full bg-blue-600/30 border-4 border-blue-400 flex items-center justify-center animate-ping absolute" />
        <span className="text-8xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-in zoom-in duration-200">
          {count}
        </span>
      </div>
    </div>
  );
};
