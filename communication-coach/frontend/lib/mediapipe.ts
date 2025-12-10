import { Holistic, Results } from '@mediapipe/holistic';
import { LandmarkData } from '@/types';

export class MediaPipeManager {
  private holistic: Holistic | null = null;
  private isInitialized = false;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private onResultsCallback: ((results: Results) => void) | null = null;
  private onLandmarksCallback: ((landmarks: LandmarkData) => void) | null = null;

  constructor() {
    this.initializeHolistic();
  }

  private async initializeHolistic(): Promise<void> {
    try {
      this.holistic = new Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        },
      });

      this.holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.holistic.onResults((results) => {
        this.handleResults(results);
      });

      this.isInitialized = true;
      console.log('✅ MediaPipe Holistic initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MediaPipe Holistic:', error);
      throw error;
    }
  }

  private handleResults(results: Results): void {
    if (this.onResultsCallback) {
      this.onResultsCallback(results);
    }

    // Extract landmarks and convert to our format
    const landmarks = this.extractLandmarks(results);
    if (this.onLandmarksCallback && landmarks) {
      this.onLandmarksCallback(landmarks);
    }

    // Draw landmarks on canvas
    this.drawLandmarks(results);
  }

  private extractLandmarks(results: Results): LandmarkData | null {
    if (!results.faceLandmarks || !results.poseLandmarks) {
      return null;
    }

    return {
      t: performance.now() / 1000, // Convert to seconds
      face: results.faceLandmarks.map(lm => [lm.x, lm.y, lm.z || 0]),
      pose: results.poseLandmarks.map(lm => [lm.x, lm.y, lm.z || 0]),
      left_hand: results.leftHandLandmarks?.map(lm => [lm.x, lm.y, lm.z || 0]) || [],
      right_hand: results.rightHandLandmarks?.map(lm => [lm.x, lm.y, lm.z || 0]) || [],
    };
  }

  private drawLandmarks(results: Results): void {
    if (!this.canvasElement || !this.ctx || !this.videoElement) {
      return;
    }

    const { width, height } = this.canvasElement;
    this.ctx.save();
    this.ctx.clearRect(0, 0, width, height);

    // Draw face landmarks
    if (results.faceLandmarks) {
      this.ctx.fillStyle = '#FF0000';
      results.faceLandmarks.forEach((landmark, index) => {
        const x = landmark.x * width;
        const y = landmark.y * height;
        this.ctx!.fillRect(x, y, 2, 2);
      });
    }

    // Draw pose landmarks
    if (results.poseLandmarks) {
      this.ctx.strokeStyle = '#00FF00';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      
      const connections = [
        [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
        [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
        [11, 23], [12, 24], [23, 24],
        [23, 25], [25, 27], [27, 29], [29, 31],
        [24, 26], [26, 28], [28, 30], [30, 32],
      ];

      connections.forEach(([start, end]) => {
        const startLandmark = results.poseLandmarks![start];
        const endLandmark = results.poseLandmarks![end];
        
        if (startLandmark && endLandmark) {
          this.ctx!.moveTo(startLandmark.x * width, startLandmark.y * height);
          this.ctx!.lineTo(endLandmark.x * width, endLandmark.y * height);
        }
      });
      
      this.ctx.stroke();
    }

    // Draw hand landmarks
    if (results.leftHandLandmarks) {
      this.ctx.fillStyle = '#0000FF';
      results.leftHandLandmarks.forEach(landmark => {
        const x = landmark.x * width;
        const y = landmark.y * height;
        this.ctx!.fillRect(x, y, 3, 3);
      });
    }

    if (results.rightHandLandmarks) {
      this.ctx.fillStyle = '#FFFF00';
      results.rightHandLandmarks.forEach(landmark => {
        const x = landmark.x * width;
        const y = landmark.y * height;
        this.ctx!.fillRect(x, y, 3, 3);
      });
    }

    this.ctx.restore();
  }

  public async startAnalysis(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onResults?: (results: Results) => void,
    onLandmarks?: (landmarks: LandmarkData) => void
  ): Promise<void> {
    if (!this.isInitialized || !this.holistic) {
      throw new Error('MediaPipe not initialized');
    }

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onResultsCallback = onResults || null;
    this.onLandmarksCallback = onLandmarks || null;

    // Send video frames to MediaPipe
    const sendFrame = async () => {
      if (this.videoElement && this.holistic) {
        await this.holistic.send({ image: this.videoElement });
        requestAnimationFrame(sendFrame);
      }
    };

    await sendFrame();
  }

  public stopAnalysis(): void {
    this.videoElement = null;
    this.canvasElement = null;
    this.ctx = null;
    this.onResultsCallback = null;
    this.onLandmarksCallback = null;
  }

  public isReady(): boolean {
    return this.isInitialized && this.holistic !== null;
  }

  public cleanup(): void {
    if (this.holistic) {
      this.holistic.close();
      this.holistic = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
let mediaPipeInstance: MediaPipeManager | null = null;

export const getMediaPipeManager = (): MediaPipeManager => {
  if (!mediaPipeInstance) {
    mediaPipeInstance = new MediaPipeManager();
  }
  return mediaPipeInstance;
};

export default MediaPipeManager;
