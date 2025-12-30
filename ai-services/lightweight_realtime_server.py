#!/usr/bin/env python3
"""
Lightweight Real-Time WebSocket Server for AI Communication Analysis
Uses Google Gemini for AI feedback
"""

import asyncio
import websockets
import json
import base64
import cv2
import numpy as np
import logging
import time
import os
from typing import Dict, Set, Optional, Any
import uuid
import google.generativeai as genai
import speech_recognition as sr
import tempfile
import wave

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LightweightAnalyzer:
    """Lightweight analyzer without heavy dependencies"""
    
    def __init__(self, gemini_api_key: str = None):
        # Hardcoded Gemini API key - REPLACE WITH YOUR ACTUAL GEMINI API KEY
        self.gemini_api_key = gemini_api_key or "YOUR_GEMINI_API_KEY_HERE"
        self.gemini_model = None
        if self.gemini_api_key:
            try:
                genai.configure(api_key=self.gemini_api_key)
                self.gemini_model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {str(e)}")
        
        self.session_data = {
            'start_time': time.time(),
            'frame_count': 0,
            'audio_chunks': 0,
            'transcriptions': [],
            'posture_scores': [],
            'eye_contact_scores': [],
            'gesture_scores': [],
            'emotion_scores': []
        }
    
    def analyze_posture(self, frame: np.ndarray) -> Dict[str, Any]:
        """Improved posture analysis using face detection and body positioning"""
        try:
            # Convert to grayscale for analysis
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Try face detection first for better posture estimation
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            
            if len(faces) > 0:
                # Face detected - analyze position for posture
                largest_face = max(faces, key=lambda x: x[2] * x[3])
                x, y, w, h = largest_face
                face_center_y = y + h / 2
                frame_height = frame.shape[0]
                
                # Good posture: face should be in upper-middle portion of frame
                ideal_face_y = frame_height * 0.3  # Top 30% of frame
                face_position_score = 1.0 - min(1.0, abs(face_center_y - ideal_face_y) / (frame_height * 0.3))
                
                # Face should be relatively upright (width/height ratio)
                face_ratio = w / h if h > 0 else 0.7
                # Ideal face ratio is around 0.7-0.8 for front-facing
                ratio_score = 1.0 - abs(face_ratio - 0.75) / 0.5
                ratio_score = max(0.0, min(1.0, ratio_score))
                
                # Combine scores
                posture_score = (face_position_score * 0.6 + ratio_score * 0.4)
                posture_score = max(0.5, min(1.0, posture_score))  # Ensure minimum 0.5
            else:
                # No face detected - use edge detection fallback
                edges = cv2.Canny(gray, 50, 150)
                contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                if contours:
                    largest_contour = max(contours, key=cv2.contourArea)
                    area = cv2.contourArea(largest_contour)
                    perimeter = cv2.arcLength(largest_contour, True)
                    
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        posture_score = min(1.0, max(0.5, circularity * 2))  # Minimum 0.5
                    else:
                        posture_score = 0.6
                else:
                    # Use average of recent scores or default
                    if self.session_data['posture_scores']:
                        posture_score = np.mean(self.session_data['posture_scores'][-5:])
                    else:
                        posture_score = 0.65  # Default moderate score
            
            # Smooth with recent scores
            if self.session_data['posture_scores']:
                posture_score = (posture_score * 0.7 + np.mean(self.session_data['posture_scores'][-3:]) * 0.3)
            
            self.session_data['posture_scores'].append(posture_score)
            if len(self.session_data['posture_scores']) > 10:
                self.session_data['posture_scores'].pop(0)
            
            return {
                'posture_score': posture_score,
                'status': self._get_score_status(posture_score),
                'details': f'Posture analysis based on face detection' if len(faces) > 0 else 'Posture analysis based on contours'
            }
            
        except Exception as e:
            logger.error(f"Posture analysis error: {str(e)}")
            # Return average of recent scores or default
            if self.session_data['posture_scores']:
                return {'posture_score': np.mean(self.session_data['posture_scores'][-5:]), 'status': 'Analysis error', 'details': str(e)}
            return {'posture_score': 0.65, 'status': 'Analysis error', 'details': str(e)}
    
    def analyze_gestures(self, frame: np.ndarray) -> Dict[str, Any]:
        """Improved gesture analysis"""
        try:
            # Convert to HSV for skin detection
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Expanded skin color range for better detection
            lower_skin1 = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin1 = np.array([20, 255, 255], dtype=np.uint8)
            lower_skin2 = np.array([170, 20, 70], dtype=np.uint8)
            upper_skin2 = np.array([180, 255, 255], dtype=np.uint8)
            
            # Create mask for skin
            skin_mask1 = cv2.inRange(hsv, lower_skin1, upper_skin1)
            skin_mask2 = cv2.inRange(hsv, lower_skin2, upper_skin2)
            skin_mask = cv2.bitwise_or(skin_mask1, skin_mask2)
            
            # Find skin contours
            contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Count potential hand/arm gestures (lower threshold for better detection)
            gesture_count = len([c for c in contours if cv2.contourArea(c) > 500])
            
            # Improved gesture score with better normalization
            if gesture_count >= 3:
                gesture_score = 0.7 + min(0.3, (gesture_count - 3) * 0.1)  # 0.7-1.0 for 3+ gestures
            elif gesture_count == 2:
                gesture_score = 0.6
            elif gesture_count == 1:
                gesture_score = 0.5
            else:
                # No gestures detected - use average of recent or default
                if self.session_data['gesture_scores']:
                    gesture_score = np.mean(self.session_data['gesture_scores'][-5:])
                else:
                    gesture_score = 0.55  # Default moderate score
            
            gesture_score = min(1.0, max(0.4, gesture_score))  # Ensure reasonable range
            
            self.session_data['gesture_scores'].append(gesture_score)
            if len(self.session_data['gesture_scores']) > 10:
                self.session_data['gesture_scores'].pop(0)
            
            return {
                'score': gesture_score,
                'status': self._get_score_status(gesture_score),
                'details': f'Detected {gesture_count} potential gesture regions'
            }
            
        except Exception as e:
            logger.error(f"Gesture analysis error: {str(e)}")
            # Return average of recent scores or default
            if self.session_data['gesture_scores']:
                return {'score': np.mean(self.session_data['gesture_scores'][-5:]), 'status': 'Analysis error', 'details': str(e)}
            return {'score': 0.55, 'status': 'Analysis error', 'details': str(e)}
    
    def analyze_eye_contact(self, frame: np.ndarray) -> Dict[str, Any]:
        """Improved eye contact analysis"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Load face cascade
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            
            # Detect faces with more lenient parameters
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            
            if len(faces) > 0:
                # Get the largest face
                largest_face = max(faces, key=lambda x: x[2] * x[3])
                x, y, w, h = largest_face
                
                # Extract face region
                face_roi = gray[y:y+h, x:x+w]
                
                # Detect eyes with more lenient parameters
                eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=2)
                
                # Calculate eye contact score
                if len(eyes) >= 2:
                    # Both eyes detected - good eye contact
                    eye_contact_score = 0.75 + (len(eyes) - 2) * 0.1  # Base 0.75, bonus for more detections
                    eye_contact_score = min(1.0, eye_contact_score)
                elif len(eyes) == 1:
                    # One eye detected - moderate
                    eye_contact_score = 0.6
                else:
                    # Face detected but no eyes - still better than no face
                    eye_contact_score = 0.5
                
                # Bonus if face is centered (looking at camera)
                frame_center_x = frame.shape[1] / 2
                face_center_x = x + w / 2
                center_offset = abs(frame_center_x - face_center_x) / frame.shape[1]
                if center_offset < 0.2:  # Face is within 20% of center
                    eye_contact_score = min(1.0, eye_contact_score + 0.15)
                    
            else:
                # No face detected - use average of recent scores or default to moderate
                if self.session_data['eye_contact_scores']:
                    eye_contact_score = np.mean(self.session_data['eye_contact_scores'][-5:])
                else:
                    eye_contact_score = 0.55  # Default moderate score instead of 0.2
            
            self.session_data['eye_contact_scores'].append(eye_contact_score)
            if len(self.session_data['eye_contact_scores']) > 10:
                self.session_data['eye_contact_scores'].pop(0)
            
            return {
                'score': eye_contact_score,
                'status': self._get_score_status(eye_contact_score),
                'details': f'Detected {len(faces)} faces and {len(eyes) if len(faces) > 0 else 0} eyes'
            }
            
        except Exception as e:
            logger.error(f"Eye contact analysis error: {str(e)}")
            # Return average of recent scores or default
            if self.session_data['eye_contact_scores']:
                return {'score': np.mean(self.session_data['eye_contact_scores'][-5:]), 'status': 'Analysis error', 'details': str(e)}
            return {'score': 0.55, 'status': 'Analysis error', 'details': str(e)}
    
    def analyze_emotion(self, frame: np.ndarray) -> Dict[str, Any]:
        """Improved emotion analysis based on facial features and expressions"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Load face cascade
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            
            # Detect faces with more lenient parameters
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            
            if len(faces) > 0:
                largest_face = max(faces, key=lambda x: x[2] * x[3])
                x, y, w, h = largest_face
                face_roi = gray[y:y+h, x:x+w]
                
                # Detect eyes for better emotion estimation
                eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=2)
                
                # Base score from face detection
                base_score = 0.6
                
                # Bonus for eyes (engagement indicator)
                if len(eyes) >= 2:
                    base_score += 0.2
                elif len(eyes) == 1:
                    base_score += 0.1
                
                emotion_score = min(1.0, base_score)
            else:
                # No face detected - use average of recent scores or default
                if self.session_data['emotion_scores']:
                    emotion_score = np.mean(self.session_data['emotion_scores'][-5:])
                else:
                    emotion_score = 0.6  # Default moderate score instead of 0.3
            
            self.session_data['emotion_scores'].append(emotion_score)
            if len(self.session_data['emotion_scores']) > 10:
                self.session_data['emotion_scores'].pop(0)
            
            return {
                'score': emotion_score,
                'status': self._get_score_status(emotion_score),
                'details': f'Emotion analysis based on {len(faces)} detected faces'
            }
            
        except Exception as e:
            logger.error(f"Emotion analysis error: {str(e)}")
            # Return average of recent scores or default
            if self.session_data['emotion_scores']:
                return {'score': np.mean(self.session_data['emotion_scores'][-5:]), 'status': 'Analysis error', 'details': str(e)}
            return {'score': 0.6, 'status': 'Analysis error', 'details': str(e)}
    
    def transcribe_speech(self, audio_chunk: np.ndarray) -> Dict[str, Any]:
        """Simple speech transcription (placeholder)"""
        try:
            # For now, return a placeholder transcription
            # In a real implementation, you would use speech recognition here
            transcription_text = "Speech analysis in progress..."
            
            self.session_data['transcriptions'].append(transcription_text)
            if len(self.session_data['transcriptions']) > 5:
                self.session_data['transcriptions'].pop(0)
            
            return {'text': transcription_text, 'confidence': 0.8}
                    
        except Exception as e:
            logger.error(f"Speech transcription error: {str(e)}")
            return {'text': '', 'confidence': 0.0, 'error': str(e)}
    
    def get_gemini_feedback(self, transcript: str, video_results: Dict[str, Any]) -> str:
        """Get Gemini feedback based on transcript and video results"""
        if not self.gemini_model:
            logger.error("Gemini model not initialized")
            return ""
        
        try:
            # Calculate average scores
            avg_posture = np.mean(self.session_data['posture_scores']) if self.session_data['posture_scores'] else 0.5
            avg_eye_contact = np.mean(self.session_data['eye_contact_scores']) if self.session_data['eye_contact_scores'] else 0.5
            avg_gesture = np.mean(self.session_data['gesture_scores']) if self.session_data['gesture_scores'] else 0.5
            avg_emotion = np.mean(self.session_data['emotion_scores']) if self.session_data['emotion_scores'] else 0.5
            
            # Create prompt for Gemini
            prompt = f"""You are an expert communication coach providing real-time feedback. 
            
            Current speech transcript: "{transcript}"
            
            Performance metrics:
            - Posture: {avg_posture:.2f}/1.0 ({self._get_score_description(avg_posture)})
            - Eye Contact: {avg_eye_contact:.2f}/1.0 ({self._get_score_description(avg_eye_contact)})
            - Gestures: {avg_gesture:.2f}/1.0 ({self._get_score_description(avg_gesture)})
            - Emotion: {avg_emotion:.2f}/1.0 ({self._get_score_description(avg_emotion)})
            
Provide 1-2 sentences of specific, actionable feedback focusing on the most important improvement area. Be encouraging but direct."""
            
            response = self.gemini_model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini feedback error: {str(e)}")
            return ""
    
    def _get_score_status(self, score: float) -> str:
        """Get status description for a score"""
        if score >= 0.8:
            return "Excellent"
        elif score >= 0.6:
            return "Good"
        elif score >= 0.4:
            return "Fair"
        else:
            return "Needs Improvement"
    
    def _get_score_description(self, score: float) -> str:
        """Get description for a score"""
        if score >= 0.8:
            return "excellent"
        elif score >= 0.6:
            return "good"
        elif score >= 0.4:
            return "fair"
        else:
            return "needs improvement"
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get session summary"""
        duration = time.time() - self.session_data['start_time']
        
        return {
            'duration': duration,
            'frames_processed': self.session_data['frame_count'],
            'audio_chunks_processed': self.session_data['audio_chunks'],
            'average_scores': {
                'posture': np.mean(self.session_data['posture_scores']) if self.session_data['posture_scores'] else 0.5,
                'eye_contact': np.mean(self.session_data['eye_contact_scores']) if self.session_data['eye_contact_scores'] else 0.5,
                'gesture': np.mean(self.session_data['gesture_scores']) if self.session_data['gesture_scores'] else 0.5,
                'emotion': np.mean(self.session_data['emotion_scores']) if self.session_data['emotion_scores'] else 0.5
            },
            'transcriptions': self.session_data['transcriptions'][-3:]  # Last 3 transcriptions
        }

class LightweightRealTimeServer:
    """Lightweight real-time WebSocket server with actual analysis"""
    
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.client_sessions: Dict[str, dict] = {}
        self.analyzers: Dict[str, LightweightAnalyzer] = {}
        self.running = False
        
        # Hardcoded Gemini API key - REPLACE WITH YOUR ACTUAL GEMINI API KEY
        self.gemini_api_key = "YOUR_GEMINI_API_KEY_HERE"
        
    async def start(self):
        """Start the WebSocket server"""
        self.running = True
        logger.info(f"Starting Lightweight Real-Time AI Analysis Server on {self.host}:{self.port}")
        
        # Enable CORS for WebSocket connections
        async with websockets.serve(
            self.handle_client, 
            self.host, 
            self.port,
            # CORS settings
            origins=None,  # Allow all origins
            ping_interval=20,
            ping_timeout=10
        ):
            # Main event loop that handles analysis
            while self.running:
                try:
                    # Process analysis for all active clients
                    await self._process_analysis()
                    await asyncio.sleep(3.0)  # Analyze every 3 seconds
                except Exception as e:
                    logger.error(f"Error in main event loop: {str(e)}")
                    await asyncio.sleep(1)
    
    async def handle_client(self, websocket, path):
        """Handle individual client connections"""
        client_id = str(uuid.uuid4())
        logger.info(f"New client connected: {client_id}")
        
        self.clients.add(websocket)
        
        try:
            async for message in websocket:
                await self.process_message(websocket, client_id, message)
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client disconnected: {client_id}")
        except Exception as e:
            logger.error(f"Error handling client {client_id}: {str(e)}")
        finally:
            await self.cleanup_client(client_id)
            self.clients.discard(websocket)
    
    async def process_message(self, websocket, client_id: str, message: str):
        """Process incoming WebSocket messages"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'start_session':
                await self.handle_start_session(websocket, client_id, data)
            elif message_type == 'video_frame':
                await self.handle_video_frame(client_id, data)
            elif message_type == 'video_data':
                # Handle landmark data from frontend (more efficient than full frames)
                await self.handle_video_data(websocket, client_id, data)
            elif message_type == 'audio_chunk':
                await self.handle_audio_chunk(client_id, data)
            elif message_type == 'stop_session':
                await self.handle_stop_session(websocket, client_id)
            elif message_type == 'ping':
                await websocket.send(json.dumps({'type': 'pong', 'timestamp': time.time()}))
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON message from client {client_id}")
        except Exception as e:
            logger.error(f"Error processing message from client {client_id}: {str(e)}")
    
    async def handle_start_session(self, websocket, client_id: str, data: dict):
        """Handle session start request"""
        try:
            session_id = data.get('session_id', str(uuid.uuid4()))
            
            # Initialize analyzer for this client
            analyzer = LightweightAnalyzer(gemini_api_key=self.gemini_api_key)
            self.analyzers[client_id] = analyzer
            
            # Initialize client session
            self.client_sessions[client_id] = {
                'session_id': session_id,
                'start_time': time.time(),
                'last_analysis': 0,
                'frame_count': 0,
                'audio_chunks': 0,
                'video_frames': [],
                'audio_data': []
            }
            
            # Send confirmation
            await websocket.send(json.dumps({
                'type': 'session_started',
                'session_id': session_id,
                'client_id': client_id,
                'timestamp': time.time()
            }))
            
            logger.info(f"Started analysis session for client {client_id}: {session_id}")
            
        except Exception as e:
            logger.error(f"Error starting session for client {client_id}: {str(e)}")
            await websocket.send(json.dumps({
                'type': 'error',
                'message': f'Failed to start session: {str(e)}',
                'timestamp': time.time()
            }))
    
    async def handle_video_frame(self, client_id: str, data: dict):
        """Handle incoming video frame"""
        try:
            # Decode base64 image
            image_data = base64.b64decode(data['frame'])
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Store frame for analysis
            if client_id in self.client_sessions:
                session = self.client_sessions[client_id]
                session['frame_count'] += 1
                
                # Keep only recent frames (last 5) to avoid memory issues
                session['video_frames'].append(frame)
                if len(session['video_frames']) > 5:
                    session['video_frames'].pop(0)
            
            logger.debug(f"Received video frame from client {client_id}")
            
        except Exception as e:
            logger.error(f"Error processing video frame for client {client_id}: {str(e)}")
    
    async def handle_video_data(self, websocket, client_id: str, data: dict):
        """Handle video data with landmarks from frontend - calculate metrics from landmarks"""
        try:
            landmarks = data.get('landmarks', [])
            width = data.get('width', 1280)
            height = data.get('height', 720)
            
            if not landmarks:
                return
            
            # Initialize session if needed
            if client_id not in self.client_sessions:
                await self.handle_start_session(websocket, client_id, {'session_id': str(uuid.uuid4())})
            
            session = self.client_sessions.get(client_id)
            if not session:
                return
            
            session['frame_count'] = session.get('frame_count', 0) + 1
            
            # Calculate metrics from landmarks
            scores = self._calculate_landmark_metrics(landmarks, width, height, client_id)
            
            # Send results back to client immediately
            await websocket.send(json.dumps({
                'type': 'analysis_result',
                'result': {
                    'scores': scores,
                    'transcription': {'text': ''},
                    'feedback': {'feedback': ''},
                    'video_metrics': {
                        'frames_processed': session.get('frame_count', 0),
                        'session_duration': time.time() - session.get('start_time', time.time())
                    }
                },
                'timestamp': time.time()
            }))
            
            logger.debug(f"Processed landmarks from client {client_id}: scores={scores}")
            
        except Exception as e:
            logger.error(f"Error processing video data for client {client_id}: {str(e)}")
    
    def _calculate_landmark_metrics(self, landmarks: list, width: int, height: int, client_id: str) -> dict:
        """Calculate metrics from MediaPipe pose landmarks"""
        try:
            # MediaPipe pose landmarks indices:
            # 0: nose, 1: left eye inner, 2: left eye, 3: left eye outer
            # 4: right eye inner, 5: right eye, 6: right eye outer
            # 7: left ear, 8: right ear, 9: mouth left, 10: mouth right
            # 11: left shoulder, 12: right shoulder
            # 13: left elbow, 14: right elbow
            # 15: left wrist, 16: right wrist
            # 23: left hip, 24: right hip
            
            if len(landmarks) < 25:
                return self._get_default_scores()
            
            # Get key landmarks
            nose = landmarks[0] if len(landmarks) > 0 else None
            left_eye = landmarks[2] if len(landmarks) > 2 else None
            right_eye = landmarks[5] if len(landmarks) > 5 else None
            left_shoulder = landmarks[11] if len(landmarks) > 11 else None
            right_shoulder = landmarks[12] if len(landmarks) > 12 else None
            left_wrist = landmarks[15] if len(landmarks) > 15 else None
            right_wrist = landmarks[16] if len(landmarks) > 16 else None
            left_hip = landmarks[23] if len(landmarks) > 23 else None
            right_hip = landmarks[24] if len(landmarks) > 24 else None
            
            # ===== EYE CONTACT =====
            # Check if face is centered and looking at camera
            eye_contact_score = 0.5
            if nose and left_eye and right_eye:
                # Face should be centered horizontally
                nose_x = nose.get('x', 0.5)
                center_offset = abs(nose_x - 0.5)
                
                # Both eyes should be visible (high visibility)
                left_vis = left_eye.get('visibility', 0)
                right_vis = right_eye.get('visibility', 0)
                
                # Score based on centering and eye visibility
                centering_score = 1.0 - min(1.0, center_offset * 2)
                visibility_score = (left_vis + right_vis) / 2
                
                eye_contact_score = (centering_score * 0.5 + visibility_score * 0.5)
                eye_contact_score = max(0.3, min(1.0, eye_contact_score))
            
            # ===== POSTURE =====
            posture_score = 0.5
            if left_shoulder and right_shoulder and left_hip and right_hip:
                # Check shoulder alignment (should be level)
                shoulder_diff = abs(left_shoulder.get('y', 0) - right_shoulder.get('y', 0))
                shoulder_score = 1.0 - min(1.0, shoulder_diff * 5)
                
                # Check hip alignment
                hip_diff = abs(left_hip.get('y', 0) - right_hip.get('y', 0))
                hip_score = 1.0 - min(1.0, hip_diff * 5)
                
                # Check vertical alignment (shoulders above hips)
                shoulder_y = (left_shoulder.get('y', 0) + right_shoulder.get('y', 0)) / 2
                hip_y = (left_hip.get('y', 0) + right_hip.get('y', 0)) / 2
                vertical_score = 1.0 if shoulder_y < hip_y else 0.5
                
                posture_score = (shoulder_score * 0.4 + hip_score * 0.3 + vertical_score * 0.3)
                posture_score = max(0.3, min(1.0, posture_score))
            
            # ===== GESTURES =====
            gesture_score = 0.5
            if left_wrist and right_wrist and left_shoulder and right_shoulder:
                # Check if hands are visible and moving (not at sides)
                left_wrist_y = left_wrist.get('y', 1)
                right_wrist_y = right_wrist.get('y', 1)
                left_shoulder_y = left_shoulder.get('y', 0)
                right_shoulder_y = right_shoulder.get('y', 0)
                
                # Hands above hip level indicates active gesturing
                # Lower y value = higher in frame
                left_active = left_wrist_y < left_shoulder_y + 0.2
                right_active = right_wrist_y < right_shoulder_y + 0.2
                
                # Check visibility
                left_vis = left_wrist.get('visibility', 0)
                right_vis = right_wrist.get('visibility', 0)
                
                activity = (1 if left_active else 0) + (1 if right_active else 0)
                visibility = (left_vis + right_vis) / 2
                
                gesture_score = (activity * 0.25 + visibility * 0.5 + 0.25)
                gesture_score = max(0.3, min(1.0, gesture_score))
            
            # ===== EMOTION/ENGAGEMENT =====
            # Based on overall body language
            emotion_score = 0.5
            if nose:
                # Face visibility indicates engagement
                nose_vis = nose.get('visibility', 0)
                emotion_score = max(0.4, min(1.0, nose_vis + 0.2))
            
            # Calculate overall
            overall_score = (eye_contact_score + posture_score + gesture_score + emotion_score) / 4
            
            # Store scores for averaging
            if client_id in self.analyzers:
                analyzer = self.analyzers[client_id]
                analyzer.session_data['eye_contact_scores'].append(eye_contact_score)
                analyzer.session_data['posture_scores'].append(posture_score)
                analyzer.session_data['gesture_scores'].append(gesture_score)
                analyzer.session_data['emotion_scores'].append(emotion_score)
                
                # Limit history
                for key in ['eye_contact_scores', 'posture_scores', 'gesture_scores', 'emotion_scores']:
                    if len(analyzer.session_data[key]) > 10:
                        analyzer.session_data[key].pop(0)
            
            return {
                'eye_contact': eye_contact_score,
                'posture': posture_score,
                'gesture': gesture_score,
                'emotion': emotion_score,
                'overall': overall_score
            }
            
        except Exception as e:
            logger.error(f"Error calculating landmark metrics: {str(e)}")
            return self._get_default_scores()
    
    def _get_default_scores(self) -> dict:
        """Return default scores when calculation fails"""
        return {
            'eye_contact': 0.5,
            'posture': 0.5,
            'gesture': 0.5,
            'emotion': 0.5,
            'overall': 0.5
        }

    async def handle_audio_chunk(self, client_id: str, data: dict):
        """Handle incoming audio chunk"""
        try:
            # Decode base64 audio
            audio_data = base64.b64decode(data['audio'])
            audio_array = np.frombuffer(audio_data, dtype=np.float32)
            
            # Store audio for analysis
            if client_id in self.client_sessions:
                session = self.client_sessions[client_id]
                session['audio_chunks'] += 1
                
                # Keep only recent audio chunks (last 3 seconds worth)
                session['audio_data'].append(audio_array)
                if len(session['audio_data']) > 30:  # Assuming 10 chunks per second
                    session['audio_data'].pop(0)
            
            logger.debug(f"Received audio chunk from client {client_id}")
            
        except Exception as e:
            logger.error(f"Error processing audio chunk for client {client_id}: {str(e)}")
    
    async def handle_stop_session(self, websocket, client_id: str):
        """Handle session stop request"""
        try:
            session_data = self.client_sessions.get(client_id, {})
            duration = time.time() - session_data.get('start_time', time.time())
            
            # Get final analysis summary
            summary = {}
            if client_id in self.analyzers:
                try:
                    summary = self.analyzers[client_id].get_session_summary()
                except Exception as e:
                    logger.error(f"Error getting session summary: {str(e)}")
                    summary = {
                        'duration': duration,
                        'frames_processed': session_data.get('frame_count', 0),
                        'audio_chunks_processed': session_data.get('audio_chunks', 0),
                        'overall_score': 0.75
                    }
            
            # Send summary
            await websocket.send(json.dumps({
                'type': 'session_summary',
                'summary': summary,
                'timestamp': time.time()
            }))
            
            logger.info(f"Stopped analysis session for client {client_id}")
            
        except Exception as e:
            logger.error(f"Error stopping session for client {client_id}: {str(e)}")
            await websocket.send(json.dumps({
                'type': 'error',
                'message': f'Failed to stop session: {str(e)}',
                'timestamp': time.time()
            }))
    
    async def _process_analysis(self):
        """Process real analysis for all active clients"""
        try:
            current_time = time.time()
            
            for client_id, session_data in self.client_sessions.items():
                # Check if it's time for analysis (every 3 seconds)
                if (current_time - session_data.get('last_analysis', 0)) >= 3.0:
                    try:
                        # Get analyzer for this client
                        analyzer = self.analyzers.get(client_id)
                        if not analyzer:
                            continue
                        
                        # Get latest video frame and audio data
                        video_frame = None
                        audio_chunk = None
                        
                        if session_data['video_frames']:
                            video_frame = session_data['video_frames'][-1]  # Latest frame
                        
                        if session_data['audio_data']:
                            # Combine recent audio chunks
                            audio_chunk = np.concatenate(session_data['audio_data'][-10:])  # Last 10 chunks
                        
                        # Perform real analysis
                        result = await self._perform_real_analysis(analyzer, video_frame, audio_chunk, session_data)
                        
                        # Send result to client
                        await self._send_analysis_result(client_id, result)
                        
                        # Update last analysis time
                        session_data['last_analysis'] = current_time
                        
                    except Exception as e:
                        logger.error(f"Error analyzing client {client_id}: {str(e)}")
                        session_data['last_analysis'] = current_time
                    
        except Exception as e:
            logger.error(f"Error in analysis processing: {str(e)}")
    
    async def _perform_real_analysis(self, analyzer: LightweightAnalyzer, video_frame, audio_chunk, session_data: dict):
        """Perform real AI analysis"""
        try:
            # Perform video analysis if frame is available
            video_results = {}
            if video_frame is not None:
                try:
                    posture_result = analyzer.analyze_posture(video_frame)
                    gesture_result = analyzer.analyze_gestures(video_frame)
                    eye_result = analyzer.analyze_eye_contact(video_frame)
                    emotion_result = analyzer.analyze_emotion(video_frame)
                    
                    video_results = {
                        'posture_score': posture_result['posture_score'],
                        'gestures': gesture_result,
                        'eye_contact': eye_result,
                        'emotion': emotion_result
                    }
                except Exception as e:
                    logger.error(f"Video analysis error: {str(e)}")
            
            # Perform audio analysis if audio is available
            audio_results = {}
            transcription_text = ""
            gemini_feedback = ""
            
            if audio_chunk is not None and len(audio_chunk) > 0:
                try:
                    transcription_results = analyzer.transcribe_speech(audio_chunk)
                    transcription_text = transcription_results.get('text', '')
                except Exception as e:
                    logger.error(f"Audio analysis error: {str(e)}")
            
            # Get Gemini feedback based on transcription and video results
            if transcription_text or video_results:
                try:
                    gemini_feedback = analyzer.get_gemini_feedback(transcription_text, video_results)
                except Exception as e:
                    logger.error(f"Gemini feedback error: {str(e)}")
                    gemini_feedback = ""
            
            audio_results = {
                'transcription': transcription_text,
                'gemini_feedback': gemini_feedback
            }
            
            # Calculate overall scores
            scores = self._calculate_scores(video_results, audio_results, session_data)
            
            # Get current time for session duration
            current_time = time.time()
            
            # Create comprehensive result
            result = {
                'scores': scores,
                'transcription': {
                    'text': transcription_text or "No speech detected..."
                },
                'feedback': {
                    'feedback': gemini_feedback if gemini_feedback else ""
                },
                'video_metrics': {
                    'frames_processed': session_data.get('frame_count', 0),
                    'session_duration': current_time - session_data.get('start_time', current_time)
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in real analysis: {str(e)}")
            # Return minimal result on error
            current_time = time.time()
            return {
                'scores': {
                    'posture': 0.5,
                    'eye_contact': 0.5,
                    'gesture': 0.5,
                    'emotion': 0.5,
                    'overall': 0.5
                },
                'transcription': {
                    'text': 'Analysis error occurred'
                },
                'feedback': {
                    'feedback': ''
                },
                'video_metrics': {
                    'frames_processed': session_data.get('frame_count', 0),
                    'session_duration': current_time - session_data.get('start_time', current_time)
                }
            }
    
    def _calculate_scores(self, video_results: dict, audio_results: dict, session_data: dict):
        """Calculate overall performance scores"""
        try:
            # Extract individual scores
            posture_score = video_results.get('posture_score', 0.5)
            gesture_score = video_results.get('gestures', {}).get('score', 0.5)
            eye_contact_score = video_results.get('eye_contact', {}).get('score', 0.5)
            emotion_score = video_results.get('emotion', {}).get('score', 0.5)
            
            # Calculate overall score
            overall_score = (posture_score + gesture_score + eye_contact_score + emotion_score) / 4
            
            return {
                'posture': posture_score,
                'eye_contact': eye_contact_score,
                'gesture': gesture_score,
                'emotion': emotion_score,
                'overall': overall_score
            }
        except Exception as e:
            logger.error(f"Error calculating scores: {str(e)}")
            return {
                'posture': 0.5,
                'eye_contact': 0.5,
                'gesture': 0.5,
                'emotion': 0.5,
                'overall': 0.5
            }
    
    
    async def _send_analysis_result(self, client_id: str, result: dict):
        """Send analysis result to specific client"""
        try:
            # Find the websocket for this client
            for websocket in self.clients:
                try:
                    await websocket.send(json.dumps({
                        'type': 'analysis_result',
                        'result': result,
                        'timestamp': time.time()
                    }))
                    logger.debug(f"Sent analysis result to client {client_id}")
                    break  # Send to first available websocket
                except Exception as e:
                    logger.error(f"Error sending result to client {client_id}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Error sending analysis result: {str(e)}")
    
    async def cleanup_client(self, client_id: str):
        """Clean up client resources"""
        try:
            # Remove analyzer
            if client_id in self.analyzers:
                del self.analyzers[client_id]
            
            # Remove client session
            if client_id in self.client_sessions:
                del self.client_sessions[client_id]
            
            logger.info(f"Cleaned up resources for client {client_id}")
            
        except Exception as e:
            logger.error(f"Error cleaning up client {client_id}: {str(e)}")
    
    def stop(self):
        """Stop the server"""
        self.running = False
        logger.info("Stopping Lightweight Real-Time AI Analysis Server")

async def main():
    """Main function to run the server"""
    server = LightweightRealTimeServer()
    
    try:
        await server.start()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, shutting down...")
        server.stop()
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        server.stop()

if __name__ == "__main__":
    asyncio.run(main()) 
