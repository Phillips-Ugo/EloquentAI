# 🤖 AI Services Setup Guide

This guide will help you set up the AI services for Eloquent AI. The application supports multiple backends and will automatically use the best available option.

---

## 🎯 Quick Start (Recommended)

### Option 1: OpenAI API (Easiest & Best Quality)

The application can use OpenAI's Whisper API for transcription and GPT-4 for analysis. This provides the best quality results without needing to install Python dependencies.

#### Steps:

1. **Get Gemini API Key:**
   - Go to https://aistudio.google.com/apikey
   - Sign in with your Google account
   - Create a new API key
   - Copy the key (starts with `AIza`)

2. **Set Environment Variable:**
   
   **Windows (PowerShell):**
   ```powershell
   $env:GEMINI_API_KEY="AIza-your-api-key-here"
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   set GEMINI_API_KEY=AIza-your-api-key-here
   ```
   
   **Linux/Mac:**
   ```bash
   export GEMINI_API_KEY="AIza-your-api-key-here"
   ```

3. **Or create `.env` file in `server/` directory:**
   ```
   GEMINI_API_KEY=AIza-your-api-key-here
   ```

4. **Install Gemini package (already done):**
   ```bash
   cd server
   npm install
   ```

5. **Restart the server:**
   ```bash
   npm start
   ```

That's it! The application will now use:
- ✅ **Gemini 1.5 Pro** for speech analysis (BEST MODEL!)
- ✅ OpenAI Whisper for audio transcription (best for audio)
- ✅ Superior communication insights

**Cost:** 
- Gemini: Free tier available (5 prompts/day) or $20/month for Pro
- OpenAI Whisper: ~$0.006 per minute of audio

**Why Gemini?**
- 🚀 Better reasoning capabilities
- 🚀 More context understanding
- 🚀 Superior analysis quality
- 🚀 Better at communication coaching tasks

---

## 🐍 Option 2: Python Services (Free but Requires Setup)

If you prefer not to use OpenAI, you can use the Python-based services. These are free but require more setup.

### Prerequisites:
- Python 3.9 or higher
- pip package manager

### Steps:

1. **Navigate to ai-services directory:**
   ```bash
   cd ai-services
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   
   **Windows:**
   ```bash
   venv\Scripts\activate
   ```
   
   **Linux/Mac:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Install additional dependencies for audio analysis:**
   ```bash
   pip install whisper openai-whisper
   ```

6. **For video analysis, install MediaPipe:**
   ```bash
   pip install mediapipe opencv-python
   ```

7. **Test the services:**
   ```bash
   python audio_analyzer.py
   ```

The application will automatically detect and use Python services if available.

---

## 🔄 How It Works

The application uses a **smart fallback system**:

1. **First Priority:** OpenAI API (if `OPENAI_API_KEY` is set)
   - Best quality transcription
   - Advanced GPT-4 analysis
   - Fast and reliable

2. **Second Priority:** Python Services (if installed)
   - Free and open-source
   - Good quality analysis
   - Requires Python setup

3. **Fallback:** Basic Analysis
   - Always works
   - Limited features
   - Good for testing

---

## 📊 What Each Service Provides

### OpenAI Service:
- ✅ High-quality audio transcription
- ✅ Advanced speech analysis
- ✅ Sentiment analysis
- ✅ Filler word detection
- ✅ Speaking pace analysis
- ✅ Actionable insights

### Python Services:
- ✅ Audio transcription (Whisper)
- ✅ Speech analysis
- ✅ Video analysis (MediaPipe)
- ✅ Posture detection
- ✅ Eye contact analysis
- ✅ Gesture recognition

### Fallback:
- ✅ Basic file processing
- ✅ File validation
- ✅ Session management
- ⚠️ Limited analysis features

---

## 🧪 Testing Your Setup

1. **Test OpenAI (if configured):**
   ```bash
   # In server directory
   node -e "require('dotenv').config(); const service = require('./services/enhancedAIService'); console.log('OpenAI available:', !!service.openai);"
   ```

2. **Test Python Services:**
   ```bash
   cd ai-services
   python audio_analyzer.py
   ```

3. **Upload a test file:**
   - Go to http://localhost:3000/upload
   - Upload an audio or video file
   - Check the console for which service is being used

---

## 💡 Recommendations

### For Development:
- Use **OpenAI API** - easiest setup, best results
- Get a free trial account ($5 credit)
- Monitor usage at https://platform.openai.com/usage

### For Production:
- Use **OpenAI API** for best user experience
- Set usage limits in OpenAI dashboard
- Consider caching results to reduce costs

### For Testing:
- Use **Fallback mode** - no setup required
- Good for testing UI and workflows
- Limited analysis features

---

## 🔐 Security Notes

- **Never commit API keys to git**
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate API keys regularly

---

## 🆘 Troubleshooting

### OpenAI Issues:
- **Error: "OpenAI client not initialized"**
  - Check that `OPENAI_API_KEY` is set correctly
  - Restart the server after setting the variable
  - Check API key is valid at https://platform.openai.com/api-keys

- **Error: "Insufficient quota"**
  - Add payment method at https://platform.openai.com/account/billing
  - Check usage limits

### Python Service Issues:
- **Error: "Python process failed"**
  - Check Python is installed: `python --version`
  - Check dependencies are installed: `pip list`
  - Check file paths are correct

- **Error: "Module not found"**
  - Activate virtual environment
  - Install missing packages: `pip install <package-name>`

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Whisper API Guide](https://platform.openai.com/docs/guides/speech-to-text)
- [Python Services README](../ai-services/README.md)

---

## ✅ Setup Checklist

- [ ] Choose setup option (OpenAI or Python)
- [ ] Get API key (if using OpenAI)
- [ ] Set environment variable
- [ ] Install dependencies
- [ ] Test the service
- [ ] Upload a test file
- [ ] Verify analysis works

---

**Need help?** Check the console logs - they show which service is being used and any errors.

