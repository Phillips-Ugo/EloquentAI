# Tools Directory

This directory contains utility tools for the Eloquent AI project.

## Gemini CLI Tools

### Setup
1. Get your Gemini API key from: https://aistudio.google.com/
2. Set environment variable: `$env:GEMINI_API_KEY='your_api_key_here'`

### Usage

#### Interactive Chat
```bash
python gemini_cli.py
```

#### Quick Questions
```bash
python simple_gemini.py "What is React.js?"
```

#### Using Batch File (Windows)
```bash
gemini "Explain machine learning in simple terms"
```

## Files
- `gemini_cli.py` - Interactive chat interface with Gemini
- `simple_gemini.py` - One-liner command interface
- `gemini.bat` - Windows batch file for easy access



