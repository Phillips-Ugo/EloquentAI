# EloquentAI Audio Processing Pipeline

A production-ready audio processing pipeline that transforms your Jupyter notebook into a comprehensive speech analysis service with enhanced filler word detection, secure API key handling, and AI-powered feedback generation.

## 🚀 Features

### Enhanced Audio Analysis
- **Whisper Transcription**: High-quality speech-to-text conversion
- **Advanced Metrics**: Words per minute, pitch analysis, volume levels, energy detection
- **Enhanced Filler Word Detection**: 50+ filler words across 5 categories
- **Pause Analysis**: Detection of long pauses and speech flow issues
- **Speaking Tone Analysis**: Automatic tone classification (Excited, Monotone, Engaging, etc.)

### AI-Powered Feedback
- **OpenAI Integration**: Professional coaching feedback using GPT-3.5-turbo
- **Rule-Based Analysis**: Automated feedback based on speech metrics
- **Personalized Recommendations**: Actionable improvement suggestions
- **Strengths Identification**: Recognition of positive speaking patterns

### Multiple Input Types
- **Audio Files**: MP3, WAV, M4A, AAC, OGG, FLAC
- **Video Files**: MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V
- **Text Analysis**: Direct text input for written communication analysis
- **Real-time Ready**: Framework prepared for live analysis integration

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+ (for the main application)
- OpenAI API key

### Setup

1. **Clone the repository and navigate to the ai-services directory:**
   ```bash
   cd ai-services
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp ../env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Install Node.js dependencies (from project root):**
   ```bash
   npm install
   ```

## 🔧 Configuration

### Environment Variables
```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=8001
HOST=0.0.0.0
DEBUG=false
WHISPER_MODEL=base
```

### Filler Word Categories
The system detects filler words across 5 categories:

1. **Basic**: um, uh, er, ah, hmm, huh, oh, wow, yeah, yep, nope
2. **Conversational**: like, you know, i mean, basically, actually, literally, honestly, frankly, obviously, clearly, simply, just, sort of, kind of, type of, thing, stuff, whatever, right, okay, so, well, now, then, here, there
3. **Thinking**: let me think, i think, i guess, i suppose, maybe, perhaps, probably, possibly, definitely, certainly, absolutely, totally, completely, really, very
4. **Repetitive**: and stuff, and things, and everything, and all that, or whatever, or something, or anything, or whatever, you see, you know what i mean, if you know what i mean
5. **Professional**: in terms of, with respect to, as far as, in regards to, moving forward, going forward, at the end of the day, bottom line, long story short, to be honest, to tell you the truth

## 🚀 Usage

### Starting the Service

1. **Start the main application:**
   ```bash
   npm run dev
   ```

2. **The audio processing service will start automatically** when needed, or you can start it manually:
   ```bash
   cd ai-services
   python speech_service.py
   ```

### API Endpoints

#### Audio Analysis
```http
POST /api/analyze/audio
Content-Type: multipart/form-data

file: [audio/video file]
analysis_type: auto|speech|video
```

#### Text Analysis
```http
POST /api/analyze/text
Content-Type: application/json

