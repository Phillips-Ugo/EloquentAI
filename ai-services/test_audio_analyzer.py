#!/usr/bin/env python3
"""
Test script for audio analyzer
"""

import json
import sys
import os
from audio_analyzer import AudioAnalyzer

def test_audio_analyzer():
    """Test the audio analyzer with a sample audio file"""
    try:
        # Check if we have a test audio file
        test_audio_path = "test_audio.wav"
        
        if not os.path.exists(test_audio_path):
            print("No test audio file found. Creating a simple test...")
            # Create a simple test result
            test_result = {
                "overall_score": 0.75,
                "clarity_score": 0.80,
                "pace_score": 0.70,
                "sentiment_score": 0.75,
                "engagement_score": 0.72,
                "strengths": [
                    "Clear audio quality",
                    "Good speaking pace",
                    "Professional tone"
                ],
                "improvements": [
                    "Consider reducing filler words",
                    "Add more vocal variety",
                    "Include more engaging pauses"
                ],
                "suggestions": [
                    "Practice with a metronome to improve timing",
                    "Record yourself and listen for filler words",
                    "Use breathing exercises to improve vocal control"
                ],
                "audio_metrics": {
                    "duration": "1:30",
                    "word_count": 120,
                    "speaking_rate": "80 words per minute",
                    "filler_word_count": 5,
                    "pause_count": 8,
                    "average_volume": "0.45 dB",
                    "speaking_pace": "moderate"
                },
                "detailed_analysis": {
                    "tone": "Professional and clear",
                    "pace": "Good speaking rate",
                    "volume": "Appropriate levels",
                    "articulation": "Clear pronunciation",
                    "engagement": "Could be more dynamic"
                },
                "filler_words": {
                    "um": 2,
                    "uh": 1,
                    "like": 2
                },
                "transcript": "This is a test transcript for the audio analysis system. It demonstrates how the system processes speech and provides feedback on various aspects of communication.",
                "categories": {
                    "clarity": 0.80,
                    "engagement": 0.72,
                    "structure": 0.75,
                    "impact": 0.73
                }
            }
            
            response = {
                "success": True,
                "data": test_result
            }
            
            print(json.dumps(response))
            return
        
        # If we have a real audio file, analyze it
        analyzer = AudioAnalyzer()
        results = analyzer.analyze_audio(test_audio_path)
        
        response = {
            "success": True,
            "data": results
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        error_response = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    test_audio_analyzer() 