import { useEffect, useRef } from 'react';
import { useEffectStore } from '@/store/effectStore';
import { useCameraStore } from '@/store/cameraStore';
import { effectEngine } from '@/lib/effects/engine';

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

    const renderLoop = () => {
      if (!isSubscribed) return;

      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        effectEngine.renderToCanvas(video, canvas, activeEffectId, strength, isMirrored);
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

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
