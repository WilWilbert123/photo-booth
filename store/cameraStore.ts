import { create } from 'zustand';
import { CameraDevice, CameraState, FacingMode, ResolutionPreset } from '@/types/camera';

interface CameraActions {
  setStream: (stream: MediaStream | null) => void;
  setActiveDeviceId: (deviceId: string | null) => void;
  setDevices: (devices: CameraDevice[]) => void;
  setFacingMode: (facingMode: FacingMode) => void;
  setResolution: (resolution: ResolutionPreset) => void;
  toggleMirror: () => void;
  setPermissionState: (state: 'prompt' | 'granted' | 'denied' | 'unsupported') => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useCameraStore = create<CameraState & CameraActions>((set) => ({
  stream: null,
  activeDeviceId: null,
  devices: [],
  facingMode: 'user',
  resolution: '1080p',
  isMirrored: true,
  permissionState: 'prompt',
  error: null,
  isLoading: false,

  setStream: (stream) => set({ stream }),
  setActiveDeviceId: (activeDeviceId) => set({ activeDeviceId }),
  setDevices: (devices) => set({ devices }),
  setFacingMode: (facingMode) => set({ facingMode }),
  setResolution: (resolution) => set({ resolution }),
  toggleMirror: () => set((state) => ({ isMirrored: !state.isMirrored })),
  setPermissionState: (permissionState) => set({ permissionState }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
