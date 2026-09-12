import { ResolutionProfile, ResolutionPreset } from '@/types/camera';

export const RESOLUTION_PROFILES: Record<ResolutionPreset, ResolutionProfile> = {
  '1080p': {
    preset: '1080p',
    width: 1920,
    height: 1080,
    label: '1080p Full HD (16:9)',
    aspectRatio: 16 / 9,
  },
  '720p': {
    preset: '720p',
    width: 1280,
    height: 720,
    label: '720p HD (16:9)',
    aspectRatio: 16 / 9,
  },
  square: {
    preset: 'square',
    width: 1080,
    height: 1080,
    label: '1:1 Square',
    aspectRatio: 1,
  },
  portrait: {
    preset: 'portrait',
    width: 1080,
    height: 1440,
    label: '3:4 Portrait',
    aspectRatio: 3 / 4,
  },
  auto: {
    preset: 'auto',
    width: 1280,
    height: 720,
    label: 'Auto (Recommended)',
    aspectRatio: 16 / 9,
  },
};

export function getConstraintsForResolution(
  preset: ResolutionPreset,
  facingMode: 'user' | 'environment' = 'user',
  deviceId?: string | null
): MediaStreamConstraints {
  const profile = RESOLUTION_PROFILES[preset] || RESOLUTION_PROFILES['1080p'];

  const videoConstraints: MediaTrackConstraints = {
    facingMode: deviceId ? undefined : facingMode,
    deviceId: deviceId ? { exact: deviceId } : undefined,
    width: { ideal: profile.width },
    height: { ideal: profile.height },
  };

  return {
    video: videoConstraints,
    audio: false,
  };
}
