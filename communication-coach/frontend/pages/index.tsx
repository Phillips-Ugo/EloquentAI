import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import CameraCapture from '@/components/CameraCapture';
import FeedbackPanel from '@/components/FeedbackPanel';
import { FeedbackCard, LandmarkData, Session } from '@/types';
import { getApiClient } from '@/lib/api';

const HomePage: React.FC = () => {
  const [feedbackCards, setFeedbackCards] = useState<FeedbackCard[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [landmarksHistory, setLandmarksHistory] = useState<LandmarkData[]>([]);
  const [apiClient] = useState(() => getApiClient());

  // Handle feedback updates from camera component
  const handleFeedbackUpdate = useCallback((feedback: FeedbackCard[]) => {
    setFeedbackCards(feedback);
  }, []);

  // Handle landmarks updates
  const handleLandmarksUpdate = useCallback((landmarks: LandmarkData) => {
    setLandmarksHistory(prev => {
      const updated = [...prev, landmarks];
      // Keep only last 100 landmarks for performance
      return updated.slice(-100);
    });
  }, []);

  // Dismiss feedback card
  const handleDismissCard = useCallback((cardId: string) => {
    setFeedbackCards(prev => prev.filter(card => card.id !== cardId));
  }, []);

  // Show example for feedback card
  const handleShowExample = useCallback((cardId: string) => {
    const card = feedbackCards.find(c => c.id === cardId);
    if (card) {
      // In a real implementation, this would show a video example
      alert(`Showing example for: ${card.title}`);
    }
  }, [feedbackCards]);

  // Jump to timestamp in video
  const handleJumpToTimestamp = useCallback((timestamp: number) => {
    // In a real implementation, this would scrub the video timeline
    console.log(`Jumping to timestamp: ${timestamp}s`);
  }, []);

  // Start new session
  const startNewSession = useCallback(() => {
    const newSession: Session = {
      id: `session_${Date.now()}`,
      started_at: new Date().toISOString(),
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        camera_available: true, // This would be checked properly
        microphone_available: true,
        webgl_support: true,
        mediapipe_support: true,
      },
      privacy_opt_in: false,
    };
    setCurrentSession(newSession);
    setLandmarksHistory([]);
    setFeedbackCards([]);
  }, []);

  // Finalize session and generate report
  const finalizeSession = useCallback(async () => {
    if (!currentSession || landmarksHistory.length === 0) {
      alert('No session data to finalize');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Send landmarks to backend for analysis
      const landmarkAnalysis = await apiClient.analyzeLandmarks({
        landmarks: landmarksHistory,
        fps: 30,
        user_id: currentSession.user_id,
      });

      // Finalize session
      const finalizeResponse = await apiClient.finalizeSession({
        session_id: currentSession.id,
        summary_requested: true,
      });

      // Update session with results
      setCurrentSession(prev => prev ? {
        ...prev,
        ended_at: new Date().toISOString(),
        analysis_results: {
          landmarks: landmarkAnalysis,
        },
      } : null);

      // Show summary
      if (finalizeResponse.summary) {
        const { overall_score, key_insights, recommendations } = finalizeResponse.summary;
        alert(`Session Complete!\n\nOverall Score: ${Math.round(overall_score * 100)}%\n\nKey Insights:\n${key_insights.join('\n')}\n\nRecommendations:\n${recommendations.join('\n')}`);
      }

      console.log('✅ Session finalized successfully');
    } catch (error) {
      console.error('❌ Failed to finalize session:', error);
      alert('Failed to finalize session. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentSession, landmarksHistory, apiClient]);

  // Initialize session on mount
  useEffect(() => {
    startNewSession();
  }, [startNewSession]);

  return (
    <>
      <Head>
        <title>Communication Coach - AI-Powered Communication Analysis</title>
        <meta name="description" content="Real-time communication coaching with AI-powered feedback on eye contact, posture, speech, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Communication Coach</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {currentSession && (
                  <div className="text-sm text-gray-600">
                    Session: {currentSession.id.slice(-8)}
                  </div>
                )}
                <button
                  onClick={startNewSession}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  New Session
                </button>
                <button
                  onClick={finalizeSession}
                  disabled={isAnalyzing || !currentSession || landmarksHistory.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Finalize Session'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                AI-Powered Communication Coach
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl mb-8 text-emerald-100"
              >
                Real-time feedback on eye contact, posture, gestures, and speech patterns
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={startNewSession}
                  className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  🎯 Start New Session
                </button>
                <button
                  onClick={() => alert('Demo video coming soon!')}
                  className="px-8 py-4 bg-emerald-600/20 text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-emerald-600/30 transition-all duration-200"
                >
                  📹 Watch Demo
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Camera Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">🎥 Live Analysis</h2>
                  <p className="text-gray-600 text-lg">
                    Get real-time feedback on your communication skills including eye contact, posture, gestures, and speech patterns.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <CameraCapture
                    onFeedbackUpdate={handleFeedbackUpdate}
                    onLandmarksUpdate={handleLandmarksUpdate}
                    className="aspect-video"
                  />
                </div>
              </motion.div>
            </div>

            {/* Feedback Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Real-time Feedback</h3>
                  <FeedbackPanel
                    feedbackCards={feedbackCards}
                    onDismiss={handleDismissCard}
                    onShowExample={handleShowExample}
                    onJumpToTimestamp={handleJumpToTimestamp}
                    className="sticky top-24"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">📊 Session Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Landmarks Processed</p>
                    <p className="text-2xl font-bold text-gray-900">{landmarksHistory.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Insights</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackCards.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-lg">💡</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Session Duration</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentSession ? Math.round((Date.now() - new Date(currentSession.started_at).getTime()) / 1000) : 0}s
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">⏱️</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-lg border border-yellow-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Privacy Mode</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentSession?.privacy_opt_in ? '🔒' : '🌐'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-lg">🛡️</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                Built with ❤️ for better communication. Powered by MediaPipe, TensorFlow.js, and AI.
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Privacy-first: All processing happens locally in your browser unless you opt-in to cloud analysis.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default HomePage;