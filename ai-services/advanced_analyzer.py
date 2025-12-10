#!/usr/bin/env python3
"""
Advanced AI Analysis Engine for Eloquent AI
Provides sophisticated analysis including sentiment, emotion, language detection, and more
"""

import os
import json
import logging
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import re
import statistics
from collections import Counter
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag
import spacy
from textstat import flesch_reading_ease, flesch_kincaid_grade

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AnalysisResult:
    """Data class for analysis results"""
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None
    processing_time: Optional[float] = None

class AdvancedAnalyzer:
    """Advanced AI Analysis Engine"""
    
    def __init__(self):
        self._load_env_vars()
        self._initialize_models()
        self._setup_nltk()
        
    def _load_env_vars(self):
        """Load environment variables"""
        env_file = os.path.join(os.path.dirname(__file__), 'env.local')
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
            logger.info("Environment variables loaded from env.local")
        
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.use_openai = self.openai_api_key and self.openai_api_key != 'your_openai_api_key_here'
        
        if not self.use_openai:
            logger.warning("OpenAI API key not configured - using advanced fallback analysis")
    
    def _initialize_models(self):
        """Initialize AI models and libraries"""
        try:
            # Initialize spaCy model
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found, using basic analysis")
                self.nlp = None
            
            # Initialize sentiment analyzer
            self.sentiment_analyzer = SentimentIntensityAnalyzer()
            
            logger.info("AI models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            self.nlp = None
            self.sentiment_analyzer = None
    
    def _setup_nltk(self):
        """Setup NLTK data"""
        try:
            # Download required NLTK data
            nltk_data = [
                'punkt', 'stopwords', 'vader_lexicon', 
                'averaged_perceptron_tagger', 'maxent_ne_chunker', 'words'
            ]
            
            for data in nltk_data:
                try:
                    nltk.data.find(f'tokenizers/{data}')
                except LookupError:
                    nltk.download(data, quiet=True)
            
            logger.info("NLTK data setup completed")
            
        except Exception as e:
            logger.error(f"Failed to setup NLTK: {e}")
    
    async def analyze_text_advanced(self, text_content: str, analysis_type: str = "comprehensive") -> AnalysisResult:
        """Perform advanced text analysis"""
        start_time = datetime.now()
        
        try:
            logger.info(f"Starting advanced analysis for {analysis_type}")
            
            if self.use_openai:
                # Use OpenAI for advanced analysis
                result = await self._openai_advanced_analysis(text_content, analysis_type)
            else:
                # Use advanced fallback analysis
                result = await self._advanced_fallback_analysis(text_content, analysis_type)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            result.processing_time = processing_time
            
            logger.info(f"Advanced analysis completed in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Advanced analysis failed: {e}")
            return AnalysisResult(
                success=False,
                data={},
                error=str(e),
                processing_time=(datetime.now() - start_time).total_seconds()
            )
    
    async def _openai_advanced_analysis(self, text_content: str, analysis_type: str) -> AnalysisResult:
        """Advanced analysis using OpenAI"""
        try:
            import openai
            
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            # Enhanced prompt for comprehensive analysis
            system_prompt = """You are an expert communication analyst. Provide comprehensive analysis including:
            1. Sentiment analysis (positive, negative, neutral with confidence scores)
            2. Emotional tone detection (joy, anger, fear, sadness, surprise, disgust)
            3. Language complexity and readability metrics
            4. Key themes and topics
            5. Writing style assessment
            6. Engagement level prediction
            7. Specific improvement recommendations
            8. Professional communication score
            9. Clarity and coherence analysis
            10. Call-to-action effectiveness (if applicable)
            
            Return detailed, actionable insights in JSON format."""
            
            user_prompt = f"""Analyze this text for {analysis_type} analysis:
            
            {text_content}
            
            Provide comprehensive insights with specific scores, metrics, and actionable recommendations."""
            
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse OpenAI response
            analysis_text = response.choices[0].message.content
            
            # Try to extract JSON from response
            try:
                # Look for JSON in the response
                json_match = re.search(r'\{.*\}', analysis_text, re.DOTALL)
                if json_match:
                    analysis_data = json.loads(json_match.group())
                else:
                    # Fallback: create structured response
                    analysis_data = self._parse_openai_response(analysis_text)
            except json.JSONDecodeError:
                analysis_data = self._parse_openai_response(analysis_text)
            
            # Enhance with local analysis
            local_analysis = self._perform_local_analysis(text_content)
            analysis_data.update(local_analysis)
            
            return AnalysisResult(
                success=True,
                data=analysis_data
            )
            
        except Exception as e:
            logger.error(f"OpenAI advanced analysis failed: {e}")
            # Fallback to local analysis
            return await self._advanced_fallback_analysis(text_content, analysis_type)
    
    async def _advanced_fallback_analysis(self, text_content: str, analysis_type: str) -> AnalysisResult:
        """Advanced fallback analysis using local models"""
        try:
            # Perform comprehensive local analysis
            analysis_data = {
                "overallScore": 0.0,
                "sentimentAnalysis": {},
                "emotionalTone": {},
                "languageMetrics": {},
                "readabilityScores": {},
                "keyThemes": [],
                "writingStyle": {},
                "engagementLevel": 0.0,
                "improvementRecommendations": [],
                "professionalScore": 0.0,
                "clarityAnalysis": {},
                "strengths": [],
                "categories": {},
                "detailedAnalysis": {},
                "textStats": {},
                "advancedMetrics": {},
                "_source": "advanced_fallback"
            }
            
            # Basic text statistics
            words = word_tokenize(text_content)
            sentences = sent_tokenize(text_content)
            word_count = len(words)
            sentence_count = len(sentences)
            char_count = len(text_content)
            
            analysis_data["textStats"] = {
                "wordCount": word_count,
                "sentenceCount": sentence_count,
                "charCount": char_count,
                "avgWordsPerSentence": word_count / max(sentence_count, 1),
                "avgCharsPerWord": char_count / max(word_count, 1)
            }
            
            # Sentiment Analysis
            if self.sentiment_analyzer:
                sentiment_scores = self.sentiment_analyzer.polarity_scores(text_content)
                analysis_data["sentimentAnalysis"] = {
                    "positive": sentiment_scores["pos"],
                    "negative": sentiment_scores["neg"],
                    "neutral": sentiment_scores["neu"],
                    "compound": sentiment_scores["compound"],
                    "overall": "positive" if sentiment_scores["compound"] > 0.05 else "negative" if sentiment_scores["compound"] < -0.05 else "neutral"
                }
            
            # Readability Analysis
            try:
                analysis_data["readabilityScores"] = {
                    "fleschReadingEase": flesch_reading_ease(text_content),
                    "fleschKincaidGrade": flesch_kincaid_grade(text_content),
                    "readingLevel": self._determine_reading_level(flesch_reading_ease(text_content))
                }
            except:
                analysis_data["readabilityScores"] = {"error": "Could not calculate readability"}
            
            # Language Complexity
            analysis_data["languageMetrics"] = self._analyze_language_complexity(text_content)
            
            # Key Themes Extraction
            analysis_data["keyThemes"] = self._extract_key_themes(text_content)
            
            # Writing Style Analysis
            analysis_data["writingStyle"] = self._analyze_writing_style(text_content)
            
            # Engagement Level
            analysis_data["engagementLevel"] = self._calculate_engagement_level(text_content)
            
            # Professional Score
            analysis_data["professionalScore"] = self._calculate_professional_score(text_content)
            
            # Clarity Analysis
            analysis_data["clarityAnalysis"] = self._analyze_clarity(text_content)
            
            # Improvement Recommendations
            analysis_data["improvementRecommendations"] = self._generate_recommendations(text_content, analysis_data)
            
            # Strengths
            analysis_data["strengths"] = self._identify_strengths(text_content, analysis_data)
            
            # Categories
            analysis_data["categories"] = {
                "clarity": min(1.0, analysis_data["readabilityScores"].get("fleschReadingEase", 50) / 100),
                "engagement": analysis_data["engagementLevel"],
                "professionalism": analysis_data["professionalScore"],
                "sentiment": abs(analysis_data["sentimentAnalysis"].get("compound", 0))
            }
            
            # Overall Score
            analysis_data["overallScore"] = statistics.mean([
                analysis_data["categories"]["clarity"],
                analysis_data["categories"]["engagement"],
                analysis_data["categories"]["professionalism"],
                analysis_data["categories"]["sentiment"]
            ])
            
            # Detailed Analysis
            analysis_data["detailedAnalysis"] = {
                "tone": analysis_data["sentimentAnalysis"].get("overall", "neutral"),
                "readability": analysis_data["readabilityScores"].get("readingLevel", "intermediate"),
                "structure": "Good" if sentence_count > 1 else "Needs improvement",
                "engagement": "High" if analysis_data["engagementLevel"] > 0.7 else "Medium" if analysis_data["engagementLevel"] > 0.4 else "Low",
                "professionalism": "High" if analysis_data["professionalScore"] > 0.7 else "Medium" if analysis_data["professionalScore"] > 0.4 else "Low"
            }
            
            return AnalysisResult(
                success=True,
                data=analysis_data
            )
            
        except Exception as e:
            logger.error(f"Advanced fallback analysis failed: {e}")
            return AnalysisResult(
                success=False,
                data={},
                error=str(e)
            )
    
    def _perform_local_analysis(self, text_content: str) -> Dict[str, Any]:
        """Perform additional local analysis"""
        return {
            "localSentiment": self.sentiment_analyzer.polarity_scores(text_content) if self.sentiment_analyzer else {},
            "wordFrequency": dict(Counter(word_tokenize(text_content.lower())).most_common(10)),
            "sentenceVariety": self._analyze_sentence_variety(text_content),
            "vocabularyRichness": self._calculate_vocabulary_richness(text_content)
        }
    
    def _parse_openai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse OpenAI response into structured data"""
        # This is a simplified parser - in production, you'd want more robust parsing
        return {
            "aiAnalysis": response_text,
            "confidence": 0.8,
            "model": "gpt-4"
        }
    
    def _analyze_language_complexity(self, text: str) -> Dict[str, Any]:
        """Analyze language complexity"""
        words = word_tokenize(text.lower())
        sentences = sent_tokenize(text)
        
        # Remove stopwords for analysis
        stop_words = set(stopwords.words('english'))
        content_words = [word for word in words if word.isalpha() and word not in stop_words]
        
        return {
            "avgWordLength": statistics.mean([len(word) for word in content_words]) if content_words else 0,
            "sentenceComplexity": statistics.mean([len(word_tokenize(sent)) for sent in sentences]) if sentences else 0,
            "vocabularyDiversity": len(set(content_words)) / len(content_words) if content_words else 0,
            "stopwordRatio": len([w for w in words if w in stop_words]) / len(words) if words else 0
        }
    
    def _extract_key_themes(self, text: str) -> List[str]:
        """Extract key themes from text"""
        words = word_tokenize(text.lower())
        stop_words = set(stopwords.words('english'))
        content_words = [word for word in words if word.isalpha() and word not in stop_words and len(word) > 3]
        
        # Get most common words as themes
        word_freq = Counter(content_words)
        return [word for word, count in word_freq.most_common(5)]
    
    def _analyze_writing_style(self, text: str) -> Dict[str, Any]:
        """Analyze writing style"""
        sentences = sent_tokenize(text)
        
        return {
            "sentenceLengthVariety": statistics.stdev([len(word_tokenize(sent)) for sent in sentences]) if len(sentences) > 1 else 0,
            "paragraphStructure": "Good" if len(sentences) > 3 else "Needs improvement",
            "formality": self._assess_formality(text),
            "conciseness": len(text) / len(sentences) if sentences else 0
        }
    
    def _calculate_engagement_level(self, text: str) -> float:
        """Calculate engagement level"""
        engagement_indicators = [
            r'\?',  # Questions
            r'!',   # Exclamations
            r'you', # Direct address
            r'we',  # Inclusive language
            r'let\'s', # Call to action
            r'important', # Emphasis words
            r'key', # Key points
            r'note' # Noteworthy content
        ]
        
        score = 0
        for pattern in engagement_indicators:
            matches = len(re.findall(pattern, text.lower()))
            score += min(matches * 0.1, 0.2)  # Cap contribution at 0.2
        
        return min(score, 1.0)
    
    def _calculate_professional_score(self, text: str) -> float:
        """Calculate professionalism score"""
        professional_indicators = [
            r'please', r'thank you', r'regards', r'sincerely',
            r'professional', r'business', r'meeting', r'project'
        ]
        
        unprofessional_indicators = [
            r'omg', r'lol', r'btw', r'asap', r'fyi',
            r'awesome', r'cool', r'stuff', r'thing'
        ]
        
        professional_score = 0.5  # Base score
        
        for pattern in professional_indicators:
            if re.search(pattern, text.lower()):
                professional_score += 0.1
        
        for pattern in unprofessional_indicators:
            if re.search(pattern, text.lower()):
                professional_score -= 0.1
        
        return max(0, min(professional_score, 1.0))
    
    def _analyze_clarity(self, text: str) -> Dict[str, Any]:
        """Analyze text clarity"""
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        return {
            "sentenceClarity": "Good" if statistics.mean([len(word_tokenize(sent)) for sent in sentences]) < 20 else "Complex",
            "wordClarity": "Good" if statistics.mean([len(word) for word in words if word.isalpha()]) < 6 else "Complex",
            "structureClarity": "Good" if len(sentences) > 1 else "Needs improvement"
        }
    
    def _generate_recommendations(self, text: str, analysis_data: Dict[str, Any]) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Based on readability
        if analysis_data["readabilityScores"].get("fleschReadingEase", 50) < 30:
            recommendations.append("Simplify sentence structure for better readability")
        
        # Based on engagement
        if analysis_data["engagementLevel"] < 0.5:
            recommendations.append("Add more engaging elements like questions or direct address")
        
        # Based on professionalism
        if analysis_data["professionalScore"] < 0.6:
            recommendations.append("Use more professional language and tone")
        
        # Based on length
        if analysis_data["textStats"]["wordCount"] < 50:
            recommendations.append("Expand content with more details and examples")
        elif analysis_data["textStats"]["wordCount"] > 500:
            recommendations.append("Consider breaking into shorter, more focused sections")
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def _identify_strengths(self, text: str, analysis_data: Dict[str, Any]) -> List[str]:
        """Identify text strengths"""
        strengths = []
        
        if analysis_data["readabilityScores"].get("fleschReadingEase", 50) > 70:
            strengths.append("Clear and readable writing")
        
        if analysis_data["engagementLevel"] > 0.7:
            strengths.append("High engagement and interaction")
        
        if analysis_data["professionalScore"] > 0.8:
            strengths.append("Professional tone and language")
        
        if analysis_data["textStats"]["sentenceCount"] > 3:
            strengths.append("Well-structured content")
        
        if analysis_data["sentimentAnalysis"].get("compound", 0) > 0.1:
            strengths.append("Positive and encouraging tone")
        
        return strengths[:5]  # Limit to 5 strengths
    
    def _assess_formality(self, text: str) -> str:
        """Assess formality level"""
        formal_indicators = len(re.findall(r'\b(please|thank you|regards|sincerely|therefore|however|furthermore)\b', text.lower()))
        informal_indicators = len(re.findall(r'\b(hey|hi|cool|awesome|gonna|wanna)\b', text.lower()))
        
        if formal_indicators > informal_indicators:
            return "Formal"
        elif informal_indicators > formal_indicators:
            return "Informal"
        else:
            return "Neutral"
    
    def _determine_reading_level(self, flesch_score: float) -> str:
        """Determine reading level from Flesch score"""
        if flesch_score >= 90:
            return "Very Easy"
        elif flesch_score >= 80:
            return "Easy"
        elif flesch_score >= 70:
            return "Fairly Easy"
        elif flesch_score >= 60:
            return "Standard"
        elif flesch_score >= 50:
            return "Fairly Difficult"
        elif flesch_score >= 30:
            return "Difficult"
        else:
            return "Very Difficult"
    
    def _analyze_sentence_variety(self, text: str) -> float:
        """Analyze sentence variety"""
        sentences = sent_tokenize(text)
        if len(sentences) < 2:
            return 0.0
        
        sentence_lengths = [len(word_tokenize(sent)) for sent in sentences]
        return statistics.stdev(sentence_lengths) / statistics.mean(sentence_lengths) if statistics.mean(sentence_lengths) > 0 else 0.0
    
    def _calculate_vocabulary_richness(self, text: str) -> float:
        """Calculate vocabulary richness (type-token ratio)"""
        words = [word.lower() for word in word_tokenize(text) if word.isalpha()]
        if not words:
            return 0.0
        
        unique_words = len(set(words))
        total_words = len(words)
        return unique_words / total_words

# Main execution
async def main():
    """Main function for testing"""
    analyzer = AdvancedAnalyzer()
    
    test_text = """
    Hello team,
    
    I hope this message finds you well. I wanted to reach out regarding our upcoming project deadline.
    We have made significant progress, but there are still some areas that need attention.
    
    Please review the attached documents and provide your feedback by Friday.
    Thank you for your hard work and dedication.
    
    Best regards,
    John
    """
    
    result = await analyzer.analyze_text_advanced(test_text, "comprehensive")
    
    if result.success:
        print("Advanced Analysis Results:")
        print(json.dumps(result.data, indent=2))
    else:
        print(f"Analysis failed: {result.error}")

if __name__ == "__main__":
    asyncio.run(main())
