#!/usr/bin/env python3
"""
Advanced Sentiment Analysis Engine
Provides emotion detection, tone analysis, and sentiment scoring
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import re
import statistics
from collections import Counter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SentimentResult:
    """Data class for sentiment analysis results"""
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None

class SentimentAnalyzer:
    """Advanced Sentiment Analysis Engine"""
    
    def __init__(self):
        self._load_env_vars()
        self._initialize_models()
        
    def _load_env_vars(self):
        """Load environment variables"""
        env_file = os.path.join(os.path.dirname(__file__), 'env.local')
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
        
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.use_openai = self.openai_api_key and self.openai_api_key != 'your_openai_api_key_here'
    
    def _initialize_models(self):
        """Initialize sentiment analysis models"""
        try:
            # Emotion keywords
            self.emotion_keywords = {
                'joy': ['happy', 'excited', 'thrilled', 'delighted', 'pleased', 'cheerful', 'joyful'],
                'anger': ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated', 'outraged'],
                'fear': ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified', 'concerned'],
                'sadness': ['sad', 'depressed', 'disappointed', 'grief', 'sorrow', 'melancholy', 'down'],
                'surprise': ['surprised', 'amazed', 'shocked', 'astonished', 'stunned', 'bewildered'],
                'disgust': ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled', 'horrified']
            }
            
            # Tone indicators
            self.tone_indicators = {
                'formal': ['therefore', 'however', 'furthermore', 'consequently', 'nevertheless'],
                'casual': ['hey', 'cool', 'awesome', 'gonna', 'wanna', 'yeah', 'okay'],
                'professional': ['please', 'thank you', 'regards', 'sincerely', 'respectfully'],
                'urgent': ['immediately', 'asap', 'urgent', 'critical', 'emergency', 'deadline'],
                'confident': ['certainly', 'definitely', 'absolutely', 'guaranteed', 'assured'],
                'uncertain': ['maybe', 'perhaps', 'possibly', 'might', 'could', 'unclear']
            }
            
            logger.info("Sentiment analysis models initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
    
    async def analyze_sentiment(self, text_content: str) -> SentimentResult:
        """Perform comprehensive sentiment analysis"""
        try:
            logger.info("Starting sentiment analysis")
            
            if self.use_openai:
                result = await self._openai_sentiment_analysis(text_content)
            else:
                result = await self._local_sentiment_analysis(text_content)
            
            return result
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return SentimentResult(
                success=False,
                data={},
                error=str(e)
            )
    
    async def _openai_sentiment_analysis(self, text: str) -> SentimentResult:
        """Advanced sentiment analysis using OpenAI"""
        try:
            import openai
            
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            system_prompt = """You are an expert sentiment analyst. Analyze the text and provide:
            1. Overall sentiment (positive, negative, neutral) with confidence score
            2. Emotional tone detection (joy, anger, fear, sadness, surprise, disgust)
            3. Tone analysis (formal, casual, professional, urgent, confident, uncertain)
            4. Intensity level (low, medium, high)
            5. Contextual sentiment (what the sentiment is about)
            6. Sentiment trends (if multiple sentences)
            
            Return detailed analysis in JSON format."""
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze sentiment: {text}"}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            analysis_text = response.choices[0].message.content
            
            # Parse response
            try:
                json_match = re.search(r'\{.*\}', analysis_text, re.DOTALL)
                if json_match:
                    analysis_data = json.loads(json_match.group())
                else:
                    analysis_data = self._parse_sentiment_response(analysis_text)
            except json.JSONDecodeError:
                analysis_data = self._parse_sentiment_response(analysis_text)
            
            # Enhance with local analysis
            local_data = self._local_sentiment_analysis(text).data
            analysis_data.update(local_data)
            
            return SentimentResult(success=True, data=analysis_data)
            
        except Exception as e:
            logger.error(f"OpenAI sentiment analysis failed: {e}")
            return await self._local_sentiment_analysis(text)
    
    async def _local_sentiment_analysis(self, text: str) -> SentimentResult:
        """Local sentiment analysis using rule-based approach"""
        try:
            # Basic sentiment scoring
            positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased']
            negative_words = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated']
            
            words = re.findall(r'\b\w+\b', text.lower())
            
            positive_score = sum(1 for word in words if word in positive_words)
            negative_score = sum(1 for word in words if word in negative_words)
            
            # Calculate overall sentiment
            total_sentiment_words = positive_score + negative_score
            if total_sentiment_words == 0:
                overall_sentiment = 'neutral'
                confidence = 0.5
            elif positive_score > negative_score:
                overall_sentiment = 'positive'
                confidence = positive_score / total_sentiment_words
            elif negative_score > positive_score:
                overall_sentiment = 'negative'
                confidence = negative_score / total_sentiment_words
            else:
                overall_sentiment = 'neutral'
                confidence = 0.5
            
            # Emotion detection
            emotions = self._detect_emotions(text)
            
            # Tone analysis
            tone = self._analyze_tone(text)
            
            # Intensity analysis
            intensity = self._calculate_intensity(text)
            
            # Contextual sentiment
            context = self._extract_sentiment_context(text)
            
            analysis_data = {
                "overallSentiment": {
                    "sentiment": overall_sentiment,
                    "confidence": confidence,
                    "positiveScore": positive_score,
                    "negativeScore": negative_score
                },
                "emotions": emotions,
                "tone": tone,
                "intensity": intensity,
                "context": context,
                "sentimentBreakdown": {
                    "positive": positive_score,
                    "negative": negative_score,
                    "neutral": len(words) - positive_score - negative_score
                },
                "analysis": {
                    "wordCount": len(words),
                    "sentimentWords": total_sentiment_words,
                    "sentimentRatio": total_sentiment_words / len(words) if words else 0
                }
            }
            
            return SentimentResult(success=True, data=analysis_data)
            
        except Exception as e:
            logger.error(f"Local sentiment analysis failed: {e}")
            return SentimentResult(success=False, data={}, error=str(e))
    
    def _detect_emotions(self, text: str) -> Dict[str, float]:
        """Detect emotions in text"""
        emotions = {}
        words = re.findall(r'\b\w+\b', text.lower())
        
        for emotion, keywords in self.emotion_keywords.items():
            emotion_count = sum(1 for word in words if word in keywords)
            emotions[emotion] = emotion_count / len(words) if words else 0
        
        return emotions
    
    def _analyze_tone(self, text: str) -> Dict[str, float]:
        """Analyze tone of the text"""
        tone_scores = {}
        words = re.findall(r'\b\w+\b', text.lower())
        
        for tone, indicators in self.tone_indicators.items():
            tone_count = sum(1 for word in words if word in indicators)
            tone_scores[tone] = tone_count / len(words) if words else 0
        
        return tone_scores
    
    def _calculate_intensity(self, text: str) -> str:
        """Calculate sentiment intensity"""
        intensity_indicators = {
            'high': ['extremely', 'absolutely', 'completely', 'totally', 'very', 'really'],
            'medium': ['quite', 'rather', 'somewhat', 'fairly', 'pretty'],
            'low': ['slightly', 'a bit', 'kind of', 'sort of']
        }
        
        words = re.findall(r'\b\w+\b', text.lower())
        
        for level, indicators in intensity_indicators.items():
            if any(word in words for word in indicators):
                return level
        
        return 'medium'
    
    def _extract_sentiment_context(self, text: str) -> str:
        """Extract what the sentiment is about"""
        # Simple context extraction - in production, use NLP
        sentences = re.split(r'[.!?]+', text)
        
        # Look for key topics
        topics = []
        for sentence in sentences:
            if any(word in sentence.lower() for word in ['project', 'meeting', 'deadline', 'team', 'work']):
                topics.append('work')
            elif any(word in sentence.lower() for word in ['customer', 'client', 'service', 'product']):
                topics.append('business')
            elif any(word in sentence.lower() for word in ['family', 'friend', 'personal', 'home']):
                topics.append('personal')
        
        return ', '.join(set(topics)) if topics else 'general'
    
    def _parse_sentiment_response(self, response_text: str) -> Dict[str, Any]:
        """Parse sentiment analysis response"""
        return {
            "aiAnalysis": response_text,
            "confidence": 0.8,
            "model": "gpt-3.5-turbo"
        }

# Main execution
async def main():
    """Test the sentiment analyzer"""
    analyzer = SentimentAnalyzer()
    
    test_text = "I'm really excited about this new project! It's going to be amazing and I can't wait to get started."
    
    result = await analyzer.analyze_sentiment(test_text)
    
    if result.success:
        print("Sentiment Analysis Results:")
        print(json.dumps(result.data, indent=2))
    else:
        print(f"Analysis failed: {result.error}")

if __name__ == "__main__":
    asyncio.run(main())
