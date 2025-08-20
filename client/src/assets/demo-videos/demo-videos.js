// Demo Videos Configuration
// This module provides paths and metadata for the interactive demo videos

export const demoVideos = {
  speechAnalysis: {
    title: "Speech Analysis Demo",
    description: "Real-time AI-powered speech recognition and analysis",
    path: "/demo-videos/speech-analysis-demo.html",
    features: [
      "Live audio waveform visualization",
      "Real-time transcription with highlighting",
      "Speaking pace and clarity metrics",
      "Filler word detection and counting",
      "Multi-language support"
    ],
    icon: "🎤",
    color: "blue"
  },
  
  videoAnalysis: {
    title: "Video Analysis Demo",
    description: "Advanced AI-powered body language and facial expression analysis",
    path: "/demo-videos/video-analysis-demo.html",
    features: [
      "Real-time pose detection overlay",
      "Facial expression analysis",
      "Eye contact duration tracking",
      "Body posture evaluation",
      "Hand gesture recognition"
    ],
    icon: "📹",
    color: "purple"
  },
  
  detailedReports: {
    title: "Detailed Reports Demo",
    description: "Comprehensive analytics and actionable insights",
    path: "/demo-videos/detailed-reports-demo.html",
    features: [
      "Interactive performance charts",
      "Progress tracking over time",
      "Personalized recommendations",
      "Export options (PDF, CSV)",
      "Goal setting and monitoring"
    ],
    icon: "📊",
    color: "green"
  }
};

// Demo video index page
export const demoIndex = {
  title: "EloquentAI - Interactive Feature Demonstrations",
  description: "Experience our AI-powered communication analysis platform",
  path: "/demo-videos/index.html"
};

// Function to open demo video in new window
export const openDemoVideo = (videoKey) => {
  const video = demoVideos[videoKey];
  if (video) {
    window.open(video.path, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  }
};

// Function to get demo video metadata
export const getDemoVideo = (videoKey) => {
  return demoVideos[videoKey] || null;
};

// Function to get all demo videos
export const getAllDemoVideos = () => {
  return Object.values(demoVideos);
};

// Demo video categories
export const demoCategories = {
  analysis: ['speechAnalysis', 'videoAnalysis'],
  reporting: ['detailedReports'],
  all: ['speechAnalysis', 'videoAnalysis', 'detailedReports']
};

// Demo video statistics
export const demoStats = {
  totalFeatures: 3,
  accuracyRate: "95%+",
  languages: "50+",
  processingTime: "2s",
  technologies: ["AI/ML", "Computer Vision", "Speech Recognition", "Real-time Analysis", "Advanced Analytics"]
};

export default demoVideos; 