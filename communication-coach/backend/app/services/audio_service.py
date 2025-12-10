"""
Audio analysis service using PyTorch and transformers
"""

import logging
import numpy as np
import torch
import torchaudio
import librosa
from typing import Dict, List, Any, Optional
import io
import soundfile as sf
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
import re
import os

from app.models.schemas import AudioAnalysisResponse, Replacement, Timestamp
from app.core.config import settings

logger = logging.getLogger(__name__)

class AudioAnalysisService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.feature_extractor = None
        self.emotion_labels = [
            "calm", "neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"
        ]
        self.filler_patterns = {
            'um': r'\b(um|uh)\b',
            'like': r'\b(like|you know)\b',
            'so': r'\b(so|basically)\b',
            'well': r'\b(well|actually)\b',
            'right': r'\b(right|okay)\b'
        }
        
        # Load model if not in mock mode
        if not settings.MOCK_RESPONSES:
            self.load_model()
    
    def load_model(self):
        """Load the emotion classification model"""
        try:
            model_path = settings.AUDIO_MODEL_PATH
            if not model_path or not os.path.exists(model_path):
                logger.warning("Model file not found, using mock responses")
                settings.MOCK_RESPONSES = True
                return
            
            # Load model and feature extractor
            self.model = Wav2Vec2ForSequenceClassification.from_pretrained(model_path)
            self.feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(model_path)
            
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"✅ Audio emotion model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load audio model: {e}")
            settings.MOCK_RESPONSES = True
    
    async def analyze_audio(self, audio_content: bytes, filename: str) -> AudioAnalysisResponse:
        """
        Analyze audio file for emotion, speech rate, and filler words
        """
        try:
            # Load and preprocess audio
            audio_data, sample_rate = self.load_audio(audio_content, filename)
            
            # Resample to target sample rate
            if sample_rate != settings.TARGET_SAMPLE_RATE:
                audio_data = self.resample_audio(audio_data, sample_rate, settings.TARGET_SAMPLE_RATE)
                sample_rate = settings.TARGET_SAMPLE_RATE
            
            # Convert to mono if stereo
            if len(audio_data.shape) > 1:
                audio_data = np.mean(audio_data, axis=1)
            
            # Emotion analysis
            emotion_result = await self.analyze_emotion(audio_data, sample_rate)
            
            # Speech rate analysis (requires transcription)
            wpm, transcript = await self.analyze_speech_rate(audio_data, sample_rate)
            
            # Filler word detection
            filler_analysis = self.detect_filler_words(transcript)
            
            # Generate timestamps
            timestamps = self.generate_timestamps(transcript, len(audio_data) / sample_rate)
            
            return AudioAnalysisResponse(
                emotion=emotion_result["emotion"],
                probabilities=emotion_result["probabilities"],
                wpm=wpm,
                filler_word_counts=filler_analysis["counts"],
                suggested_replacements=filler_analysis["replacements"],
                timestamps=timestamps
            )
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {e}")
            raise
    
    async def analyze_emotion(self, audio_data: np.ndarray, sample_rate: int) -> Dict[str, Any]:
        """Analyze emotion from audio data"""
        if settings.MOCK_RESPONSES or not self.model:
            return self.mock_emotion_analysis()
        
        try:
            # Extract features
            inputs = self.feature_extractor(
                audio_data, 
                sampling_rate=sample_rate, 
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=16000 * 10  # 10 seconds max
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Predict
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
            
            # Get predictions
            probabilities = probabilities.cpu().numpy()[0]
            emotion_idx = np.argmax(probabilities)
            emotion = self.emotion_labels[emotion_idx]
            
            # Format probabilities
            emotion_probs = {
                label: float(prob) for label, prob in zip(self.emotion_labels, probabilities)
            }
            
            return {
                "emotion": emotion,
                "probabilities": emotion_probs
            }
            
        except Exception as e:
            logger.error(f"Emotion analysis failed: {e}")
            return self.mock_emotion_analysis()
    
    async def analyze_speech_rate(self, audio_data: np.ndarray, sample_rate: int) -> tuple[int, str]:
        """Analyze speech rate and transcribe audio"""
        try:
            # For now, use a simple transcription approach
            # In production, you would use a proper ASR model like Whisper
            
            # Mock transcription for demonstration
            transcript = self.mock_transcribe(audio_data)
            
            # Calculate WPM
            words = transcript.split()
            duration_minutes = len(audio_data) / sample_rate / 60
            wpm = int(len(words) / duration_minutes) if duration_minutes > 0 else 0
            
            return wpm, transcript
            
        except Exception as e:
            logger.error(f"Speech rate analysis failed: {e}")
            return 0, ""
    
    def detect_filler_words(self, transcript: str) -> Dict[str, Any]:
        """Detect filler words in transcript"""
        counts = {}
        replacements = []
        positions = []
        
        for filler, pattern in self.filler_patterns.items():
            matches = list(re.finditer(pattern, transcript, re.IGNORECASE))
            counts[filler] = len(matches)
            
            for match in matches:
                positions.append({
                    "word": filler,
                    "position": match.start(),
                    "text": match.group()
                })
                
                # Generate replacement
                replacement = self.get_filler_replacement(filler)
                replacements.append(Replacement(
                    position=match.start(),
                    original=match.group(),
                    suggestion=replacement
                ))
        
        return {
            "counts": counts,
            "replacements": replacements,
            "positions": positions
        }
    
    def generate_timestamps(self, transcript: str, duration: float) -> List[Timestamp]:
        """Generate timestamps for events in transcript"""
        timestamps = []
        
        # Estimate word timestamps
        words = transcript.split()
        if not words:
            return timestamps
        
        word_duration = duration / len(words)
        
        for i, word in enumerate(words):
            timestamp = i * word_duration
            
            # Check if word is a filler
            for filler in self.filler_patterns.keys():
                if re.search(self.filler_patterns[filler], word, re.IGNORECASE):
                    timestamps.append(Timestamp(
                        t=timestamp,
                        type="filler",
                        word=word
                    ))
                    break
        
        return timestamps
    
    def load_audio(self, audio_content: bytes, filename: str) -> tuple[np.ndarray, int]:
        """Load audio from bytes"""
        try:
            # Try different audio loading methods
            try:
                # Use soundfile for most formats
                audio_data, sample_rate = sf.read(io.BytesIO(audio_content))
                return audio_data, sample_rate
            except:
                # Fallback to librosa
                audio_data, sample_rate = librosa.load(io.BytesIO(audio_content), sr=None)
                return audio_data, sample_rate
                
        except Exception as e:
            logger.error(f"Failed to load audio: {e}")
            raise ValueError(f"Could not load audio file: {e}")
    
    def resample_audio(self, audio_data: np.ndarray, original_sr: int, target_sr: int) -> np.ndarray:
        """Resample audio to target sample rate"""
        try:
            if original_sr == target_sr:
                return audio_data
            
            resampled = librosa.resample(audio_data, orig_sr=original_sr, target_sr=target_sr)
            return resampled
            
        except Exception as e:
            logger.error(f"Failed to resample audio: {e}")
            return audio_data
    
    def get_filler_replacement(self, filler: str) -> str:
        """Get replacement for filler word"""
        replacements = {
            'um': '(pause)',
            'uh': '(pause)',
            'like': '(remove)',
            'you know': '(remove)',
            'so': 'therefore',
            'basically': 'in essence',
            'well': '(remove)',
            'actually': '(remove)',
            'right': '(remove)',
            'okay': '(remove)'
        }
        return replacements.get(filler, '(remove)')
    
    def mock_transcribe(self, audio_data: np.ndarray) -> str:
        """Mock transcription for development"""
        # Generate a realistic mock transcript based on audio length
        duration = len(audio_data) / settings.TARGET_SAMPLE_RATE
        word_count = int(duration * 2.5)  # Assume 150 WPM
        
        mock_words = [
            "hello", "this", "is", "a", "test", "presentation", "about", "communication",
            "skills", "and", "how", "to", "improve", "your", "public", "speaking",
            "abilities", "today", "we", "will", "discuss", "various", "techniques",
            "for", "better", "presentation", "delivery", "thank", "you", "for",
            "listening", "to", "this", "demo", "recording"
        ]
        
        # Generate transcript with some filler words
        transcript_words = []
        for i in range(word_count):
            if i % 10 == 0:  # Add filler words occasionally
                transcript_words.append("um")
            elif i % 15 == 0:
                transcript_words.append("like")
            else:
                transcript_words.append(mock_words[i % len(mock_words)])
        
        return " ".join(transcript_words)
    
    async def mock_analyze_audio(self, audio_content: bytes, filename: str) -> AudioAnalysisResponse:
        """Mock audio analysis for development"""
        # Simulate processing delay
        import asyncio
        await asyncio.sleep(1.0)
        
        # Mock emotion analysis
        emotions = ["confident", "neutral", "anxious", "excited", "calm"]
        emotion = np.random.choice(emotions)
        
        probabilities = {}
        for emo in emotions:
            if emo == emotion:
                probabilities[emo] = 0.7 + np.random.random() * 0.2
            else:
                probabilities[emo] = np.random.random() * 0.3
        
        # Normalize probabilities
        total = sum(probabilities.values())
        probabilities = {k: v/total for k, v in probabilities.items()}
        
        # Mock speech analysis
        wpm = np.random.randint(120, 180)
        filler_counts = {
            "um": np.random.randint(0, 5),
            "like": np.random.randint(0, 3),
            "so": np.random.randint(0, 2)
        }
        
        # Mock replacements
        replacements = []
        if filler_counts["um"] > 0:
            replacements.append(Replacement(
                position=10,
                original="um",
                suggestion="(pause)"
            ))
        
        # Mock timestamps
        timestamps = [
            Timestamp(t=2.1, type="filler", word="um"),
            Timestamp(t=5.3, type="filler", word="like"),
            Timestamp(t=8.7, type="emotion", emotion=emotion)
        ]
        
        return AudioAnalysisResponse(
            emotion=emotion,
            probabilities=probabilities,
            wpm=wpm,
            filler_word_counts=filler_counts,
            suggested_replacements=replacements,
            timestamps=timestamps
        )
    
    async def analyze_audio_chunk(self, chunk_content: bytes, session_id: str, chunk_index: int) -> Dict[str, Any]:
        """Analyze audio chunk for streaming"""
        try:
            # Load chunk
            audio_data, sample_rate = self.load_audio(chunk_content, f"chunk_{chunk_index}")
            
            # Analyze emotion for chunk
            emotion_result = await self.analyze_emotion(audio_data, sample_rate)
            
            return {
                "chunk_index": chunk_index,
                "session_id": session_id,
                "emotion": emotion_result["emotion"],
                "confidence": max(emotion_result["probabilities"].values()),
                "timestamp": chunk_index * 0.1  # Assume 100ms chunks
            }
            
        except Exception as e:
            logger.error(f"Chunk analysis failed: {e}")
            return {
                "chunk_index": chunk_index,
                "session_id": session_id,
                "error": str(e)
            }
