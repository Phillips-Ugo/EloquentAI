#!/usr/bin/env python3
"""
Language Detection Service
Detects language, dialect, and provides language-specific analysis
"""

import os
import json
import logging
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from collections import Counter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LanguageResult:
    """Data class for language detection results"""
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None

class LanguageDetector:
    """Advanced Language Detection Engine"""
    
    def __init__(self):
        self._initialize_language_data()
        
    def _initialize_language_data(self):
        """Initialize language detection data"""
        # Common words in different languages
        self.language_indicators = {
            'english': [
                'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
                'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
                'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
            ],
            'spanish': [
                'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le',
                'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como'
            ],
            'french': [
                'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour',
                'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus'
            ],
            'german': [
                'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf',
                'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an'
            ],
            'italian': [
                'il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'da', 'a', 'al', 'del',
                'della', 'dei', 'delle', 'sono', 'è', 'ha', 'hanno', 'si', 'lo', 'le', 'gli'
            ],
            'portuguese': [
                'o', 'de', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no',
                'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das'
            ],
            'russian': [
                'и', 'в', 'не', 'на', 'я', 'быть', 'с', 'он', 'а', 'как', 'по', 'это', 'но',
                'они', 'к', 'у', 'мы', 'за', 'вы', 'что', 'от', 'его', 'до', 'из', 'ей'
            ],
            'chinese': [
                '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
                '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看'
            ],
            'japanese': [
                'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある',
                'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる', 'られ'
            ],
            'arabic': [
                'في', 'من', 'إلى', 'على', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كانت', 'يكون',
                'تكون', 'له', 'لها', 'لهما', 'لهم', 'لهن', 'بعد', 'قبل', 'عند', 'مع', 'بدون'
            ]
        }
        
        # Language names mapping
        self.language_names = {
            'english': 'English',
            'spanish': 'Español',
            'french': 'Français',
            'german': 'Deutsch',
            'italian': 'Italiano',
            'portuguese': 'Português',
            'russian': 'Русский',
            'chinese': '中文',
            'japanese': '日本語',
            'arabic': 'العربية'
        }
        
        # Script detection patterns
        self.script_patterns = {
            'latin': r'[a-zA-Z]',
            'cyrillic': r'[а-яА-Я]',
            'arabic': r'[\u0600-\u06FF]',
            'chinese': r'[\u4e00-\u9fff]',
            'japanese': r'[\u3040-\u309f\u30a0-\u30ff]',
            'korean': r'[\uac00-\ud7af]',
            'hindi': r'[\u0900-\u097f]'
        }
        
        logger.info("Language detection data initialized")
    
    def detect_language(self, text_content: str) -> LanguageResult:
        """Detect the language of the text"""
        try:
            logger.info("Starting language detection")
            
            # Clean and prepare text
            cleaned_text = self._clean_text(text_content)
            
            if not cleaned_text.strip():
                return LanguageResult(
                    success=False,
                    data={},
                    error="No text content to analyze"
                )
            
            # Detect script
            script_info = self._detect_script(cleaned_text)
            
            # Detect language using multiple methods
            word_based_result = self._detect_by_words(cleaned_text)
            pattern_based_result = self._detect_by_patterns(cleaned_text)
            script_based_result = self._detect_by_script(cleaned_text, script_info)
            
            # Combine results
            final_result = self._combine_detection_results(
                word_based_result, 
                pattern_based_result, 
                script_based_result,
                script_info
            )
            
            # Add additional analysis
            final_result.update({
                "textStats": self._analyze_text_stats(cleaned_text),
                "confidence": self._calculate_confidence(final_result),
                "alternatives": self._get_alternative_languages(word_based_result, pattern_based_result)
            })
            
            return LanguageResult(success=True, data=final_result)
            
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return LanguageResult(
                success=False,
                data={},
                error=str(e)
            )
    
    def _clean_text(self, text: str) -> str:
        """Clean text for analysis"""
        # Remove extra whitespace and normalize
        cleaned = re.sub(r'\s+', ' ', text.strip())
        
        # Remove special characters but keep letters and basic punctuation
        cleaned = re.sub(r'[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0600-\u06ff\u0900-\u097f]', ' ', cleaned)
        
        return cleaned
    
    def _detect_script(self, text: str) -> Dict[str, Any]:
        """Detect the script/writing system used"""
        script_counts = {}
        
        for script, pattern in self.script_patterns.items():
            matches = len(re.findall(pattern, text))
            script_counts[script] = matches
        
        # Determine primary script
        primary_script = max(script_counts, key=script_counts.get) if script_counts else 'unknown'
        
        return {
            "primaryScript": primary_script,
            "scriptCounts": script_counts,
            "totalCharacters": len(text)
        }
    
    def _detect_by_words(self, text: str) -> Dict[str, float]:
        """Detect language based on common words"""
        words = re.findall(r'\b\w+\b', text.lower())
        word_count = len(words)
        
        if word_count == 0:
            return {}
        
        language_scores = {}
        
        for language, common_words in self.language_indicators.items():
            matches = sum(1 for word in words if word in common_words)
            score = matches / word_count
            language_scores[language] = score
        
        return language_scores
    
    def _detect_by_patterns(self, text: str) -> Dict[str, float]:
        """Detect language based on linguistic patterns"""
        patterns = {
            'english': [
                r'\bthe\b', r'\band\b', r'\bor\b', r'\bof\b', r'\bto\b', r'\bin\b',
                r'\bis\b', r'\bare\b', r'\bwas\b', r'\bwere\b', r'\bhave\b', r'\bhas\b'
            ],
            'spanish': [
                r'\bel\b', r'\bla\b', r'\bde\b', r'\bque\b', r'\by\b', r'\ben\b',
                r'\bes\b', r'\bse\b', r'\bno\b', r'\bte\b', r'\blo\b', r'\ble\b'
            ],
            'french': [
                r'\ble\b', r'\bde\b', r'\bet\b', r'\bà\b', r'\bun\b', r'\bil\b',
                r'\bêtre\b', r'\ben\b', r'\bavoir\b', r'\bque\b', r'\bpour\b', r'\bdans\b'
            ],
            'german': [
                r'\bder\b', r'\bdie\b', r'\bund\b', r'\bin\b', r'\bden\b', r'\bvon\b',
                r'\bzu\b', r'\bdas\b', r'\bmit\b', r'\bsich\b', r'\bdes\b', r'\bauf\b'
            ]
        }
        
        language_scores = {}
        text_lower = text.lower()
        
        for language, language_patterns in patterns.items():
            matches = sum(len(re.findall(pattern, text_lower)) for pattern in language_patterns)
            score = matches / len(text_lower.split()) if text_lower.split() else 0
            language_scores[language] = score
        
        return language_scores
    
    def _detect_by_script(self, text: str, script_info: Dict[str, Any]) -> Dict[str, float]:
        """Detect language based on script"""
        script_scores = {}
        primary_script = script_info["primaryScript"]
        
        # Map scripts to likely languages
        script_language_map = {
            'latin': ['english', 'spanish', 'french', 'german', 'italian', 'portuguese'],
            'cyrillic': ['russian'],
            'arabic': ['arabic'],
            'chinese': ['chinese'],
            'japanese': ['japanese'],
            'korean': ['korean'],
            'hindi': ['hindi']
        }
        
        if primary_script in script_language_map:
            languages = script_language_map[primary_script]
            score_per_language = 1.0 / len(languages)
            
            for language in languages:
                script_scores[language] = score_per_language
        
        return script_scores
    
    def _combine_detection_results(self, word_result: Dict, pattern_result: Dict, script_result: Dict, script_info: Dict) -> Dict[str, Any]:
        """Combine all detection results"""
        all_languages = set(word_result.keys()) | set(pattern_result.keys()) | set(script_result.keys())
        
        combined_scores = {}
        for language in all_languages:
            word_score = word_result.get(language, 0)
            pattern_score = pattern_result.get(language, 0)
            script_score = script_result.get(language, 0)
            
            # Weighted combination
            combined_score = (word_score * 0.5) + (pattern_score * 0.3) + (script_score * 0.2)
            combined_scores[language] = combined_score
        
        # Get the best match
        if combined_scores:
            detected_language = max(combined_scores, key=combined_scores.get)
            confidence = combined_scores[detected_language]
        else:
            detected_language = 'unknown'
            confidence = 0.0
        
        return {
            "detectedLanguage": detected_language,
            "languageName": self.language_names.get(detected_language, detected_language.title()),
            "confidence": confidence,
            "scriptInfo": script_info,
            "allScores": combined_scores,
            "detectionMethod": "combined"
        }
    
    def _analyze_text_stats(self, text: str) -> Dict[str, Any]:
        """Analyze text statistics"""
        words = re.findall(r'\b\w+\b', text)
        sentences = re.split(r'[.!?]+', text)
        
        return {
            "characterCount": len(text),
            "wordCount": len(words),
            "sentenceCount": len([s for s in sentences if s.strip()]),
            "averageWordLength": sum(len(word) for word in words) / len(words) if words else 0,
            "averageSentenceLength": len(words) / len(sentences) if sentences else 0
        }
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate confidence in the detection"""
        confidence = result.get("confidence", 0.0)
        
        # Adjust confidence based on text length
        text_stats = result.get("textStats", {})
        word_count = text_stats.get("wordCount", 0)
        
        if word_count < 10:
            confidence *= 0.5  # Lower confidence for short texts
        elif word_count > 100:
            confidence *= 1.1  # Slightly higher confidence for longer texts
        
        return min(confidence, 1.0)
    
    def _get_alternative_languages(self, word_result: Dict, pattern_result: Dict) -> List[Dict[str, Any]]:
        """Get alternative language possibilities"""
        all_scores = {}
        for language in set(word_result.keys()) | set(pattern_result.keys()):
            all_scores[language] = (word_result.get(language, 0) + pattern_result.get(language, 0)) / 2
        
        # Sort by score and return top alternatives
        sorted_languages = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)
        
        alternatives = []
        for language, score in sorted_languages[:3]:
            if score > 0.1:  # Only include languages with meaningful scores
                alternatives.append({
                    "language": language,
                    "languageName": self.language_names.get(language, language.title()),
                    "confidence": score
                })
        
        return alternatives

# Main execution
def main():
    """Test the language detector"""
    detector = LanguageDetector()
    
    test_texts = [
        "Hello, how are you today?",
        "Hola, ¿cómo estás hoy?",
        "Bonjour, comment allez-vous aujourd'hui?",
        "Hallo, wie geht es dir heute?",
        "Ciao, come stai oggi?",
        "Привет, как дела сегодня?",
        "你好，你今天怎么样？",
        "こんにちは、今日はどうですか？"
    ]
    
    for text in test_texts:
        result = detector.detect_language(text)
        
        if result.success:
            print(f"Text: {text}")
            print(f"Detected: {result.data['languageName']} (confidence: {result.data['confidence']:.2f})")
            print("---")
        else:
            print(f"Detection failed for: {text}")

if __name__ == "__main__":
    main()
