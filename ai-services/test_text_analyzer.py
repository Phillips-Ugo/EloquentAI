#!/usr/bin/env python3
"""
Test script for text analyzer
"""

import json
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from text_analyzer import TextAnalyzer

def test_text_analyzer():
    """Test the text analyzer with sample text"""
    
    sample_text = """
    Today I want to talk about the importance of effective communication in the workplace. 
    Communication is key to success and without it, teams cannot function properly. 
    We need to ensure that everyone is on the same page and working towards common goals.
    """
    
    print("Testing Text Analyzer...")
    print(f"Sample text: {sample_text.strip()}")
    print("-" * 50)
    
    try:
        analyzer = TextAnalyzer()
        result = analyzer.analyze_text(sample_text)
        
        print("Analysis Result:")
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            print("\n✅ Text analyzer is working correctly!")
            return True
        else:
            print(f"\n❌ Text analyzer failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error testing text analyzer: {e}")
        return False

if __name__ == "__main__":
    success = test_text_analyzer()
    sys.exit(0 if success else 1) 