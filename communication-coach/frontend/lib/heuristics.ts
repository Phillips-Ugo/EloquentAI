import { LandmarkData, FeedbackItem, AggregateScores, HeuristicConfig } from '@/types';
import { appConfig } from './config';

export class HeuristicsEngine {
  private config: HeuristicConfig;
  private smoothingBuffer: LandmarkData[] = [];
  private readonly MAX_BUFFER_SIZE = 30; // 1 second at 30fps

  constructor(config?: Partial<HeuristicConfig>) {
    this.config = { ...appConfig.heuristics, ...config };
  }

  /**
   * Analyze landmarks and generate feedback
   */
  public analyzeLandmarks(landmarks: LandmarkData): FeedbackItem[] {
    this.addToBuffer(landmarks);
    const feedback: FeedbackItem[] = [];

    // Eye contact analysis
    const eyeContactFeedback = this.analyzeEyeContact(landmarks);
    if (eyeContactFeedback) feedback.push(eyeContactFeedback);

    // Posture analysis
    const postureFeedback = this.analyzePosture(landmarks);
    if (postureFeedback) feedback.push(postureFeedback);

    // Smile analysis
    const smileFeedback = this.analyzeSmile(landmarks);
    if (smileFeedback) feedback.push(smileFeedback);

    // Hand fidget analysis
    const fidgetFeedback = this.analyzeFidget(landmarks);
    if (fidgetFeedback) feedback.push(fidgetFeedback);

    return feedback;
  }

  /**
   * Calculate aggregate scores from recent landmarks
   */
  public calculateAggregateScores(): AggregateScores {
    if (this.smoothingBuffer.length === 0) {
      return {
        posture_score: 0,
        eye_contact_score: 0,
        fidget_score: 0,
        smile_score: 0,
      };
    }

    const recentLandmarks = this.smoothingBuffer.slice(-10); // Last 10 frames
    
    return {
      posture_score: this.calculateAveragePostureScore(recentLandmarks),
      eye_contact_score: this.calculateAverageEyeContactScore(recentLandmarks),
      fidget_score: this.calculateAverageFidgetScore(recentLandmarks),
      smile_score: this.calculateAverageSmileScore(recentLandmarks),
    };
  }

  /**
   * Eye contact analysis using head pose estimation
   */
  private analyzeEyeContact(landmarks: LandmarkData): FeedbackItem | null {
    if (landmarks.face.length < 68) return null; // Need face landmarks

    const faceLandmarks = landmarks.face;
    
    // Calculate head pose using key face landmarks
    const nose = faceLandmarks[30]; // Nose tip
    const leftEye = faceLandmarks[36];
    const rightEye = faceLandmarks[45];
    const chin = faceLandmarks[8];

    if (!nose || !leftEye || !rightEye || !chin) return null;

    // Calculate yaw (left-right rotation)
    const eyeCenter = [
      (leftEye[0] + rightEye[0]) / 2,
      (leftEye[1] + rightEye[1]) / 2,
    ];
    const yaw = Math.atan2(nose[0] - eyeCenter[0], nose[2] - eyeCenter[2]) * (180 / Math.PI);

    // Calculate pitch (up-down rotation)
    const pitch = Math.atan2(chin[1] - nose[1], nose[2] - chin[2]) * (180 / Math.PI);

    const yawAbs = Math.abs(yaw);
    const pitchAbs = Math.abs(pitch);

    let severity: 'good' | 'warning' | 'critical' = 'good';
    let message = 'Good eye contact maintained';
    let actionableTip = 'Keep looking at the camera or audience';

    if (yawAbs > this.config.eye_contact.yaw_threshold || pitchAbs > this.config.eye_contact.pitch_threshold) {
      severity = yawAbs > 30 || pitchAbs > 25 ? 'critical' : 'warning';
      message = `Looking away (yaw: ${yawAbs.toFixed(1)}°, pitch: ${pitchAbs.toFixed(1)}°)`;
      actionableTip = 'Try to maintain eye contact with the camera or audience';
    }

    const score = Math.max(0, 1 - (yawAbs / 30 + pitchAbs / 20) / 2);

    return {
      timestamp: landmarks.t,
      type: 'eye_contact',
      score,
      message,
      severity,
      actionable_tip: actionableTip,
    };
  }

