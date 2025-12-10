import React, { lazy, Suspense } from 'react';

const AdvancedRealTimeAnalysis = lazy(() => import('../components/AdvancedRealTimeAnalysis'));

const RealtimeAnalysisPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Real-Time Analysis...</p>
          </div>
        </div>
      }>
        <AdvancedRealTimeAnalysis />
      </Suspense>
    </div>
  );
};

export default RealtimeAnalysisPage;



