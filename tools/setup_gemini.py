#!/usr/bin/env python3
"""
Gemini API Setup Helper
This script helps you set up Gemini API correctly
"""

import os
import sys

def main():
    print("Gemini API Setup Helper")
    print("=" * 40)
    
    print("\nYou have 2 options for Gemini API:")
    print("\n1. Google AI Studio (Recommended for CLI)")
    print("   - Free tier available")
    print("   - Easy setup")
    print("   - Perfect for CLI tools")
    print("   - Get API key: https://aistudio.google.com/")
    
    print("\n2. Google Cloud Gemini API")
    print("   - Enterprise features")
    print("   - More control")
    print("   - Requires Google Cloud project")
    print("   - More complex setup")
    
    print("\n" + "=" * 40)
    choice = input("\nWhich option do you prefer? (1 or 2): ").strip()
    
    if choice == "1":
        print("\nGoogle AI Studio Setup:")
        print("1. Go to: https://aistudio.google.com/")
        print("2. Sign in with your Google account")
        print("3. Click 'Get API Key' in the left sidebar")
        print("4. Click 'Create API Key'")
        print("5. Copy the generated API key")
        print("\nThen run:")
        print("$env:GEMINI_API_KEY='your_api_key_here'")
        print("\nOr set it permanently:")
        print("setx GEMINI_API_KEY 'your_api_key_here'")
        
    elif choice == "2":
        print("\nGoogle Cloud Setup:")
        print("1. Go to: https://console.developers.google.com/")
        print("2. Create or select a project")
        print("3. Enable the Gemini API:")
        print("   https://console.developers.google.com/apis/api/generativelanguage.googleapis.com")
        print("4. Create credentials (API key)")
        print("5. Set the API key:")
        print("$env:GEMINI_API_KEY='your_api_key_here'")
        
    else:
        print("Invalid choice. Please run the script again.")
        return
    
    print("\n" + "=" * 40)
    print("After setting up your API key, test it with:")
    print("python tools/simple_gemini.py 'Hello, can you help me?'")
    print("\nOr start interactive chat with:")
    print("python tools/gemini_cli.py")

if __name__ == "__main__":
    main()