  /**
   * Posture analysis using torso angle
   */
  private analyzePosture(landmarks: LandmarkData): FeedbackItem | null {
    if (landmarks.pose.length < 33) return null; // Need pose landmarks

    const poseLandmarks = landmarks.pose;
    
    // Key landmarks for posture
    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    const leftHip = poseLandmarks[23];
    const rightHip = poseLandmarks[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

    // Calculate shoulder and hip midpoints
    const shoulderMid = [
      (leftShoulder[0] + rightShoulder[0]) / 2,
      (leftShoulder[1] + rightShoulder[1]) / 2,
    ];
    const hipMid = [
      (leftHip[0] + rightHip[0]) / 2,
      (leftHip[1] + rightHip[1]) / 2,
    ];

    // Calculate torso vector
    const torsoVector = [
      shoulderMid[0] - hipMid[0],
      shoulderMid[1] - hipMid[1],
    ];

    // Calculate angle from vertical
    const verticalVector = [0, -1]; // Camera coordinates: up is negative Y
    const dotProduct = torsoVector[0] * verticalVector[0] + torsoVector[1] * verticalVector[1];
    const magnitude = Math.sqrt(torsoVector[0] ** 2 + torsoVector[1] ** 2);
    const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct / magnitude))) * (180 / Math.PI);

    let severity: 'good' | 'warning' | 'critical' = 'good';
    let message = 'Good posture maintained';
    let actionableTip = 'Keep your shoulders back and spine straight';

    if (angle > this.config.posture.torso_angle_critical) {
      severity = 'critical';
      message = `Poor posture detected (${angle.toFixed(1)}° deviation)`;
      actionableTip = 'Straighten your back and pull your shoulders back';
    } else if (angle > this.config.posture.torso_angle_warning) {
      severity = 'warning';
      message = `Slight posture deviation (${angle.toFixed(1)}°)`;
      actionableTip = 'Adjust your posture slightly';
    }

    const score = Math.max(0, 1 - angle / 30);

    return {
      timestamp: landmarks.t,
      type: 'posture',
      score,
      message,
      severity,
      actionable_tip: actionableTip,
    };
  }

  /**
   * Smile detection using mouth landmarks
   */
  private analyzeSmile(landmarks: LandmarkData): FeedbackItem | null {
    if (landmarks.face.length < 68) return null;

    const faceLandmarks = landmarks.face;
    
    // Mouth corner landmarks
    const leftMouthCorner = faceLandmarks[48];
    const rightMouthCorner = faceLandmarks[54];
    const leftFaceContour = faceLandmarks[0];
    const rightFaceContour = faceLandmarks[16];

    if (!leftMouthCorner || !rightMouthCorner || !leftFaceContour || !rightFaceContour) {
      return null;
    }

    // Calculate mouth width and face width
    const mouthWidth = Math.sqrt(
      (rightMouthCorner[0] - leftMouthCorner[0]) ** 2 +
      (rightMouthCorner[1] - leftMouthCorner[1]) ** 2
    );
    const faceWidth = Math.sqrt(
      (rightFaceContour[0] - leftFaceContour[0]) ** 2 +
      (rightFaceContour[1] - leftFaceContour[1]) ** 2
    );

    const smileRatio = mouthWidth / faceWidth;

    let severity: 'good' | 'warning' | 'critical' = 'warning';
    let message = 'Consider smiling more';
    let actionableTip = 'A genuine smile can make you appear more confident and approachable';

    if (smileRatio > this.config.smile.ratio_threshold) {
      severity = 'good';
      message = 'Great smile!';
      actionableTip = 'Maintain that confident smile';
    }

    const score = Math.min(1, smileRatio / this.config.smile.ratio_threshold);

    return {
      timestamp: landmarks.t,
      type: 'smile',
      score,
      message,
      severity,
      actionable_tip: actionableTip,
    };
  }

  /**
   * Hand fidget analysis using hand movement velocity
   */
  private analyzeFidget(landmarks: LandmarkData): FeedbackItem | null {
    if (landmarks.left_hand.length === 0 && landmarks.right_hand.length === 0) {
      return null;
    }

    // Calculate hand centroid velocity
    const currentCentroid = this.calculateHandCentroid(landmarks);
    if (!currentCentroid) return null;

    if (this.smoothingBuffer.length < 2) {
      return null; // Need at least 2 frames to calculate velocity
    }

    const previousLandmarks = this.smoothingBuffer[this.smoothingBuffer.length - 2];
    const previousCentroid = this.calculateHandCentroid(previousLandmarks);
    if (!previousCentroid) return null;

    const timeDelta = landmarks.t - previousLandmarks.t;
    if (timeDelta <= 0) return null;

    // Calculate velocity magnitude
    const velocity = [
      (currentCentroid[0] - previousCentroid[0]) / timeDelta,
      (currentCentroid[1] - previousCentroid[1]) / timeDelta,
    ];
    const velocityMagnitude = Math.sqrt(velocity[0] ** 2 + velocity[1] ** 2);

    // Smooth velocity over recent frames
    const avgVelocity = this.calculateAverageVelocity();
    const normalizedVelocity = Math.min(1, avgVelocity / this.config.fidget.velocity_threshold);

    let severity: 'good' | 'warning' | 'critical' = 'good';
    let message = 'Hands are steady';
    let actionableTip = 'Keep your hands relaxed and purposeful';

    if (normalizedVelocity > 1.5) {
      severity = 'critical';
      message = 'Excessive hand movement detected';
      actionableTip = 'Try to keep your hands more still or use purposeful gestures';
    } else if (normalizedVelocity > 1.0) {
      severity = 'warning';
      message = 'Some hand fidgeting detected';
      actionableTip = 'Try to minimize unnecessary hand movements';
    }

    const score = Math.max(0, 1 - normalizedVelocity);

    return {
      timestamp: landmarks.t,
      type: 'fidget',
      score,
      message,
      severity,
      actionable_tip: actionableTip,
    };
  }

  /**
   * Calculate hand centroid from available hand landmarks
   */
  private calculateHandCentroid(landmarks: LandmarkData): [number, number] | null {
    const allHandLandmarks = [...landmarks.left_hand, ...landmarks.right_hand];
    if (allHandLandmarks.length === 0) return null;

    const x = allHandLandmarks.reduce((sum, lm) => sum + lm[0], 0) / allHandLandmarks.length;
    const y = allHandLandmarks.reduce((sum, lm) => sum + lm[1], 0) / allHandLandmarks.length;

    return [x, y];
  }

  /**
   * Calculate average velocity over recent frames
   */
  private calculateAverageVelocity(): number {
    if (this.smoothingBuffer.length < 2) return 0;

    let totalVelocity = 0;
    let validFrames = 0;

    for (let i = 1; i < this.smoothingBuffer.length; i++) {
      const current = this.smoothingBuffer[i];
      const previous = this.smoothingBuffer[i - 1];
      
      const currentCentroid = this.calculateHandCentroid(current);
      const previousCentroid = this.calculateHandCentroid(previous);
      
      if (currentCentroid && previousCentroid) {
        const timeDelta = current.t - previous.t;
        if (timeDelta > 0) {
          const velocity = [
            (currentCentroid[0] - previousCentroid[0]) / timeDelta,
            (currentCentroid[1] - previousCentroid[1]) / timeDelta,
          ];
          totalVelocity += Math.sqrt(velocity[0] ** 2 + velocity[1] ** 2);
          validFrames++;
        }
      }
    }

    return validFrames > 0 ? totalVelocity / validFrames : 0;
  }

  /**
   * Add landmarks to smoothing buffer
   */
  private addToBuffer(landmarks: LandmarkData): void {
    this.smoothingBuffer.push(landmarks);
    if (this.smoothingBuffer.length > this.MAX_BUFFER_SIZE) {
      this.smoothingBuffer.shift();
    }
  }

  /**
   * Calculate average scores from recent landmarks
   */
  private calculateAveragePostureScore(landmarks: LandmarkData[]): number {
    let totalScore = 0;
    let validScores = 0;

    landmarks.forEach(lm => {
      const feedback = this.analyzePosture(lm);
      if (feedback) {
        totalScore += feedback.score;
        validScores++;
      }
    });

    return validScores > 0 ? totalScore / validScores : 0;
  }

  private calculateAverageEyeContactScore(landmarks: LandmarkData[]): number {
    let totalScore = 0;
    let validScores = 0;

    landmarks.forEach(lm => {
      const feedback = this.analyzeEyeContact(lm);
      if (feedback) {
        totalScore += feedback.score;
        validScores++;
      }
    });

    return validScores > 0 ? totalScore / validScores : 0;
  }

  private calculateAverageSmileScore(landmarks: LandmarkData[]): number {
    let totalScore = 0;
    let validScores = 0;

    landmarks.forEach(lm => {
      const feedback = this.analyzeSmile(lm);
      if (feedback) {
        totalScore += feedback.score;
        validScores++;
      }
    });

    return validScores > 0 ? totalScore / validScores : 0;
  }

  private calculateAverageFidgetScore(landmarks: LandmarkData[]): number {
    let totalScore = 0;
    let validScores = 0;

    landmarks.forEach(lm => {
      const feedback = this.analyzeFidget(lm);
      if (feedback) {
        totalScore += feedback.score;
        validScores++;
      }
    });

    return validScores > 0 ? totalScore / validScores : 0;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<HeuristicConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear smoothing buffer
   */
  public clearBuffer(): void {
    this.smoothingBuffer = [];
  }
}

export default HeuristicsEngine;
