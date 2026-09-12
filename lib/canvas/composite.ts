import { effectEngine } from '../effects/engine';
import { ExportFormat } from '@/types/photo';
import { ARFaceFeatures } from '../effects/arTracker';

export async function processHighResSnapshot(
  sourceVideo: HTMLVideoElement,
  effectId: string,
  strength: number = 100,
  isMirrored: boolean = true,
  format: ExportFormat = 'image/jpeg',
  quality: number = 0.92,
  arFeatures?: ARFaceFeatures | null
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = sourceVideo.videoWidth || 1920;
  canvas.height = sourceVideo.videoHeight || 1080;

  effectEngine.renderToCanvas(sourceVideo, canvas, effectId, strength, isMirrored, arFeatures);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      },
      format,
      quality
    );
  });
}

export async function createThumbnailFromBlob(
  sourceBlob: Blob,
  targetWidth: number = 320,
  targetHeight: number = 320
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(sourceBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      // Center crop square thumbnail
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetWidth, targetHeight);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate thumbnail'));
      }, 'image/jpeg', 0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = url;
  });
}
