"""
Tests for audio analysis service
"""

import pytest
import numpy as np
from unittest.mock import Mock, patch
from app.services.audio_service import AudioAnalysisService
from app.models.schemas import AudioAnalysisResponse

class TestAudioAnalysisService:
    def setup_method(self):
        self.audio_service = AudioAnalysisService()
    
    def test_initialization(self):
        """Test service initialization"""
        assert self.audio_service.device is not None
        assert self.audio_service.emotion_labels is not None
        assert self.audio_service.filler_patterns is not None
    
    def test_filler_word_detection(self):
        """Test filler word detection"""
        transcript = "Hello um this is a test like you know so basically"
        
        result = self.audio_service.detect_filler_words(transcript)
        
        assert "counts" in result
        assert "replacements" in result
        assert "positions" in result
        
        # Check that filler words were detected
        assert result["counts"]["um"] > 0
        assert result["counts"]["like"] > 0
        assert result["counts"]["so"] > 0
    
    def test_filler_replacement_generation(self):
        """Test filler word replacement suggestions"""
        replacements = {
            'um': '(pause)',
            'uh': '(pause)',
            'like': '(remove)',
            'so': 'therefore',
            'basically': 'in essence'
        }
        
        for filler, expected_replacement in replacements.items():
            result = self.audio_service.get_filler_replacement(filler)
            assert result == expected_replacement
    
    def test_words_per_minute_calculation(self):
        """Test WPM calculation"""
        transcript = "This is a test transcript with multiple words for calculation"
        duration_seconds = 60  # 1 minute
        
        wpm = self.audio_service.calculateWPM(transcript, duration_seconds)
        
        # Should be approximately 10 WPM (10 words in 1 minute)
        assert wpm == 10
    
    def test_timestamp_generation(self):
        """Test timestamp generation for events"""
        transcript = "Hello um this is like a test"
        duration = 10.0  # 10 seconds
        
        timestamps = self.audio_service.generate_timestamps(transcript, duration)
        
        assert len(timestamps) > 0
        
        # Check that filler words have timestamps
        for timestamp in timestamps:
            assert timestamp.t >= 0
            assert timestamp.t <= duration
            assert timestamp.type == "filler"
    
    @pytest.mark.asyncio
    async def test_mock_audio_analysis(self):
        """Test mock audio analysis"""
        mock_audio_content = b"mock audio data"
        filename = "test.wav"
        
        result = await self.audio_service.mock_analyze_audio(mock_audio_content, filename)
        
        assert isinstance(result, AudioAnalysisResponse)
        assert result.emotion in self.audio_service.emotion_labels
        assert isinstance(result.wpm, int)
        assert isinstance(result.probabilities, dict)
        assert isinstance(result.filler_word_counts, dict)
        assert isinstance(result.suggested_replacements, list)
        assert isinstance(result.timestamps, list)
    
    def test_audio_loading(self):
        """Test audio loading from bytes"""
        # Create mock audio data
        sample_rate = 16000
        duration = 1  # 1 second
        audio_data = np.random.randn(sample_rate * duration)
        
        # Convert to bytes (simplified)
        audio_bytes = audio_data.tobytes()
        
        with patch('soundfile.read') as mock_read:
            mock_read.return_value = (audio_data, sample_rate)
            
            result_data, result_sr = self.audio_service.load_audio(audio_bytes, "test.wav")
            
            assert np.array_equal(result_data, audio_data)
            assert result_sr == sample_rate
    
    def test_audio_resampling(self):
        """Test audio resampling"""
        original_sr = 44100
        target_sr = 16000
        duration = 1  # 1 second
        original_audio = np.random.randn(original_sr * duration)
        
        with patch('librosa.resample') as mock_resample:
            expected_length = int(len(original_audio) * target_sr / original_sr)
            mock_resample.return_value = np.random.randn(expected_length)
            
            result = self.audio_service.resample_audio(original_audio, original_sr, target_sr)
            
            assert len(result) == expected_length
    
    @pytest.mark.asyncio
    async def test_chunk_analysis(self):
        """Test audio chunk analysis for streaming"""
        chunk_content = b"mock chunk data"
        session_id = "test_session"
        chunk_index = 0
        
        with patch.object(self.audio_service, 'load_audio') as mock_load:
            mock_load.return_value = (np.random.randn(16000), 16000)  # 1 second of audio
            
            result = await self.audio_service.analyze_audio_chunk(
                chunk_content, session_id, chunk_index
            )
            
            assert result["chunk_index"] == chunk_index
            assert result["session_id"] == session_id
            assert "emotion" in result
            assert "confidence" in result
            assert "timestamp" in result
