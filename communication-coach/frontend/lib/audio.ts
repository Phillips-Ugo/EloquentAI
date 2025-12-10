import { AudioAnalysisResult, Replacement, Timestamp } from '@/types';

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isRecording = false;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      console.log('✅ Audio context initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      throw error;
    }
  }

  /**
   * Start audio recording from microphone
   */
  public async startRecording(): Promise<MediaStream> {
    if (!this.audioContext || !this.analyser) {
      throw new Error('Audio context not initialized');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      this.isRecording = true;

      console.log('✅ Audio recording started');
      return stream;
    } catch (error) {
      console.error('❌ Failed to start audio recording:', error);
      throw error;
    }
  }

  /**
   * Stop audio recording
   */
  public stopRecording(): void {
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    this.isRecording = false;
    console.log('✅ Audio recording stopped');
  }

  /**
   * Get current audio level (0-1)
   */
  public getAudioLevel(): number {
    if (!this.analyser || !this.dataArray || !this.isRecording) {
      return 0;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    return average / 255; // Normalize to 0-1
  }

  /**
   * Get audio frequency data for visualization
   */
  public getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(0);
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  /**
   * Process audio file for analysis
   */
  public async processAudioFile(file: File): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Convert to mono 16kHz if needed
      const processedBuffer = await this.resampleToTarget(audioBuffer, 16000, 1);
      
      console.log('✅ Audio file processed:', {
        duration: processedBuffer.duration,
        sampleRate: processedBuffer.sampleRate,
        channels: processedBuffer.numberOfChannels,
      });

      return processedBuffer;
    } catch (error) {
      console.error('❌ Failed to process audio file:', error);
      throw error;
    }
  }

  /**
   * Resample audio to target sample rate and channels
   */
  private async resampleToTarget(
    audioBuffer: AudioBuffer, 
    targetSampleRate: number, 
    targetChannels: number
  ): Promise<AudioBuffer> {
    if (this.audioContext === null) {
      throw new Error('Audio context not available');
    }

    const { sampleRate, numberOfChannels, length } = audioBuffer;

    // If already at target format, return as-is
    if (sampleRate === targetSampleRate && numberOfChannels === targetChannels) {
      return audioBuffer;
    }

    // Create offline context for resampling
    const offlineContext = new OfflineAudioContext(
      targetChannels,
      Math.ceil((length * targetSampleRate) / sampleRate),
      targetSampleRate
    );

    // Create buffer source
    const bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = audioBuffer;

    // Convert to mono if needed
    if (targetChannels === 1 && numberOfChannels > 1) {
      const merger = offlineContext.createChannelMerger(targetChannels);
      bufferSource.connect(merger);
      merger.connect(offlineContext.destination);
    } else {
      bufferSource.connect(offlineContext.destination);
    }

    bufferSource.start();
    return await offlineContext.startRendering();
  }

  /**
   * Extract audio features for analysis
   */
  public extractAudioFeatures(audioBuffer: AudioBuffer): {
    rms: number;
    zeroCrossingRate: number;
    spectralCentroid: number;
    mfcc: number[];
  } {
    const { channelData, sampleRate, length } = audioBuffer;
    const audioData = channelData[0]; // Use first channel

    // RMS (Root Mean Square) - energy
    const rms = Math.sqrt(
      audioData.reduce((sum, sample) => sum + sample * sample, 0) / length
    );

    // Zero Crossing Rate
    let zeroCrossings = 0;
    for (let i = 1; i < length; i++) {
      if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / length;

    // Spectral Centroid (simplified)
    const spectralCentroid = this.calculateSpectralCentroid(audioData, sampleRate);

    // MFCC (simplified - just basic features)
    const mfcc = this.calculateSimpleMFCC(audioData, sampleRate);

    return {
      rms,
      zeroCrossingRate,
      spectralCentroid,
      mfcc,
    };
  }

  /**
   * Calculate spectral centroid
   */
  private calculateSpectralCentroid(audioData: Float32Array, sampleRate: number): number {
    // Simplified spectral centroid calculation
    const fftSize = 1024;
    const hopSize = 512;
    let totalCentroid = 0;
    let frameCount = 0;

    for (let i = 0; i < audioData.length - fftSize; i += hopSize) {
      const frame = audioData.slice(i, i + fftSize);
      const windowedFrame = this.applyHannWindow(frame);
      
      // Simple magnitude spectrum
      const magnitudes = new Array(fftSize / 2);
      for (let j = 0; j < fftSize / 2; j++) {
        magnitudes[j] = Math.abs(windowedFrame[j]);
      }

      // Calculate centroid
      let weightedSum = 0;
      let magnitudeSum = 0;
      for (let j = 0; j < magnitudes.length; j++) {
        const frequency = (j * sampleRate) / fftSize;
        weightedSum += frequency * magnitudes[j];
        magnitudeSum += magnitudes[j];
      }

      if (magnitudeSum > 0) {
        totalCentroid += weightedSum / magnitudeSum;
        frameCount++;
      }
    }

    return frameCount > 0 ? totalCentroid / frameCount : 0;
  }

  /**
   * Calculate simple MFCC-like features
   */
  private calculateSimpleMFCC(audioData: Float32Array, sampleRate: number): number[] {
    const fftSize = 1024;
    const hopSize = 512;
    const numCoeffs = 13;
    const features = new Array(numCoeffs).fill(0);
    let frameCount = 0;

    for (let i = 0; i < audioData.length - fftSize; i += hopSize) {
      const frame = audioData.slice(i, i + fftSize);
      const windowedFrame = this.applyHannWindow(frame);
      
      // Simple spectral features
      const magnitudes = new Array(fftSize / 2);
      for (let j = 0; j < fftSize / 2; j++) {
        magnitudes[j] = Math.abs(windowedFrame[j]);
      }

      // Calculate mel-scale features (simplified)
      for (let coeff = 0; coeff < numCoeffs; coeff++) {
        let sum = 0;
        for (let j = 0; j < magnitudes.length; j++) {
          const melBin = this.hzToMel((j * sampleRate) / fftSize);
          const weight = Math.exp(-Math.pow((melBin - coeff * 100) / 200, 2));
          sum += magnitudes[j] * weight;
        }
        features[coeff] += Math.log(sum + 1e-10);
      }
      frameCount++;
    }

    // Average over frames
    return features.map(f => f / frameCount);
  }

  /**
   * Apply Hann window to audio frame
   */
  private applyHannWindow(frame: Float32Array): Float32Array {
    const windowed = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
      const windowValue = 0.5 * (1 - Math.cos(2 * Math.PI * i / (frame.length - 1)));
      windowed[i] = frame[i] * windowValue;
    }
    return windowed;
  }

  /**
   * Convert Hz to Mel scale
   */
  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  /**
   * Detect filler words in transcript
   */
  public detectFillerWords(transcript: string): {
    fillerWordCounts: Record<string, number>;
    suggestedReplacements: Replacement[];
    timestamps: Timestamp[];
  } {
    const fillerPatterns = {
      'um': /\b(um|uh)\b/gi,
      'like': /\b(like|you know)\b/gi,
      'so': /\b(so|basically)\b/gi,
      'well': /\b(well|actually)\b/gi,
    };

    const fillerWordCounts: Record<string, number> = {};
    const suggestedReplacements: Replacement[] = [];
    const timestamps: Timestamp[] = [];

    let position = 0;
    Object.entries(fillerPatterns).forEach(([filler, pattern]) => {
      let match;
      let count = 0;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(transcript)) !== null) {
        count++;
        
        // Create replacement suggestion
        const replacement = this.getFillerReplacement(filler);
        if (replacement) {
          suggestedReplacements.push({
            position: match.index,
            original: match[0],
            suggestion: replacement,
          });
        }

        // Create timestamp (approximate)
        timestamps.push({
          t: this.estimateTimestamp(match.index, transcript),
          type: 'filler',
          word: match[0],
        });
      }

      if (count > 0) {
        fillerWordCounts[filler] = count;
      }
    });

    return {
      fillerWordCounts,
      suggestedReplacements,
      timestamps,
    };
  }

  /**
   * Get replacement for filler word
   */
  private getFillerReplacement(filler: string): string {
    const replacements: Record<string, string> = {
      'um': '(pause)',
      'uh': '(pause)',
      'like': '(remove)',
      'you know': '(remove)',
      'so': 'therefore',
      'basically': 'in essence',
      'well': '(remove)',
      'actually': '(remove)',
    };
    return replacements[filler] || '(remove)';
  }

  /**
   * Estimate timestamp for word position in transcript
   */
  private estimateTimestamp(position: number, transcript: string): number {
    // Rough estimate: 150 words per minute average
    const wordsPerSecond = 150 / 60; // 2.5 words per second
    const charactersPerWord = 5; // Average word length
    const estimatedWords = position / charactersPerWord;
    return estimatedWords / wordsPerSecond;
  }

  /**
   * Calculate words per minute from transcript and duration
   */
  public calculateWPM(transcript: string, durationSeconds: number): number {
    const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
    const minutes = durationSeconds / 60;
    return minutes > 0 ? words.length / minutes : 0;
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopRecording();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

export default AudioProcessor;
