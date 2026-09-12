import { useCallback, useRef, useState } from 'react';
import { useBoothStore } from '@/store/boothStore';
import { useEffectStore } from '@/store/effectStore';
import { useCameraStore } from '@/store/cameraStore';
import { playCountdownBeep, playShutterSound, playFlashSound } from '@/lib/audio/soundEffects';
import { processHighResSnapshot, createThumbnailFromBlob } from '@/lib/canvas/composite';
import { createPhotoStripBlob } from '@/lib/export/strip';
import { getStripPreset } from '@/lib/export/stripPresets';
import { createBoomerangGifBlob } from '@/lib/export/gif';
import { savePhotoToDB } from '@/lib/storage/photos';
import { PhotoRecord, PhotoStripConfig } from '@/types/photo';
import { EFFECTS_REGISTRY } from '@/lib/effects/registry';
import { arTracker } from '@/lib/effects/arTracker';

export function usePhotoBooth(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const {
    mode,
    selectedStripLayout,
    countdownDuration,
    isCountingDown,
    currentCountdown,
    isCapturing,
    isSoundEnabled,
    isFlashEnabled,
    setIsCountingDown,
    setCurrentCountdown,
    setIsCapturing,
    startSequence,
    addSequenceBlob,
    clearSequence,
  } = useBoothStore();

  const { activeEffectId, strength } = useEffectStore();
  const { isMirrored } = useCameraStore();

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isCameraReady = useCallback((): boolean => {
    const { stream, permissionState, error } = useCameraStore.getState();
    if (permissionState === 'denied' || Boolean(error) || !stream) return false;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack || !videoTrack.enabled || videoTrack.readyState !== 'live') return false;

    if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
      return false;
    }
    return true;
  }, [videoRef]);

  const captureSingleSnapshot = useCallback(async (): Promise<Blob> => {
    if (!isCameraReady()) throw new Error('Camera is turned off or video stream is unavailable');

    const { isSoundEnabled, isFlashEnabled } = useBoothStore.getState();
    const { activeEffectId, strength } = useEffectStore.getState();
    const { isMirrored } = useCameraStore.getState();

    if (isSoundEnabled) playShutterSound();
    if (isFlashEnabled && isSoundEnabled) playFlashSound();

    let arFeatures = null;
    const effect = EFFECTS_REGISTRY.find(e => e.id === activeEffectId);
    if (effect?.category === 'prop') {
      try {
        arFeatures = await arTracker.detectFace(videoRef.current!);
      } catch (e) {
        console.error("AR track error on capture:", e);
      }
    }

    return processHighResSnapshot(
      videoRef.current!,
      activeEffectId,
      strength,
      isMirrored,
      'image/jpeg',
      0.92,
      arFeatures
    );
  }, [videoRef, isCameraReady]);

  const triggerCaptureSequence = useCallback(() => {
    if (!isCameraReady() || isCountingDown || isCapturing) return;

    if (countdownDuration === 0) {
      executeCaptureFlow();
      return;
    }

    setIsCountingDown(true);
    setCurrentCountdown(countdownDuration);
    if (isSoundEnabled) playCountdownBeep(false);

    let count = countdownDuration;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      setCurrentCountdown(count);

      if (count > 0) {
        if (isBoothSoundEnabled()) playCountdownBeep(false);
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (isBoothSoundEnabled()) playCountdownBeep(true);
        setIsCountingDown(false);
        executeCaptureFlow();
      }
    }, 1000);
  }, [countdownDuration, isCountingDown, isCapturing, isSoundEnabled, setIsCountingDown, setCurrentCountdown]); // Intentionally omitting executeCaptureFlow to avoid recreating interval, executeCaptureFlow uses getState.

  // Helper to get fresh sound state inside setInterval
  const isBoothSoundEnabled = () => useBoothStore.getState().isSoundEnabled;

  const executeCaptureFlow = useCallback(async () => {
    if (!isCameraReady()) {
      setIsCapturing(false);
      return;
    }
    setIsCapturing(true);
    
    const { mode, selectedStripLayout } = useBoothStore.getState();
    const { activeEffectId, strength } = useEffectStore.getState();

    try {
      if (mode === 'PHOTO' || mode === 'POLAROID') {
        const blob = await captureSingleSnapshot();
        setIsProcessing(true);
        const thumbnailBlob = await createThumbnailFromBlob(blob);

        const record: PhotoRecord = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          originalBlob: blob,
          processedBlob: blob,
          thumbnailBlob,
          createdAt: Date.now(),
          width: 1920,
          height: 1080,
          effectId: activeEffectId,
          effectSettings: { strength },
          type: mode === 'POLAROID' ? 'polaroid' : 'single',
        };

        await savePhotoToDB(record);
      } else if (mode === '4-SHOT' || mode === 'PHOTO_STRIP') {
        const preset = getStripPreset(selectedStripLayout);
        const shotCount = preset.shotCount || 4;

        startSequence(shotCount);
        const sequenceBlobs: Blob[] = [];

        for (let shot = 1; shot <= shotCount; shot++) {
          const blob = await captureSingleSnapshot();
          sequenceBlobs.push(blob);
          addSequenceBlob(blob);

          // Brief delay between shots
          if (shot < shotCount) {
            await new Promise((res) => setTimeout(res, 1200));
          }
        }

        setIsProcessing(true);
        // Generate themed photo strip
        const stripBlob = await createPhotoStripBlob(sequenceBlobs, {
          layout: preset.id as PhotoStripConfig['layout'],
          backgroundColor: preset.backgroundColor,
          borderColor: preset.borderColor,
          borderWidth: 20,
          padding: 24,
          headerText: preset.defaultHeader,
          subtitleText: preset.defaultSubtitle,
          badgeText: preset.badgeText,
          showDate: true,
        });

        const thumbnailBlob = await createThumbnailFromBlob(stripBlob);

        const record: PhotoRecord = {
          id: `strip_${preset.id}_${Date.now()}`,
          originalBlob: stripBlob,
          processedBlob: stripBlob,
          thumbnailBlob,
          createdAt: Date.now(),
          width: 720,
          height: 2400,
          effectId: activeEffectId,
          effectSettings: { strength },
          type: 'strip',
          metadata: {
            title: preset.defaultHeader,
          },
        };

        await savePhotoToDB(record);
        clearSequence();
      } else if (mode === 'BOOMERANG' || mode === 'GIF') {
        // Capture rapid 8 frames
        const frameBlobs: Blob[] = [];
        for (let f = 0; f < 8; f++) {
          const blob = await captureSingleSnapshot();
          frameBlobs.push(blob);
          await new Promise((res) => setTimeout(res, 150));
        }

        setIsProcessing(true);
        const gifBlob = await createBoomerangGifBlob(frameBlobs, 120);
        const thumbnailBlob = await createThumbnailFromBlob(frameBlobs[0]);

        const record: PhotoRecord = {
          id: `gif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          originalBlob: gifBlob,
          processedBlob: gifBlob,
          thumbnailBlob,
          createdAt: Date.now(),
          width: 640,
          height: 1080,
          effectId: activeEffectId,
          effectSettings: { strength },
          type: mode === 'BOOMERANG' ? 'boomerang' : 'gif',
        };

        await savePhotoToDB(record);
      }
    } catch (err) {
      console.error('Capture flow error:', err);
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  }, [captureSingleSnapshot, startSequence, addSequenceBlob, clearSequence, setIsCapturing]);

  return {
    isCountingDown,
    currentCountdown,
    isCapturing,
    isProcessing,
    triggerCaptureSequence,
  };
}