{
  "text_content": "Your text to analyze...",
  "analysis_type": "text"
}
```

#### Health Check
```http
GET /api/health/speech
```

#### Filler Words List
```http
GET /api/filler-words
```

### Example Response

```json
{
  "success": true,
  "data": {
    "transcription": "Hi and welcome to this course about React.js...",
    "metrics": {
      "words_per_minute": 180.32,
      "filler_word_count": 4,
      "filler_words_used": ["um", "like", "you know"],
      "long_pauses": 0,
      "average_pitch": 115.33,
      "average_volume": 0.0283,
      "energy_level": 0.035,
      "speaking_tone": "Passionate / Loud",
      "delivery_score": 77,
      "clarity_score": 85.2,
      "engagement_score": 78.5
    },
    "feedback": {
      "rule_based": {
        "speed": "You're speaking a bit fast. Try slowing down slightly.",
        "filler_words": "You're using some filler words (4). Try to reduce them for better clarity.",
        "pauses": "Pauses are well-paced. Good rhythm!",
        "volume": "Volume is appropriate. Good projection!",
        "tone": "Good tonal variation! Your passionate / loud tone works well."
      },
      "ai_generated": "Overall, the speaker demonstrates good enthusiasm and a welcoming tone..."
    },
    "recommendations": [
      "Practice speaking at a slower pace using a metronome",
      "Record yourself and identify filler word patterns"
    ],
    "strengths": [
      "Good vocal projection",
      "Engaging speaking tone"
    ],
    "areas_for_improvement": [
      "Speaking pace - too fast",
      "Filler word usage"
    ]
  }
}
```

## 🔒 Security

### API Key Management
- **Environment Variables**: API keys stored securely in `.env` files
- **No Hardcoding**: Never commit API keys to version control
- **Validation**: Automatic validation of required environment variables

### File Handling
- **Temporary Files**: Automatic cleanup of uploaded files
- **File Validation**: Strict file type and size validation
- **Error Handling**: Comprehensive error handling and logging

## 📊 Analysis Metrics

### Speech Metrics
- **Words per Minute (WPM)**: Speaking pace analysis
- **Filler Word Count**: Enhanced detection across 5 categories
- **Pause Analysis**: Detection of long pauses (>1 second)
- **Pitch Analysis**: Average pitch and variation detection
- **Volume Analysis**: Average volume and energy levels
- **Speaking Tone**: Automatic classification of speaking style

### Scoring System
- **Delivery Score**: Overall speaking performance (0-100)
- **Clarity Score**: Based on filler words and volume (0-100)
- **Engagement Score**: Based on pitch variety and pace (0-100)

## 🛠️ Development

### Project Structure
```
ai-services/
├── audio_processor.py      # Core audio processing pipeline
├── speech_service.py       # FastAPI service
├── requirements.txt        # Python dependencies
├── README.md              # This file
└── .env                   # Environment variables (create from env.example)
```

### Adding New Filler Words
Edit the `filler_words` dictionary in `audio_processor.py`:

```python
self.filler_words = {
    'new_category': [
        'new_filler_word_1',
        'new_filler_word_2'
    ],
    # ... existing categories
}
```

### Customizing Analysis Thresholds
Modify the `thresholds` dictionary in `audio_processor.py`:

```python
self.thresholds = {
    'fast_speech': 160,        # WPM threshold for fast speech
    'slow_speech': 100,        # WPM threshold for slow speech
    'long_pause': 1.0,         # Pause duration threshold (seconds)
    'low_volume': 0.015,       # Volume threshold
    # ... other thresholds
}
```

## 🧪 Testing

### Manual Testing
1. Start the service: `python speech_service.py`
2. Visit: `http://localhost:8001/docs` for interactive API documentation
3. Test endpoints using the Swagger UI

### Test Endpoint
```http
POST /api/test
```
Returns analysis of a sample text for testing purposes.

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Ensure all required environment variables are set
2. **File Permissions**: Ensure proper read/write permissions for upload directories
3. **Process Management**: Use PM2 or similar for process management
4. **Logging**: Configure proper logging for production environments
5. **Security**: Configure CORS appropriately for production

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["python", "speech_service.py"]
```

## 📈 Performance

### Optimization Tips
- **Whisper Model**: Use smaller models (tiny, base) for faster processing
- **Batch Processing**: Process multiple files in parallel
- **Caching**: Cache transcription results for repeated analysis
- **Resource Management**: Monitor memory usage for large audio files

### Expected Performance
- **Audio Files**: 2-5 minutes processing time (depending on file size)
- **Text Analysis**: 1-2 seconds processing time
- **Memory Usage**: 1-2GB RAM for typical audio files
- **CPU Usage**: Moderate during transcription, low during analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review the logs for error messages
3. Test with the `/test` endpoint
4. Create an issue with detailed information

---

**Note**: This pipeline transforms your Jupyter notebook into a production-ready service with enhanced features, secure API key handling, and comprehensive speech analysis capabilities. 