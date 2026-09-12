import { useCallback, useEffect } from 'react';
import { useCameraStore } from '@/store/cameraStore';
import { requestCameraStream, stopMediaStream } from '@/lib/camera/camera';
import { getAvailableCameraDevices } from '@/lib/camera/devices';
import { checkCameraPermissions } from '@/lib/camera/permissions';
import { FacingMode } from '@/types/camera';

export function useCamera() {
  const {
    stream,
    activeDeviceId,
    devices,
    facingMode,
    resolution,
    isMirrored,
    permissionState,
    error,
    isLoading,
    setStream,
    setActiveDeviceId,
    setDevices,
    setFacingMode,
    toggleMirror,
    setPermissionState,
    setError,
    setIsLoading,
  } = useCameraStore();

  const initCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const perm = await checkCameraPermissions();
    setPermissionState(perm);

    if (perm === 'unsupported') {
      setError('Camera access is not supported in this browser or unsecure context.');
      setIsLoading(false);
      return;
    }

    try {
      if (stream) {
        stopMediaStream(stream);
      }

      const newStream = await requestCameraStream(facingMode, resolution, activeDeviceId);
      setStream(newStream);
      setPermissionState('granted');

      const availableDevices = await getAvailableCameraDevices();
      setDevices(availableDevices);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to initialize camera');
      setPermissionState('denied');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, resolution, activeDeviceId, setStream, setPermissionState, setError, setIsLoading, setDevices]);

  const switchFacingMode = useCallback(() => {
    const nextMode: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setActiveDeviceId(null); // Reset explicit device when switching mode
  }, [facingMode, setFacingMode, setActiveDeviceId]);

  useEffect(() => {
    initCamera();

    return () => {
      if (stream) {
        stopMediaStream(stream);
      }
    };
  }, [facingMode, activeDeviceId, resolution]);

  return {
    stream,
    activeDeviceId,
    devices,
    facingMode,
    resolution,
    isMirrored,
    permissionState,
    error,
    isLoading,
    initCamera,
    switchFacingMode,
    toggleMirror,
  };
}
