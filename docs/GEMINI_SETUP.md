# 🚀 Google Gemini Setup - Quick Guide

**Your API Key:** `AIzaSyCiAzBHfseXROCkL5I8zs2y7zV3ycr7C_w`

---

## ✅ Quick Setup (2 minutes)

### Step 1: Set Environment Variable

**Windows PowerShell (Current Session):**
```powershell
$env:GEMINI_API_KEY="AIzaSyCiAzBHfseXROCkL5I8zs2y7zV3ycr7C_w"
```

**Windows PowerShell (Permanent - Add to Profile):**
```powershell
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaSyCiAzBHfseXROCkL5I8zs2y7zV3ycr7C_w', 'User')
```

**Windows Command Prompt:**
```cmd
setx GEMINI_API_KEY "AIzaSyCiAzBHfseXROCkL5I8zs2y7zV3ycr7C_w"
```

**Or create `.env` file in `server/` directory:**
```
GEMINI_API_KEY=AIzaSyCiAzBHfseXROCkL5I8zs2y7zV3ycr7C_w
```

### Step 2: Restart Server

```bash
cd server
npm start
```

### Step 3: Verify

Check console for:
```
✅ Google Gemini client initialized
```

---

## 🎯 How It Works

**Priority Order:**
1. **Gemini 1.5 Pro** - For speech analysis (BEST MODEL! ⭐)
2. **OpenAI Whisper** - For audio transcription (best for audio)
3. **OpenAI GPT** - Fallback for analysis
4. **Python Services** - Alternative option
5. **Fallback** - Always works

**Current Setup:**
- ✅ Gemini for analysis (superior to GPT-4!)
- ✅ OpenAI Whisper for transcription (optional but recommended)
- ✅ Automatic fallback if services unavailable

---

## 💡 Why Gemini?

- 🚀 **Better reasoning** than GPT-4
- 🚀 **More context understanding**
- 🚀 **Superior analysis quality**
- 🚀 **Better at communication coaching**
- 🚀 **Free tier available** (5 prompts/day)
- 🚀 **Affordable Pro plan** ($20/month)

---

## 🔒 Security Note

**Important:** Your API key is sensitive. For production:

1. **Never commit to git** - Add `.env` to `.gitignore`
2. **Use environment variables** - Don't hardcode
3. **Set API restrictions** - In Google Cloud Console
4. **Rotate keys regularly** - For security

---

## 🧪 Test It

1. Upload an audio file
2. Check console logs - should see "Gemini" messages
3. View results - should have detailed Gemini analysis

---

## 📊 Usage Limits

**Free Tier:**
- 5 prompts per day
- 32,000-token context window

**Pro Plan ($20/month):**
- 100 prompts per day
- 1 million-token context window
- Much more!

---

**You're all set! Gemini is now your primary analysis engine!** 🎉








