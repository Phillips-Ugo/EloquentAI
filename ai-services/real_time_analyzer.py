#!/usr/bin/env python3
"""
Real-Time AI Communication Feedback Pipeline
Advanced system for live presentation and speaking skills analysis
"""

import cv2
import numpy as np
import mediapipe as mp
import threading
import asyncio
import queue
import time
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import openai
import whisper
import librosa
import sounddevice as sd
from deepface import DeepFace
import speech_recognition as sr
from collections import deque
import os
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AnalysisResult:
    """Data class for analysis results"""
    timestamp: float
    posture_score: float
    eye_contact_score: float
    gesture_score: float
    emotion_score: float
    speech_clarity: float
    speech_pace: float
    filler_words: List[str]
    transcript: str
    feedback: List[str]
    overall_score: float

@dataclass
class SessionData:
    """Data class for session information"""
    session_id: str
    start_time: datetime
    duration: float
    results: List[AnalysisResult]
    summary: Dict[str, Any]

class PostureAnalyzer:
    """Analyzes posture using MediaPipe Pose"""
    
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
    def analyze_posture(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze posture from video frame"""
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_frame)
            
            if not results.pose_landmarks:
                return {
                    'score': 0.5,
                    'status': 'No pose detected',
                    'details': 'Unable to detect body pose'
                }
            
            landmarks = results.pose_landmarks.landmark
            
            # Calculate posture metrics
            posture_score = self._calculate_posture_score(landmarks)
            shoulder_alignment = self._check_shoulder_alignment(landmarks)
            spine_straightness = self._check_spine_straightness(landmarks)
            
            return {
                'score': posture_score,
                'status': self._get_posture_status(posture_score),
                'details': {
                    'shoulder_alignment': shoulder_alignment,
                    'spine_straightness': spine_straightness,
                    'landmarks': self._extract_key_landmarks(landmarks)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in posture analysis: {str(e)}")
            return {
                'score': 0.5,
                'status': 'Analysis error',
                'details': str(e)
            }
    
    def _calculate_posture_score(self, landmarks) -> float:
        """Calculate overall posture score"""
        try:
            # Get key landmarks
            nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
            
            # Calculate shoulder alignment
            shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
            shoulder_score = max(0, 1 - shoulder_diff * 10)
            
            # Calculate spine straightness
            spine_angle = self._calculate_spine_angle(
                nose, left_shoulder, right_shoulder, left_hip, right_hip
            )
            spine_score = max(0, 1 - abs(spine_angle - 90) / 90)
            
            # Calculate hip alignment
            hip_diff = abs(left_hip.y - right_hip.y)
            hip_score = max(0, 1 - hip_diff * 10)
            
            # Weighted average
            overall_score = (shoulder_score * 0.4 + spine_score * 0.4 + hip_score * 0.2)
            return min(1.0, max(0.0, overall_score))
            
        except Exception as e:
            logger.error(f"Error calculating posture score: {str(e)}")
            return 0.5
    
    def _check_shoulder_alignment(self, landmarks) -> str:
        """Check if shoulders are level"""
        try:
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            
            diff = abs(left_shoulder.y - right_shoulder.y)
            if diff < 0.02:
                return "Excellent"
            elif diff < 0.05:
                return "Good"
            elif diff < 0.1:
                return "Fair"
            else:
                return "Needs improvement"
        except:
            return "Unknown"
    
    def _check_spine_straightness(self, landmarks) -> str:
        """Check spine straightness"""
        try:
            nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
            
            # Calculate angle between nose-shoulder-hip
            angle = self._calculate_angle(nose, left_shoulder, left_hip)
            
            if 80 <= angle <= 100:
                return "Excellent"
            elif 70 <= angle <= 110:
                return "Good"
            elif 60 <= angle <= 120:
                return "Fair"
            else:
                return "Needs improvement"
        except:
            return "Unknown"
    
    def _calculate_spine_angle(self, nose, left_shoulder, right_shoulder, left_hip, right_hip):
        """Calculate spine angle"""
        # Use shoulder midpoint and hip midpoint
        shoulder_mid = ((left_shoulder.x + right_shoulder.x) / 2, 
                       (left_shoulder.y + right_shoulder.y) / 2)
        hip_mid = ((left_hip.x + right_hip.x) / 2, 
                  (left_hip.y + right_hip.y) / 2)
        
        # Calculate angle between vertical and spine
        dx = shoulder_mid[0] - hip_mid[0]
        dy = shoulder_mid[1] - hip_mid[1]
        angle = np.degrees(np.arctan2(dx, dy))
        
        return abs(angle)
    
    def _calculate_angle(self, point1, point2, point3):
        """Calculate angle between three points"""
        a = np.array([point1.x, point1.y])
        b = np.array([point2.x, point2.y])
        c = np.array([point3.x, point3.y])
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        return np.degrees(angle)
    
    def _extract_key_landmarks(self, landmarks) -> Dict[str, Tuple[float, float]]:
        """Extract key landmark positions"""
        key_points = {
            'nose': (landmarks[self.mp_pose.PoseLandmark.NOSE].x, 
                    landmarks[self.mp_pose.PoseLandmark.NOSE].y),
            'left_shoulder': (landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER].x,
                             landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER].y),
            'right_shoulder': (landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER].x,
                              landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER].y),
            'left_hip': (landmarks[self.mp_pose.PoseLandmark.LEFT_HIP].x,
                        landmarks[self.mp_pose.PoseLandmark.LEFT_HIP].y),
            'right_hip': (landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP].x,
                         landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP].y)
        }
        return key_points
    
    def _get_posture_status(self, score: float) -> str:
        """Get posture status based on score"""
        if score >= 0.8:
            return "Excellent"
        elif score >= 0.6:
            return "Good"
        elif score >= 0.4:
            return "Fair"
        else:
            return "Needs improvement"

class GestureRecognizer:
    """Recognizes hand gestures using MediaPipe Hands"""
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.gesture_history = deque(maxlen=30)  # Track last 30 frames
        
    def analyze_gestures(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze hand gestures from video frame"""
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            if not results.multi_hand_landmarks:
                return {
                    'score': 0.3,
                    'status': 'No hands detected',
                    'gestures': [],
                    'details': 'No hand gestures detected'
                }
            
            gestures = []
            gesture_score = 0.0
            
            for hand_landmarks in results.multi_hand_landmarks:
                gesture = self._classify_gesture(hand_landmarks)
                gestures.append(gesture)
                
                # Score based on gesture type
                if gesture['type'] == 'positive':
                    gesture_score += 0.8
                elif gesture['type'] == 'neutral':
                    gesture_score += 0.5
                elif gesture['type'] == 'negative':
                    gesture_score += 0.2
            
            # Average score
            if gestures:
                gesture_score /= len(gestures)
            
            # Add to history
            self.gesture_history.append({
                'timestamp': time.time(),
                'gestures': gestures,
                'score': gesture_score
            })
            
            return {
                'score': gesture_score,
                'status': self._get_gesture_status(gesture_score),
                'gestures': gestures,
                'details': {
                    'hand_count': len(results.multi_hand_landmarks),
                    'recent_gestures': list(self.gesture_history)[-5:]  # Last 5 frames
                }
            }
            
        except Exception as e:
            logger.error(f"Error in gesture analysis: {str(e)}")
            return {
                'score': 0.5,
                'status': 'Analysis error',
                'gestures': [],
                'details': str(e)
            }
    
    def _classify_gesture(self, landmarks) -> Dict[str, Any]:
        """Classify hand gesture based on landmarks"""
        try:
            # Extract key points
            wrist = landmarks.landmark[0]
            thumb_tip = landmarks.landmark[4]
            index_tip = landmarks.landmark[8]
            middle_tip = landmarks.landmark[12]
            ring_tip = landmarks.landmark[16]
            pinky_tip = landmarks.landmark[20]
            
            # Calculate finger states
            thumb_up = thumb_tip.y < wrist.y
            index_up = index_tip.y < wrist.y
            middle_up = middle_tip.y < wrist.y
            ring_up = ring_tip.y < wrist.y
            pinky_up = pinky_tip.y < wrist.y
            
            # Classify gesture
            if [index_up, middle_up, ring_up, pinky_up] == [True, True, True, True]:
                if thumb_up:
                    return {'type': 'positive', 'name': 'Open palm', 'confidence': 0.9}
                else:
                    return {'type': 'positive', 'name': 'Four fingers up', 'confidence': 0.8}
            elif [index_up, middle_up, ring_up, pinky_up] == [True, True, False, False]:
                return {'type': 'positive', 'name': 'Peace sign', 'confidence': 0.9}
            elif [index_up, middle_up, ring_up, pinky_up] == [True, False, False, False]:
                return {'type': 'neutral', 'name': 'Pointing', 'confidence': 0.7}
            elif [index_up, middle_up, ring_up, pinky_up] == [False, False, False, False]:
                if thumb_up:
                    return {'type': 'positive', 'name': 'Thumbs up', 'confidence': 0.9}
                else:
                    return {'type': 'neutral', 'name': 'Closed fist', 'confidence': 0.6}
            else:
                return {'type': 'neutral', 'name': 'Unknown gesture', 'confidence': 0.5}
                
        except Exception as e:
            logger.error(f"Error classifying gesture: {str(e)}")
            return {'type': 'neutral', 'name': 'Error', 'confidence': 0.0}
    
    def _get_gesture_status(self, score: float) -> str:
        """Get gesture status based on score"""
        if score >= 0.7:
            return "Excellent"
        elif score >= 0.5:
            return "Good"
        elif score >= 0.3:
            return "Fair"
        else:
            return "Needs improvement"

class EyeTracker:
    """Tracks eye contact using MediaPipe FaceMesh"""
    
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.eye_contact_history = deque(maxlen=60)  # Track last 60 frames
        
    def analyze_eye_contact(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze eye contact from video frame"""
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if not results.multi_face_landmarks:
                return {
                    'score': 0.0,
                    'status': 'No face detected',
                    'details': 'Unable to detect face'
                }
            
            landmarks = results.multi_face_landmarks[0].landmark
            
            # Calculate eye contact score
            eye_contact_score = self._calculate_eye_contact_score(landmarks, frame.shape)
            
            # Add to history
            self.eye_contact_history.append({
                'timestamp': time.time(),
                'score': eye_contact_score
            })
            
            return {
                'score': eye_contact_score,
                'status': self._get_eye_contact_status(eye_contact_score),
                'details': {
                    'eye_position': self._get_eye_position(landmarks, frame.shape),
                    'contact_percentage': self._calculate_contact_percentage(),
                    'recent_scores': list(self.eye_contact_history)[-10:]  # Last 10 frames
                }
            }
            
        except Exception as e:
            logger.error(f"Error in eye contact analysis: {str(e)}")
            return {
                'score': 0.5,
                'status': 'Analysis error',
                'details': str(e)
            }
    
    def _calculate_eye_contact_score(self, landmarks, frame_shape) -> float:
        """Calculate eye contact score"""
        try:
            # Get eye landmarks
            left_eye = landmarks[33]  # Left eye center
            right_eye = landmarks[263]  # Right eye center
            
            # Calculate eye center position
            eye_center_x = (left_eye.x + right_eye.x) / 2
            eye_center_y = (left_eye.y + right_eye.y) / 2
            
            # Calculate distance from center of frame
            frame_center_x = 0.5
            frame_center_y = 0.5
            
            distance_from_center = np.sqrt(
                (eye_center_x - frame_center_x) ** 2 + 
                (eye_center_y - frame_center_y) ** 2
            )
            
            # Convert distance to score (closer to center = higher score)
            score = max(0, 1 - distance_from_center * 2)
            
            return min(1.0, max(0.0, score))
            
        except Exception as e:
            logger.error(f"Error calculating eye contact score: {str(e)}")
            return 0.5
    
    def _get_eye_position(self, landmarks, frame_shape) -> Dict[str, float]:
        """Get eye position relative to frame"""
        try:
            left_eye = landmarks[33]
            right_eye = landmarks[263]
            
            return {
                'x': (left_eye.x + right_eye.x) / 2,
                'y': (left_eye.y + right_eye.y) / 2
            }
        except:
            return {'x': 0.5, 'y': 0.5}
    
    def _calculate_contact_percentage(self) -> float:
        """Calculate percentage of recent frames with good eye contact"""
        if not self.eye_contact_history:
            return 0.0
        
        good_contact_frames = sum(1 for entry in self.eye_contact_history if entry['score'] > 0.6)
        return (good_contact_frames / len(self.eye_contact_history)) * 100
    
    def _get_eye_contact_status(self, score: float) -> str:
        """Get eye contact status based on score"""
        if score >= 0.8:
            return "Excellent"
        elif score >= 0.6:
            return "Good"
        elif score >= 0.4:
            return "Fair"
        else:
            return "Needs improvement"

class EmotionDetector:
    """Detects emotions using DeepFace"""
    
    def __init__(self):
        self.emotion_history = deque(maxlen=30)  # Track last 30 detections
        
    def analyze_emotion(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze emotion from video frame"""
        try:
            # Use DeepFace for emotion detection
            result = DeepFace.analyze(
                frame, 
                actions=['emotion'], 
                enforce_detection=False,
                detector_backend='opencv'
            )
            
            if isinstance(result, list):
                result = result[0]
            
            emotion = result['dominant_emotion']
            emotion_scores = result['emotion']
            
            # Calculate emotion score based on positive emotions
            positive_emotions = ['happy', 'surprise']
            negative_emotions = ['angry', 'sad', 'fear', 'disgust']
            
            positive_score = sum(emotion_scores.get(emotion, 0) for emotion in positive_emotions)
            negative_score = sum(emotion_scores.get(emotion, 0) for emotion in negative_emotions)
            
            # Calculate overall emotion score
            emotion_score = positive_score / (positive_score + negative_score + 1e-6)
            
            # Add to history
            self.emotion_history.append({
                'timestamp': time.time(),
                'emotion': emotion,
                'score': emotion_score,
                'scores': emotion_scores
            })
            
            return {
                'score': emotion_score,
                'dominant_emotion': emotion,
                'emotion_scores': emotion_scores,
                'status': self._get_emotion_status(emotion_score),
                'details': {
                    'recent_emotions': list(self.emotion_history)[-5:],
                    'emotion_trend': self._calculate_emotion_trend()
                }
            }
            
        except Exception as e:
            logger.error(f"Error in emotion analysis: {str(e)}")
            return {
                'score': 0.5,
                'dominant_emotion': 'neutral',
                'emotion_scores': {},
                'status': 'Analysis error',
                'details': str(e)
            }
    
    def _get_emotion_status(self, score: float) -> str:
        """Get emotion status based on score"""
        if score >= 0.7:
            return "Very Positive"
        elif score >= 0.5:
            return "Positive"
        elif score >= 0.3:
            return "Neutral"
        else:
            return "Negative"
    
    def _calculate_emotion_trend(self) -> str:
        """Calculate emotion trend over time"""
        if len(self.emotion_history) < 5:
            return "Insufficient data"
        
        recent_scores = [entry['score'] for entry in list(self.emotion_history)[-5:]]
        trend = np.polyfit(range(len(recent_scores)), recent_scores, 1)[0]
        
        if trend > 0.05:
            return "Improving"
        elif trend < -0.05:
            return "Declining"
        else:
            return "Stable"

class SpeechTranscriber:
    """Transcribes speech using OpenAI Whisper"""
    
    def __init__(self):
        self.model = whisper.load_model("base")
        self.audio_buffer = []
        self.sample_rate = 16000
        self.chunk_duration = 5  # seconds
        self.transcription_history = deque(maxlen=20)  # Keep last 20 transcriptions
        
    def add_audio_chunk(self, audio_data: np.ndarray):
        """Add audio chunk to buffer"""
        self.audio_buffer.extend(audio_data)
        
        # Check if we have enough audio for transcription
        if len(self.audio_buffer) >= self.sample_rate * self.chunk_duration:
            self._transcribe_buffer()
    
    def _transcribe_buffer(self):
        """Transcribe the current audio buffer"""
        try:
            # Convert buffer to numpy array
            audio_array = np.array(self.audio_buffer[:self.sample_rate * self.chunk_duration])
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                import soundfile as sf
                sf.write(temp_file.name, audio_array, self.sample_rate)
                
                # Transcribe
                result = self.model.transcribe(temp_file.name)
                transcription = result["text"].strip()
                
                # Clean up temp file
                os.unlink(temp_file.name)
            
            if transcription:
                self.transcription_history.append({
                    'timestamp': time.time(),
                    'text': transcription,
                    'confidence': result.get('confidence', 0.0)
                })
            
            # Clear buffer
            self.audio_buffer = self.audio_buffer[self.sample_rate * self.chunk_duration:]
            
        except Exception as e:
            logger.error(f"Error in transcription: {str(e)}")
    
    def get_latest_transcription(self) -> Dict[str, Any]:
        """Get the latest transcription"""
        if not self.transcription_history:
            return {
                'text': '',
                'confidence': 0.0,
                'timestamp': time.time()
            }
        
        latest = self.transcription_history[-1]
        return {
            'text': latest['text'],
            'confidence': latest['confidence'],
            'timestamp': latest['timestamp']
        }
    
    def get_recent_transcriptions(self, count: int = 5) -> List[Dict[str, Any]]:
        """Get recent transcriptions"""
        return list(self.transcription_history)[-count:]

class GPTFeedbackEngine:
    """Generates feedback using OpenAI GPT"""
    
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        self.feedback_history = deque(maxlen=10)
        
    def generate_feedback(self, 
                         transcript: str, 
                         posture_score: float,
                         eye_contact_score: float,
                         gesture_score: float,
                         emotion_score: float) -> Dict[str, Any]:
        """Generate comprehensive feedback using GPT"""
        try:
            # Create prompt for GPT
            prompt = self._create_feedback_prompt(
                transcript, posture_score, eye_contact_score, 
                gesture_score, emotion_score
            )
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert communication coach providing real-time feedback for presentations and public speaking."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            feedback = response.choices[0].message.content.strip()
            
            # Add to history
            self.feedback_history.append({
                'timestamp': time.time(),
                'feedback': feedback,
                'scores': {
                    'posture': posture_score,
                    'eye_contact': eye_contact_score,
                    'gesture': gesture_score,
                    'emotion': emotion_score
                }
            })
            
            return {
                'feedback': feedback,
                'timestamp': time.time(),
                'type': 'comprehensive'
            }
            
        except Exception as e:
            logger.error(f"Error generating GPT feedback: {str(e)}")
            return {
                'feedback': "Unable to generate feedback at this time.",
                'timestamp': time.time(),
                'type': 'error'
            }
    
    def _create_feedback_prompt(self, 
                               transcript: str, 
                               posture_score: float,
                               eye_contact_score: float,
                               gesture_score: float,
                               emotion_score: float) -> str:
        """Create prompt for GPT feedback"""
        return f"""
        Analyze this presentation segment and provide 2-3 specific, actionable feedback points:

        TRANSCRIPT: "{transcript}"

        PERFORMANCE METRICS:
        - Posture: {posture_score:.2f}/1.0 ({self._get_score_description(posture_score)})
        - Eye Contact: {eye_contact_score:.2f}/1.0 ({self._get_score_description(eye_contact_score)})
        - Gestures: {gesture_score:.2f}/1.0 ({self._get_score_description(gesture_score)})
        - Emotional Expression: {emotion_score:.2f}/1.0 ({self._get_score_description(emotion_score)})

        Provide:
        1. One specific strength to maintain
        2. One specific area for improvement
        3. One actionable tip for immediate improvement

        Keep feedback concise, encouraging, and specific. Focus on the most impactful areas for improvement.
        """
    
    def _get_score_description(self, score: float) -> str:
        """Get description for score"""
        if score >= 0.8:
            return "Excellent"
        elif score >= 0.6:
            return "Good"
        elif score >= 0.4:
            return "Fair"
        else:
            return "Needs improvement"

class SessionLogger:
    """Logs session data for post-analysis"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.session_data = SessionData(
            session_id=session_id,
            start_time=datetime.now(),
            duration=0.0,
            results=[],
            summary={}
        )
    
    def add_result(self, result: AnalysisResult):
        """Add analysis result to session"""
        self.session_data.results.append(result)
    
    def end_session(self) -> Dict[str, Any]:
        """End session and generate summary"""
        self.session_data.duration = (datetime.now() - self.session_data.start_time).total_seconds()
        
        # Generate summary
        summary = self._generate_summary()
        self.session_data.summary = summary
        
        return asdict(self.session_data)
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate session summary"""
        if not self.session_data.results:
            return {"error": "No results to summarize"}
        
        # Calculate averages
        avg_posture = np.mean([r.posture_score for r in self.session_data.results])
        avg_eye_contact = np.mean([r.eye_contact_score for r in self.session_data.results])
        avg_gesture = np.mean([r.gesture_score for r in self.session_data.results])
        avg_emotion = np.mean([r.emotion_score for r in self.session_data.results])
        avg_overall = np.mean([r.overall_score for r in self.session_data.results])
        
        # Find trends
        posture_trend = self._calculate_trend([r.posture_score for r in self.session_data.results])
        eye_contact_trend = self._calculate_trend([r.eye_contact_score for r in self.session_data.results])
        
        # Collect all feedback
        all_feedback = []
        for result in self.session_data.results:
            all_feedback.extend(result.feedback)
        
        # Find most common feedback
        feedback_counts = {}
        for feedback in all_feedback:
            feedback_counts[feedback] = feedback_counts.get(feedback, 0) + 1
        
        top_feedback = sorted(feedback_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "duration_seconds": self.session_data.duration,
            "total_analyses": len(self.session_data.results),
            "average_scores": {
                "posture": avg_posture,
                "eye_contact": avg_eye_contact,
                "gesture": avg_gesture,
                "emotion": avg_emotion,
                "overall": avg_overall
            },
            "trends": {
                "posture": posture_trend,
                "eye_contact": eye_contact_trend
            },
            "top_feedback": top_feedback,
            "strengths": self._identify_strengths(),
            "improvements": self._identify_improvements()
        }
    
    def _calculate_trend(self, scores: List[float]) -> str:
        """Calculate trend in scores"""
        if len(scores) < 5:
            return "Insufficient data"
        
        trend = np.polyfit(range(len(scores)), scores, 1)[0]
        
        if trend > 0.01:
            return "Improving"
        elif trend < -0.01:
            return "Declining"
        else:
            return "Stable"
    
    def _identify_strengths(self) -> List[str]:
        """Identify session strengths"""
        strengths = []
        
        if self.session_data.results:
            avg_scores = {
                "posture": np.mean([r.posture_score for r in self.session_data.results]),
                "eye_contact": np.mean([r.eye_contact_score for r in self.session_data.results]),
                "gesture": np.mean([r.gesture_score for r in self.session_data.results]),
                "emotion": np.mean([r.emotion_score for r in self.session_data.results])
            }
            
            for metric, score in avg_scores.items():
                if score >= 0.7:
                    strengths.append(f"Strong {metric.replace('_', ' ')}")
        
        return strengths[:3]  # Top 3 strengths
    
    def _identify_improvements(self) -> List[str]:
        """Identify areas for improvement"""
        improvements = []
        
        if self.session_data.results:
            avg_scores = {
                "posture": np.mean([r.posture_score for r in self.session_data.results]),
                "eye_contact": np.mean([r.eye_contact_score for r in self.session_data.results]),
                "gesture": np.mean([r.gesture_score for r in self.session_data.results]),
                "emotion": np.mean([r.emotion_score for r in self.session_data.results])
            }
            
            for metric, score in avg_scores.items():
                if score < 0.5:
                    improvements.append(f"Improve {metric.replace('_', ' ')}")
        
        return improvements[:3]  # Top 3 improvements

class RealTimeAnalyzer:
    """Main class that orchestrates all analysis components"""
    
    def __init__(self, openai_api_key: str = None):
        self.posture_analyzer = PostureAnalyzer()
        self.gesture_recognizer = GestureRecognizer()
        self.eye_tracker = EyeTracker()
        self.emotion_detector = EmotionDetector()
        self.speech_transcriber = SpeechTranscriber()
        self.gpt_engine = GPTFeedbackEngine(openai_api_key) if openai_api_key else None
        self.session_logger = None
        
        self.is_running = False
        self.analysis_queue = queue.Queue()
        self.results_queue = queue.Queue()
        
    def start_session(self, session_id: str):
        """Start a new analysis session"""
        self.session_logger = SessionLogger(session_id)
        self.is_running = True
        logger.info(f"Started analysis session: {session_id}")
    
    def stop_session(self) -> Dict[str, Any]:
        """Stop the analysis session and return summary"""
        self.is_running = False
        
        if self.session_logger:
            summary = self.session_logger.end_session()
            logger.info(f"Ended analysis session: {self.session_logger.session_id}")
            return summary
        
        return {"error": "No active session"}
    
    def end_session(self) -> Dict[str, Any]:
        """Alias for stop_session"""
        return self.stop_session()
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get current session summary without stopping"""
        if self.session_logger:
            return self.session_logger._generate_summary()
        return {"error": "No active session"}
    
    def analyze_posture(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze posture from frame"""
        return self.posture_analyzer.analyze_posture(frame)
    
    def analyze_gestures(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze gestures from frame"""
        return self.gesture_recognizer.analyze_gestures(frame)
    
    def analyze_eye_contact(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze eye contact from frame"""
        return self.eye_tracker.analyze_eye_contact(frame)
    
    def analyze_emotion(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze emotion from frame"""
        return self.emotion_detector.analyze_emotion(frame)
    
    def transcribe_speech(self, audio_chunk: np.ndarray) -> Dict[str, Any]:
        """Transcribe speech from audio chunk"""
        self.speech_transcriber.add_audio_chunk(audio_chunk)
        return self.speech_transcriber.get_latest_transcription()
    
    def get_gpt_feedback(self, transcript: str, video_results: Dict[str, Any]) -> str:
        """Get GPT feedback based on transcript and video results"""
        if not self.gpt_engine:
            return "GPT feedback not available (no API key)"
        
        try:
            feedback = self.gpt_engine.generate_feedback(
                transcript,
                video_results.get('posture_score', 0.5),
                video_results.get('eye_contact', {}).get('score', 0.5),
                video_results.get('gestures', {}).get('score', 0.5),
                video_results.get('emotion', {}).get('score', 0.5)
            )
            return feedback.get('feedback', 'No feedback available')
        except Exception as e:
            logger.error(f"Error getting GPT feedback: {str(e)}")
            return f"AI feedback error: {str(e)}"
    
    def analyze_frame(self, frame: np.ndarray, audio_chunk: np.ndarray = None) -> Dict[str, Any]:
        """Analyze a single frame and audio chunk"""
        if not self.is_running:
            return {"error": "Session not active"}
        
        try:
            # Run all analyses
            posture_result = self.posture_analyzer.analyze_posture(frame)
            gesture_result = self.gesture_recognizer.analyze_gestures(frame)
            eye_contact_result = self.eye_tracker.analyze_eye_contact(frame)
            emotion_result = self.emotion_detector.analyze_emotion(frame)
            
            # Process audio if provided
            if audio_chunk is not None:
                self.speech_transcriber.add_audio_chunk(audio_chunk)
            
            transcription = self.speech_transcriber.get_latest_transcription()
            
            # Generate GPT feedback if available
            gpt_feedback = None
            if self.gpt_engine and transcription['text']:
                gpt_feedback = self.gpt_engine.generate_feedback(
                    transcription['text'],
                    posture_result['score'],
                    eye_contact_result['score'],
                    gesture_result['score'],
                    emotion_result['score']
                )
            
            # Calculate overall score
            overall_score = (
                posture_result['score'] * 0.25 +
                eye_contact_result['score'] * 0.25 +
                gesture_result['score'] * 0.2 +
                emotion_result['score'] * 0.3
            )
            
            # Create analysis result
            result = AnalysisResult(
                timestamp=time.time(),
                posture_score=posture_result['score'],
                eye_contact_score=eye_contact_result['score'],
                gesture_score=gesture_result['score'],
                emotion_score=emotion_result['score'],
                speech_clarity=0.7,  # Placeholder
                speech_pace=0.6,     # Placeholder
                filler_words=[],     # Placeholder
                transcript=transcription['text'],
                feedback=[gpt_feedback['feedback']] if gpt_feedback else [],
                overall_score=overall_score
            )
            
            # Log result
            if self.session_logger:
                self.session_logger.add_result(result)
            
            # Return comprehensive result
            return {
                'timestamp': result.timestamp,
                'scores': {
                    'posture': result.posture_score,
                    'eye_contact': result.eye_contact_score,
                    'gesture': result.gesture_score,
                    'emotion': result.emotion_score,
                    'overall': result.overall_score
                },
                'status': {
                    'posture': posture_result['status'],
                    'eye_contact': eye_contact_result['status'],
                    'gesture': gesture_result['status'],
                    'emotion': emotion_result['status']
                },
                'details': {
                    'posture': posture_result['details'],
                    'gesture': gesture_result['details'],
                    'eye_contact': eye_contact_result['details'],
                    'emotion': emotion_result['details']
                },
                'transcription': transcription,
                'feedback': gpt_feedback,
                'gestures': gesture_result['gestures']
            }
            
        except Exception as e:
            logger.error(f"Error in frame analysis: {str(e)}")
            return {"error": str(e)}

def main():
    """Example usage of the real-time analyzer"""
    # Initialize analyzer
    analyzer = RealTimeAnalyzer()
    
    # Start session
    analyzer.start_session("test_session_001")
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Analyze frame
            result = analyzer.analyze_frame(frame)
            
            if 'error' not in result:
                print(f"Overall Score: {result['scores']['overall']:.2f}")
                print(f"Posture: {result['status']['posture']}")
                print(f"Eye Contact: {result['status']['eye_contact']}")
                print(f"Gestures: {result['status']['gesture']}")
                print(f"Emotion: {result['status']['emotion']}")
                
                if result['transcription']['text']:
                    print(f"Transcript: {result['transcription']['text']}")
                
                if result['feedback']:
                    print(f"Feedback: {result['feedback']['feedback']}")
                
                print("-" * 50)
            
            # Break on 'q' press
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        cap.release()
        cv2.destroyAllWindows()
        
        # End session and get summary
        summary = analyzer.stop_session()
        print("Session Summary:")
        print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main() 