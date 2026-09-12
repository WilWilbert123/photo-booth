import { getConstraintsForResolution } from './resolution';
import { FacingMode, ResolutionPreset } from '@/types/camera';

export async function requestCameraStream(
  facingMode: FacingMode = 'user',
  resolution: ResolutionPreset = '1080p',
  deviceId?: string | null
): Promise<MediaStream> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access is not supported in this environment.');
  }

  const constraints = getConstraintsForResolution(resolution, facingMode, deviceId);

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err: unknown) {
    // If exact device constraint or resolution fails, try simple fallback
    if (deviceId || resolution !== '720p') {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
      } catch {
        // Fallthrough to standard error handling
      }
    }

    const error = err as Error;
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Camera access denied. Please allow camera access in your browser settings.');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('No camera hardware found on this device.');
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      throw new Error('Camera is currently in use by another application.');
    } else {
      throw new Error(`Failed to start camera: ${error.message || 'Unknown error'}`);
    }
  }
}

export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // Ignore stop errors
    }
  });
}
