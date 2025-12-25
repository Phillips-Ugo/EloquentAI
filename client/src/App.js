import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import './styles/world-class.css';

// Components
import ConsumerLandingPage from './pages/ConsumerLandingPage';
import ConsumerHeader from './components/ConsumerHeader';
import ConsumerFooter from './components/ConsumerFooter';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import TextAnalysisResults from './pages/TextAnalysisResults';
import AboutPage from './pages/AboutPage';
import RealTimeVideoAnalysis from './components/RealTimeVideoAnalysis';
import RealtimeAnalysisPage from './pages/RealtimeAnalysisPage';
import PricingPage from './pages/PricingPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';


function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-white">
        <ConsumerHeader />
        
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ConsumerLandingPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UploadPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/results/:analysisId" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultsPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/text-results/:analysisId" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextAnalysisResults />
                  </motion.div>
                } 
              />
              <Route 
                path="/about" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AboutPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/realtime-video" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RealTimeVideoAnalysis />
                  </motion.div>
                } 
              />
              <Route 
                path="/realtime-analysis" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RealtimeAnalysisPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/pricing" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PricingPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnalyticsDashboardPage />
                  </motion.div>
                } 
              />

            </Routes>
          </AnimatePresence>
        </main>
        
        <ConsumerFooter />
      </div>
    </Router>
  );
}

export default App; 