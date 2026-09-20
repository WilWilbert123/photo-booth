'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EffectDefinition } from '@/types/effect';
import { effectEngine } from '@/lib/effects/engine';

interface EffectCardProps {
  effect: EffectDefinition;
  isSelected: boolean;
  onSelect: (id: string) => void;
  /** Live camera video — when provided, overrides the sample.jpg preview */
  previewVideo?: HTMLVideoElement | null;
  /** Shared preloaded sample image passed down from EffectPanel */
  sampleImage?: HTMLImageElement | null;
}

const CARD_W = 120;
const CARD_H = 90;

export const EffectCard: React.FC<EffectCardProps> = ({
  effect,
  isSelected,
  onSelect,
  previewVideo,
  sampleImage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // IntersectionObserver to pause rendering for offscreen cards
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const render = useCallback((source: CanvasImageSource) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (canvas.width !== CARD_W) canvas.width = CARD_W;
    if (canvas.height !== CARD_H) canvas.height = CARD_H;

    effectEngine.renderToCanvas(source, canvas, effect.id, 100, false);
  }, [effect.id]);

  useEffect(() => {
    let alive = true;
    let lastDrawTime = 0;
    // Selected card updates at 15 FPS; unselected visible cards update at 8 FPS
    const targetFps = isSelected ? 15 : 8;
    const intervalMs = 1000 / targetFps;

    // If card is not in viewport, stop rendering entirely
    if (!isVisible) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return;
    }

    // Prefer live video if available for selected card, fall back to static sampleImage for unselected
    if (previewVideo && isSelected) {
      const loop = (timestamp: number) => {
        if (!alive) return;
        if (timestamp - lastDrawTime >= intervalMs) {
          if (previewVideo.readyState >= 2 && previewVideo.videoWidth > 0) {
            render(previewVideo);
            lastDrawTime = timestamp;
          }
        }
        frameRef.current = requestAnimationFrame(loop);
      };
      frameRef.current = requestAnimationFrame(loop);
    } else if (sampleImage) {
      // Static image – render once when visible
      render(sampleImage);
    } else if (previewVideo) {
      // Unselected card with live camera fallback – throttled loop
      const loop = (timestamp: number) => {
        if (!alive) return;
        if (timestamp - lastDrawTime >= intervalMs) {
          if (previewVideo.readyState >= 2 && previewVideo.videoWidth > 0) {
            render(previewVideo);
            lastDrawTime = timestamp;
          }
        }
        frameRef.current = requestAnimationFrame(loop);
      };
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      alive = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [previewVideo, sampleImage, isSelected, isVisible, render]);

  return (
    <div
      ref={containerRef}
      onClick={() => onSelect(effect.id)}
      className="flex flex-col cursor-pointer group select-none"
    >
      {/* Thumbnail */}
      <div
        className={`w-full aspect-[4/3] rounded-xl overflow-hidden relative transition-all duration-150 bg-zinc-800 ${
          isSelected
            ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-zinc-900 scale-[1.04] shadow-lg shadow-blue-500/20'
            : 'group-hover:scale-[1.02] group-hover:shadow-md'
        }`}
      >
        {/* Canvas – always rendered; shows sample.jpg or live feed */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />

        {/* Selected checkmark badge */}
        {isSelected && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shadow z-10">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={`text-[10px] font-semibold mt-1 leading-tight truncate transition-colors ${
          isSelected
            ? 'text-blue-400'
            : 'text-zinc-400 group-hover:text-zinc-100'
        }`}
      >
        {effect.name}
      </span>
    </div>
  );
};

