import os
import whisper
import librosa
import numpy as np
import soundfile as sf
import json
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from openai import OpenAI
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv("env.local")
load_dotenv()  # Load main .env as fallback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SpeechMetrics:
    """Data class to store speech analysis metrics"""
    words_per_minute: float
    filler_word_count: int
    filler_words_used: List[str]
    long_pauses: int
    average_pitch: float
    average_volume: float
    energy_level: float
    speaking_tone: str
    delivery_score: int
    clarity_score: float
    engagement_score: float

@dataclass
class SpeechFeedback:
    """Data class to store speech feedback"""
    overall_score: int
    speed_feedback: str
    filler_word_feedback: str
    pause_feedback: str
    volume_feedback: str
    tone_feedback: str
    ai_feedback: str
    recommendations: List[str]
    strengths: List[str]
    areas_for_improvement: List[str]

class AudioProcessor:
    """Production-ready audio processing pipeline for speech analysis"""
    
    def __init__(self):
        """Initialize the audio processor with models and configurations"""
        self.whisper_model = whisper.load_model("base")
        
        # Enhanced filler words list with categories
        self.filler_words = {
            'basic': [
                'um', 'uh', 'er', 'ah', 'hmm', 'huh', 'oh', 'wow', 'yeah', 'yep', 'nope'
            ],
            'conversational': [
                'like', 'you know', 'i mean', 'basically', 'actually', 'literally',
                'honestly', 'frankly', 'obviously', 'clearly', 'simply', 'just',
                'sort of', 'kind of', 'type of', 'thing', 'stuff', 'whatever',
                'right', 'okay', 'so', 'well', 'now', 'then', 'here', 'there'
            ],
            'thinking': [
                'let me think', 'i think', 'i guess', 'i suppose', 'maybe',
                'perhaps', 'probably', 'possibly', 'definitely', 'certainly',
                'absolutely', 'totally', 'completely', 'really', 'very'
            ],
            'repetitive': [
                'and stuff', 'and things', 'and everything', 'and all that',
                'or whatever', 'or something', 'or anything', 'or whatever',
                'you see', 'you know what i mean', 'if you know what i mean'
            ],
            'professional': [
                'in terms of', 'with respect to', 'as far as', 'in regards to',
                'moving forward', 'going forward', 'at the end of the day',
                'bottom line', 'long story short', 'to be honest', 'to tell you the truth'
            ]
        }
        
        # Initialize OpenAI client with secure API key
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.openai_client = OpenAI(api_key=api_key)
        
        # Analysis thresholds
        self.thresholds = {
            'fast_speech': 160,
            'slow_speech': 100,
            'very_fast_speech': 180,
            'very_slow_speech': 80,
            'long_pause': 1.0,
            'low_volume': 0.015,
            'high_energy': 0.035,
            'low_pitch': 110,
            'high_pitch': 180
        }
    
    def transcribe_audio(self, audio_path: str) -> Dict:
        """Transcribe audio file using Whisper with word timestamps"""
        try:
            logger.info(f"Transcribing audio file: {audio_path}")
            result = self.whisper_model.transcribe(audio_path, word_timestamps=True)
            logger.info("Transcription completed successfully")
            return result
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise
    
    def analyze_speech_metrics(self, transcription: str, segments: List[Dict], audio_path: str) -> SpeechMetrics:
        """Analyze speech metrics from transcription and audio"""
        try:
            # Load audio for analysis
            y, sr = librosa.load(audio_path, sr=None)
            
            # Calculate words per minute
            total_words = len(transcription.split())
            total_duration = segments[-1]["end"] - segments[0]["start"]
            wpm = total_words / (total_duration / 60) if total_duration > 0 else 0
            
            # Enhanced filler word detection
            filler_count, filler_words_used = self._detect_filler_words(transcription)
            
            # Pause detection
            long_pauses = self._detect_pauses(segments)
            
            # Audio analysis
            volume = np.mean(np.abs(y))
            pitch = librosa.yin(y, fmin=50, fmax=300)
            avg_pitch = np.mean(pitch[pitch > 0]) if len(pitch[pitch > 0]) > 0 else 0
            energy = np.mean(librosa.feature.rms(y=y))
            
            # Determine speaking tone
            speaking_tone = self._determine_speaking_tone(avg_pitch, energy)
            
            # Calculate scores
            delivery_score = self._calculate_delivery_score(wpm, filler_count, len(long_pauses), volume, avg_pitch)
            clarity_score = self._calculate_clarity_score(filler_count, total_words, volume)
            engagement_score = self._calculate_engagement_score(avg_pitch, energy, wpm)
            
            return SpeechMetrics(
                words_per_minute=wpm,
                filler_word_count=filler_count,
                filler_words_used=filler_words_used,
                long_pauses=len(long_pauses),
                average_pitch=avg_pitch,
                average_volume=volume,
                energy_level=energy,
                speaking_tone=speaking_tone,
                delivery_score=delivery_score,
                clarity_score=clarity_score,
                engagement_score=engagement_score
            )
            
        except Exception as e:
            logger.error(f"Error analyzing speech metrics: {e}")
            raise
    
    def _detect_filler_words(self, transcription: str) -> Tuple[int, List[str]]:
        """Enhanced filler word detection with categorization"""
        text_lower = transcription.lower()
        filler_words_used = []
        
        # Check each category of filler words
        for category, words in self.filler_words.items():
            for word in words:
                # Use word boundary matching for more accurate detection
                pattern = r'\b' + re.escape(word) + r'\b'
                matches = re.findall(pattern, text_lower)
                if matches:
                    filler_words_used.extend([word] * len(matches))
        
        return len(filler_words_used), list(set(filler_words_used))
    
    def _detect_pauses(self, segments: List[Dict]) -> List[float]:
        """Detect long pauses between speech segments"""
        pauses = []
        for i in range(1, len(segments)):
            pause = segments[i]["start"] - segments[i-1]["end"]
            if pause > self.thresholds['long_pause']:
                pauses.append(pause)
        return pauses
    
    def _determine_speaking_tone(self, avg_pitch: float, energy: float) -> str:
        """Determine the speaking tone based on pitch and energy"""
        if avg_pitch > self.thresholds['high_pitch'] and energy > self.thresholds['high_energy']:
            return "Excited / Energetic"
        elif avg_pitch < self.thresholds['low_pitch'] and energy < 0.02:
            return "Monotone / Low energy"
        elif energy > self.thresholds['high_energy']:
            return "Passionate / Loud"
        elif avg_pitch > 130:
            return "Engaging"
        else:
            return "Neutral"
    
    def _calculate_delivery_score(self, wpm: float, filler_count: int, pause_count: int, volume: float, avg_pitch: float) -> int:
        """Calculate overall delivery score"""
        score = 100
        
        # Speed penalty
        if wpm > self.thresholds['very_fast_speech'] or wpm < self.thresholds['very_slow_speech']:
            score -= 15
        elif wpm > self.thresholds['fast_speech'] or wpm < self.thresholds['slow_speech']:
            score -= 5
        
        # Filler word penalty (enhanced)
        score -= min(filler_count * 1.5, 20)  # Increased penalty for filler words
        
        # Pause penalty
        score -= min(pause_count * 2, 10)
        
        # Volume penalty
        if volume < self.thresholds['low_volume']:
            score -= 10
        
        # Pitch variation bonus
        if avg_pitch > 150:
            score += 5
        
        return max(0, min(score, 100))
    
    def _calculate_clarity_score(self, filler_count: int, total_words: int, volume: float) -> float:
        """Calculate clarity score based on filler words and volume"""
        filler_ratio = filler_count / total_words if total_words > 0 else 0
        clarity = 100 - (filler_ratio * 1000)  # Penalize high filler word ratio
        
        # Volume factor
        if volume < self.thresholds['low_volume']:
            clarity -= 20
        
        return max(0, min(clarity, 100))
    
    def _calculate_engagement_score(self, avg_pitch: float, energy: float, wpm: float) -> float:
        """Calculate engagement score based on vocal variety and pace"""
        engagement = 50  # Base score
        
        # Pitch variety
        if avg_pitch > 130:
            engagement += 20
        elif avg_pitch < 100:
            engagement -= 10
        
        # Energy level
        if energy > 0.03:
            engagement += 15
        elif energy < 0.02:
            engagement -= 10
        
        # Speaking pace
        if 120 <= wpm <= 160:
            engagement += 15
        elif wpm > 180 or wpm < 80:
            engagement -= 10
        
        return max(0, min(engagement, 100))
    
    def generate_ai_feedback(self, transcription: str, metrics: SpeechMetrics) -> str:
        """Generate AI-powered feedback using OpenAI"""
        try:
            prompt = f"""You are a professional public speaking coach. Provide constructive and actionable feedback based on the following analysis:

TRANSCRIPT: {transcription}

ANALYSIS METRICS:
- Words per minute: {metrics.words_per_minute:.1f}
- Filler words used: {metrics.filler_word_count} ({', '.join(metrics.filler_words_used) if metrics.filler_words_used else 'None detected'})
- Long pauses: {metrics.long_pauses}
- Average pitch: {metrics.average_pitch:.1f} Hz
- Speaking tone: {metrics.speaking_tone}
- Overall score: {metrics.delivery_score}/100

Provide detailed, actionable feedback focusing on:
1. Speaking pace and rhythm
2. Filler word usage and reduction strategies
3. Vocal variety and engagement
4. Specific recommendations for improvement
5. Strengths to maintain

Keep the feedback encouraging but honest, and provide specific actionable tips."""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert public speaking coach with 20+ years of experience. Provide constructive, actionable feedback that helps speakers improve their communication skills."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating AI feedback: {e}")
            return "Unable to generate AI feedback at this time."
    
    def generate_rule_based_feedback(self, metrics: SpeechMetrics) -> Dict[str, str]:
        """Generate rule-based feedback based on metrics"""
        feedback = {}
        
        # Speed feedback
        if metrics.words_per_minute > self.thresholds['very_fast_speech']:
            feedback['speed'] = "You're speaking very fast. Try slowing down significantly for better comprehension."
        elif metrics.words_per_minute > self.thresholds['fast_speech']:
            feedback['speed'] = "You're speaking a bit fast. Try slowing down slightly."
        elif metrics.words_per_minute < self.thresholds['very_slow_speech']:
            feedback['speed'] = "Your speech is quite slow. Try to pick up the pace to maintain engagement."
        elif metrics.words_per_minute < self.thresholds['slow_speech']:
            feedback['speed'] = "Your speech is a bit slow. Consider increasing the pace slightly."
        else:
            feedback['speed'] = "Your speaking speed is in the ideal range. Well done!"
        
        # Filler word feedback
        if metrics.filler_word_count > 10:
            feedback['filler_words'] = f"You're using many filler words ({metrics.filler_word_count}). Focus on reducing them for clearer communication."
        elif metrics.filler_word_count > 5:
            feedback['filler_words'] = f"You're using some filler words ({metrics.filler_word_count}). Try to reduce them for better clarity."
        else:
            feedback['filler_words'] = "Minimal filler words detected. Excellent clarity!"
        
        # Pause feedback
        if metrics.long_pauses > 5:
            feedback['pauses'] = "Many long pauses detected. Try to keep thoughts flowing more smoothly."
        elif metrics.long_pauses > 2:
            feedback['pauses'] = "Some long pauses detected. Consider reducing them for better flow."
        else:
            feedback['pauses'] = "Pauses are well-paced. Good rhythm!"
        
        # Volume feedback
        if metrics.average_volume < self.thresholds['low_volume']:
            feedback['volume'] = "You're speaking softly. Consider speaking louder for better projection."
        else:
            feedback['volume'] = "Volume is appropriate. Good projection!"
        
        # Tone feedback
        if metrics.speaking_tone == "Monotone / Low energy":
            feedback['tone'] = "Your tone might sound monotonous. Add more vocal variety for engagement."
        elif metrics.speaking_tone == "Excited / Energetic":
            feedback['tone'] = "Great energy and enthusiasm! Maintain this engaging tone."
        else:
            feedback['tone'] = f"Good tonal variation! Your {metrics.speaking_tone.lower()} tone works well."
        
        return feedback
    
    def process_audio(self, audio_path: str) -> Dict:
        """Main method to process audio and return comprehensive analysis"""
        try:
            logger.info(f"Starting audio processing for: {audio_path}")
            
            # Step 1: Transcribe audio
            result = self.transcribe_audio(audio_path)
            transcription = result["text"]
            segments = result["segments"]
            
            # Step 2: Analyze metrics
            metrics = self.analyze_speech_metrics(transcription, segments, audio_path)
            
            # Step 3: Generate feedback
            rule_based_feedback = self.generate_rule_based_feedback(metrics)
            ai_feedback = self.generate_ai_feedback(transcription, metrics)
            
            # Step 4: Compile results
            analysis_result = {
                "transcription": transcription,
                "metrics": {
                    "words_per_minute": round(metrics.words_per_minute, 2),
                    "filler_word_count": metrics.filler_word_count,
                    "filler_words_used": metrics.filler_words_used,
                    "long_pauses": metrics.long_pauses,
                    "average_pitch": round(metrics.average_pitch, 2),
                    "average_volume": round(metrics.average_volume, 4),
                    "energy_level": round(metrics.energy_level, 4),
                    "speaking_tone": metrics.speaking_tone,
                    "delivery_score": metrics.delivery_score,
                    "clarity_score": round(metrics.clarity_score, 2),
                    "engagement_score": round(metrics.engagement_score, 2)
                },
                "feedback": {
                    "rule_based": rule_based_feedback,
                    "ai_generated": ai_feedback
                },
                "recommendations": self._generate_recommendations(metrics),
                "strengths": self._identify_strengths(metrics),
                "areas_for_improvement": self._identify_improvement_areas(metrics)
            }
            
            logger.info("Audio processing completed successfully")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error processing audio: {e}")
            raise
    
    def _generate_recommendations(self, metrics: SpeechMetrics) -> List[str]:
        """Generate specific recommendations based on metrics"""
        recommendations = []
        
        if metrics.words_per_minute > self.thresholds['fast_speech']:
            recommendations.append("Practice speaking at a slower pace using a metronome")
            recommendations.append("Add strategic pauses after key points")
        
        if metrics.filler_word_count > 5:
            recommendations.append("Record yourself and identify filler word patterns")
            recommendations.append("Practice speaking with intentional pauses instead of filler words")
        
        if metrics.average_volume < self.thresholds['low_volume']:
            recommendations.append("Practice breathing exercises to support vocal projection")
            recommendations.append("Stand up straight and open your chest for better voice projection")
        
        if metrics.speaking_tone == "Monotone / Low energy":
            recommendations.append("Practice varying your pitch and tone")
            recommendations.append("Use vocal exercises to increase pitch range")
        
        if metrics.long_pauses > 3:
            recommendations.append("Practice smooth transitions between thoughts")
            recommendations.append("Use connecting phrases to bridge ideas")
        
        return recommendations
    
    def _identify_strengths(self, metrics: SpeechMetrics) -> List[str]:
        """Identify strengths based on metrics"""
        strengths = []
        
        if 120 <= metrics.words_per_minute <= 160:
            strengths.append("Optimal speaking pace")
        
        if metrics.filler_word_count <= 3:
            strengths.append("Clear, filler-free speech")
        
        if metrics.average_volume >= self.thresholds['low_volume']:
            strengths.append("Good vocal projection")
        
        if metrics.speaking_tone in ["Excited / Energetic", "Engaging", "Passionate / Loud"]:
            strengths.append("Engaging speaking tone")
        
        if metrics.long_pauses <= 2:
            strengths.append("Smooth speech flow")
        
        return strengths
    
    def _identify_improvement_areas(self, metrics: SpeechMetrics) -> List[str]:
        """Identify areas for improvement based on metrics"""
        areas = []
        
        if metrics.words_per_minute > self.thresholds['fast_speech']:
            areas.append("Speaking pace - too fast")
        elif metrics.words_per_minute < self.thresholds['slow_speech']:
            areas.append("Speaking pace - too slow")
        
        if metrics.filler_word_count > 5:
            areas.append("Filler word usage")
        
        if metrics.average_volume < self.thresholds['low_volume']:
            areas.append("Vocal projection")
        
        if metrics.speaking_tone == "Monotone / Low energy":
            areas.append("Vocal variety and energy")
        
        if metrics.long_pauses > 3:
            areas.append("Speech flow and transitions")
        
        return areas

# Example usage
if __name__ == "__main__":
    # Initialize processor
    processor = AudioProcessor()
    
    # Process audio file
    audio_file = "path/to/your/audio.mp4"
    if os.path.exists(audio_file):
        result = processor.process_audio(audio_file)
        print(json.dumps(result, indent=2))
    else:
        print(f"Audio file not found: {audio_file}") 