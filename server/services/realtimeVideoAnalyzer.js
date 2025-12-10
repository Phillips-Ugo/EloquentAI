/**
 * Real-Time Video Analysis Service
 * Processes MediaPipe landmarks to provide real-time video analysis
 */

class RealtimeVideoAnalyzer {
  constructor() {
    this.frameHistory = new Map(); // sessionId -> frame history
    this.maxHistorySize = 30; // Keep last 30 frames (~1 second at 30fps)
  }

  /**
   * Analyze landmarks from MediaPipe PoseLandmarker
   * @param {Object} landmarks - MediaPipe pose landmarks
   * @param {string} sessionId - Session identifier
   * @returns {Object} Analysis results
   */
  analyzeLandmarks(landmarks, sessionId) {
    if (!landmarks || landmarks.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Get first person's landmarks (MediaPipe can detect multiple)
    const personLandmarks = Array.isArray(landmarks[0]) ? landmarks[0] : landmarks;

    // Initialize history for this session
    if (!this.frameHistory.has(sessionId)) {
      this.frameHistory.set(sessionId, []);
    }
    const history = this.frameHistory.get(sessionId);

    // Analyze current frame
    const frameAnalysis = {
      timestamp: Date.now(),
      posture: this.analyzePosture(personLandmarks),
      eyeContact: this.analyzeEyeContact(personLandmarks),
      gestures: this.analyzeGestures(personLandmarks),
      movement: this.analyzeMovement(personLandmarks, history),
      smile: this.analyzeSmile(personLandmarks),
      handPosition: this.analyzeHandPosition(personLandmarks)
    };

    // Add to history
    history.push(frameAnalysis);
    if (history.length > this.maxHistorySize) {
      history.shift(); // Remove oldest
    }

    // Calculate aggregate scores
    const aggregateScores = this.calculateAggregateScores(history);

    return {
      frame: frameAnalysis,
      aggregate: aggregateScores,
      feedback: this.generateFeedback(frameAnalysis, aggregateScores)
    };
  }

  /**
   * Analyze posture from pose landmarks
   */
  analyzePosture(landmarks) {
    try {
      // MediaPipe pose landmark indices
      const LEFT_SHOULDER = 11;
      const RIGHT_SHOULDER = 12;
      const LEFT_HIP = 23;
      const RIGHT_HIP = 24;
      const NOSE = 0;

      if (!landmarks[LEFT_SHOULDER] || !landmarks[RIGHT_SHOULDER] || 
          !landmarks[LEFT_HIP] || !landmarks[RIGHT_HIP]) {
        return { score: 0.75, status: 'unknown', angle: 0 };
      }

      // Calculate shoulder midpoint
      const shoulderMid = {
        x: (landmarks[LEFT_SHOULDER].x + landmarks[RIGHT_SHOULDER].x) / 2,
        y: (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2
      };
      // Calculate hip midpoint
      const hipMid = {
        x: (landmarks[LEFT_HIP].x + landmarks[RIGHT_HIP].x) / 2,
        y: (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2
      };

      // Calculate vertical alignment
      const verticalDiff = Math.abs(shoulderMid.x - hipMid.x);
      const torsoAngle = Math.atan2(
        Math.abs(shoulderMid.y - hipMid.y),
        Math.abs(shoulderMid.x - hipMid.x)
      ) * (180 / Math.PI);

      // Score based on alignment (0-90 degrees, where 0 is perfect vertical)
      const angleFromVertical = Math.abs(90 - torsoAngle);
      let score = 1.0 - (angleFromVertical / 30); // Penalize angles > 30 degrees
      score = Math.max(0, Math.min(1, score));

      let status = 'good';
      if (angleFromVertical > 25) status = 'poor';
      else if (angleFromVertical > 12) status = 'needs_improvement';

      return {
        score: score,
        status: status,
        angle: angleFromVertical,
        message: this.getPostureMessage(status, angleFromVertical)
      };
    } catch (error) {
      console.error('Posture analysis error:', error);
      return { score: 0.75, status: 'unknown', angle: 0 };
    }
  }

  /**
   * Analyze eye contact (head pose estimation)
   */
  analyzeEyeContact(landmarks) {
    try {
      const NOSE = 0;
      const LEFT_EYE = 2;
      const RIGHT_EYE = 5;
      const LEFT_EAR = 7;
      const RIGHT_EAR = 8;

      if (!landmarks[NOSE] || !landmarks[LEFT_EYE] || !landmarks[RIGHT_EYE]) {
        return { score: 0.75, status: 'unknown', lookingAtCamera: true };
      }

      // Calculate head center
      const headCenter = {
        x: (landmarks[LEFT_EYE].x + landmarks[RIGHT_EYE].x) / 2,
        y: (landmarks[LEFT_EYE].y + landmarks[RIGHT_EYE].y) / 2
      };

      // Estimate head pose (simplified - using nose position relative to eyes)
      const noseToEyeCenter = {
        x: landmarks[NOSE].x - headCenter.x,
        y: landmarks[NOSE].y - headCenter.y
      };

      // Calculate yaw (left-right head turn)
      const yaw = Math.atan2(noseToEyeCenter.x, Math.abs(noseToEyeCenter.y)) * (180 / Math.PI);
      
      // Calculate pitch (up-down head tilt)
      const pitch = Math.atan2(noseToEyeCenter.y, Math.abs(noseToEyeCenter.x)) * (180 / Math.PI);

      // Eye contact is good if head is facing forward (low yaw and pitch)
      const yawAbs = Math.abs(yaw);
      const pitchAbs = Math.abs(pitch);

      // Thresholds: >15° yaw or >12° pitch = not looking at camera
      const lookingAtCamera = yawAbs < 15 && pitchAbs < 12;

      // Score: 1.0 if perfect, decreases with angle
      const yawScore = Math.max(0, 1 - (yawAbs / 30));
      const pitchScore = Math.max(0, 1 - (pitchAbs / 20));
      const score = (yawScore + pitchScore) / 2;

      let status = 'good';
      if (!lookingAtCamera) {
        if (yawAbs > 25 || pitchAbs > 20) status = 'poor';
        else status = 'needs_improvement';
      }

      return {
        score: score,
        status: status,
        lookingAtCamera: lookingAtCamera,
        yaw: yaw,
        pitch: pitch,
        message: this.getEyeContactMessage(status, lookingAtCamera)
      };
    } catch (error) {
      console.error('Eye contact analysis error:', error);
      return { score: 0.75, status: 'unknown', lookingAtCamera: true };
    }
  }

  /**
   * Analyze gestures (hand movements)
   */
  analyzeGestures(landmarks) {
    try {
      // MediaPipe hand landmarks (if available in pose)
      // For now, we'll analyze arm positions
      const LEFT_WRIST = 15;
      const RIGHT_WRIST = 16;
      const LEFT_ELBOW = 13;
      const RIGHT_ELBOW = 14;
      const LEFT_SHOULDER = 11;
      const RIGHT_SHOULDER = 12;

      if (!landmarks[LEFT_WRIST] || !landmarks[RIGHT_WRIST]) {
        return { score: 0.70, status: 'unknown', gestureCount: 0 };
      }

      // Calculate hand positions relative to body
      const leftHandHeight = landmarks[LEFT_WRIST].y;
      const rightHandHeight = landmarks[RIGHT_WRIST].y;
      const shoulderHeight = (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2;

      // Detect if hands are raised (above shoulders = gesturing)
      const leftHandRaised = leftHandHeight < shoulderHeight;
      const rightHandRaised = rightHandHeight < shoulderHeight;

      // Calculate hand movement (would need history for this)
      // For now, just check if hands are in gesture position
      const gestureActive = leftHandRaised || rightHandRaised;

      // Score based on gesture activity
      let score = 0.5; // Base score
      if (gestureActive) score = 0.8; // Higher score if gesturing
      if (leftHandRaised && rightHandRaised) score = 0.9; // Both hands = even better

      return {
        score: score,
        status: gestureActive ? 'active' : 'passive',
        gestureActive: gestureActive,
        leftHandRaised: leftHandRaised,
        rightHandRaised: rightHandRaised,
        message: this.getGestureMessage(gestureActive)
      };
    } catch (error) {
      console.error('Gesture analysis error:', error);
      return { score: 0.70, status: 'unknown', gestureActive: false };
    }
  }

  /**
   * Analyze movement (fidgeting, stability)
   */
  analyzeMovement(landmarks, history) {
    if (!history || history.length < 2) {
      return { score: 0.75, status: 'unknown', movementLevel: 'normal' };
    }

    try {
      const NOSE = 0;
      const currentNose = landmarks[NOSE];
      const previousFrame = history[history.length - 2];

      if (!previousFrame || !previousFrame.frame) {
        return { score: 0.75, status: 'unknown', movementLevel: 'normal' };
      }

      // Calculate movement distance
      const movement = Math.sqrt(
        Math.pow(currentNose.x - previousFrame.frame.movement?.lastPosition?.x || 0, 2) +
        Math.pow(currentNose.y - previousFrame.frame.movement?.lastPosition?.y || 0, 2)
      );

      // High movement = fidgeting, low movement = stable
      const movementThreshold = 0.05; // Normalized coordinates
      const movementLevel = movement > movementThreshold * 2 ? 'high' : 
                            movement > movementThreshold ? 'normal' : 'low';

      // Score: moderate movement is best (not too still, not too fidgety)
      let score = 0.8;
      if (movementLevel === 'high') score = 0.6; // Too much movement
      if (movementLevel === 'low') score = 0.7; // Too still

      return {
        score: score,
        status: movementLevel === 'normal' ? 'good' : 'needs_improvement',
        movementLevel: movementLevel,
        movement: movement,
        lastPosition: { x: currentNose.x, y: currentNose.y }
      };
    } catch (error) {
      console.error('Movement analysis error:', error);
      return { score: 0.75, status: 'unknown', movementLevel: 'normal' };
    }
  }

  /**
   * Analyze smile (mouth position)
   */
  analyzeSmile(landmarks) {
    try {
      // MediaPipe face landmarks (if available)
      // For pose landmarks, we can estimate from mouth area
      const MOUTH_LEFT = 9;
      const MOUTH_RIGHT = 10;

      if (!landmarks[MOUTH_LEFT] || !landmarks[MOUTH_RIGHT]) {
        return { score: 0.70, status: 'unknown', smiling: false };
      }

      // Calculate mouth width
      const mouthWidth = Math.abs(landmarks[MOUTH_RIGHT].x - landmarks[MOUTH_LEFT].x);
      
      // Estimate smile (wider mouth = more likely smiling)
      // This is simplified - real implementation would use face mesh
      const faceWidth = 0.2; // Approximate face width in normalized coordinates
      const mouthRatio = mouthWidth / faceWidth;

      const smiling = mouthRatio > 0.15; // Threshold
      const score = Math.min(1.0, mouthRatio / 0.2); // Normalize to 0-1

      return {
        score: score,
        status: smiling ? 'smiling' : 'neutral',
        smiling: smiling,
        mouthRatio: mouthRatio
      };
    } catch (error) {
      console.error('Smile analysis error:', error);
      return { score: 0.70, status: 'unknown', smiling: false };
    }
  }

  /**
   * Analyze hand position
   */
  analyzeHandPosition(landmarks) {
    try {
      const LEFT_WRIST = 15;
      const RIGHT_WRIST = 16;
      const LEFT_SHOULDER = 11;
      const RIGHT_SHOULDER = 12;

      if (!landmarks[LEFT_WRIST] || !landmarks[RIGHT_WRIST]) {
        return { score: 0.75, status: 'unknown' };
      }

      // Check if hands are in pockets (below hips) or crossed
      const leftHandY = landmarks[LEFT_WRIST].y;
      const rightHandY = landmarks[RIGHT_WRIST].y;
      const shoulderY = (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2;

      const handsVisible = leftHandY < 1.0 && rightHandY < 1.0; // Within frame
      const handsRaised = leftHandY < shoulderY || rightHandY < shoulderY;

      return {
        score: handsVisible ? 0.8 : 0.6,
        status: handsRaised ? 'active' : 'resting',
        handsVisible: handsVisible,
        handsRaised: handsRaised
      };
    } catch (error) {
      console.error('Hand position analysis error:', error);
      return { score: 0.75, status: 'unknown' };
    }
  }

  /**
   * Calculate aggregate scores from history
   */
  calculateAggregateScores(history) {
    if (!history || history.length === 0) {
      return {
        posture_score: 0.75,
        eye_contact_score: 0.75,
        gesture_score: 0.70,
        movement_score: 0.75,
        smile_score: 0.70
      };
    }

    const scores = {
      posture: [],
      eyeContact: [],
      gestures: [],
      movement: [],
      smile: []
    };

    history.forEach(frame => {
      if (frame.frame) {
        if (frame.frame.posture) scores.posture.push(frame.frame.posture.score);
        if (frame.frame.eyeContact) scores.eyeContact.push(frame.frame.eyeContact.score);
        if (frame.frame.gestures) scores.gestures.push(frame.frame.gestures.score);
        if (frame.frame.movement) scores.movement.push(frame.frame.movement.score);
        if (frame.frame.smile) scores.smile.push(frame.frame.smile.score);
      }
    });

    const average = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0.75;

    return {
      posture_score: average(scores.posture),
      eye_contact_score: average(scores.eyeContact),
      gesture_score: average(scores.gestures),
      movement_score: average(scores.movement),
      smile_score: average(scores.smile)
    };
  }

  /**
   * Generate feedback based on analysis
   */
  generateFeedback(frameAnalysis, aggregateScores) {
    const feedback = [];

    // Posture feedback
    if (frameAnalysis.posture && frameAnalysis.posture.status === 'poor') {
      feedback.push({
        type: 'posture',
        priority: 'high',
        message: frameAnalysis.posture.message || 'Improve your posture - stand up straight',
        score: frameAnalysis.posture.score
      });
    }

    // Eye contact feedback
    if (frameAnalysis.eyeContact && !frameAnalysis.eyeContact.lookingAtCamera) {
      feedback.push({
        type: 'eye_contact',
        priority: 'high',
        message: frameAnalysis.eyeContact.message || 'Look at the camera to improve engagement',
        score: frameAnalysis.eyeContact.score
      });
    }

    // Gesture feedback
    if (frameAnalysis.gestures && !frameAnalysis.gestures.gestureActive) {
      feedback.push({
        type: 'gestures',
        priority: 'medium',
        message: frameAnalysis.gestures.message || 'Use hand gestures to emphasize points',
        score: frameAnalysis.gestures.score
      });
    }

    // Movement feedback
    if (frameAnalysis.movement && frameAnalysis.movement.movementLevel === 'high') {
      feedback.push({
        type: 'movement',
        priority: 'medium',
        message: 'Try to reduce fidgeting and stay more still',
        score: frameAnalysis.movement.score
      });
    }

    return feedback;
  }

  /**
   * Get empty analysis for when no landmarks detected
   */
  getEmptyAnalysis() {
    return {
      frame: {
        posture: { score: 0.75, status: 'unknown' },
        eyeContact: { score: 0.75, status: 'unknown', lookingAtCamera: true },
        gestures: { score: 0.70, status: 'unknown' },
        movement: { score: 0.75, status: 'unknown' },
        smile: { score: 0.70, status: 'unknown' }
      },
      aggregate: {
        posture_score: 0.75,
        eye_contact_score: 0.75,
        gesture_score: 0.70,
        movement_score: 0.75,
        smile_score: 0.70
      },
      feedback: []
    };
  }

  /**
   * Helper methods for messages
   */
  getPostureMessage(status, angle) {
    if (status === 'good') return 'Great posture!';
    if (status === 'needs_improvement') return `Slight posture adjustment needed (${angle.toFixed(1)}° off)`;
    return `Please straighten your posture (${angle.toFixed(1)}° off)`;
  }

  getEyeContactMessage(status, lookingAtCamera) {
    if (lookingAtCamera) return 'Good eye contact maintained';
    if (status === 'needs_improvement') return 'Try to look more directly at the camera';
    return 'Please look at the camera to improve engagement';
  }

  getGestureMessage(gestureActive) {
    if (gestureActive) return 'Good use of hand gestures';
    return 'Consider using hand gestures to emphasize your points';
  }

  /**
   * Get latest analysis for a session
   */
  getLatestAnalysis(sessionId) {
    const history = this.frameHistory.get(sessionId);
    if (!history || history.length === 0) {
      return null;
    }
    const latest = history[history.length - 1];
    return {
      frame: latest.frame,
      aggregate: this.calculateAggregateScores(history),
      feedback: latest.feedback || []
    };
  }

  /**
   * Process video frame data (called from WebSocket handler)
   */
  processVideoFrame(landmarks, sessionId) {
    return this.analyzeLandmarks(landmarks, sessionId);
  }

  /**
   * Clean up session history
   */
  cleanupSession(sessionId) {
    this.frameHistory.delete(sessionId);
  }
}

module.exports = new RealtimeVideoAnalyzer();

