'use client';

import React from 'react';
import { FlipHorizontal, RotateCw, Timer, Volume2, VolumeX, Zap, ZapOff, Sparkles, Layers } from 'lucide-react';
import { useBoothStore } from '@/store/boothStore';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '../ui/Button';
import { BoothMode, CountdownSeconds } from '@/types/booth';
import { STRIP_PRESETS } from '@/lib/export/stripPresets';

export const BoothControls: React.FC = () => {
  const {
    mode,
    selectedStripLayout,
    countdownDuration,
    isSoundEnabled,
    isFlashEnabled,
    isPoseGuideEnabled,
    setMode,
    setSelectedStripLayout,
    setCountdownDuration,
    toggleSound,
    toggleFlash,
    togglePoseGuide,
  } = useBoothStore();

  const { isMirrored, switchFacingMode, toggleMirror } = useCamera();

  const modes: { id: BoothMode; label: string }[] = [
    { id: 'PHOTO', label: 'Single' },
    { id: '4-SHOT', label: 'Photo Strip' },
    { id: 'GIF', label: 'Boomerang / GIF' },
    { id: 'VIDEO', label: 'Video' },
    { id: 'POLAROID', label: 'Polaroid' },
  ];

  const cycleCountdown = () => {
    const nextMap: Record<CountdownSeconds, CountdownSeconds> = {
      0: 3,
      3: 5,
      5: 10,
      10: 0,
    };
    setCountdownDuration(nextMap[countdownDuration]);
  };

  const isStripMode = mode === '4-SHOT' || mode === 'PHOTO_STRIP';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Utility Controls (Camera flip, mirror, timer, sound, flash, pose) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar bg-zinc-900/80 backdrop-blur-md p-2 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={switchFacingMode} title="Switch Front/Back Camera">
            <RotateCw className="w-4 h-4" />
            <span className="hidden xs:inline">Flip</span>
          </Button>

          <Button
            variant={isMirrored ? 'secondary' : 'ghost'}
            size="sm"
            onClick={toggleMirror}
            title="Toggle Camera Mirror"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="hidden xs:inline">Mirror</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={cycleCountdown} title="Set Timer Duration">
            <Timer className="w-4 h-4 text-blue-400" />
            <span>{countdownDuration === 0 ? 'Off' : `${countdownDuration}s`}</span>
          </Button>

          <Button
            variant={isFlashEnabled ? 'secondary' : 'ghost'}
            size="icon"
            onClick={toggleFlash}
            title="Toggle Flash"
          >
            {isFlashEnabled ? (
              <Zap className="w-4 h-4 text-amber-400" />
            ) : (
              <ZapOff className="w-4 h-4 text-zinc-500" />
            )}
          </Button>

          <Button
            variant={isSoundEnabled ? 'secondary' : 'ghost'}
            size="icon"
            onClick={toggleSound}
            title="Toggle Sound Effects"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4 text-zinc-200" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </Button>

          <Button
            variant={isPoseGuideEnabled ? 'secondary' : 'ghost'}
            size="sm"
            onClick={togglePoseGuide}
            title="Toggle Pose Ideas"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Pose</span>
          </Button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-x-auto no-scrollbar">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${mode === m.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white dark:hover:bg-zinc-900'
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Themed Strip Layout Selector (Visible in Strip Mode) */}
      {isStripMode && (
        <div className="flex flex-col gap-1.5 bg-zinc-950/90 backdrop-blur-md p-2.5 rounded-2xl border border-blue-500/20 shadow-xl">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Strip Layout Theme</span>
            </span>
            <span className="text-[10px] text-zinc-400">
              {STRIP_PRESETS.find((p) => p.id === selectedStripLayout)?.shotCount || 4} Shots
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {STRIP_PRESETS.map((preset) => {
              const isSelected = selectedStripLayout === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedStripLayout(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30 scale-95'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                    }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
