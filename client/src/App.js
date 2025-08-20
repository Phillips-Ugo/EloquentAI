import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Components
import Header from './components/Header';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import TextAnalysisResults from './pages/TextAnalysisResults';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import RealTimeVideoAnalysis from './components/RealTimeVideoAnalysis';


function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
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
                    <HomePage />
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

            </Routes>
          </AnimatePresence>
        </main>
        
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2024 Eloquent AI. Built with ❤️ for better communication.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              AI-powered speech and video analysis for presentation excellence.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 