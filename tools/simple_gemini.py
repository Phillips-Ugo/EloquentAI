#!/usr/bin/env python3
"""
Simple one-liner Gemini CLI
Usage: python simple_gemini.py "your question here"
"""

import os
import sys
import google.generativeai as genai

def main():
    if len(sys.argv) < 2:
        print("Usage: python simple_gemini.py 'your question here'")
        return
    
    # Get API key
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Please set GEMINI_API_KEY environment variable")
        print("Get your API key from: https://aistudio.google.com/")
        return
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Get user input
    user_input = " ".join(sys.argv[1:])
    
    # Generate response
    try:
        response = model.generate_content(user_input)
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
