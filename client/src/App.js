import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import './styles/unified-theme.css';

// Core Pages
import ConsumerLandingPage from './pages/ConsumerLandingPage';
import PracticePage from './pages/PracticePage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AboutPage from './pages/AboutPage';

// Components
import ConsumerHeader from './components/ConsumerHeader';
import ConsumerFooter from './components/ConsumerFooter';

// Simple page wrapper for animations
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
          <ConsumerHeader />
          
          <main>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Main Routes */}
                <Route path="/" element={<PageWrapper><ConsumerLandingPage /></PageWrapper>} />
                <Route path="/practice" element={<PageWrapper><PracticePage /></PageWrapper>} />
                <Route path="/upload" element={<PageWrapper><UploadPage /></PageWrapper>} />
                <Route path="/results/:analysisId" element={<PageWrapper><ResultsPage /></PageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><AnalyticsDashboardPage /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
                
                {/* Auth Routes */}
                <Route path="/signin" element={<PageWrapper><SignInPage /></PageWrapper>} />
                <Route path="/signup" element={<PageWrapper><SignUpPage /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><SignInPage /></PageWrapper>} />
                
                {/* Legacy redirects */}
                <Route path="/realtime-analysis" element={<PageWrapper><PracticePage /></PageWrapper>} />
                <Route path="/realtime-video" element={<PageWrapper><PracticePage /></PageWrapper>} />
                <Route path="/analytics" element={<PageWrapper><AnalyticsDashboardPage /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </main>
          
          <ConsumerFooter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
