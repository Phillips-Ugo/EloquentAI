#!/usr/bin/env python3
"""
Test script for Video Analyzer
Tests the video analyzer with a sample video file
"""

import json
import sys
import os
from video_analyzer import VideoAnalyzer

def test_video_analyzer():
    """Test the video analyzer with a sample video file"""
    
    # Path to the test video file
    video_file_path = "001 Welcome To The Course!.mp4"
    
    # Check if video file exists
    if not os.path.exists(video_file_path):
        print(f"❌ Error: Video file '{video_file_path}' not found!")
        print(f"Current directory: {os.getcwd()}")
        print(f"Available files: {os.listdir('.')}")
        return False
    
    print(f"✅ Found video file: {video_file_path}")
    
    try:
        # Initialize the video analyzer
        print("🔧 Initializing Video Analyzer...")
        analyzer = VideoAnalyzer()
        print("✅ Video Analyzer initialized successfully")
        
        # Analyze the video
        print(f"🎬 Starting video analysis for: {video_file_path}")
        results = analyzer.analyze_video(video_file_path)
        
        # Check if results are valid
        if not results:
            print("❌ Error: No results returned from video analysis")
            return False
        
        print("✅ Video analysis completed successfully!")
        
        # Print summary of results
        print("\n📊 Analysis Results Summary:")
        print("=" * 50)
        
        if 'scores' in results:
            scores = results['scores']
            print(f"Overall Score: {scores.get('overall', 'N/A'):.2f}")
            print(f"Posture Score: {scores.get('posture', 'N/A'):.2f}")
            print(f"Eye Contact Score: {scores.get('eye_contact', 'N/A'):.2f}")
            print(f"Gestures Score: {scores.get('gestures', 'N/A'):.2f}")
            print(f"Movement Score: {scores.get('movement', 'N/A'):.2f}")
        
        if 'analysis' in results and 'strengths' in results['analysis']:
            print(f"\n💪 Strengths ({len(results['analysis']['strengths'])}):")
            for strength in results['analysis']['strengths']:
                print(f"  • {strength}")
        
        if 'analysis' in results and 'improvements' in results['analysis']:
            print(f"\n🔧 Areas for Improvement ({len(results['analysis']['improvements'])}):")
            for improvement in results['analysis']['improvements']:
                print(f"  • {improvement}")
        
        if 'analysis' in results and 'suggestions' in results['analysis']:
            print(f"\n💡 Suggestions ({len(results['analysis']['suggestions'])}):")
            for suggestion in results['analysis']['suggestions']:
                print(f"  • {suggestion}")
        
        # Test real-time functionality
        print("\n🔄 Testing Real-time Functionality:")
        real_time_scores = analyzer.get_real_time_scores()
        print(f"Real-time scores: {real_time_scores}")
        
        print("\n✅ All tests passed! Video analyzer is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Error during video analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_command_line_interface():
    """Test the command line interface"""
    print("\n🔧 Testing Command Line Interface:")
    
    video_file_path = "001 Welcome To The Course!.mp4"
    
    if not os.path.exists(video_file_path):
        print(f"❌ Video file not found for CLI test")
        return False
    
    try:
        # Create a test request
        request = {
            "video_file_path": video_file_path
        }
        
        # Simulate stdin input
        import io
        import contextlib
        
        # Capture stdout to get the response
        f = io.StringIO()
        with contextlib.redirect_stdout(f):
            # Import and run main function
            from video_analyzer import main
            
            # Temporarily replace sys.stdin
            original_stdin = sys.stdin
            sys.stdin = io.StringIO(json.dumps(request))
            
            try:
                main()
            finally:
                sys.stdin = original_stdin
        
        # Get the output
        output = f.getvalue()
        response = json.loads(output)
        
        if response.get('success'):
            print("✅ CLI test passed!")
            return True
        else:
            print(f"❌ CLI test failed: {response.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ CLI test error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Video Analyzer Test Suite")
    print("=" * 50)
    
    # Test 1: Direct API usage
    test1_passed = test_video_analyzer()
    
    # Test 2: Command line interface
    test2_passed = test_command_line_interface()
    
    print("\n" + "=" * 50)
    print("📋 Test Results Summary:")
    print(f"Direct API Test: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"CLI Test: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! Video analyzer is working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        sys.exit(1) 