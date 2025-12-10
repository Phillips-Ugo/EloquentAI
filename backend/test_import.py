#!/usr/bin/env python3
"""Test script to verify imports"""

try:
    from pydantic_settings import BaseSettings
    print("✅ pydantic_settings import successful")
    
    from app.core.config import settings
    print("✅ Config import successful")
    print(f"Project name: {settings.PROJECT_NAME}")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Other error: {e}")