import type * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import type * as tf from '@tensorflow/tfjs-core';

export interface ARFaceFeatures {
  leftEye: { x: number; y: number; z?: number };
  rightEye: { x: number; y: number; z?: number };
  noseTip: { x: number; y: number; z?: number };
  forehead: { x: number; y: number; z?: number };
  mouthCenter: { x: number; y: number; z?: number };
  width: number;
  height: number;
  angle: number; // Angle of the face in radians (roll)
}

class ARTracker {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.detector) return;
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = (async () => {
      try {
        const tf = await import('@tensorflow/tfjs-core');
        await import('@tensorflow/tfjs-backend-webgl');
        const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');
        
        await tf.setBackend('webgl');
        await tf.ready();
        
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
          runtime: 'tfjs',
          refineLandmarks: false,
          maxFaces: 1,
        };

        this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      } catch (error) {
        console.error("Failed to initialize AR Tracker:", error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initializationPromise;
  }

  async detectFace(videoElement: HTMLVideoElement): Promise<ARFaceFeatures | null> {
    if (!this.detector) {
      return null;
    }

    try {
      const faces = await this.detector.estimateFaces(videoElement, { flipHorizontal: false });
      if (faces.length === 0) return null;

      const face = faces[0];
      const keypoints = face.keypoints;

      const leftEye = keypoints[159]; // Left eye upper
      const rightEye = keypoints[386]; // Right eye upper
      const noseTip = keypoints[1];
      const forehead = keypoints[10];
      const mouthCenter = keypoints[13];
      
      const leftCheek = keypoints[234];
      const rightCheek = keypoints[454];
      
      const width = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y);
      const height = Math.hypot(mouthCenter.x - forehead.x, mouthCenter.y - forehead.y) * 1.5;

      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const angle = Math.atan2(dy, dx);

      return {
        leftEye,
        rightEye,
        noseTip,
        forehead,
        mouthCenter,
        width,
        height,
        angle
      };
    } catch (e) {
      console.error("Face detection error:", e);
      return null;
    }
  }
}

export const arTracker = new ARTracker();
