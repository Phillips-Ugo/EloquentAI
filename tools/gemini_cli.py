#!/usr/bin/env python3
"""
Simple Gemini CLI tool for terminal interaction
Usage: python gemini_cli.py
"""

import os
import sys
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

def setup_gemini():
    """Setup Gemini API with API key"""
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("🔑 Gemini API Key not found!")
        print("Please set your API key in one of these ways:")
        print("1. Set environment variable: set GEMINI_API_KEY=your_api_key_here")
        print("2. Or run: $env:GEMINI_API_KEY='your_api_key_here'")
        print("3. Get your API key from: https://aistudio.google.com/")
        print()
        
        # Try to get API key from user input
        api_key = input("Enter your Gemini API key (or press Enter to skip): ").strip()
        if api_key:
            os.environ['GEMINI_API_KEY'] = api_key
        else:
            return None
    
    try:
        genai.configure(api_key=api_key)
        print("✅ Gemini API configured successfully!")
        return True
    except Exception as e:
        print(f"❌ Error configuring Gemini API: {e}")
        return None

def get_model():
    """Get the Gemini model"""
    try:
        # Use Gemini 1.5 Flash (current model)
        model = genai.GenerativeModel('gemini-2.5-flash')
        return model
    except Exception as e:
        print(f"Error getting model: {e}")
        return None

def chat_with_gemini(model, message):
    """Chat with Gemini"""
    try:
        # Configure safety settings to be less restrictive
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        response = model.generate_content(
            message,
            safety_settings=safety_settings
        )
        
        if response.text:
            return response.text
        else:
            return "Sorry, I couldn't generate a response to that."
            
    except Exception as e:
        return f"Error: {e}"

def main():
    """Main function"""
    print("🤖 Gemini CLI - Chat with Google's Gemini AI")
    print("=" * 50)
    
    # Setup Gemini
    if not setup_gemini():
        return
    
    # Get model
    model = get_model()
    if not model:
        return
    
    print(f"🚀 Using model: {model.model_name}")
    print("💡 Type 'quit', 'exit', or 'bye' to stop")
    print("💡 Type 'clear' to clear conversation")
    print("=" * 50)
    
    conversation_history = []
    
    while True:
        try:
            # Get user input
            user_input = input("\n👤 You: ").strip()
            
            # Check for exit commands
            if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                print("👋 Goodbye!")
                break
            
            # Check for clear command
            if user_input.lower() == 'clear':
                conversation_history = []
                print("🧹 Conversation cleared!")
                continue
            
            # Skip empty inputs
            if not user_input:
                continue
            
            # Add to conversation history
            conversation_history.append(f"Human: {user_input}")
            
            # Create context from conversation history (last 10 messages)
            context = "\n".join(conversation_history[-10:])
            
            print("🤖 Gemini: ", end="", flush=True)
            
            # Get response from Gemini
            response = chat_with_gemini(model, context)
            
            # Display response
            print(response)
            
            # Add response to history
            conversation_history.append(f"Assistant: {response}")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
