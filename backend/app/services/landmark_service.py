"""
Landmark analysis service for posture, eye contact, smile detection, etc.
"""

import logging
import numpy as np
from typing import List, Dict, Any, Optional
import math

from app.models.schemas import (
    LandmarkData,
    FeedbackItem,
    AggregateScores,
    FeedbackType,
    SeverityLevel
)
from app.core.config import settings

logger = logging.getLogger(__name__)

class LandmarkAnalysisService:
    def __init__(self):
        self.heuristic_config = {
            "eye_contact": {
                "yaw_threshold": settings.EYE_CONTACT_YAW_THRESHOLD,
                "pitch_threshold": settings.EYE_CONTACT_PITCH_THRESHOLD,
            },
            "smile": {
                "ratio_threshold": settings.SMILE_RATIO_THRESHOLD,
            },
            "posture": {
                "warning_angle": settings.POSTURE_WARNING_ANGLE,
                "critical_angle": settings.POSTURE_CRITICAL_ANGLE,
            },
            "fidget": {
                "velocity_threshold": settings.FIDGET_VELOCITY_THRESHOLD,
            }
        }
    
    async def analyze_landmarks(
        self, 
        landmarks: List[LandmarkData], 
        fps: int,
        user_id: Optional[str] = None,
        streaming: bool = False
    ) -> "LandmarkAnalysisResponse":
        """
        Analyze landmark data and generate feedback
        """
        try:
            feedback_items = []
            
            for landmark in landmarks:
                # Analyze each landmark frame
                frame_feedback = self.analyze_single_landmark(landmark)
                feedback_items.extend(frame_feedback)
            
            # Calculate aggregate scores
            aggregate_scores = self.calculate_aggregate_scores(landmarks, feedback_items)
            
            # Import here to avoid circular imports
            from app.models.schemas import LandmarkAnalysisResponse
            
            return LandmarkAnalysisResponse(
                feedback=feedback_items,
                aggregate_scores=aggregate_scores
            )
            
        except Exception as e:
            logger.error(f"Landmark analysis failed: {e}")
            raise
    
    def analyze_single_landmark(self, landmark: LandmarkData) -> List[FeedbackItem]:
        """Analyze a single landmark frame"""
        feedback_items = []
        
        try:
            # Eye contact analysis
            eye_contact_feedback = self.analyze_eye_contact(landmark)
            if eye_contact_feedback:
                feedback_items.append(eye_contact_feedback)
            
            # Posture analysis
            posture_feedback = self.analyze_posture(landmark)
            if posture_feedback:
                feedback_items.append(posture_feedback)
            
            # Smile analysis
            smile_feedback = self.analyze_smile(landmark)
            if smile_feedback:
                feedback_items.append(smile_feedback)
            
            # Hand fidget analysis
            fidget_feedback = self.analyze_fidget(landmark)
            if fidget_feedback:
                feedback_items.append(fidget_feedback)
                
        except Exception as e:
            logger.error(f"Single landmark analysis failed: {e}")
        
        return feedback_items
    
    def analyze_eye_contact(self, landmark: LandmarkData) -> Optional[FeedbackItem]:
        """Analyze eye contact using face landmarks"""
        try:
            if len(landmark.face) < 68:  # Need face landmarks
                return None
            
            # Key face landmarks for head pose estimation
            nose_tip = landmark.face[30]  # Nose tip
            left_eye = landmark.face[36]  # Left eye corner
            right_eye = landmark.face[45]  # Right eye corner
            chin = landmark.face[8]  # Chin
            
            # Calculate head pose angles
            eye_center = [
                (left_eye[0] + right_eye[0]) / 2,
                (left_eye[1] + right_eye[1]) / 2,
            ]
            
            # Yaw (left-right rotation)
            yaw = math.atan2(nose_tip[0] - eye_center[0], nose_tip[2] - eye_center[2]) * (180 / math.pi)
            
            # Pitch (up-down rotation)
            pitch = math.atan2(chin[1] - nose_tip[1], nose_tip[2] - chin[2]) * (180 / math.pi)
            
            yaw_abs = abs(yaw)
            pitch_abs = abs(pitch)
            
            # Determine severity and feedback
            if yaw_abs > self.heuristic_config["eye_contact"]["yaw_threshold"] or \
               pitch_abs > self.heuristic_config["eye_contact"]["pitch_threshold"]:
                
                severity = SeverityLevel.CRITICAL if yaw_abs > 30 or pitch_abs > 25 else SeverityLevel.WARNING
                message = f"Looking away (yaw: {yaw_abs:.1f}°, pitch: {pitch_abs:.1f}°)"
                actionable_tip = "Try to maintain eye contact with the camera or audience"
            else:
                severity = SeverityLevel.GOOD
                message = "Good eye contact maintained"
                actionable_tip = "Keep looking at the camera or audience"
            
            # Calculate score (0-1)
            score = max(0, 1 - (yaw_abs / 30 + pitch_abs / 20) / 2)
            
            return FeedbackItem(
                timestamp=landmark.t,
                type=FeedbackType.EYE_CONTACT,
                score=score,
                message=message,
                severity=severity,
                actionable_tip=actionable_tip
            )
            
        except Exception as e:
            logger.error(f"Eye contact analysis failed: {e}")
            return None
    
    def analyze_posture(self, landmark: LandmarkData) -> Optional[FeedbackItem]:
        """Analyze posture using pose landmarks"""
        try:
            if len(landmark.pose) < 33:  # Need pose landmarks
                return None
            
            # Key pose landmarks
            left_shoulder = landmark.pose[11]
            right_shoulder = landmark.pose[12]
            left_hip = landmark.pose[23]
            right_hip = landmark.pose[24]
            
            # Calculate shoulder and hip midpoints
            shoulder_mid = [
                (left_shoulder[0] + right_shoulder[0]) / 2,
                (left_shoulder[1] + right_shoulder[1]) / 2,
            ]
            hip_mid = [
                (left_hip[0] + right_hip[0]) / 2,
                (left_hip[1] + right_hip[1]) / 2,
            ]
            
            # Calculate torso vector and angle from vertical
            torso_vector = [
                shoulder_mid[0] - hip_mid[0],
                shoulder_mid[1] - hip_mid[1],
            ]
            
            vertical_vector = [0, -1]  # Camera coordinates: up is negative Y
            dot_product = torso_vector[0] * vertical_vector[0] + torso_vector[1] * vertical_vector[1]
            magnitude = math.sqrt(torso_vector[0] ** 2 + torso_vector[1] ** 2)
            
            if magnitude == 0:
                return None
            
            angle = math.acos(max(-1, min(1, dot_product / magnitude))) * (180 / math.pi)
            
            # Determine severity and feedback
            if angle > self.heuristic_config["posture"]["critical_angle"]:
                severity = SeverityLevel.CRITICAL
                message = f"Poor posture detected ({angle:.1f}° deviation)"
                actionable_tip = "Straighten your back and pull your shoulders back"
            elif angle > self.heuristic_config["posture"]["warning_angle"]:
                severity = SeverityLevel.WARNING
                message = f"Slight posture deviation ({angle:.1f}°)"
                actionable_tip = "Adjust your posture slightly"
            else:
                severity = SeverityLevel.GOOD
                message = "Good posture maintained"
                actionable_tip = "Keep your shoulders back and spine straight"
            
            # Calculate score (0-1)
            score = max(0, 1 - angle / 30)
            
            return FeedbackItem(
                timestamp=landmark.t,
                type=FeedbackType.POSTURE,
                score=score,
                message=message,
                severity=severity,
                actionable_tip=actionable_tip
            )
            
        except Exception as e:
            logger.error(f"Posture analysis failed: {e}")
            return None
    
    def analyze_smile(self, landmark: LandmarkData) -> Optional[FeedbackItem]:
        """Analyze smile using face landmarks"""
        try:
            if len(landmark.face) < 68:  # Need face landmarks
                return None
            
            # Mouth corner landmarks
            left_mouth_corner = landmark.face[48]
            right_mouth_corner = landmark.face[54]
            left_face_contour = landmark.face[0]
            right_face_contour = landmark.face[16]
            
            # Calculate mouth width and face width
            mouth_width = math.sqrt(
                (right_mouth_corner[0] - left_mouth_corner[0]) ** 2 +
                (right_mouth_corner[1] - left_mouth_corner[1]) ** 2
            )
            face_width = math.sqrt(
                (right_face_contour[0] - left_face_contour[0]) ** 2 +
                (right_face_contour[1] - left_face_contour[1]) ** 2
            )
            
            if face_width == 0:
                return None
            
            smile_ratio = mouth_width / face_width
            
            # Determine severity and feedback
            if smile_ratio > self.heuristic_config["smile"]["ratio_threshold"]:
                severity = SeverityLevel.GOOD
                message = "Great smile!"
                actionable_tip = "Maintain that confident smile"
            else:
                severity = SeverityLevel.WARNING
                message = "Consider smiling more"
                actionable_tip = "A genuine smile can make you appear more confident and approachable"
            
            # Calculate score (0-1)
            score = min(1, smile_ratio / self.heuristic_config["smile"]["ratio_threshold"])
            
            return FeedbackItem(
                timestamp=landmark.t,
                type=FeedbackType.SMILE,
                score=score,
                message=message,
                severity=severity,
                actionable_tip=actionable_tip
            )
            
        except Exception as e:
            logger.error(f"Smile analysis failed: {e}")
            return None
    
    def analyze_fidget(self, landmark: LandmarkData) -> Optional[FeedbackItem]:
        """Analyze hand fidgeting using hand landmarks"""
        try:
            if len(landmark.left_hand) == 0 and len(landmark.right_hand) == 0:
                return None
            
            # Calculate hand centroid
            all_hand_landmarks = landmark.left_hand + landmark.right_hand
            if not all_hand_landmarks:
                return None
            
            centroid_x = sum(lm[0] for lm in all_hand_landmarks) / len(all_hand_landmarks)
            centroid_y = sum(lm[1] for lm in all_hand_landmarks) / len(all_hand_landmarks)
            
            # For now, return a basic analysis
            # In a full implementation, you would track movement over time
            fidget_score = 0.2  # Mock score
            
            if fidget_score > self.heuristic_config["fidget"]["velocity_threshold"]:
                severity = SeverityLevel.WARNING if fidget_score < 0.5 else SeverityLevel.CRITICAL
                message = "Hand fidgeting detected" if fidget_score < 0.5 else "Excessive hand movement detected"
                actionable_tip = "Try to keep your hands more still or use purposeful gestures"
            else:
                severity = SeverityLevel.GOOD
                message = "Hands are steady"
                actionable_tip = "Keep your hands relaxed and purposeful"
            
            score = max(0, 1 - fidget_score)
            
            return FeedbackItem(
                timestamp=landmark.t,
                type=FeedbackType.FIDGET,
                score=score,
                message=message,
                severity=severity,
                actionable_tip=actionable_tip
            )
            
        except Exception as e:
            logger.error(f"Fidget analysis failed: {e}")
            return None
    
    def calculate_aggregate_scores(
        self, 
        landmarks: List[LandmarkData], 
        feedback_items: List[FeedbackItem]
    ) -> AggregateScores:
        """Calculate aggregate scores across all landmarks"""
        try:
            # Initialize score accumulators
            scores = {
                "posture": [],
                "eye_contact": [],
                "smile": [],
                "fidget": [],
                "gesture": []
            }
            
            # Collect scores by type
            for feedback in feedback_items:
                if feedback.type in scores:
                    scores[feedback.type].append(feedback.score)
            
            # Calculate averages
            def safe_average(score_list):
                return sum(score_list) / len(score_list) if score_list else 0.0
            
            return AggregateScores(
                posture_score=safe_average(scores["posture"]),
                eye_contact_score=safe_average(scores["eye_contact"]),
                fidget_score=safe_average(scores["fidget"]),
                smile_score=safe_average(scores["smile"]),
                gesture_score=safe_average(scores["gesture"])
            )
            
        except Exception as e:
            logger.error(f"Aggregate score calculation failed: {e}")
            return AggregateScores(
                posture_score=0.0,
                eye_contact_score=0.0,
                fidget_score=0.0,
                smile_score=0.0
            )
    
    def get_heuristic_config(self) -> Dict[str, Any]:
        """Get current heuristic configuration"""
        return self.heuristic_config.copy()
    
    def update_heuristic_config(self, config: Dict[str, Any]) -> None:
        """Update heuristic configuration"""
        try:
            for category, values in config.items():
                if category in self.heuristic_config:
                    self.heuristic_config[category].update(values)
            logger.info("Heuristic configuration updated successfully")
        except Exception as e:
            logger.error(f"Failed to update heuristic configuration: {e}")
            raise
