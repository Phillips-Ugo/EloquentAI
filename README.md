# EloquentAI - AI-Powered Communication Analysis Platform

EloquentAI is a comprehensive platform that provides real-time analysis of communication skills through speech, video, and text analysis. It offers AI-powered feedback to help users improve their presentation and communication abilities.

## 🚀 Features

- **Real-time Video Analysis**: Analyzes posture, eye contact, gestures, and movement
- **Speech Analysis**: Evaluates clarity, pace, tone, and speech patterns
- **Text Analysis**: Provides feedback on content structure and language use
- **AI-Powered Feedback**: Uses OpenAI GPT for intelligent, contextual feedback
- **Modern Web Interface**: React-based frontend with real-time updates
- **Microservices Architecture**: Scalable backend with separate services

## 🏗️ Project Structure

```
EloquentAI/
├── client/                 # React frontend application
├── server/                 # Node.js backend server
├── ai-services/           # Python AI analysis services
├── speech-service/        # Speech processing microservice
├── video-service/         # Video processing microservice
├── backend/              # Java backend (alternative)
├── package.json          # Main project configuration
└── README.md            # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **Multer** - File upload handling

### AI Services
- **Python 3.10+** - AI/ML processing
- **OpenCV** - Computer vision
- **MediaPipe** - Pose detection
- **OpenAI GPT** - Natural language processing
- **Librosa** - Audio analysis

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **Python** 3.10 or higher
- **npm** 8.0.0 or higher
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EloquentAI
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install Python dependencies
cd ai-services
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup
```bash
# Copy environment example
cp environment.example .env

# Edit .env with your configuration
# Add your OpenAI API key and other settings
```

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run server    # Backend only
npm run client    # Frontend only
```

### 5. Deploy to Vercel (Production)

See [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set root directory to `client`
4. Add environment variables
5. Deploy!

**Backend Deployment:**
- Deploy server separately on Railway or Render
- Update `REACT_APP_API_URL` in Vercel
- Update `REACT_APP_WS_URL` in Vercel

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **WebSocket**: ws://localhost:8765

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration (if using)
DATABASE_URL=your_database_url

# File Upload Configuration
MAX_FILE_SIZE=100mb
UPLOAD_PATH=./uploads
```

### AI Services Configuration
The AI services can be configured in `ai-services/env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANALYSIS_MODE=realtime
LOG_LEVEL=INFO
```

## 📊 API Endpoints

### Main API (Port 5001)
- `GET /api/health` - Health check
- `POST /api/upload` - File upload
- `POST /api/analysis/:id` - Start analysis
- `GET /api/analysis/:id/status` - Analysis status
- `GET /api/analysis/:id/results` - Analysis results

### WebSocket (Port 8765)
- Real-time communication for live analysis
- Supports video streaming and real-time feedback

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
cd client && npm test

# Backend tests
npm test

# AI services tests
cd ai-services
python -m pytest tests/
```

### Manual Testing
```bash
# Test video analysis
python ai-services/test_video_analyzer.py

# Test speech analysis
python ai-services/test_audio_analyzer.py

# Test integration
python ai-services/test_enhanced_system.py
```

## 🐳 Docker Support

### Using Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Start specific services
docker-compose up server
docker-compose up ai-services
```

### Individual Docker Images
```bash
# Build frontend
docker build -t eloquent-ai-frontend ./client

# Build backend
docker build -t eloquent-ai-backend ./server

# Build AI services
docker build -t eloquent-ai-services ./ai-services
```

## 📈 Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis with webpack-bundle-analyzer

### Backend
- Caching with Redis
- Database connection pooling
- File upload streaming

### AI Services
- Model caching
- Batch processing
- GPU acceleration (if available)

## 🔒 Security

- Input validation and sanitization
- Rate limiting
- CORS configuration
- Environment variable protection
- File upload restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the troubleshooting guide

## 🔄 Version History

- **v2.0.0** - Major refactor with microservices architecture
- **v1.5.0** - Added real-time analysis capabilities
- **v1.0.0** - Initial release with basic analysis features

## 🙏 Acknowledgments

- OpenAI for GPT integration
- MediaPipe for pose detection
- React and Node.js communities
- All contributors and testers 