#!/usr/bin/env python3
"""
Enhanced Real-Time AI Communication Feedback Pipeline
Improved version with better accuracy, comprehensive analysis, and real-time feedback
"""

import cv2
import numpy as np
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
from collections import deque
import os
import tempfile
import base64
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AnalysisResult:
    """Enhanced data class for analysis results"""
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
    confidence: float
    session_duration: float

@dataclass
class SessionData:
    """Enhanced data class for session information"""
    session_id: str
    start_time: datetime
    duration: float
    results: List[AnalysisResult]
    summary: Dict[str, Any]
    trends: Dict[str, List[float]]

class EnhancedPostureAnalyzer:
    """Enhanced posture analyzer with improved computer vision algorithms"""
    
    def __init__(self):
        # Load multiple cascade classifiers for better detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self.body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')
        self.upper_body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_upperbody.xml')
        
        # Initialize tracking variables
        self.previous_face_position = None
        self.stability_counter = 0
        self.movement_history = deque(maxlen=30)
        
    def analyze_posture(self, frame: np.ndarray) -> Dict[str, Any]:
        """Enhanced posture analysis with multiple detection methods"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame_height, frame_width = frame.shape[:2]
            
            # Multi-stage detection
            detection_results = self._multi_stage_detection(gray, frame_width, frame_height)
            
            # Calculate comprehensive posture score
            posture_score = self._calculate_posture_score(detection_results, frame_width, frame_height)
            
            # Generate detailed feedback
            feedback = self._generate_posture_feedback(detection_results, posture_score)
            
            return {
                'score': posture_score,
                'status': 'Analyzed',
                'details': detection_results,
                'feedback': feedback,
                'confidence': detection_results.get('confidence', 0.7)
            }
            
        except Exception as e:
            logger.error(f"Posture analysis error: {e}")
            return {
                'score': 0.5,
                'status': 'Error',
                'details': f'Analysis failed: {str(e)}',
                'feedback': ['Unable to analyze posture at this time'],
                'confidence': 0.0
            }
    
    def _multi_stage_detection(self, gray: np.ndarray, frame_width: int, frame_height: int) -> Dict[str, Any]:
        """Multi-stage detection for better accuracy"""
        results = {}
        
        # Stage 1: Face detection
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        if len(faces) > 0:
            largest_face = max(faces, key=lambda x: x[2] * x[3])
            x, y, w, h = largest_face
            
            results['face_detected'] = True
            results['face_position'] = (x + w/2, y + h/2)
            results['face_size'] = (w, h)
            results['face_area'] = w * h
            
            # Stage 2: Eye detection within face
            face_roi = gray[y:y+h, x:x+w]
            eyes = self.eye_cascade.detectMultiScale(face_roi, 1.1, 3)
            results['eye_count'] = len(eyes)
            
            # Stage 3: Body detection
            bodies = self.body_cascade.detectMultiScale(gray, 1.1, 3)
            upper_bodies = self.upper_body_cascade.detectMultiScale(gray, 1.1, 3)
            
            results['body_detected'] = len(bodies) > 0
            results['upper_body_detected'] = len(upper_bodies) > 0
            
            # Calculate confidence based on detections
            confidence = 0.5
            if results['face_detected']:
                confidence += 0.3
            if results['eye_count'] >= 2:
                confidence += 0.1
            if results['body_detected'] or results['upper_body_detected']:
                confidence += 0.1
                
            results['confidence'] = min(confidence, 1.0)
            
        else:
            results['face_detected'] = False
            results['confidence'] = 0.0
            
        return results
    
    def _calculate_posture_score(self, detection_results: Dict[str, Any], frame_width: int, frame_height: int) -> float:
        """Calculate comprehensive posture score"""
        if not detection_results.get('face_detected', False):
            return 0.5
        
        score = 0.0
        face_pos = detection_results['face_position']
        face_size = detection_results['face_size']
        
        # 1. Horizontal centering (30% weight)
        horizontal_center_score = 1.0 - abs(face_pos[0] - frame_width/2) / (frame_width/2)
        score += horizontal_center_score * 0.3
        
        # 2. Vertical positioning (25% weight)
        optimal_vertical = frame_height * 0.33  # Upper third
        vertical_score = 1.0 - abs(face_pos[1] - optimal_vertical) / (frame_height * 0.2)
        vertical_score = max(0, min(1, vertical_score))
        score += vertical_score * 0.25
        
        # 3. Face size/distance (20% weight)
        face_area = face_size[0] * face_size[1]
        frame_area = frame_width * frame_height
        face_ratio = face_area / frame_area
        
        if 0.08 <= face_ratio <= 0.2:  # Optimal range
            distance_score = 1.0
        elif face_ratio < 0.08:
            distance_score = face_ratio / 0.08
        else:
            distance_score = max(0, 1.0 - (face_ratio - 0.2) / 0.3)
        
        score += distance_score * 0.2
        
        # 4. Stability (15% weight)
        current_pos = face_pos
        if self.previous_face_position:
            movement = math.sqrt((current_pos[0] - self.previous_face_position[0])**2 + 
                               (current_pos[1] - self.previous_face_position[1])**2)
            stability_score = max(0, 1.0 - movement / 50)  # Normalize movement
            score += stability_score * 0.15
        else:
            score += 0.75  # Default stability score
        
        # 5. Detection confidence (10% weight)
        confidence = detection_results.get('confidence', 0.5)
        score += confidence * 0.1
        
        # Update tracking
        self.previous_face_position = current_pos
        self.movement_history.append(score)
        
        return min(1.0, max(0.0, score))
    
    def _generate_posture_feedback(self, detection_results: Dict[str, Any], score: float) -> List[str]:
        """Generate specific posture feedback"""
        feedback = []
        
        if score >= 0.8:
            feedback.append("Excellent posture! You're well-positioned and confident.")
        elif score >= 0.6:
            feedback.append("Good posture. Consider slight adjustments for optimal positioning.")
        else:
            feedback.append("Focus on improving your posture positioning.")
        
        if detection_results.get('face_detected', False):
            face_pos = detection_results['face_position']
            if face_pos[0] < 0.4:  # Too far left
                feedback.append("Move slightly to the right for better framing.")
            elif face_pos[0] > 0.6:  # Too far right
                feedback.append("Move slightly to the left for better framing.")
        
        return feedback

class EnhancedEyeContactAnalyzer:
    """Enhanced eye contact analyzer with improved detection"""
    
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self.eye_contact_history = deque(maxlen=30)
        self.looking_away_counter = 0
        
    def analyze_eye_contact(self, frame: np.ndarray) -> Dict[str, Any]:
        """Enhanced eye contact analysis"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                self.looking_away_counter += 1
                self.eye_contact_history.append(0.0)
                return {
                    'score': 0.0,
                    'status': 'No face detected',
                    'looking_away': True,
                    'confidence': 0.0
                }
            
            # Get largest face
            largest_face = max(faces, key=lambda x: x[2] * x[3])
            x, y, w, h = largest_face
            
            # Detect eyes within face region
            face_roi = gray[y:y+h, x:x+w]
            eyes = self.eye_cascade.detectMultiScale(face_roi, 1.1, 3)
            
            # Calculate eye contact score
            if len(eyes) >= 2:
                # Both eyes detected - likely looking at camera
                score = 0.9
                self.looking_away_counter = 0
            elif len(eyes) == 1:
                # One eye detected - partial eye contact
                score = 0.6
                self.looking_away_counter += 1
            else:
                # No eyes detected - likely looking away
                score = 0.2
                self.looking_away_counter += 1
            
            # Adjust score based on looking away frequency
            if self.looking_away_counter > 5:
                score *= 0.8
            
            self.eye_contact_history.append(score)
            
            # Calculate average eye contact over time
            avg_eye_contact = sum(self.eye_contact_history) / len(self.eye_contact_history)
            
            return {
                'score': score,
                'status': 'Analyzed',
                'eyes_detected': len(eyes),
                'looking_away': self.looking_away_counter > 3,
                'average_score': avg_eye_contact,
                'confidence': 0.8
            }
            
        except Exception as e:
            logger.error(f"Eye contact analysis error: {e}")
            return {
                'score': 0.5,
                'status': 'Error',
                'confidence': 0.0
            }

