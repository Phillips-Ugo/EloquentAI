import asyncio
import time
import os
import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, List, Tuple, Optional
from collections import defaultdict

class VideoAnalyzer:
    """AI-powered video analysis using MediaPipe for body language assessment"""
    
    def __init__(self):
        self.mp_pose = None
        self.mp_face_mesh = None
        self.mp_hands = None
        self.initialized = False
        
    async def initialize(self):
        """Initialize MediaPipe models"""
        if self.initialized:
            return
            
        print("Initializing Video Analyzer...")
        
        # Initialize MediaPipe
        self.mp_pose = mp.solutions.pose
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        
        self.initialized = True
        print("Video Analyzer initialized successfully!")
    
    async def analyze(self, file_path: str) -> Dict:
        """Perform comprehensive video analysis"""
        if not self.initialized:
            await self.initialize()
        
        start_time = time.time()
        
        try:
            # Open video file
            cap = cv2.VideoCapture(file_path)
            if not cap.isOpened():
                raise Exception("Could not open video file")
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            
            # Initialize analysis containers
            pose_data = []
            face_data = []
            hand_data = []
            frame_timestamps = []
            
            # Process frames
            frame_idx = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process every 3rd frame for efficiency (10 FPS analysis)
                if frame_idx % 3 == 0:
                    timestamp = frame_idx / fps
                    frame_timestamps.append(timestamp)
                    
                    # Analyze pose
                    pose_results = await self._analyze_pose(frame)
                    if pose_results:
                        pose_data.append(pose_results)
                    
                    # Analyze face
                    face_results = await self._analyze_face(frame)
                    if face_results:
                        face_data.append(face_results)
                    
                    # Analyze hands
                    hand_results = await self._analyze_hands(frame)
                    if hand_results:
                        hand_data.append(hand_results)
                
                frame_idx += 1
                
                # Limit analysis to first 60 seconds for performance
                if timestamp > 60:
                    break
            
            cap.release()
            
            # Analyze collected data
            posture_analysis = await self._analyze_posture(pose_data, frame_timestamps)
            gesture_analysis = await self._analyze_gestures(hand_data, frame_timestamps)
            eye_contact_analysis = await self._analyze_eye_contact(face_data, frame_timestamps)
            movement_analysis = await self._analyze_movement(pose_data, frame_timestamps)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(
                posture_analysis, gesture_analysis, eye_contact_analysis, movement_analysis
            )
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(
                posture_analysis, gesture_analysis, eye_contact_analysis, movement_analysis
            )
            
            processing_time = time.time() - start_time
            
            # Compile results
            result = {
                "file_name": os.path.basename(file_path),
                "duration_seconds": duration,
                "frame_count": len(frame_timestamps),
                "posture_score": posture_analysis['overall_score'],
                "shoulder_alignment": posture_analysis['shoulder_alignment'],
                "spine_position": posture_analysis['spine_position'],
                "head_position": posture_analysis['head_position'],
                "gesture_score": gesture_analysis['overall_score'],
                "hand_movement_frequency": gesture_analysis['movement_frequency'],
                "excessive_gestures": gesture_analysis['excessive_gestures'],
                "gesture_variety": gesture_analysis['variety_score'],
                "eye_contact_score": eye_contact_analysis['overall_score'],
                "eye_contact_percentage": eye_contact_analysis['contact_percentage'],
                "gaze_direction": eye_contact_analysis['primary_direction'],
                "eye_contact_consistency": eye_contact_analysis['consistency'],
                "movement_score": movement_analysis['overall_score'],
                "excessive_movement": movement_analysis['excessive_movements'],
                "movement_smoothness": movement_analysis['smoothness'],
                "fidgeting_detected": movement_analysis['fidgeting_detected'],
                "professional_presence_score": self._calculate_presence_score(
                    posture_analysis, gesture_analysis, eye_contact_analysis
                ),
                "confidence_level": self._assess_confidence_level(
                    posture_analysis, gesture_analysis, eye_contact_analysis
                ),
                "engagement_score": self._calculate_engagement_score(
                    gesture_analysis, eye_contact_analysis, movement_analysis
                ),
                "posture_issues": posture_analysis['issues'],
                "gesture_recommendations": gesture_analysis['recommendations'],
                "eye_contact_issues": eye_contact_analysis['issues'],
                "recommendations": recommendations,
                "overall_score": overall_score,
                "analysis_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "processing_time_seconds": processing_time
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Video analysis failed: {str(e)}")
    
    async def _analyze_pose(self, frame) -> Optional[Dict]:
        """Analyze pose using MediaPipe Pose"""
        try:
            with self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                smooth_landmarks=True,
                enable_segmentation=False,
                smooth_segmentation=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            ) as pose:
                results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                
                if results.pose_landmarks:
                    landmarks = results.pose_landmarks.landmark
                    return {
                        'landmarks': landmarks,
                        'visibility': [landmark.visibility for landmark in landmarks]
                    }
                return None
                
        except Exception as e:
            print(f"Pose analysis error: {e}")
            return None
    
    async def _analyze_face(self, frame) -> Optional[Dict]:
        """Analyze face using MediaPipe Face Mesh"""
        try:
            with self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            ) as face_mesh:
                results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                
                if results.multi_face_landmarks:
                    landmarks = results.multi_face_landmarks[0].landmark
                    return {
                        'landmarks': landmarks,
                        'eye_landmarks': [landmarks[i] for i in [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]]
                    }
                return None
                
        except Exception as e:
            print(f"Face analysis error: {e}")
            return None
    
    async def _analyze_hands(self, frame) -> Optional[Dict]:
        """Analyze hands using MediaPipe Hands"""
        try:
            with self.mp_hands.Hands(
                static_image_mode=False,
                max_num_hands=2,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            ) as hands:
                results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                
                if results.multi_hand_landmarks:
                    hand_data = []
                    for hand_landmarks in results.multi_hand_landmarks:
                        landmarks = hand_landmarks.landmark
                        hand_data.append({
                            'landmarks': landmarks,
                            'handedness': 'left' if hand_landmarks.landmark[17].x < hand_landmarks.landmark[5].x else 'right'
                        })
                    return {'hands': hand_data}
                return None
                
        except Exception as e:
            print(f"Hand analysis error: {e}")
            return None
    
    async def _analyze_posture(self, pose_data: List, timestamps: List) -> Dict:
        """Analyze posture from pose data"""
        if not pose_data:
            return {
                'overall_score': 50,
                'shoulder_alignment': 50,
                'spine_position': 50,
                'head_position': 50,
                'issues': ['No pose data available']
            }
        
        try:
            # Analyze shoulder alignment
            shoulder_scores = []
            spine_scores = []
            head_scores = []
            
            for pose in pose_data:
                landmarks = pose['landmarks']
                
                # Shoulder alignment (landmarks 11, 12)
                left_shoulder = landmarks[11]
                right_shoulder = landmarks[12]
                
                if left_shoulder.visibility > 0.5 and right_shoulder.visibility > 0.5:
                    shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
                    shoulder_score = max(0, 100 - (shoulder_diff * 1000))
                    shoulder_scores.append(shoulder_score)
                
                # Spine position (landmarks 11, 12, 23, 24)
                left_hip = landmarks[23]
                right_hip = landmarks[24]
                
                if (left_shoulder.visibility > 0.5 and right_shoulder.visibility > 0.5 and
                    left_hip.visibility > 0.5 and right_hip.visibility > 0.5):
                    spine_angle = abs((left_shoulder.y + right_shoulder.y) / 2 - (left_hip.y + right_hip.y) / 2)
                    spine_score = max(0, 100 - (spine_angle * 100))
                    spine_scores.append(spine_score)
                
                # Head position (landmarks 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
                nose = landmarks[0]
                left_ear = landmarks[2]
                right_ear = landmarks[5]
                
                if nose.visibility > 0.5 and left_ear.visibility > 0.5 and right_ear.visibility > 0.5:
                    head_tilt = abs(left_ear.y - right_ear.y)
                    head_score = max(0, 100 - (head_tilt * 1000))
                    head_scores.append(head_score)
            
            # Calculate averages
            shoulder_alignment = np.mean(shoulder_scores) if shoulder_scores else 50
            spine_position = np.mean(spine_scores) if spine_scores else 50
            head_position = np.mean(head_scores) if head_scores else 50
            
            overall_score = (shoulder_alignment + spine_position + head_position) / 3
            
            # Identify issues
            issues = []
            if shoulder_alignment < 70:
                issues.append("Uneven shoulder alignment detected")
            if spine_position < 70:
                issues.append("Poor spine posture detected")
            if head_position < 70:
                issues.append("Head tilt or poor head position")
            
            return {
                'overall_score': overall_score,
                'shoulder_alignment': shoulder_alignment,
                'spine_position': spine_position,
                'head_position': head_position,
                'issues': issues
            }
            
        except Exception as e:
            print(f"Posture analysis error: {e}")
            return {
                'overall_score': 50,
                'shoulder_alignment': 50,
                'spine_position': 50,
                'head_position': 50,
                'issues': ['Posture analysis failed']
            }
    
    async def _analyze_gestures(self, hand_data: List, timestamps: List) -> Dict:
        """Analyze hand gestures from hand data"""
        if not hand_data:
            return {
                'overall_score': 50,
                'movement_frequency': 0,
                'excessive_gestures': 0,
                'variety_score': 50,
                'recommendations': ['No hand data available']
            }
        
        try:
            # Count hand movements
            movement_count = len([d for d in hand_data if d and 'hands' in d])
            movement_frequency = (movement_count / max(timestamps)) * 60 if timestamps else 0
            
            # Analyze gesture variety
            gesture_types = set()
            for data in hand_data:
                if data and 'hands' in data:
                    for hand in data['hands']:
                        # Simple gesture classification based on hand position
                        landmarks = hand['landmarks']
                        wrist = landmarks[0]
                        thumb_tip = landmarks[4]
                        index_tip = landmarks[8]
                        
                        # Classify gesture type
                        if thumb_tip.y < wrist.y and index_tip.y < wrist.y:
                            gesture_types.add('pointing')
                        elif abs(thumb_tip.y - wrist.y) < 0.1:
                            gesture_types.add('neutral')
                        else:
                            gesture_types.add('other')
            
            variety_score = min(100, len(gesture_types) * 25)
            
            # Determine excessive gestures
            excessive_gestures = 0
            if movement_frequency > 20:  # More than 20 movements per minute
                excessive_gestures = int(movement_frequency - 20)
            
            # Calculate overall score
            overall_score = max(0, 100 - (excessive_gestures * 5) + (variety_score * 0.3))
            
            # Generate recommendations
            recommendations = []
            if excessive_gestures > 0:
                recommendations.append("Reduce excessive hand movements for more professional appearance")
            if variety_score < 50:
                recommendations.append("Add more variety to your hand gestures")
            if movement_frequency < 5:
                recommendations.append("Consider using more hand gestures to engage your audience")
            
            return {
                'overall_score': overall_score,
                'movement_frequency': movement_frequency,
                'excessive_gestures': excessive_gestures,
                'variety_score': variety_score,
                'recommendations': recommendations
            }
            
        except Exception as e:
            print(f"Gesture analysis error: {e}")
            return {
                'overall_score': 50,
                'movement_frequency': 0,
                'excessive_gestures': 0,
                'variety_score': 50,
                'recommendations': ['Gesture analysis failed']
            }
    
    async def _analyze_eye_contact(self, face_data: List, timestamps: List) -> Dict:
        """Analyze eye contact from face data"""
        if not face_data:
            return {
                'overall_score': 50,
                'contact_percentage': 0,
                'primary_direction': 'unknown',
                'consistency': 50,
                'issues': ['No face data available']
            }
        
        try:
            # Analyze gaze direction
            gaze_directions = []
            eye_contact_frames = 0
            
            for face in face_data:
                if face and 'eye_landmarks' in face:
                    eye_landmarks = face['eye_landmarks']
                    
                    # Simple gaze direction estimation
                    left_eye_center = np.mean([eye_landmarks[0].x, eye_landmarks[1].x, eye_landmarks[2].x])
                    right_eye_center = np.mean([eye_landmarks[8].x, eye_landmarks[9].x, eye_landmarks[10].x])
                    
                    eye_center = (left_eye_center + right_eye_center) / 2
                    
                    if 0.4 < eye_center < 0.6:  # Looking at camera
                        gaze_directions.append('center')
                        eye_contact_frames += 1
                    elif eye_center < 0.4:
                        gaze_directions.append('left')
                    else:
                        gaze_directions.append('right')
            
            # Calculate metrics
            contact_percentage = (eye_contact_frames / len(face_data)) * 100 if face_data else 0
            
            # Determine primary direction
            direction_counts = defaultdict(int)
            for direction in gaze_directions:
                direction_counts[direction] += 1
            
            primary_direction = max(direction_counts, key=direction_counts.get) if direction_counts else 'unknown'
            
            # Calculate consistency
            consistency = max(0, 100 - (len(set(gaze_directions)) * 20))
            
            # Calculate overall score
            overall_score = (contact_percentage * 0.6 + consistency * 0.4)
            
            # Identify issues
            issues = []
            if contact_percentage < 50:
                issues.append("Low eye contact with camera")
            if consistency < 70:
                issues.append("Inconsistent gaze direction")
            if primary_direction != 'center':
                issues.append(f"Primary gaze direction is {primary_direction}")
            
            return {
                'overall_score': overall_score,
                'contact_percentage': contact_percentage,
                'primary_direction': primary_direction,
                'consistency': consistency,
                'issues': issues
            }
            
        except Exception as e:
            print(f"Eye contact analysis error: {e}")
            return {
                'overall_score': 50,
                'contact_percentage': 0,
                'primary_direction': 'unknown',
                'consistency': 50,
                'issues': ['Eye contact analysis failed']
            }
    
    async def _analyze_movement(self, pose_data: List, timestamps: List) -> Dict:
        """Analyze overall movement patterns"""
        if not pose_data:
            return {
                'overall_score': 50,
                'excessive_movements': 0,
                'smoothness': 50,
                'fidgeting_detected': False
            }
        
        try:
            # Analyze movement smoothness
            movement_changes = []
            for i in range(1, len(pose_data)):
                if pose_data[i] and pose_data[i-1]:
                    # Calculate movement between frames
                    prev_landmarks = pose_data[i-1]['landmarks']
                    curr_landmarks = pose_data[i]['landmarks']
                    
                    # Use nose position as reference
                    if prev_landmarks[0].visibility > 0.5 and curr_landmarks[0].visibility > 0.5:
                        movement = abs(curr_landmarks[0].x - prev_landmarks[0].x) + abs(curr_landmarks[0].y - prev_landmarks[0].y)
                        movement_changes.append(movement)
            
            # Calculate smoothness
            if movement_changes:
                movement_variance = np.var(movement_changes)
                smoothness = max(0, 100 - (movement_variance * 1000))
            else:
                smoothness = 50
            
            # Detect excessive movements
            excessive_movements = len([m for m in movement_changes if m > 0.1])
            
            # Detect fidgeting (rapid small movements)
            fidgeting_detected = len([m for m in movement_changes if 0.01 < m < 0.05]) > len(movement_changes) * 0.3
            
            # Calculate overall score
            overall_score = max(0, 100 - (excessive_movements * 2) - (fidgeting_detected * 20) + (smoothness * 0.5))
            
            return {
                'overall_score': overall_score,
                'excessive_movements': excessive_movements,
                'smoothness': smoothness,
                'fidgeting_detected': fidgeting_detected
            }
            
        except Exception as e:
            print(f"Movement analysis error: {e}")
            return {
                'overall_score': 50,
                'excessive_movements': 0,
                'smoothness': 50,
                'fidgeting_detected': False
            }
    
    async def _generate_recommendations(self, posture: Dict, gestures: Dict, eye_contact: Dict, movement: Dict) -> List[str]:
        """Generate personalized improvement recommendations"""
        recommendations = []
        
        # Posture recommendations
        if posture['overall_score'] < 70:
            recommendations.append("Work on maintaining good posture with shoulders back and head held high")
        
        # Gesture recommendations
        if gestures['excessive_gestures'] > 0:
            recommendations.append("Reduce excessive hand movements for a more professional appearance")
        elif gestures['movement_frequency'] < 5:
            recommendations.append("Consider using more hand gestures to engage your audience")
        
        # Eye contact recommendations
        if eye_contact['contact_percentage'] < 50:
            recommendations.append("Maintain more eye contact with the camera/audience")
        
        # Movement recommendations
        if movement['fidgeting_detected']:
            recommendations.append("Avoid fidgeting and maintain steady, confident movements")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Excellent presentation skills! Keep up the great work")
        
        return recommendations[:5]
    
    def _calculate_overall_score(self, posture: Dict, gestures: Dict, eye_contact: Dict, movement: Dict) -> float:
        """Calculate overall presentation quality score"""
        weights = {
            'posture': 0.25,
            'eye_contact': 0.30,
            'gestures': 0.25,
            'movement': 0.20
        }
        
        overall_score = (
            posture['overall_score'] * weights['posture'] +
            eye_contact['overall_score'] * weights['eye_contact'] +
            gestures['overall_score'] * weights['gestures'] +
            movement['overall_score'] * weights['movement']
        )
        
        return round(overall_score, 1)
    
    def _calculate_presence_score(self, posture: Dict, gestures: Dict, eye_contact: Dict) -> float:
        """Calculate professional presence score"""
        return (posture['overall_score'] * 0.4 + eye_contact['overall_score'] * 0.4 + gestures['overall_score'] * 0.2)
    
    def _assess_confidence_level(self, posture: Dict, gestures: Dict, eye_contact: Dict) -> str:
        """Assess confidence level based on multiple factors"""
        avg_score = (posture['overall_score'] + gestures['overall_score'] + eye_contact['overall_score']) / 3
        
        if avg_score >= 80:
            return "high"
        elif avg_score >= 60:
            return "medium"
        else:
            return "low"
    
    def _calculate_engagement_score(self, gestures: Dict, eye_contact: Dict, movement: Dict) -> float:
        """Calculate audience engagement potential"""
        return (gestures['variety_score'] * 0.3 + eye_contact['contact_percentage'] * 0.4 + movement['smoothness'] * 0.3) 