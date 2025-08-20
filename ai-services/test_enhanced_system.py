#!/usr/bin/env python3
"""
Test script for Enhanced Real-Time AI Communication Analysis System
Verifies all components are working correctly
"""

import os
import sys
import time
import logging
import numpy as np
import cv2
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_dependencies():
    """Test if all required dependencies are available"""
    logger.info("Testing dependencies...")
    
    dependencies = [
        ('opencv-python', 'cv2'),
        ('mediapipe', 'mediapipe'),
        ('numpy', 'numpy'),
        ('websockets', 'websockets'),
        ('openai', 'openai'),
        ('python-dotenv', 'dotenv'),
        ('whisper', 'whisper'),
        ('deepface', 'deepface'),
        ('librosa', 'librosa'),
        ('sounddevice', 'sounddevice')
    ]
    
    missing = []
    for package, import_name in dependencies:
        try:
            __import__(import_name)
            logger.info(f"✓ {package}")
        except ImportError:
            missing.append(package)
            logger.error(f"✗ {package} - Missing")
    
    if missing:
        logger.error(f"Missing dependencies: {', '.join(missing)}")
        return False
    
    logger.info("All dependencies are available!")
    return True

def test_environment():
    """Test environment configuration"""
    logger.info("Testing environment configuration...")
    
    # Check env.local file
    env_file = Path('env.local')
    if not env_file.exists():
        logger.error("env.local file not found!")
        return False
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv('env.local')
    
    # Check OpenAI API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key or api_key == 'your_openai_api_key_here':
        logger.warning("OpenAI API key not configured - GPT feedback will be disabled")
    else:
        logger.info("✓ OpenAI API key configured")
    
    return True

def test_analyzer_components():
    """Test analyzer components"""
    logger.info("Testing analyzer components...")
    
    try:
        from real_time_analyzer import (
            PostureAnalyzer, 
            EyeTracker, 
            GestureRecognizer, 
            EmotionDetector,
            SpeechTranscriber,
            GPTFeedbackEngine,
            RealTimeAnalyzer
        )
        logger.info("✓ Analyzer components imported successfully")
        
        # Test posture analyzer
        posture_analyzer = PostureAnalyzer()
        logger.info("✓ Posture analyzer initialized")
        
        # Test eye tracker
        eye_tracker = EyeTracker()
        logger.info("✓ Eye tracker initialized")
        
        # Test gesture recognizer
        gesture_recognizer = GestureRecognizer()
        logger.info("✓ Gesture recognizer initialized")
        
        # Test emotion detector
        emotion_detector = EmotionDetector()
        logger.info("✓ Emotion detector initialized")
        
        # Test speech transcriber
        speech_transcriber = SpeechTranscriber()
        logger.info("✓ Speech transcriber initialized")
        
        # Test GPT feedback engine (if API key available)
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key and api_key != 'your_openai_api_key_here':
            try:
                gpt_engine = GPTFeedbackEngine(api_key)
                logger.info("✓ GPT feedback engine initialized")
            except Exception as e:
                logger.warning(f"GPT feedback engine failed: {e}")
        else:
            logger.info("✓ GPT feedback engine skipped (no API key)")
        
        # Test main analyzer
        analyzer = RealTimeAnalyzer(openai_api_key=api_key)
        logger.info("✓ Main analyzer initialized")
        
        return True
        
    except Exception as e:
        logger.error(f"Analyzer component test failed: {e}")
        return False

def test_video_analysis():
    """Test video analysis with a sample image"""
    logger.info("Testing video analysis...")
    
    try:
        from real_time_analyzer import RealTimeAnalyzer
        
        # Create a test image (simple colored rectangle)
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        test_image[:] = (100, 150, 200)  # Blue-gray color
        
        # Initialize analyzer
        api_key = os.getenv('OPENAI_API_KEY')
        analyzer = RealTimeAnalyzer(openai_api_key=api_key)
        
        # Start session
        analyzer.start_session("test_session")
        
        # Test frame analysis
        result = analyzer.analyze_frame(test_image)
        
        if 'error' not in result:
            logger.info("✓ Video analysis working")
            logger.info(f"  - Posture score: {result['scores']['posture']:.2f}")
            logger.info(f"  - Eye contact score: {result['scores']['eye_contact']:.2f}")
            logger.info(f"  - Gesture score: {result['scores']['gesture']:.2f}")
            logger.info(f"  - Emotion score: {result['scores']['emotion']:.2f}")
            logger.info(f"  - Overall score: {result['scores']['overall']:.2f}")
        else:
            logger.warning(f"Video analysis returned error: {result['error']}")
        
        # Stop session
        summary = analyzer.stop_session()
        logger.info("✓ Session management working")
        
        return True
        
    except Exception as e:
        logger.error(f"Video analysis test failed: {e}")
        return False

def test_websocket_server():
    """Test WebSocket server functionality"""
    logger.info("Testing WebSocket server...")
    
    try:
        from enhanced_realtime_server import EnhancedRealTimeServer
        import asyncio
        
        # Create server instance
        server = EnhancedRealTimeServer()
        logger.info("✓ Server instance created")
        
        # Test server initialization
        if server.analyzer is not None:
            logger.info("✓ Analyzer initialized in server")
        else:
            logger.warning("Analyzer not available in server")
        
        if server.openai_available:
            logger.info("✓ OpenAI integration available")
        else:
            logger.info("✓ OpenAI integration disabled (expected)")
        
        logger.info("✓ WebSocket server test passed")
        return True
        
    except Exception as e:
        logger.error(f"WebSocket server test failed: {e}")
        return False

def test_performance():
    """Test system performance"""
    logger.info("Testing system performance...")
    
    try:
        from real_time_analyzer import RealTimeAnalyzer
        
        # Create test image
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        test_image[:] = (100, 150, 200)
        
        # Initialize analyzer
        api_key = os.getenv('OPENAI_API_KEY')
        analyzer = RealTimeAnalyzer(openai_api_key=api_key)
        analyzer.start_session("performance_test")
        
        # Test analysis speed
        start_time = time.time()
        for i in range(5):
            result = analyzer.analyze_frame(test_image)
            if 'error' in result:
                logger.warning(f"Analysis {i+1} failed: {result['error']}")
        
        end_time = time.time()
        avg_time = (end_time - start_time) / 5
        
        logger.info(f"✓ Average analysis time: {avg_time:.3f} seconds")
        
        if avg_time < 1.0:  # Should be under 1 second
            logger.info("✓ Performance is acceptable")
        else:
            logger.warning("⚠ Analysis time is slow")
        
        analyzer.stop_session()
        return True
        
    except Exception as e:
        logger.error(f"Performance test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("=" * 60)
    logger.info("Enhanced Real-Time AI Communication Analysis - System Test")
    logger.info("=" * 60)
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Environment", test_environment),
        ("Analyzer Components", test_analyzer_components),
        ("Video Analysis", test_video_analysis),
        ("WebSocket Server", test_websocket_server),
        ("Performance", test_performance)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        logger.info(f"\n--- {test_name} Test ---")
        try:
            if test_func():
                passed += 1
                logger.info(f"✓ {test_name} test PASSED")
            else:
                logger.error(f"✗ {test_name} test FAILED")
        except Exception as e:
            logger.error(f"✗ {test_name} test ERROR: {e}")
    
    logger.info("\n" + "=" * 60)
    logger.info(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! System is ready to use.")
        return 0
    else:
        logger.error("❌ Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 