import { useEffect, useRef } from 'react';
import { useEffectStore } from '@/store/effectStore';
import { useCameraStore } from '@/store/cameraStore';
import { effectEngine } from '@/lib/effects/engine';
import { EFFECTS_REGISTRY } from '@/lib/effects/registry';
import { arTracker } from '@/lib/effects/arTracker';

export function useEffects(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const { activeEffectId, strength } = useEffectStore();
  const { isMirrored, stream } = useCameraStore();
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !stream) return;

    let isSubscribed = true;
    let currentArFeatures: any = null;
    let lastTrackTime = 0;

    // Throttled face tracking loop (~10 FPS) to avoid choking mobile CPUs
    const trackFace = async () => {
      if (!isSubscribed) return;

      const effect = EFFECTS_REGISTRY.find(e => e.id === activeEffectId);
      const now = Date.now();

      if (effect?.category === 'prop') {
        if (now - lastTrackTime >= 90) {
          lastTrackTime = now;
          try {
            currentArFeatures = await arTracker.detectFace(video);
          } catch (e) {
            console.error("AR tracking error:", e);
          }
        }
      } else {
        currentArFeatures = null;
      }

      if (isSubscribed) {
        setTimeout(trackFace, 90);
      }
    };

    trackFace();

    let lastRenderTime = 0;
    const targetFps = 60;
    const frameInterval = 1000 / targetFps;

    const renderLoop = (timestamp: number) => {
      if (!isSubscribed) return;

      const delta = timestamp - lastRenderTime;

      if (delta >= frameInterval) {
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          // Cap preview canvas internal dimensions for smooth 60fps mobile rendering
          const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
          const maxDim = isMobile ? 850 : 1280;
          let targetW = video.videoWidth;
          let targetH = video.videoHeight;

          if (targetW > maxDim || targetH > maxDim) {
            const scale = maxDim / Math.max(targetW, targetH);
            targetW = Math.round(targetW * scale);
            targetH = Math.round(targetH * scale);
          }

          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          effectEngine.renderToCanvas(video, canvas, activeEffectId, strength, isMirrored, currentArFeatures);
          lastRenderTime = timestamp - (delta % frameInterval);
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [videoRef, canvasRef, stream, activeEffectId, strength, isMirrored]);

  return {
    activeEffectId,
    strength,
  };
}
