import asyncio
import time
import os
import re
import json
from typing import Dict, List, Tuple, Optional
import numpy as np
import librosa
import whisper
import spacy
from transformers import pipeline
import torch

class SpeechAnalyzer:
    """AI-powered speech analysis using multiple ML models"""
    
    def __init__(self):
        self.whisper_model = None
        self.nlp = None
        self.sentiment_analyzer = None
        self.initialized = False
        
        # Common filler words
        self.filler_words = {
            'um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean', 'basically',
            'actually', 'literally', 'sort of', 'kind of', 'right', 'okay',
            'so', 'well', 'now', 'then', 'just', 'really', 'very'
        }
        
    async def initialize(self):
        """Initialize all ML models asynchronously"""
        if self.initialized:
            return
            
        print("Initializing Speech Analyzer...")
        
        # Load Whisper model
        print("Loading Whisper model...")
        self.whisper_model = whisper.load_model("base")
        
        # Load spaCy model
        print("Loading spaCy model...")
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Download if not available
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        # Load sentiment analyzer
        print("Loading sentiment analyzer...")
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest"
        )
        
        self.initialized = True
        print("Speech Analyzer initialized successfully!")
    
    async def analyze(self, file_path: str) -> Dict:
        """Perform comprehensive speech analysis"""
        if not self.initialized:
            await self.initialize()
        
        start_time = time.time()
        
        try:
            # Load audio file
            y, sr = librosa.load(file_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            
            # Perform transcription
            transcript_result = await self._transcribe_audio(file_path)
            transcript = transcript_result.get('text', '')
            confidence = transcript_result.get('confidence', 0.0)
            
            # Analyze audio features
            audio_features = await self._analyze_audio_features(y, sr)
            
            # Analyze text features
            text_features = await self._analyze_text_features(transcript, duration)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(
                audio_features, text_features, transcript
            )
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(audio_features, text_features)
            
            processing_time = time.time() - start_time
            
            # Compile results
            result = {
                "file_name": os.path.basename(file_path),
                "duration_seconds": duration,
                "transcript": transcript if transcript else None,
                "confidence_score": confidence,
                "speaking_rate": text_features['speaking_rate'],
                "pause_frequency": audio_features['pause_frequency'],
                "average_pause_duration": audio_features['average_pause_duration'],
                "clarity_score": audio_features['clarity_score'],
                "pronunciation_score": text_features['pronunciation_score'],
                "filler_words": text_features['filler_words'],
                "filler_word_count": text_features['filler_word_count'],
                "filler_word_frequency": text_features['filler_word_frequency'],
                "emotional_tone": text_features['emotional_tone'],
                "confidence_level": text_features['confidence_level'],
                "enthusiasm_score": audio_features['enthusiasm_score'],
                "volume_consistency": audio_features['volume_consistency'],
                "pitch_variation": audio_features['pitch_variation'],
                "average_volume": audio_features['average_volume'],
                "recommendations": recommendations,
                "overall_score": overall_score,
                "analysis_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "processing_time_seconds": processing_time
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Speech analysis failed: {str(e)}")
    
    async def _transcribe_audio(self, file_path: str) -> Dict:
        """Transcribe audio using Whisper"""
        try:
            result = self.whisper_model.transcribe(file_path)
            return {
                'text': result['text'].strip(),
                'confidence': np.mean([seg['avg_logprob'] for seg in result['segments']]) if result['segments'] else 0.0
            }
        except Exception as e:
            print(f"Transcription error: {e}")
            return {'text': '', 'confidence': 0.0}
    
    async def _analyze_audio_features(self, y: np.ndarray, sr: int) -> Dict:
        """Analyze audio features using Librosa"""
        try:
            # Extract features
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            
            # Volume analysis
            rms = librosa.feature.rms(y=y)[0]
            average_volume = np.mean(rms)
            volume_std = np.std(rms)
            volume_consistency = max(0, 100 - (volume_std / average_volume * 100)) if average_volume > 0 else 0
            
            # Pitch analysis
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)
            
            pitch_variation = np.std(pitch_values) if pitch_values else 0
            pitch_variation_score = min(100, max(0, 50 + (pitch_variation / 100)))
            
            # Pause detection
            silence_threshold = 0.01
            silence_mask = rms < silence_threshold
            silence_changes = np.diff(silence_mask.astype(int))
            pause_starts = np.where(silence_changes == 1)[0]
            pause_ends = np.where(silence_changes == -1)[0]
            
            pause_durations = []
            for start, end in zip(pause_starts, pause_ends):
                if end > start:
                    pause_duration = (end - start) / sr
                    if pause_duration > 0.1:  # Only count pauses longer than 100ms
                        pause_durations.append(pause_duration)
            
            pause_frequency = len(pause_durations) / (len(y) / sr) * 60  # per minute
            average_pause_duration = np.mean(pause_durations) if pause_durations else 0
            
            # Clarity score based on spectral features
            clarity_score = min(100, max(0, 
                50 + np.mean(spectral_centroids) / 1000 * 20 + 
                np.mean(spectral_rolloff) / 1000 * 10
            ))
            
            # Enthusiasm score based on energy and tempo
            energy = np.mean(librosa.feature.melspectrogram(y=y, sr=sr))
            enthusiasm_score = min(100, max(0, 
                50 + (energy / 1000) * 20 + (tempo / 200) * 10
            ))
            
            return {
                'tempo': tempo,
                'average_volume': average_volume,
                'volume_consistency': volume_consistency,
                'pitch_variation': pitch_variation_score,
                'pause_frequency': pause_frequency,
                'average_pause_duration': average_pause_duration,
                'clarity_score': clarity_score,
                'enthusiasm_score': enthusiasm_score
            }
            
        except Exception as e:
            print(f"Audio analysis error: {e}")
            return {
                'tempo': 120,
                'average_volume': 0,
                'volume_consistency': 50,
                'pitch_variation': 50,
                'pause_frequency': 0,
                'average_pause_duration': 0,
                'clarity_score': 50,
                'enthusiasm_score': 50
            }
    
    async def _analyze_text_features(self, transcript: str, duration: float) -> Dict:
        """Analyze text features using spaCy and sentiment analysis"""
        try:
            if not transcript:
                return {
                    'speaking_rate': 0,
                    'pronunciation_score': 50,
                    'filler_words': [],
                    'filler_word_count': 0,
                    'filler_word_frequency': 0,
                    'emotional_tone': 'neutral',
                    'confidence_level': 'low'
                }
            
            # Process with spaCy
            doc = self.nlp(transcript.lower())
            
            # Calculate speaking rate
            word_count = len([token for token in doc if not token.is_punct])
            speaking_rate = (word_count / duration) * 60 if duration > 0 else 0
            
            # Detect filler words
            filler_words = []
            for token in doc:
                if token.text in self.filler_words:
                    filler_words.append(token.text)
            
            filler_word_count = len(filler_words)
            filler_word_frequency = (filler_word_count / duration) * 60 if duration > 0 else 0
            
            # Sentiment analysis
            try:
                sentiment_result = self.sentiment_analyzer(transcript[:512])[0]  # Limit length
                emotional_tone = sentiment_result['label']
            except:
                emotional_tone = 'neutral'
            
            # Confidence level based on speaking rate and filler words
            if speaking_rate < 100:
                confidence_level = 'slow'
            elif speaking_rate > 200:
                confidence_level = 'fast'
            else:
                confidence_level = 'good'
            
            if filler_word_frequency > 5:
                confidence_level = 'needs_improvement'
            
            # Pronunciation score (simplified)
            pronunciation_score = max(0, 100 - (filler_word_frequency * 5))
            
            return {
                'speaking_rate': speaking_rate,
                'pronunciation_score': pronunciation_score,
                'filler_words': list(set(filler_words)),
                'filler_word_count': filler_word_count,
                'filler_word_frequency': filler_word_frequency,
                'emotional_tone': emotional_tone,
                'confidence_level': confidence_level
            }
            
        except Exception as e:
            print(f"Text analysis error: {e}")
            return {
                'speaking_rate': 0,
                'pronunciation_score': 50,
                'filler_words': [],
                'filler_word_count': 0,
                'filler_word_frequency': 0,
                'emotional_tone': 'neutral',
                'confidence_level': 'low'
            }
    
    async def _generate_recommendations(self, audio_features: Dict, text_features: Dict, transcript: str) -> List[str]:
        """Generate personalized improvement recommendations"""
        recommendations = []
        
        # Speaking rate recommendations
        if text_features['speaking_rate'] < 100:
            recommendations.append("Consider speaking slightly faster to maintain audience engagement")
        elif text_features['speaking_rate'] > 200:
            recommendations.append("Slow down your speech to improve clarity and comprehension")
        
        # Filler word recommendations
        if text_features['filler_word_frequency'] > 3:
            recommendations.append("Reduce filler words like 'um', 'uh', and 'like' for more professional speech")
        
        # Volume recommendations
        if audio_features['volume_consistency'] < 70:
            recommendations.append("Work on maintaining consistent volume throughout your speech")
        
        # Pause recommendations
        if audio_features['pause_frequency'] < 2:
            recommendations.append("Add strategic pauses to emphasize key points and improve pacing")
        elif audio_features['pause_frequency'] > 10:
            recommendations.append("Reduce excessive pausing to maintain better flow")
        
        # Clarity recommendations
        if audio_features['clarity_score'] < 70:
            recommendations.append("Focus on clear pronunciation and articulation")
        
        # Enthusiasm recommendations
        if audio_features['enthusiasm_score'] < 60:
            recommendations.append("Increase vocal energy and enthusiasm to engage your audience")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Great job! Your speech demonstrates good communication skills")
        
        return recommendations[:5]  # Limit to top 5 recommendations
    
    def _calculate_overall_score(self, audio_features: Dict, text_features: Dict) -> float:
        """Calculate overall speech quality score"""
        weights = {
            'clarity': 0.25,
            'pronunciation': 0.20,
            'volume_consistency': 0.15,
            'speaking_rate': 0.15,
            'enthusiasm': 0.15,
            'filler_words': 0.10
        }
        
        # Normalize speaking rate score (optimal range: 120-180 WPM)
        speaking_rate_score = 100
        if text_features['speaking_rate'] < 120:
            speaking_rate_score = max(0, 100 - (120 - text_features['speaking_rate']) * 2)
        elif text_features['speaking_rate'] > 180:
            speaking_rate_score = max(0, 100 - (text_features['speaking_rate'] - 180) * 2)
        
        # Normalize filler word score
        filler_word_score = max(0, 100 - text_features['filler_word_frequency'] * 10)
        
        overall_score = (
            audio_features['clarity_score'] * weights['clarity'] +
            text_features['pronunciation_score'] * weights['pronunciation'] +
            audio_features['volume_consistency'] * weights['volume_consistency'] +
            speaking_rate_score * weights['speaking_rate'] +
            audio_features['enthusiasm_score'] * weights['enthusiasm'] +
            filler_word_score * weights['filler_words']
        )
        
        return round(overall_score, 1) 