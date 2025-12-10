# Communication Coach - Multimodal AI Assistant

A production-ready, privacy-first multimodal communication coach that analyzes speech (audio) and body & face movement (video via MediaPipe) in real-time and on uploaded media. Provides actionable, friendly, prioritized feedback to help users improve eye contact, posture, gestures, emotional expressiveness, filler-word usage, speaking rate, and smile timing.

## 🎯 Features

### Core Capabilities
- **Real-time Analysis**: Live webcam + microphone capture with MediaPipe Holistic landmarks
- **Audio Emotion Classification**: Fine-tuned wav2vec2 model for emotion detection
- **Video Heuristics**: Eye contact, posture, smile, hand gesture analysis
- **Filler Word Detection**: ASR-based transcription with smart replacements
- **Privacy-First**: Client-side processing with optional server-side analysis
- **Session Management**: History, reports, and export capabilities

### Technical Highlights
- **Frontend**: Next.js + TypeScript + TailwindCSS + Framer Motion
- **Backend**: FastAPI + PyTorch + Hugging Face Transformers
- **Real-time**: MediaPipe.js (WebAssembly) + WebAudio API
- **Database**: PostgreSQL (production) / SQLite (development)
- **Deployment**: Docker + docker-compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Docker and docker-compose (optional but recommended)

### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd communication-coach

# Start the full stack
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development
```bash
# Clone the repository
git clone <repository-url>
cd communication-coach

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## 📁 Project Structure

```
communication-coach/
├── frontend/                 # Next.js frontend application
│   ├── components/          # React components
│   ├── lib/                # Utilities and hooks
│   ├── pages/              # Next.js pages
│   └── styles/             # TailwindCSS styles
├── backend/                 # FastAPI backend
│   ├── app/                # FastAPI application
│   ├── models/             # ML models and inference
│   ├── services/           # Business logic
│   └── tests/              # Backend tests
├── docker-compose.yml      # Development environment
├── Dockerfile.frontend     # Frontend container
├── Dockerfile.backend      # Backend container
└── docs/                   # Documentation
```

## 🎮 Demo Instructions

### One-Click Demo (Frontend Only)
```bash
cd frontend
npm install
npm run dev
# Navigate to http://localhost:3000
# The app will work with mocked backend responses
```

### Full Stack Demo
```bash
docker-compose up
# Navigate to http://localhost:3000
# Full functionality with real-time analysis
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test

# E2E tests
cd frontend && npm run test:e2e
```

### Test Coverage
- **Unit Tests**: Heuristics functions, API endpoints, ML models
- **Integration Tests**: API workflows, database operations
- **E2E Tests**: Full user journeys with Playwright

## 📊 API Documentation

### Core Endpoints

#### Audio Analysis
```bash
POST /api/predict/audio
Content-Type: multipart/form-data

# Request
{
  "file": "audio.wav",
  "user_id": "optional",
  "session_id": "optional"
}

# Response
{
  "emotion": "confident",
  "probabilities": {
    "confident": 0.72,
    "neutral": 0.14,
    "anxious": 0.08,
    "excited": 0.06
  },
  "wpm": 132,
  "filler_word_counts": {"um": 3, "like": 5},
  "suggested_replacements": [
    {"position": 2, "original": "um", "suggestion": "(pause)"}
  ],
  "timestamps": [
    {"t": 2.1, "type": "filler", "word": "um"}
  ]
}
```

#### Landmark Analysis
```bash
POST /api/analyze/landmarks
Content-Type: application/json

# Request
{
  "landmarks": [
    {
      "t": 0.04,
      "face": [...],
      "pose": [...],
      "left_hand": [...],
      "right_hand": [...]
    }
  ],
  "fps": 15,
  "user_id": "optional"
}

# Response
{
  "feedback": [
    {
      "timestamp": 0.04,
      "type": "eye_contact",
      "score": 0.85,
      "message": "Good eye contact maintained",
      "severity": "good"
    }
  ],
  "aggregate_scores": {
    "posture_score": 0.78,
    "eye_contact_score": 0.85,
    "fidget_score": 0.23,
    "smile_score": 0.67
  }
}
```

## 🔬 ML Models & Training

### Audio Emotion Model
```bash
# Train the wav2vec2 emotion classifier
cd backend
python -m models.train_audio_emotion

# Export model for production
python -m models.export_model --format torchscript
```

### Datasets Used
- **RAVDESS**: 1,440 audio files, 8 emotions
- **CREMA-D**: 7,442 audio files, 6 emotions  
- **IEMOCAP**: 10,039 audio files, 4 emotions
- **MSP-Podcast**: 85,000+ audio files, continuous emotions

### Training Pipeline
1. Data preprocessing (16kHz mono, normalization)
2. Feature extraction (wav2vec2 embeddings)
3. Fine-tuning with class weighting
4. Validation with speaker-independent splits
5. Export for production inference

## 🏗️ Architecture

### Data Flow
1. **Frontend**: Captures video/audio → MediaPipe processing → Client-side heuristics
2. **Backend**: Receives aggregated data → ML inference → Structured feedback
3. **Database**: Stores sessions, predictions, and reports
4. **Storage**: S3-compatible storage for audio/video artifacts

### Privacy & Security
- **Client-side Processing**: MediaPipe + heuristics run in browser
- **Opt-in Analytics**: User controls data sharing
- **Encrypted Storage**: All artifacts encrypted at rest
- **HTTPS**: All traffic encrypted in transit

## 📈 Performance Targets

- **Real-time Feedback**: < 200ms latency for heuristics
- **Audio Inference**: < 500ms for short clips (<10s)
- **Video Processing**: 15-30 FPS landmark detection
- **Memory Usage**: < 500MB for client-side processing

## 🛠️ Development

### Common Tasks
```bash
# Start development environment
./scripts/run_dev.sh

# Train audio model
./scripts/train_audio_model.sh

# Run tests
./scripts/run_tests.sh

# Build for production
./scripts/build_production.sh
```

### Code Quality
- **Linting**: ESLint (frontend) + flake8 (backend)
- **Formatting**: Prettier (frontend) + black (backend)
- **Type Checking**: TypeScript (frontend) + mypy (backend)
- **Testing**: Jest + Playwright (frontend) + pytest (backend)

## 📋 Roadmap

### Milestone 1 (MVP) - 2-3 weeks
- [x] Repository scaffold and documentation
- [ ] Live webcam + MediaPipe overlay
- [ ] Audio upload + emotion inference
- [ ] Basic feedback panel (3+ feedback types)
- [ ] Docker development environment

### Milestone 2 (v1) - 1-2 weeks  
- [ ] ASR integration for filler word detection
- [ ] Session history + CSV export
- [ ] Unit tests for heuristics
- [ ] API integration tests

### Milestone 3 (v2) - Future
- [ ] Multimodal fusion model
- [ ] PDF report generation
- [ ] User authentication
- [ ] Cloud deployment scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MediaPipe team for the excellent browser-based ML framework
- Hugging Face for the transformers library
- The open-source community for the datasets and tools used

## 📞 Support

For questions, issues, or contributions, please:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Review the [FAQ](docs/FAQ.md)

---

**Built with ❤️ for better communication**