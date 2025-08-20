#!/usr/bin/env python3
"""
Test script to verify error handling improvements in Video Analyzer
"""

import json
import sys
import os
from video_analyzer import VideoAnalyzer

def test_error_handling():
    """Test various error scenarios"""
    print("🧪 Testing Error Handling Improvements")
    print("=" * 50)
    
    analyzer = VideoAnalyzer()
    
    # Test 1: Non-existent file
    print("\n1️⃣ Testing non-existent file handling...")
    try:
        result = analyzer.analyze_video("non_existent_file.mp4")
        print("❌ Should have raised FileNotFoundError")
        return False
    except FileNotFoundError as e:
        print(f"✅ Correctly handled non-existent file: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False
    
    # Test 2: Invalid video file (create a text file with .mp4 extension)
    print("\n2️⃣ Testing invalid video file handling...")
    test_file = "test_invalid.mp4"
    try:
        with open(test_file, 'w') as f:
            f.write("This is not a video file")
        
        try:
            result = analyzer.analyze_video(test_file)
            print("❌ Should have raised ValueError for invalid video")
            return False
        except ValueError as e:
            print(f"✅ Correctly handled invalid video: {str(e)}")
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            return False
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)
    
    # Test 3: MediaPipe model availability
    print("\n3️⃣ Testing MediaPipe model availability...")
    if analyzer.pose is not None:
        print("✅ Pose detection model is available")
    else:
        print("⚠️  Pose detection model is not available")
    
    if analyzer.face_mesh is not None:
        print("✅ Face mesh model is available")
    else:
        print("⚠️  Face mesh model is not available")
    
    if analyzer.hands is not None:
        print("✅ Hand detection model is available")
    else:
        print("⚠️  Hand detection model is not available")
    
    # Test 4: Real-time functionality
    print("\n4️⃣ Testing real-time functionality...")
    try:
        real_time_scores = analyzer.get_real_time_scores()
        if isinstance(real_time_scores, dict) and 'scores' in real_time_scores:
            print("✅ Real-time scores working correctly")
            print(f"   Scores: {real_time_scores['scores']}")
        else:
            print("❌ Real-time scores not in expected format")
            return False
    except Exception as e:
        print(f"❌ Error in real-time functionality: {str(e)}")
        return False
    
    # Test 5: Reset functionality
    print("\n5️⃣ Testing reset functionality...")
    try:
        analyzer.reset_real_time_state()
        print("✅ Reset functionality working")
    except Exception as e:
        print(f"❌ Error in reset functionality: {str(e)}")
        return False
    
    print("\n✅ All error handling tests passed!")
    return True

def test_landmark_handling():
    """Test landmark handling improvements"""
    print("\n🔧 Testing Landmark Handling Improvements")
    print("=" * 50)
    
    analyzer = VideoAnalyzer()
    
    # Test with valid video file
    video_file = "001 Welcome To The Course!.mp4"
    if not os.path.exists(video_file):
        print(f"❌ Test video file not found: {video_file}")
        return False
    
    try:
        print(f"🎬 Testing landmark handling with: {video_file}")
        result = analyzer.analyze_video(video_file)
        
        # Check if we got valid results
        if 'overall_score' in result and 'posture_score' in result:
            print("✅ Landmark handling working correctly")
            print(f"   Overall Score: {result['overall_score']:.2f}")
            print(f"   Posture Score: {result['posture_score']:.2f}")
            print(f"   Eye Contact Score: {result['eye_contact_score']:.2f}")
            print(f"   Gesture Score: {result['gesture_score']:.2f}")
            print(f"   Movement Score: {result['movement_score']:.2f}")
            return True
        else:
            print("❌ Missing expected result fields")
            return False
            
    except Exception as e:
        print(f"❌ Error in landmark handling test: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Video Analyzer Error Handling Test Suite")
    print("=" * 60)
    
    # Test 1: Error handling
    test1_passed = test_error_handling()
    
    # Test 2: Landmark handling
    test2_passed = test_landmark_handling()
    
    print("\n" + "=" * 60)
    print("📋 Error Handling Test Results:")
    print(f"Error Handling Tests: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Landmark Handling Tests: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All error handling improvements are working correctly!")
        sys.exit(0)
    else:
        print("\n⚠️  Some error handling tests failed.")
        sys.exit(1) 