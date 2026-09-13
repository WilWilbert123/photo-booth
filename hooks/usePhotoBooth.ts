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

export function usePhotoBooth(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onTriggerFlash?: () => void,
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
) {
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

  const runSingleShotCountdown = useCallback(async (shotNum: number, totalShots: number) => {
    const { countdownDuration, isSoundEnabled, setSequenceShotStatusText, setIsCountingDown, setCurrentCountdown } = useBoothStore.getState();
    
    // Each photo in a multi-shot strip runs a countdown (3s default or countdownDuration, min 2s per shot)
    const duration = countdownDuration > 0 ? countdownDuration : 3;

    setSequenceShotStatusText(`Photo ${shotNum} of ${totalShots}`);
    setIsCountingDown(true);
    setCurrentCountdown(duration);

    for (let c = duration; c > 0; c--) {
      useBoothStore.getState().setCurrentCountdown(c);
      if (useBoothStore.getState().isSoundEnabled) playCountdownBeep(false);
      await new Promise((res) => setTimeout(res, 1000));
    }

    if (useBoothStore.getState().isSoundEnabled) playCountdownBeep(true);
    setIsCountingDown(false);
  }, []);

  const triggerCaptureSequence = useCallback(() => {
    if (!isCameraReady() || isCountingDown || isCapturing) return;

    if (mode === 'PHOTO' || mode === 'POLAROID') {
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
    } else {
      executeCaptureFlow();
    }
  }, [countdownDuration, mode, isCountingDown, isCapturing, isSoundEnabled, setIsCountingDown, setCurrentCountdown]);

  const isBoothSoundEnabled = () => useBoothStore.getState().isSoundEnabled;

  const recordLiveMotionClip = async (
    rawStream: MediaStream | null,
    canvasEl: HTMLCanvasElement | null
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      try {
        let streamToRecord: MediaStream | null = null;
        if (canvasEl && typeof (canvasEl as any).captureStream === 'function') {
          try {
            streamToRecord = (canvasEl as any).captureStream(30);
          } catch (e) {
            console.warn('Canvas captureStream fallback to raw camera stream:', e);
          }
        }
        if (!streamToRecord) {
          streamToRecord = rawStream;
        }

        if (!streamToRecord || typeof window === 'undefined' || !window.MediaRecorder) {
          resolve(null);
          return;
        }

        let options: MediaRecorderOptions = {};
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            options = { mimeType: 'video/webm;codecs=vp9' };
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/webm' };
          } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4' };
          }
        }

        const mediaRecorder = new MediaRecorder(streamToRecord, options);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const mime = options.mimeType || mediaRecorder.mimeType || 'video/webm';
          const videoBlob = new Blob(chunks, { type: mime });
          resolve(videoBlob);
        };

        mediaRecorder.start(100);
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 1600);
      } catch (err) {
        console.warn('Live photo recording warning:', err);
        resolve(null);
      }
    });
  };

  const executeCaptureFlow = useCallback(async () => {
    if (!isCameraReady()) {
      setIsCapturing(false);
      return;
    }
    setIsCapturing(true);
    
    const { mode, selectedStripLayout, isLivePhotoEnabled } = useBoothStore.getState();
    const { activeEffectId, strength } = useEffectStore.getState();
    const { stream } = useCameraStore.getState();

    try {
      if (mode === 'PHOTO' || mode === 'POLAROID') {
        if (onTriggerFlash && useBoothStore.getState().isFlashEnabled) {
          onTriggerFlash();
        }

        // Live Photo motion clip capture (records canvas with active filter/effect applied!)
        let liveVideoBlob: Blob | undefined;
        if (isLivePhotoEnabled && (stream || canvasRef?.current)) {
          liveVideoBlob = (await recordLiveMotionClip(stream, canvasRef?.current || null)) || undefined;
        }

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
          liveVideoBlob,
          isLivePhoto: !!liveVideoBlob,
        };

        await savePhotoToDB(record);
      } else if (mode === '4-SHOT' || mode === 'PHOTO_STRIP') {
        const preset = getStripPreset(selectedStripLayout);
        const shotCount = preset.shotCount || 4;

        startSequence(shotCount);

        for (let shot = 1; shot <= shotCount; shot++) {
          // 1. Per-shot countdown
          await runSingleShotCountdown(shot, shotCount);

          // 2. Screen Flash!
          if (onTriggerFlash && useBoothStore.getState().isFlashEnabled) {
            onTriggerFlash();
          }

          // 3. Capture Snapshot
          const blob = await captureSingleSnapshot();
          addSequenceBlob(blob);

          // 4. Brief status pause before next photo
          if (shot < shotCount) {
            useBoothStore.getState().setSequenceShotStatusText(`Photo ${shot} Captured! Get ready...`);
            await new Promise((res) => setTimeout(res, 1200));
          }
        }

        // Open Review Modal instead of saving silently!
        useBoothStore.getState().setSequenceShotStatusText(null);
        useBoothStore.getState().setShowSequenceReviewModal(true);
        setIsCapturing(false);
      } else if (mode === 'BOOMERANG' || mode === 'GIF') {
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
  }, [captureSingleSnapshot, startSequence, addSequenceBlob, isCameraReady, onTriggerFlash, runSingleShotCountdown, setIsCapturing]);

  const retakeSingleShot = useCallback(async (index: number) => {
    if (!isCameraReady()) return;

    const { sequenceTotalShots, setShowSequenceReviewModal, setRetakeIndex, setSequenceShotStatusText, replaceSequenceBlob } = useBoothStore.getState();
    
    setShowSequenceReviewModal(false);
    setRetakeIndex(index);
    setIsCapturing(true);

    try {
      await runSingleShotCountdown(index + 1, sequenceTotalShots);

      if (onTriggerFlash && useBoothStore.getState().isFlashEnabled) {
        onTriggerFlash();
      }

      const newBlob = await captureSingleSnapshot();
      replaceSequenceBlob(index, newBlob);
    } catch (e) {
      console.error("Retake error:", e);
    } finally {
      setIsCapturing(false);
      setRetakeIndex(null);
      setSequenceShotStatusText(null);
      setShowSequenceReviewModal(true);
    }
  }, [isCameraReady, runSingleShotCountdown, captureSingleSnapshot, onTriggerFlash, setIsCapturing]);

  const finalizePhotoStrip = useCallback(async () => {
    const { sequenceCapturedBlobs, selectedStripLayout, clearSequence, setShowSequenceReviewModal } = useBoothStore.getState();
    const { activeEffectId, strength } = useEffectStore.getState();

    if (!sequenceCapturedBlobs || sequenceCapturedBlobs.length === 0) return;

    setShowSequenceReviewModal(false);
    setIsProcessing(true);

    try {
      const preset = getStripPreset(selectedStripLayout);
      const stripBlob = await createPhotoStripBlob(sequenceCapturedBlobs, {
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
    } catch (err) {
      console.error('Failed to finalize photo strip:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isCountingDown,
    currentCountdown,
    isCapturing,
    isProcessing,
    triggerCaptureSequence,
    retakeSingleShot,
    finalizePhotoStrip,
  };
}
