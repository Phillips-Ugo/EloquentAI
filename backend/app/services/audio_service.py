"""
Audio analysis service using PyTorch and transformers
"""

import logging
import numpy as np
from typing import Dict, List, Any, Optional
import io
import re
import os
import wave
import tempfile

logger = logging.getLogger(__name__)

# Speech recognition for real transcription
try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    logger.warning("speech_recognition not available - transcription will be limited")
    sr = None
    SPEECH_RECOGNITION_AVAILABLE = False

# Try to import ML libraries - these may not be available on all systems
TORCH_AVAILABLE = False
TORCHAUDIO_AVAILABLE = False
LIBROSA_AVAILABLE = False
TRANSFORMERS_AVAILABLE = False

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    logger.warning("torch not available - audio analysis will be limited")
    torch = None

try:
    import torchaudio
    TORCHAUDIO_AVAILABLE = True
except (ImportError, OSError) as e:
    logger.warning(f"torchaudio not available ({e}) - audio analysis will be limited")
    torchaudio = None

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    logger.warning("librosa not available - audio analysis will be limited")
    librosa = None

try:
    import soundfile as sf
except ImportError:
    logger.warning("soundfile not available")
    sf = None

try:
    from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("transformers not available - ML features will be limited")
    Wav2Vec2ForSequenceClassification = None
    Wav2Vec2FeatureExtractor = None

from app.models.schemas import AudioAnalysisResponse, Replacement, Timestamp
from app.core.config import settings

class AudioAnalysisService:
    def __init__(self):
        # Handle case when torch is not available
        if TORCH_AVAILABLE and torch is not None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = None
            logger.warning("torch not available - running in limited mode")
        
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
        
        # Load model if not in mock mode and torch is available
        if not settings.MOCK_RESPONSES and TORCH_AVAILABLE:
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
            # Use signal-based analysis as fallback
            return self.analyze_emotion_from_signal(audio_data, sample_rate)
        
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
            return self.analyze_emotion_from_signal(audio_data, sample_rate)
    
    async def analyze_speech_rate(self, audio_data: np.ndarray, sample_rate: int) -> tuple[int, str]:
        """Analyze speech rate and transcribe audio using real speech recognition"""
        try:
            # Use real transcription
            transcript = self.real_transcribe(audio_data, sample_rate)
            
            if not transcript:
                logger.warning("No speech detected in audio")
                return 0, ""
            
            # Calculate WPM
            words = transcript.split()
            duration_minutes = len(audio_data) / sample_rate / 60
            wpm = int(len(words) / duration_minutes) if duration_minutes > 0 else 0
            
            logger.info(f"Transcribed {len(words)} words at {wpm} WPM")
            return wpm, transcript
            
        except Exception as e:
            logger.error(f"Speech rate analysis failed: {e}")
            return 0, ""
    
    def real_transcribe(self, audio_data: np.ndarray, sample_rate: int) -> str:
        """Real transcription using Google Speech Recognition"""
        if not SPEECH_RECOGNITION_AVAILABLE or sr is None:
            logger.warning("Speech recognition not available, returning empty transcript")
            return ""
        
        try:
            # Convert numpy array to 16-bit integer audio
            if audio_data.dtype == np.float32 or audio_data.dtype == np.float64:
                audio_int16 = (audio_data * 32767).astype(np.int16)
            else:
                audio_int16 = audio_data.astype(np.int16)
            
            # Create a temporary WAV file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_path = tmp_file.name
                with wave.open(tmp_path, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)  # 16-bit
                    wav_file.setframerate(sample_rate)
                    wav_file.writeframes(audio_int16.tobytes())
            
            # Use speech_recognition to transcribe
            recognizer = sr.Recognizer()
            with sr.AudioFile(tmp_path) as source:
                audio = recognizer.record(source)
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            # Try Google Speech Recognition (free, no API key needed)
            try:
                text = recognizer.recognize_google(audio)
                logger.info(f"Successfully transcribed: '{text[:100]}...'")
                return text
            except sr.UnknownValueError:
                logger.debug("Speech not understood")
                return ""
            except sr.RequestError as e:
                logger.error(f"Speech Recognition service error: {e}")
                return ""
                
        except Exception as e:
            logger.error(f"Real transcription error: {e}")
            return ""
    
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
    
    def analyze_emotion_from_signal(self, audio_data: np.ndarray, sample_rate: int) -> Dict[str, Any]:
        """Analyze emotion from audio signal characteristics (fallback when ML model not available)"""
        try:
            # Calculate audio features
            rms = np.sqrt(np.mean(audio_data ** 2))  # Volume/energy
            
            # Zero-crossing rate (indicates speech vs. silence)
            zero_crossings = np.sum(np.abs(np.diff(np.sign(audio_data)))) / 2
            zcr = zero_crossings / len(audio_data) if len(audio_data) > 0 else 0
            
            # Pitch variation (approximation based on signal dynamics)
            if len(audio_data) > 1024:
                audio_diff = np.abs(np.diff(audio_data))
                variation = np.std(audio_diff) / (np.mean(np.abs(audio_data)) + 1e-6)
            else:
                variation = 0.5
            
            # Determine emotion based on audio characteristics
            # High energy + high variation = excited/happy
            # High energy + low variation = angry/assertive
            # Low energy + low variation = calm/sad
            # Moderate energy + moderate variation = neutral
            
            energy_level = "high" if rms > 0.1 else ("low" if rms < 0.02 else "moderate")
            variation_level = "high" if variation > 0.5 else ("low" if variation < 0.2 else "moderate")
            
            if energy_level == "high" and variation_level == "high":
                emotion = "excited"
                confidence = 0.7
            elif energy_level == "high" and variation_level == "low":
                emotion = "confident"
                confidence = 0.65
            elif energy_level == "low" and variation_level == "low":
                emotion = "calm"
                confidence = 0.6
            elif energy_level == "low":
                emotion = "neutral"
                confidence = 0.55
            else:
                emotion = "neutral"
                confidence = 0.5
            
            # Build probability distribution
            emotions = ["calm", "neutral", "happy", "confident", "excited"]
            probabilities = {e: 0.1 for e in emotions}
            probabilities[emotion] = confidence
            
            # Normalize
            total = sum(probabilities.values())
            probabilities = {k: v / total for k, v in probabilities.items()}
            
            return {
                "emotion": emotion,
                "probabilities": probabilities
            }
            
        except Exception as e:
            logger.error(f"Signal-based emotion analysis failed: {e}")
            return {
                "emotion": "neutral",
                "probabilities": {"neutral": 0.7, "calm": 0.15, "confident": 0.15}
            }
    
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
    
    # DEPRECATED: mock_transcribe and mock_analyze_audio removed - using real implementations
    
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
