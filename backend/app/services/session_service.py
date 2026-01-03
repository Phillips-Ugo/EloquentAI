"""
Session management service - stores and retrieves real session data
"""

import logging
import base64
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from pathlib import Path
import io

from app.models.schemas import SessionSummary
from app.core.config import settings

logger = logging.getLogger(__name__)

# Session data storage path
SESSIONS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "server" / "sessions"
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

class SessionService:
    def __init__(self):
        self.sessions = {}  # In-memory cache
        self._load_existing_sessions()
    
    def _load_existing_sessions(self):
        """Load existing session data from disk"""
        try:
            for session_file in SESSIONS_DIR.glob("*.json"):
                try:
                    with open(session_file, 'r') as f:
                        data = json.load(f)
                        session_id = session_file.stem
                        self.sessions[session_id] = data
                except Exception as e:
                    logger.warning(f"Could not load session {session_file}: {e}")
        except Exception as e:
            logger.error(f"Error loading sessions: {e}")
    
    def store_analysis_result(self, session_id: str, analysis_type: str, data: Dict[str, Any]):
        """Store an analysis result for a session"""
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                'session_id': session_id,
                'created_at': datetime.now().isoformat(),
                'analyses': [],
                'scores': {},
                'transcriptions': [],
                'feedback': []
            }
        
        # Add analysis result
        self.sessions[session_id]['analyses'].append({
            'timestamp': datetime.now().isoformat(),
            'type': analysis_type,
            'data': data
        })
        
        # Update aggregate scores
        if 'scores' in data:
            for key, value in data['scores'].items():
                if key not in self.sessions[session_id]['scores']:
                    self.sessions[session_id]['scores'][key] = []
                self.sessions[session_id]['scores'][key].append(value)
        
        # Store transcriptions
        if 'transcription' in data and data['transcription']:
            self.sessions[session_id]['transcriptions'].append(data['transcription'])
        
        # Save to disk
        self._save_session(session_id)
    
    def _save_session(self, session_id: str):
        """Save session data to disk"""
        try:
            session_file = SESSIONS_DIR / f"{session_id}.json"
            with open(session_file, 'w') as f:
                json.dump(self.sessions[session_id], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save session {session_id}: {e}")
    
    async def generate_session_summary(
        self, 
        session_id: str,
        include_recommendations: bool = True
    ) -> SessionSummary:
        """Generate a comprehensive session summary from real data"""
        try:
            session_data = self.sessions.get(session_id)
            
            if not session_data:
                # Try loading from disk
                session_file = SESSIONS_DIR / f"{session_id}.json"
                if session_file.exists():
                    with open(session_file, 'r') as f:
                        session_data = json.load(f)
                        self.sessions[session_id] = session_data
            
            if not session_data:
                logger.warning(f"No data found for session {session_id}")
                return SessionSummary(
                    overall_score=0.0,
                    duration=0.0,
                    key_insights=["No session data available"],
                    recommendations=["Start a new analysis session to get feedback"]
                )
            
            # Calculate duration from analyses
            analyses = session_data.get('analyses', [])
            if analyses:
                first_time = datetime.fromisoformat(analyses[0]['timestamp'])
                last_time = datetime.fromisoformat(analyses[-1]['timestamp'])
                duration = (last_time - first_time).total_seconds()
            else:
                duration = 0.0
            
            # Calculate average scores from stored data
            scores = session_data.get('scores', {})
            avg_scores = {}
            for key, values in scores.items():
                if values:
                    avg_scores[key] = sum(values) / len(values)
            
            # Calculate overall score
            if avg_scores:
                overall_score = sum(avg_scores.values()) / len(avg_scores)
            else:
                overall_score = 0.0
            
            # Generate insights from real data
            key_insights = self._generate_insights(avg_scores, session_data)
            
            # Generate recommendations
            recommendations = []
            if include_recommendations:
                recommendations = self._generate_recommendations(avg_scores, session_data)
            
            return SessionSummary(
                overall_score=overall_score,
                duration=duration,
                key_insights=key_insights,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Failed to generate session summary: {e}")
            raise
    
    def _generate_insights(self, avg_scores: Dict[str, float], session_data: Dict) -> List[str]:
        """Generate insights from real session data"""
        insights = []
        
        # Eye contact insight
        eye_contact = avg_scores.get('eye_contact', avg_scores.get('eyeContact', 0))
        if eye_contact >= 0.7:
            insights.append(f"Good eye contact maintained ({eye_contact:.0%})")
        elif eye_contact >= 0.5:
            insights.append(f"Moderate eye contact ({eye_contact:.0%}) - room for improvement")
        elif eye_contact > 0:
            insights.append(f"Eye contact needs work ({eye_contact:.0%})")
        
        # Posture insight
        posture = avg_scores.get('posture', 0)
        if posture >= 0.7:
            insights.append(f"Excellent posture maintained ({posture:.0%})")
        elif posture >= 0.5:
            insights.append(f"Posture is adequate ({posture:.0%})")
        elif posture > 0:
            insights.append(f"Posture needs improvement ({posture:.0%})")
        
        # Speech clarity insight
        clarity = avg_scores.get('clarity', avg_scores.get('speechClarity', 0))
        if clarity >= 0.7:
            insights.append(f"Clear and articulate speech ({clarity:.0%})")
        elif clarity >= 0.5:
            insights.append(f"Speech clarity is moderate ({clarity:.0%})")
        elif clarity > 0:
            insights.append(f"Speech clarity needs work ({clarity:.0%})")
        
        # Gesture insight
        gesture = avg_scores.get('gesture', avg_scores.get('gestures', 0))
        if gesture >= 0.6:
            insights.append(f"Good use of gestures ({gesture:.0%})")
        elif gesture > 0:
            insights.append(f"Consider using more expressive gestures ({gesture:.0%})")
        
        # Transcription insight
        transcriptions = session_data.get('transcriptions', [])
        if transcriptions:
            total_words = sum(len(t.split()) for t in transcriptions if t)
            insights.append(f"Total words transcribed: {total_words}")
        
        if not insights:
            insights.append("Start speaking to see your analysis results")
        
        return insights
    
    def _generate_recommendations(self, avg_scores: Dict[str, float], session_data: Dict) -> List[str]:
        """Generate recommendations based on real performance data"""
        recommendations = []
        
        # Find weakest areas
        if not avg_scores:
            return ["Complete a full analysis session to receive personalized recommendations"]
        
        # Sort by score (lowest first)
        sorted_scores = sorted(avg_scores.items(), key=lambda x: x[1])
        
        # Recommendations for weakest areas
        for metric, score in sorted_scores[:3]:  # Top 3 areas to improve
            if score < 0.7:
                if metric in ['eye_contact', 'eyeContact']:
                    recommendations.append("Practice looking directly at the camera to improve eye contact")
                elif metric == 'posture':
                    recommendations.append("Focus on sitting/standing straight with shoulders back")
                elif metric in ['clarity', 'speechClarity']:
                    recommendations.append("Speak more slowly and enunciate each word clearly")
                elif metric in ['gesture', 'gestures']:
                    recommendations.append("Use purposeful hand movements to emphasize key points")
                elif metric == 'volume':
                    recommendations.append("Project your voice more - speak from your diaphragm")
                elif metric == 'pace':
                    recommendations.append("Vary your speaking pace to maintain audience engagement")
        
        if not recommendations:
            recommendations.append("Great job! Continue practicing to maintain your skills")
        
        return recommendations
    
    async def generate_pdf_report(
        self, 
        session_id: str, 
        summary: SessionSummary
    ) -> str:
        """Generate PDF report for session using real data"""
        try:
            # Get session data for detailed report
            session_data = self.sessions.get(session_id, {})
            scores = session_data.get('scores', {})
            
            # Calculate average scores
            avg_scores = {}
            for key, values in scores.items():
                if values:
                    avg_scores[key] = sum(values) / len(values)
            
            report_content = f"""
╔════════════════════════════════════════════════════════════════════╗
║            ELOQUENT AI - COMMUNICATION ANALYSIS REPORT             ║
╚════════════════════════════════════════════════════════════════════╝

Session ID: {session_id}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY
═══════
Overall Score: {summary.overall_score:.1%}
Duration: {summary.duration:.1f} seconds ({summary.duration/60:.1f} minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY INSIGHTS
════════════
"""
            
            for i, insight in enumerate(summary.key_insights, 1):
                report_content += f"  {i}. {insight}\n"
            
            if summary.recommendations:
                report_content += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                report_content += "RECOMMENDATIONS\n═══════════════\n"
                for i, rec in enumerate(summary.recommendations, 1):
                    report_content += f"  {i}. {rec}\n"
            
            report_content += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            report_content += "DETAILED ANALYSIS\n═════════════════\n"
            
            # Add real scores from session data
            score_labels = {
                'eye_contact': 'Eye Contact',
                'eyeContact': 'Eye Contact',
                'posture': 'Posture',
                'gesture': 'Gestures',
                'gestures': 'Gestures',
                'clarity': 'Speech Clarity',
                'speechClarity': 'Speech Clarity',
                'volume': 'Volume',
                'pace': 'Speaking Pace',
                'emotion': 'Emotional Expression'
            }
            
            for key, value in avg_scores.items():
                label = score_labels.get(key, key.title())
                report_content += f"  • {label}: {value:.0%}\n"
            
            if not avg_scores:
                report_content += "  No detailed metrics available\n"
            
            report_content += f"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by Eloquent AI - Your Personal Communication Coach
https://eloquentai.com

"""
            
            # Convert to base64
            report_bytes = report_content.encode('utf-8')
            pdf_base64 = base64.b64encode(report_bytes).decode('utf-8')
            
            logger.info(f"Generated report for session {session_id}")
            return pdf_base64
            
        except Exception as e:
            logger.error(f"Failed to generate PDF report: {e}")
            raise
    
    async def get_session_history(self, session_id: str) -> Dict[str, Any]:
        """Get detailed session history from real data"""
        try:
            session_data = self.sessions.get(session_id)
            
            if not session_data:
                # Try loading from disk
                session_file = SESSIONS_DIR / f"{session_id}.json"
                if session_file.exists():
                    with open(session_file, 'r') as f:
                        session_data = json.load(f)
                        self.sessions[session_id] = session_data
            
            if not session_data:
                return {
                    "session_id": session_id,
                    "error": "Session not found",
                    "analyses": [],
                    "aggregate_scores": {}
                }
            
            # Calculate aggregate scores
            scores = session_data.get('scores', {})
            aggregate_scores = {}
            for key, values in scores.items():
                if values:
                    aggregate_scores[key] = sum(values) / len(values)
            
            # Calculate overall
            if aggregate_scores:
                aggregate_scores['overall'] = sum(aggregate_scores.values()) / len(aggregate_scores)
            
            # Calculate duration
            analyses = session_data.get('analyses', [])
            if analyses:
                first_time = datetime.fromisoformat(analyses[0]['timestamp'])
                last_time = datetime.fromisoformat(analyses[-1]['timestamp'])
                duration = (last_time - first_time).total_seconds()
            else:
                duration = 0.0
            
            history = {
                "session_id": session_id,
                "started_at": session_data.get('created_at', datetime.now().isoformat()),
                "ended_at": analyses[-1]['timestamp'] if analyses else datetime.now().isoformat(),
                "duration": duration,
                "analyses": analyses[-20:],  # Last 20 analyses
                "aggregate_scores": aggregate_scores,
                "transcriptions": session_data.get('transcriptions', [])[-10:]  # Last 10 transcriptions
            }
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get session history: {e}")
            raise
    
    async def delete_session(self, session_id: str) -> None:
        """Delete session and all associated data"""
        try:
            # Remove from memory
            if session_id in self.sessions:
                del self.sessions[session_id]
            
            # Remove from disk
            session_file = SESSIONS_DIR / f"{session_id}.json"
            if session_file.exists():
                os.unlink(session_file)
            
            logger.info(f"Deleted session {session_id}")
        except Exception as e:
            logger.error(f"Failed to delete session: {e}")
            raise
