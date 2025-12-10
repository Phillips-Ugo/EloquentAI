@echo off
REM Gemini CLI Batch File
REM Usage: gemini "your question here"

if "%1"=="" (
    echo Usage: gemini "your question here"
    echo Example: gemini "What is artificial intelligence?"
    pause
    exit /b
)

python simple_gemini.py %*
