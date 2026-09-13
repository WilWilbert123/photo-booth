import { savePhotoToDB } from './photos';
import { saveVideoToDB } from './videos';
import { createThumbnailFromBlob } from '../canvas/composite';
import { PhotoRecord } from '@/types/photo';
import { VideoRecord } from '@/types/video';

/**
 * Processes an uploaded image or video File and saves it directly to IndexedDB.
 */
export async function processAndSaveUploadedFile(file: File): Promise<void> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = async () => {
        URL.revokeObjectURL(url);
        try {
          const thumbnailBlob = await createThumbnailFromBlob(file).catch(() => file);
          const photoRecord: PhotoRecord = {
            id: `photo_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            originalBlob: file,
            processedBlob: file,
            thumbnailBlob,
            createdAt: Date.now(),
            width: img.naturalWidth || 1920,
            height: img.naturalHeight || 1080,
            effectId: 'none',
            effectSettings: {},
            type: 'single',
            metadata: {
              title: file.name,
            },
          };
          await savePhotoToDB(photoRecord);
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image file: ${file.name}`));
      };

      img.src = url;
    });
  }

  if (isVideo) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);

      let resolved = false;

      const finishSave = async (thumbnailBlob: Blob) => {
        if (resolved) return;
        resolved = true;
        URL.revokeObjectURL(url);
        try {
          const videoRecord: VideoRecord = {
            id: `video_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            blob: file,
            createdAt: Date.now(),
            duration: Math.round(video.duration || 0),
            width: video.videoWidth || 1280,
            height: video.videoHeight || 720,
            thumbnailBlob,
            effectId: 'none',
            type: 'video',
          };
          await saveVideoToDB(videoRecord);
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      const captureFrame = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx && canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((b) => finishSave(b || file), 'image/jpeg', 0.85);
          } else {
            finishSave(file);
          }
        } catch {
          finishSave(file);
        }
      };

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(0.2, (video.duration || 1) / 2);
      };

      video.onseeked = () => {
        captureFrame();
      };

      video.onerror = () => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(url);
          reject(new Error(`Failed to load video file: ${file.name}`));
        }
      };

      // Fallback timer if seeked doesn't fire
      setTimeout(() => {
        if (!resolved) {
          captureFrame();
        }
      }, 3000);

      video.src = url;
    });
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}
