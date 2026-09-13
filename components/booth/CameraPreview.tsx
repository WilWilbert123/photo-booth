'use client';

import React, { useRef, useEffect } from 'react';
import { CameraOff, RefreshCw } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useEffects } from '@/hooks/useEffects';
import { Button } from '../ui/Button';

interface CameraPreviewProps {
  onVideoRefAvailable?: (video: HTMLVideoElement) => void;
  onCanvasRefAvailable?: (canvas: HTMLCanvasElement) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  onVideoRefAvailable,
  onCanvasRefAvailable,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { stream, permissionState, error, isLoading, initCamera } = useCamera();
  useEffects(videoRef, canvasRef);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (onVideoRefAvailable) {
        onVideoRefAvailable(videoRef.current);
      }
    }
  }, [stream, onVideoRefAvailable]);

  useEffect(() => {
    if (canvasRef.current && onCanvasRefAvailable) {
      onCanvasRefAvailable(canvasRef.current);
    }
  }, [onCanvasRefAvailable]);

  if (permissionState === 'denied' || error) {
    return (
      <div className="relative w-full h-full min-h-[320px] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
          <CameraOff className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-2">Camera Unavailable</h3>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          {error || 'Camera access was denied. Please allow camera permissions in your browser settings to continue.'}
        </p>
        <Button variant="primary" onClick={initCamera}>
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      {/* Hidden raw video element supplying stream to WebGL canvas */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Live Canvas Feed - edge to edge cover without black letterbox bars */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />

      {isLoading && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm text-zinc-300 font-medium">Initializing Camera...</span>
          </div>
        </div>
      )}
    </div>
  );
};