class EnhancedGestureAnalyzer:
    """Enhanced gesture analyzer with improved detection"""
    
    def __init__(self):
        self.hand_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_hand.xml')
        self.gesture_history = deque(maxlen=30)
        self.gesture_types = {
            'pointing': 0,
            'open_palm': 0,
            'closed_fist': 0,
            'thumbs_up': 0
        }
        
    def analyze_gestures(self, frame: np.ndarray) -> Dict[str, Any]:
        """Enhanced gesture analysis"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect hands (if cascade is available)
            hands = []
            try:
                hands = self.hand_cascade.detectMultiScale(gray, 1.1, 3)
            except:
                # Fallback to motion detection
                hands = self._detect_motion_regions(gray)
            
            # Analyze gesture patterns
            gesture_score = self._analyze_gesture_patterns(hands, frame)
            
            # Update history
            self.gesture_history.append(gesture_score)
            
            # Calculate trend
            if len(self.gesture_history) > 5:
                recent_avg = sum(list(self.gesture_history)[-5:]) / 5
                overall_avg = sum(self.gesture_history) / len(self.gesture_history)
                trend = "improving" if recent_avg > overall_avg else "declining"
            else:
                trend = "stable"
            
            return {
                'score': gesture_score,
                'status': 'Analyzed',
                'hands_detected': len(hands),
                'gesture_types': self.gesture_types.copy(),
                'trend': trend,
                'confidence': 0.7
            }
            
        except Exception as e:
            logger.error(f"Gesture analysis error: {e}")
            return {
                'score': 0.5,
                'status': 'Error',
                'confidence': 0.0
            }
    
    def _detect_motion_regions(self, gray: np.ndarray) -> List:
        """Fallback motion detection for gesture analysis"""
        # Simple edge detection for motion regions
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by size (potential hand regions)
        hand_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if 1000 < area < 10000:  # Reasonable hand size range
                x, y, w, h = cv2.boundingRect(contour)
                hand_regions.append((x, y, w, h))
        
        return hand_regions
    
    def _analyze_gesture_patterns(self, hands: List, frame: np.ndarray) -> float:
        """Analyze gesture patterns and calculate score"""
        if len(hands) == 0:
            return 0.3  # No gestures detected
        
        # Basic scoring based on hand detection
        base_score = min(0.8, len(hands) * 0.4)
        
        # Add variety bonus
        if len(hands) > 1:
            base_score += 0.1
        
        return min(1.0, base_score)

class SimplifiedRealTimeAnalyzer:
    """Enhanced real-time analyzer with improved accuracy and feedback"""
    
    def __init__(self, openai_api_key: str = None):
        self.posture_analyzer = EnhancedPostureAnalyzer()
        self.eye_contact_analyzer = EnhancedEyeContactAnalyzer()
        self.gesture_analyzer = EnhancedGestureAnalyzer()
        
        # OpenAI integration for enhanced feedback
        self.openai_api_key = openai_api_key
        self.openai_available = openai_api_key and openai_api_key.startswith('sk-')
        
        # Session tracking
        self.session_data = {}
        self.analysis_history = deque(maxlen=100)
        
        logger.info("Enhanced Real-Time Analyzer initialized successfully")
    
    async def analyze_frame(self, frame: np.ndarray, session_id: str = None) -> Dict[str, Any]:
        """Enhanced frame analysis with comprehensive feedback"""
        try:
            start_time = time.time()
            
            # Run all analyses
            posture_result = self.posture_analyzer.analyze_posture(frame)
            eye_contact_result = self.eye_contact_analyzer.analyze_eye_contact(frame)
            gesture_result = self.gesture_analyzer.analyze_gestures(frame)
            
            # Calculate overall score with weighted components
            overall_score = self._calculate_overall_score(posture_result, eye_contact_result, gesture_result)
            
            # Generate comprehensive feedback
            feedback = await self._generate_comprehensive_feedback(
                posture_result, eye_contact_result, gesture_result, overall_score
            )
            
            # Create analysis result
            result = AnalysisResult(
                timestamp=time.time(),
                posture_score=posture_result['score'],
                eye_contact_score=eye_contact_result['score'],
                gesture_score=gesture_result['score'],
                emotion_score=0.7,  # Placeholder for emotion analysis
                speech_clarity=0.7,  # Placeholder for speech analysis
                speech_pace=0.7,     # Placeholder for speech analysis
                filler_words=[],
                transcript="",
                feedback=feedback,
                overall_score=overall_score,
                confidence=min(posture_result.get('confidence', 0.5),
                             eye_contact_result.get('confidence', 0.5),
                             gesture_result.get('confidence', 0.5)),
                session_duration=time.time() - start_time
            )
            
            # Store in history
            self.analysis_history.append(result)
            
            # Update session data
            if session_id:
                if session_id not in self.session_data:
                    self.session_data[session_id] = {
                        'start_time': time.time(),
                        'results': []
                    }
                self.session_data[session_id]['results'].append(result)
            
            return asdict(result)
            
        except Exception as e:
            logger.error(f"Frame analysis error: {e}")
            return {
                'error': str(e),
                'overall_score': 0.5,
                'feedback': ['Analysis temporarily unavailable']
            }
    
    def _calculate_overall_score(self, posture_result: Dict, eye_contact_result: Dict, gesture_result: Dict) -> float:
        """Calculate weighted overall score"""
        weights = {
            'posture': 0.35,
            'eye_contact': 0.35,
            'gestures': 0.30
        }
        
        score = (
            posture_result['score'] * weights['posture'] +
            eye_contact_result['score'] * weights['eye_contact'] +
            gesture_result['score'] * weights['gestures']
        )
        
        return min(1.0, max(0.0, score))
    
    async def _generate_comprehensive_feedback(self, posture_result: Dict, eye_contact_result: Dict, 
                                             gesture_result: Dict, overall_score: float) -> List[str]:
        """Generate comprehensive feedback using OpenAI or fallback"""
        feedback = []
        
        # Add specific feedback from each analyzer
        feedback.extend(posture_result.get('feedback', []))
        
        if eye_contact_result.get('looking_away', False):
            feedback.append("Try to maintain more consistent eye contact with your audience.")
        
        if gesture_result['score'] < 0.5:
            feedback.append("Consider using more hand gestures to emphasize your points.")
        
        # Overall performance feedback
        if overall_score >= 0.8:
            feedback.append("Excellent performance! You're communicating effectively.")
        elif overall_score >= 0.6:
            feedback.append("Good performance. Focus on the areas for improvement.")
        else:
            feedback.append("Keep practicing! Focus on the specific feedback provided.")
        
        # Use OpenAI for enhanced feedback if available
        if self.openai_available and len(feedback) > 0:
            try:
                enhanced_feedback = await self._get_openai_feedback(feedback, overall_score)
                feedback = enhanced_feedback
            except Exception as e:
                logger.warning(f"OpenAI feedback generation failed: {e}")
        
        return feedback[:5]  # Limit to 5 feedback items
    
    async def _get_openai_feedback(self, current_feedback: List[str], score: float) -> List[str]:
        """Get enhanced feedback from OpenAI"""
        try:
            import openai
            
            prompt = f"""
            As an expert communication coach, provide 3-5 specific, actionable feedback items for a presenter with a score of {score:.2f}/1.0.
            
            Current feedback: {', '.join(current_feedback)}
            
            Provide concise, specific, and actionable feedback that will help improve their presentation skills.
            Focus on practical tips and specific behaviors they can change.
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert communication and presentation coach."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            enhanced_feedback = response.choices[0].message.content.split('\n')
            enhanced_feedback = [item.strip() for item in enhanced_feedback if item.strip()]
            
            return enhanced_feedback[:5]
            
        except Exception as e:
            logger.error(f"OpenAI feedback error: {e}")
            return current_feedback
    
    def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive session summary"""
        if session_id not in self.session_data:
            return {}
        
        session = self.session_data[session_id]
        results = session['results']
        
        if not results:
            return {}
        
        # Calculate trends
        scores = [r.overall_score for r in results]
        posture_scores = [r.posture_score for r in results]
        eye_contact_scores = [r.eye_contact_score for r in results]
        gesture_scores = [r.gesture_score for r in results]
        
        return {
            'session_id': session_id,
            'duration': time.time() - session['start_time'],
            'total_frames': len(results),
            'average_scores': {
                'overall': sum(scores) / len(scores),
                'posture': sum(posture_scores) / len(posture_scores),
                'eye_contact': sum(eye_contact_scores) / len(eye_contact_scores),
                'gestures': sum(gesture_scores) / len(gesture_scores)
            },
            'trends': {
                'overall': scores,
                'posture': posture_scores,
                'eye_contact': eye_contact_scores,
                'gestures': gesture_scores
            },
            'improvements': self._identify_improvements(results)
        }
    
    def _identify_improvements(self, results: List[AnalysisResult]) -> List[str]:
        """Identify areas for improvement based on session data"""
        if len(results) < 5:
            return ["Continue practicing to gather more data for analysis"]
        
        # Split into early and late sessions
        early_results = results[:len(results)//2]
        late_results = results[len(results)//2:]
        
        early_avg = sum(r.overall_score for r in early_results) / len(early_results)
        late_avg = sum(r.overall_score for r in late_results) / len(late_results)
        
        improvements = []
        
        if late_avg > early_avg:
            improvements.append("Great improvement throughout your session!")
        else:
            improvements.append("Focus on maintaining consistent performance throughout your presentation.")
        
        # Identify specific areas
        avg_posture = sum(r.posture_score for r in results) / len(results)
        avg_eye_contact = sum(r.eye_contact_score for r in results) / len(results)
        avg_gestures = sum(r.gesture_score for r in results) / len(results)
        
        if avg_posture < 0.6:
            improvements.append("Work on maintaining better posture positioning.")
        if avg_eye_contact < 0.6:
            improvements.append("Practice maintaining more consistent eye contact.")
        if avg_gestures < 0.5:
            improvements.append("Incorporate more purposeful hand gestures.")
        
        return improvements 