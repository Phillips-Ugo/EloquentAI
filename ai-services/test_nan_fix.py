#!/usr/bin/env python3
"""
Test script to verify NaN fixes and LLM integration
"""

import json
import sys
import os
import numpy as np
from video_analyzer import VideoAnalyzer

def test_nan_fixes():
    """Test that NaN values are properly handled"""
    print("🧪 Testing NaN Value Fixes")
    print("=" * 50)
    
    analyzer = VideoAnalyzer()
    
    # Test with valid video file
    video_file = "001 Welcome To The Course!.mp4"
    if not os.path.exists(video_file):
        print(f"❌ Test video file not found: {video_file}")
        return False
    
    try:
        print(f"🎬 Testing video analysis with: {video_file}")
        result = analyzer.analyze_video(video_file)
        
        # Check for NaN values in scores
        scores_to_check = [
            'overall_score', 'posture_score', 'eye_contact_score', 
            'gesture_score', 'movement_score'
        ]
        
        nan_found = False
        for score_key in scores_to_check:
            score_value = result.get(score_key, 0)
            if np.isnan(score_value) or not isinstance(score_value, (int, float)):
                print(f"❌ Found invalid value in {score_key}: {score_value}")
                nan_found = True
            else:
                print(f"✅ {score_key}: {score_value:.3f}")
        
        if nan_found:
            print("❌ NaN values found in scores")
            return False
        
        # Check categories
        categories = result.get('categories', {})
        for category, value in categories.items():
            if np.isnan(value) or not isinstance(value, (int, float)):
                print(f"❌ Found invalid value in categories.{category}: {value}")
                nan_found = True
            else:
                print(f"✅ categories.{category}: {value:.3f}")
        
        if nan_found:
            print("❌ NaN values found in categories")
            return False
        
        # Check video metrics
        video_metrics = result.get('video_metrics', {})
        eye_contact_pct = video_metrics.get('eye_contact_percentage', 0)
        if np.isnan(eye_contact_pct) or not isinstance(eye_contact_pct, (int, float)):
            print(f"❌ Found invalid eye contact percentage: {eye_contact_pct}")
            nan_found = True
        else:
            print(f"✅ Eye contact percentage: {eye_contact_pct:.1f}%")
        
        if nan_found:
            print("❌ NaN values found in video metrics")
            return False
        
        print("✅ All scores are valid numbers!")
        return True
        
    except Exception as e:
        print(f"❌ Error in NaN test: {str(e)}")
        return False

def test_llm_suggestions():
    """Test LLM suggestions functionality"""
    print("\n🤖 Testing LLM Suggestions")
    print("=" * 50)
    
    analyzer = VideoAnalyzer()
    
    # Test with sample scores
    test_scores = {
        "overall": 0.65,
        "posture": 0.45,
        "eye_contact": 0.80,
        "gestures": 0.30,
        "movement": 0.55
    }
    
    test_metrics = {
        "duration": "60s",
        "eye_contact_percentage": 80.0,
        "gesture_count": 5
    }
    
    try:
        print("🎯 Testing LLM suggestions with sample data...")
        suggestions = analyzer._get_llm_suggestions(test_scores, test_metrics)
        
        if isinstance(suggestions, list) and len(suggestions) > 0:
            print(f"✅ Generated {len(suggestions)} suggestions:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"   {i}. {suggestion}")
            return True
        else:
            print("❌ No suggestions generated")
            return False
            
    except Exception as e:
        print(f"❌ Error in LLM suggestions test: {str(e)}")
        return False

def test_fallback_suggestions():
    """Test fallback suggestions when LLM is not available"""
    print("\n🔄 Testing Fallback Suggestions")
    print("=" * 50)
    
    analyzer = VideoAnalyzer()
    
    # Test with various score combinations
    test_cases = [
        {"overall": 0.3, "posture": 0.2, "eye_contact": 0.4, "gestures": 0.1, "movement": 0.5},
        {"overall": 0.8, "posture": 0.9, "eye_contact": 0.8, "gestures": 0.7, "movement": 0.8},
        {"overall": 0.6, "posture": 0.5, "eye_contact": 0.9, "gestures": 0.3, "movement": 0.7}
    ]
    
    for i, scores in enumerate(test_cases, 1):
        try:
            print(f"📊 Test case {i} - Scores: {scores}")
            suggestions = analyzer._get_fallback_suggestions(scores)
            
            if isinstance(suggestions, list) and len(suggestions) > 0:
                print(f"✅ Generated {len(suggestions)} fallback suggestions")
                for j, suggestion in enumerate(suggestions[:3], 1):  # Show first 3
                    print(f"   {j}. {suggestion}")
            else:
                print("❌ No fallback suggestions generated")
                return False
                
        except Exception as e:
            print(f"❌ Error in fallback test case {i}: {str(e)}")
            return False
    
    return True

if __name__ == "__main__":
    print("🧪 Video Analyzer NaN Fixes and LLM Integration Test Suite")
    print("=" * 70)
    
    # Test 1: NaN fixes
    test1_passed = test_nan_fixes()
    
    # Test 2: LLM suggestions
    test2_passed = test_llm_suggestions()
    
    # Test 3: Fallback suggestions
    test3_passed = test_fallback_suggestions()
    
    print("\n" + "=" * 70)
    print("📋 Test Results:")
    print(f"NaN Fixes: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"LLM Suggestions: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    print(f"Fallback Suggestions: {'✅ PASSED' if test3_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed and test3_passed:
        print("\n🎉 All tests passed! NaN values are fixed and LLM integration is working.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed.")
        sys.exit(1) 