import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Smile, 
  User, 
  Hand, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Play,
  Info
} from 'lucide-react';
import { FeedbackCard, FEEDBACK_SEVERITY_COLORS } from '@/types';
import { FEEDBACK_SEVERITY_COLORS as severityColors } from '@/lib/config';

interface FeedbackPanelProps {
  feedbackCards: FeedbackCard[];
  onDismiss: (cardId: string) => void;
  onShowExample: (cardId: string) => void;
  onJumpToTimestamp?: (timestamp: number) => void;
  className?: string;
}

const iconMap = {
  eye_contact: Eye,
  posture: User,
  smile: Smile,
  fidget: Hand,
  gesture: Hand,
};

const severityIconMap = {
  good: CheckCircle,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedbackCards,
  onDismiss,
  onShowExample,
  onJumpToTimestamp,
  className = '',
}) => {
  return (
    <div className={`w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg">Live Feedback</h3>
        <p className="text-white/80 text-sm">Real-time communication insights</p>
      </div>

      {/* Feedback Cards */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {feedbackCards.map((card) => {
            const IconComponent = iconMap[card.type] || Info;
            const SeverityIcon = severityIconMap[card.severity] || Info;
            const severityClass = severityColors[card.severity];

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className={`border-b border-gray-100 p-4 ${severityClass}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${card.severity === 'good' ? 'bg-green-100' : card.severity === 'warning' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                      <IconComponent className={`h-5 w-5 ${card.severity === 'good' ? 'text-green-600' : card.severity === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{card.title}</h4>
                      <div className="flex items-center space-x-2">
                        <SeverityIcon className={`h-4 w-4 ${card.severity === 'good' ? 'text-green-600' : card.severity === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                        <span className={`text-sm font-medium ${card.severity === 'good' ? 'text-green-700' : card.severity === 'warning' ? 'text-yellow-700' : 'text-red-700'}`}>
                          {card.severity === 'good' ? 'Good' : card.severity === 'warning' ? 'Warning' : 'Critical'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {card.dismissible && (
                    <button
                      onClick={() => onDismiss(card.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="text-gray-700 text-sm mb-3">{card.message}</p>
                
                {card.actionable_tip && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-blue-800 text-sm font-medium">💡 Tip:</p>
                    <p className="text-blue-700 text-sm">{card.actionable_tip}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {card.timestamp !== undefined && onJumpToTimestamp && (
                      <button
                        onClick={() => onJumpToTimestamp(card.timestamp!)}
                        className="flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        <span>Jump to {card.timestamp.toFixed(1)}s</span>
                      </button>
                    )}
                  </div>
                  
                  {card.show_example && (
                    <button
                      onClick={() => onShowExample(card.id)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                    >
                      Show Example
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {feedbackCards.length === 0 && (
          <div className="p-8 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No feedback available yet</p>
            <p className="text-gray-400 text-xs mt-1">Start recording to get real-time insights</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Powered by AI</span>
          <span>{feedbackCards.length} active insights</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;
