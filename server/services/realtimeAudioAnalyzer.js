/**
 * Real-Time Audio Analysis Service
 * Handles real-time audio transcription and analysis using OpenAI Whisper and Gemini
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const enhancedAIService = require('./enhancedAIService');

class RealtimeAudioAnalyzer {
  constructor() {
    this.audioBuffers = new Map(); // sessionId -> audio buffer
    this.transcriptionHistory = new Map(); // sessionId -> transcription history
    this.analysisCache = new Map(); // sessionId -> cached analysis
    this.bufferDuration = 5; // seconds of audio to buffer before transcription
    this.sampleRate = 16000; // 16kHz sample rate
    this.maxBufferSize = this.sampleRate * this.bufferDuration; // 5 seconds of audio
    this.processingQueue = new Map(); // sessionId -> processing state
  }

  /**
   * Add audio chunk to buffer and process if ready
   * @param {string} sessionId - Session identifier
   * @param {Array<number>} audioData - Audio samples (Float32Array converted to array)
   * @param {number} sampleRate - Sample rate of the audio
   */
  async addAudioChunk(sessionId, audioData, sampleRate = 16000) {
    if (!this.audioBuffers.has(sessionId)) {
      this.audioBuffers.set(sessionId, []);
      this.transcriptionHistory.set(sessionId, []);
    }

    const buffer = this.audioBuffers.get(sessionId);
    buffer.push(...audioData);

    // Resample if needed (simplified - in production use proper resampling)
    if (sampleRate !== this.sampleRate) {
      // Simple downsampling (for production, use proper resampling library)
      const ratio = sampleRate / this.sampleRate;
      const resampled = [];
      for (let i = 0; i < audioData.length; i += Math.floor(ratio)) {
        resampled.push(audioData[i]);
      }
      buffer.push(...resampled);
    }

    // Check if we have enough audio for transcription
    if (buffer.length >= this.maxBufferSize && !this.processingQueue.get(sessionId)) {
      this.processingQueue.set(sessionId, true);
      this.processAudioBuffer(sessionId).catch(error => {
        console.error(`❌ Error processing audio buffer for session ${sessionId}:`, error);
        this.processingQueue.set(sessionId, false);
      });
    }
  }

  /**
   * Process audio buffer and transcribe
   */
  async processAudioBuffer(sessionId) {
    try {
      const buffer = this.audioBuffers.get(sessionId);
      if (!buffer || buffer.length < this.sampleRate) {
        // Not enough audio yet
        this.processingQueue.set(sessionId, false);
        return;
      }

      // Extract audio chunk for transcription (last 5 seconds)
      const chunkSize = Math.min(this.maxBufferSize, buffer.length);
      const audioChunk = buffer.slice(-chunkSize);

      // Convert to WAV format and save to temp file
      const tempFilePath = await this.saveAudioToFile(audioChunk, sessionId);

      try {
        // Transcribe using OpenAI Whisper
        const transcription = await enhancedAIService.transcribeAudioWithOpenAI(tempFilePath);

        if (transcription && transcription.text) {
          // Add to transcription history
          const history = this.transcriptionHistory.get(sessionId);
          history.push({
            timestamp: Date.now(),
            text: transcription.text,
            confidence: transcription.confidence || 0.95,
            words: transcription.words || [],
            segments: transcription.segments || []
          });

          // Keep only last 20 transcriptions
          if (history.length > 20) {
            history.shift();
          }

          // Analyze speech in real-time (use cached analysis if recent)
          const analysis = await this.analyzeTranscription(sessionId, transcription);

          // Remove processed audio from buffer (keep last 1 second for overlap)
          const overlapSize = this.sampleRate; // 1 second overlap
          this.audioBuffers.set(sessionId, buffer.slice(-overlapSize));

          return {
            transcription: transcription.text,
            analysis: analysis,
            timestamp: Date.now()
          };
        }
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    } catch (error) {
      console.error(`❌ Error in processAudioBuffer for session ${sessionId}:`, error);
      throw error;
    } finally {
      this.processingQueue.set(sessionId, false);
    }
  }

  /**
   * Save audio buffer to WAV file
   */
  async saveAudioToFile(audioData, sessionId) {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `audio_${sessionId}_${Date.now()}.wav`);

    // Convert Float32Array (-1 to 1) to Int16Array (-32768 to 32767)
    const int16Data = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      int16Data[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    // Create WAV file header
    const wavHeader = this.createWavHeader(int16Data.length, this.sampleRate);
    const buffer = Buffer.concat([
      Buffer.from(wavHeader),
      Buffer.from(int16Data.buffer)
    ]);

    fs.writeFileSync(tempFilePath, buffer);
    return tempFilePath;
  }

  /**
   * Create WAV file header
   */
  createWavHeader(dataLength, sampleRate) {
    const header = Buffer.alloc(44);
    const numChannels = 1; // Mono
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = dataLength * 2; // 2 bytes per sample

    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);

    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // audio format (PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);

    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return header;
  }

  /**
   * Analyze transcription using Gemini
   */
  async analyzeTranscription(sessionId, transcription) {
    try {
      // Check cache (cache for 3 seconds)
      const cacheKey = `${sessionId}_${transcription.text.substring(0, 50)}`;
      const cached = this.analysisCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 3000) {
        return cached.analysis;
      }

      // Use Gemini for analysis
      const analysis = await enhancedAIService.analyzeSpeechWithGemini(transcription, {
        duration: transcription.duration || 5
      });

      // Cache result
      this.analysisCache.set(cacheKey, {
        analysis: analysis,
        timestamp: Date.now()
      });

      // Clean old cache entries
      if (this.analysisCache.size > 100) {
        const entries = Array.from(this.analysisCache.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        this.analysisCache.clear();
        entries.slice(0, 50).forEach(([key, value]) => {
          this.analysisCache.set(key, value);
        });
      }

      return analysis;
    } catch (error) {
      console.error(`❌ Error analyzing transcription for session ${sessionId}:`, error);
      // Return basic analysis on error
      return this.getBasicAnalysis(transcription);
    }
  }

  /**
   * Get basic analysis when AI service fails
   */
  getBasicAnalysis(transcription) {
    const text = transcription.text || '';
    const words = text.split(/\s+/);
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically'];
    const fillerCount = words.filter(w => fillerWords.includes(w.toLowerCase())).length;
    const wpm = Math.round(words.length / ((transcription.duration || 5) / 60));

    return {
      overallScore: 0.75,
      clarity_score: 0.80,
      pace_score: wpm > 180 ? 0.6 : wpm < 120 ? 0.7 : 0.85,
      sentiment_score: 0.75,
      engagement_score: 0.72,
      filler_words: { total: fillerCount },
      speaking_pace: `${wpm} WPM`,
      tone: 'neutral',
      audioMetrics: {
        word_count: words.length,
        speaking_rate: wpm,
        filler_word_count: fillerCount
      }
    };
  }

  /**
   * Calculate real-time speech metrics from audio data
   */
  calculateSpeechMetrics(audioData) {
    if (!audioData || audioData.length === 0) {
      return {
        volume: 0,
        energy: 0,
        pitch: 0,
        clarity: 0
      };
    }

    // Calculate RMS (Root Mean Square) for volume
    let sumSquares = 0;
    for (let i = 0; i < audioData.length; i++) {
      sumSquares += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sumSquares / audioData.length);
    const volume = Math.min(100, rms * 1000); // Normalize to 0-100

    // Calculate energy
    const energy = rms;

    // Simple pitch estimation (zero-crossing rate as proxy)
    let zeroCrossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0 && audioData[i - 1] < 0) || 
          (audioData[i] < 0 && audioData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / audioData.length;
    const pitch = zcr * 1000; // Rough pitch estimate

    // Clarity (based on signal-to-noise ratio approximation)
    // Higher RMS with less variation = clearer speech
    let variance = 0;
    for (let i = 0; i < audioData.length; i++) {
      variance += Math.pow(audioData[i] - rms, 2);
    }
    variance = variance / audioData.length;
    const clarity = Math.min(100, Math.max(0, 100 - (variance * 1000)));

    return {
      volume: Math.round(volume),
      energy: energy,
      pitch: Math.round(pitch),
      clarity: Math.round(clarity)
    };
  }

  /**
   * Get latest transcription for a session
   */
  getLatestTranscription(sessionId) {
    const history = this.transcriptionHistory.get(sessionId);
    if (!history || history.length === 0) {
      return null;
    }
    return history[history.length - 1];
  }

  /**
   * Get full transcription history for a session
   */
  getTranscriptionHistory(sessionId) {
    return this.transcriptionHistory.get(sessionId) || [];
  }

  /**
   * Get combined transcription text
   */
  getCombinedTranscription(sessionId) {
    const history = this.transcriptionHistory.get(sessionId);
    if (!history || history.length === 0) {
      return '';
    }
    return history.map(t => t.text).join(' ');
  }

  /**
   * Clean up session data
   */
  cleanupSession(sessionId) {
    this.audioBuffers.delete(sessionId);
    this.transcriptionHistory.delete(sessionId);
    this.processingQueue.delete(sessionId);
    
    // Clean cache entries for this session
    const keysToDelete = [];
    for (const key of this.analysisCache.keys()) {
      if (key.startsWith(sessionId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.analysisCache.delete(key));
  }
}

module.exports = new RealtimeAudioAnalyzer();

