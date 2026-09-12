export type FacingMode = 'user' | 'environment';

export interface CameraDevice {
  deviceId: string;
  label: string;
  groupId?: string;
  facing?: FacingMode;
}

export type ResolutionPreset = '1080p' | '720p' | 'square' | 'portrait' | 'auto';

export interface ResolutionProfile {
  preset: ResolutionPreset;
  width: number;
  height: number;
  label: string;
  aspectRatio: number;
}

export interface CameraState {
  stream: MediaStream | null;
  activeDeviceId: string | null;
  devices: CameraDevice[];
  facingMode: FacingMode;
  resolution: ResolutionPreset;
  isMirrored: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  error: string | null;
  isLoading: boolean;
}
