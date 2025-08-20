// Demo Images and Data for Eloquent AI Features
// This file contains sample data and visualizations for showcasing each feature

export const speechAnalysisDemo = {
  title: "Speech Analysis",
  description: "Advanced AI-powered speech recognition and analysis",
  features: [
    "Real-time transcription with 95%+ accuracy",
    "Filler word detection and analysis",
    "Speaking pace and clarity metrics",
    "Sentiment analysis and tone detection",
    "Pronunciation and articulation feedback"
  ],
  sampleData: {
    transcription: "Hello everyone, um, today I'm going to, you know, talk about our quarterly results. So, like, we've seen some really good growth in, um, our key metrics...",
    metrics: {
      clarity: 0.85,
      pace: 0.72,
      confidence: 0.78,
      engagement: 0.81
    },
    fillerWords: [
      { word: "um", count: 8, percentage: 12 },
      { word: "you know", count: 5, percentage: 7.5 },
      { word: "like", count: 3, percentage: 4.5 },
      { word: "so", count: 6, percentage: 9 }
    ],
    recommendations: [
      "Reduce filler words by 40% for more professional delivery",
      "Slow down speaking pace by 15% for better clarity",
      "Practice breathing techniques to improve confidence",
      "Use more varied vocabulary to increase engagement"
    ]
  }
};

export const videoAnalysisDemo = {
  title: "Video Analysis",
  description: "Comprehensive body language and presentation analysis",
  features: [
    "Real-time pose detection and tracking",
    "Eye contact analysis and recommendations",
    "Gesture recognition and effectiveness scoring",
    "Posture assessment and improvement tips",
    "Movement pattern analysis"
  ],
  sampleData: {
    metrics: {
      eyeContact: 0.68,
      posture: 0.82,
      gestures: 0.75,
      movement: 0.71,
      confidence: 0.79
    },
    postureAnalysis: {
      shoulders: "Good - shoulders are relaxed and open",
      spine: "Excellent - straight posture maintained",
      head: "Needs improvement - slight forward tilt detected",
      hands: "Good - natural hand positioning"
    },
    eyeContactData: [
      { time: "0-30s", percentage: 45, recommendation: "Increase eye contact" },
      { time: "30-60s", percentage: 75, recommendation: "Good engagement" },
      { time: "60-90s", percentage: 60, recommendation: "Maintain consistency" }
    ],
    recommendations: [
      "Maintain eye contact for 70% of presentation time",
      "Use more open hand gestures to appear confident",
      "Reduce fidgeting movements for professional appearance",
      "Practice power poses before presentations"
    ]
  }
};

export const detailedReportsDemo = {
  title: "Detailed Reports",
  description: "Comprehensive analytics and actionable insights",
  features: [
    "Interactive charts and visualizations",
    "Progress tracking over time",
    "Customizable report templates",
    "Export capabilities (PDF, CSV)",
    "Comparative analysis with benchmarks"
  ],
  sampleData: {
    overallScore: 0.78,
    categoryScores: [
      { category: "Speech Quality", score: 0.82, trend: "+0.05" },
      { category: "Body Language", score: 0.75, trend: "+0.08" },
      { category: "Content Structure", score: 0.71, trend: "+0.12" },
      { category: "Audience Engagement", score: 0.80, trend: "+0.03" }
    ],
    progressData: [
      { date: "Week 1", score: 0.65 },
      { date: "Week 2", score: 0.68 },
      { date: "Week 3", score: 0.72 },
      { date: "Week 4", score: 0.75 },
      { date: "Week 5", score: 0.78 }
    ],
    keyInsights: [
      "15% improvement in speaking clarity over 5 weeks",
      "Reduced filler words by 30% through targeted practice",
      "Enhanced eye contact consistency by 25%",
      "Improved posture awareness and maintenance"
    ],
    actionPlan: [
      "Continue daily speech practice exercises",
      "Focus on reducing remaining filler words",
      "Practice power poses before important presentations",
      "Schedule weekly video analysis sessions"
    ]
  }
};

export const uploadInterfaceDemo = {
  title: "Easy Upload Interface",
  description: "Simple and intuitive file upload experience",
  features: [
    "Drag & drop file upload",
    "Support for multiple formats (MP4, MP3, WAV, MOV)",
    "Real-time upload progress",
    "File validation and error handling",
    "Secure file processing"
  ],
  supportedFormats: [
    "Video: MP4, MOV, AVI, WMV",
    "Audio: MP3, WAV, M4A, FLAC",
    "Max file size: 500MB",
    "Processing time: 2-5 minutes"
  ]
};

export const realTimeAnalysisDemo = {
  title: "Real-Time Analysis",
  description: "Live feedback and instant insights",
  features: [
    "Live transcription during presentations",
    "Real-time confidence scoring",
    "Instant filler word detection",
    "Live posture and gesture feedback",
    "Immediate improvement suggestions"
  ],
  sampleLiveData: {
    currentMetrics: {
      speakingPace: "Good (150 WPM)",
      fillerWords: "2 in last 30 seconds",
      eyeContact: "75% engagement",
      posture: "Excellent"
    },
    liveRecommendations: [
      "Slight pause needed - speaking too fast",
      "Great eye contact with audience",
      "Consider using more hand gestures",
      "Posture is perfect - maintain this"
    ]
  }
};

// Chart data for visualizations
export const chartData = {
  speechMetrics: [
    { name: 'Clarity', value: 85, color: '#3B82F6' },
    { name: 'Pace', value: 72, color: '#10B981' },
    { name: 'Confidence', value: 78, color: '#F59E0B' },
    { name: 'Engagement', value: 81, color: '#8B5CF6' }
  ],
  fillerWords: [
    { name: 'um', value: 12, color: '#EF4444' },
    { name: 'you know', value: 7.5, color: '#F97316' },
    { name: 'like', value: 4.5, color: '#EAB308' },
    { name: 'so', value: 9, color: '#84CC16' }
  ],
  progressTrend: [
    { week: 'Week 1', score: 65 },
    { week: 'Week 2', score: 68 },
    { week: 'Week 3', score: 72 },
    { week: 'Week 4', score: 75 },
    { week: 'Week 5', score: 78 }
  ]
};

// Feature comparison data
export const featureComparison = {
  speechAnalysis: {
    accuracy: "95%+",
    processingTime: "2-3 minutes",
    supportedLanguages: "50+ languages",
    features: ["Transcription", "Filler Words", "Sentiment", "Pace Analysis"]
  },
  videoAnalysis: {
    accuracy: "90%+",
    processingTime: "3-5 minutes",
    supportedFormats: "All major video formats",
    features: ["Pose Detection", "Eye Contact", "Gestures", "Posture"]
  },
  detailedReports: {
    reportTypes: "5+ templates",
    exportFormats: "PDF, CSV, JSON",
    dataRetention: "Unlimited",
    features: ["Progress Tracking", "Benchmarks", "Custom Insights"]
  }
}; 