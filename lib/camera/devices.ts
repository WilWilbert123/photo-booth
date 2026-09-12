import { CameraDevice } from '@/types/camera';

export async function getAvailableCameraDevices(): Promise<CameraDevice[]> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');

    return videoDevices.map((device, index) => {
      const label = device.label || `Camera ${index + 1}`;
      const isFront = label.toLowerCase().includes('front') || label.toLowerCase().includes('user') || index === 0;

      return {
        deviceId: device.deviceId,
        label,
        groupId: device.groupId,
        facing: isFront ? 'user' : 'environment',
      };
    });
  } catch {
    return [];
  }
}
