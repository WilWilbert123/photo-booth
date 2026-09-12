'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/Button';

const POSE_PROMPTS = [
  'Peace Sign & Big Smile!',
  'Wink at the camera!',
  'Surprised expression!',
  'Silly face / Tongue out!',
  'Silhouetted model pose!',
  'Double thumb up!',
  'Blow a kiss!',
  'Finger heart sign!',
  'Classic vintage smile',
  'Dramatic side gaze',
];

interface PoseGuideProps {
  onClose: () => void;
}

export const PoseGuide: React.FC<PoseGuideProps> = ({ onClose }) => {
  const [index, setIndex] = useState(0);

  const nextPose = () => {
    setIndex((prev) => (prev + 1) % POSE_PROMPTS.length);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 max-w-[90vw]">
      <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-full">
        <Sparkles className="w-4 h-4" />
      </div>
      <span className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
        {POSE_PROMPTS[index]}
      </span>
      <Button variant="ghost" size="icon" onClick={nextPose} className="p-1 min-w-0 min-h-0">
        <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onClose} className="p-1 min-w-0 min-h-0">
        <X className="w-3.5 h-3.5 text-zinc-400" />
      </Button>
    </div>
  );
};
