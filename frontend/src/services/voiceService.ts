/**
 * Voice Service for Bhashini ASR/TTS Integration
 * Handles speech recognition, text-to-speech, and voice interface management
 */

import axios from 'axios';

export interface VoiceConfig {
  language: string;
  voiceGender: 'male' | 'female';
  audioFormat: 'wav' | 'mp3' | 'ogg';
  noiseReduction: boolean;
  autoStop: boolean;
  maxDuration: number; // seconds
}

export interface ASRResult {
  success: boolean;
  transcription: string;
  confidence: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
  language: string;
  processingTime?: number;
  error?: string;
  fallback?: boolean;
}

export interface TTSResult {
  success: boolean;
  audioData?: ArrayBuffer;
  audioBase64?: string;
  text: string;
  language: string;
  duration?: number;
  processingTime?: number;
  error?: string;
  fallback?: boolean;
}

export interface VoiceProcessResult {
  success: boolean;
  transcription?: string;
  confidence?: number;
  intent?: {
    intent: string;
    confidence: number;
    entities: Record<string, any>;
  };
  responseText?: string;
  responseAudio?: ArrayBuffer;
  processingTime?: number;
  error?: string;
  fallbackMessage?: string;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  alternatives?: Array<{
    language: string;
    confidence: number;
  }>;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

class VoiceService {
  private baseURL: string;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private noiseGate: number = 0.01; // Noise gate threshold
  private silenceTimeout: NodeJS.Timeout | null = null;
  private recordingTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  /**
   * Initialize audio context and check browser support
   */
  async initialize(): Promise<boolean> {
    try {
      // Check for required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Media devices not supported');
        return false;
      }

      if (!window.MediaRecorder) {
        console.error('MediaRecorder not supported');
        return false;
      }

      // Initialize audio context for noise analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      return true;
    } catch (error) {
      console.error('Voice service initialization failed:', error);
      return false;
    }
  }

  /**
   * Get microphone permission and setup audio stream
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      // Test the stream and then stop it
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(config: Partial<VoiceConfig> = {}): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return false;
      }

      const defaultConfig: VoiceConfig = {
        language: 'hi',
        voiceGender: 'female',
        audioFormat: 'wav',
        noiseReduction: true,
        autoStop: true,
        maxDuration: 30
      };

      const finalConfig = { ...defaultConfig, ...config };

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: finalConfig.noiseReduction,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      // Setup noise detection if enabled
      if (finalConfig.noiseReduction && this.audioContext) {
        await this.setupNoiseDetection(stream);
      }

      // Setup MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording = true;
        console.log('Recording started');
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        stream.getTracks().forEach(track => track.stop());
        console.log('Recording stopped');
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms

      // Set maximum recording duration
      this.recordingTimeout = setTimeout(() => {
        this.stopRecording();
      }, finalConfig.maxDuration * 1000);

      // Setup auto-stop on silence if enabled
      if (finalConfig.autoStop) {
        this.setupSilenceDetection();
      }

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop recording audio
   */
  async stopRecording(): Promise<Blob | null> {
    try {
      if (!this.isRecording || !this.mediaRecorder) {
        return null;
      }

      return new Promise((resolve) => {
        if (!this.mediaRecorder) {
          resolve(null);
          return;
        }

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.getSupportedMimeType() 
          });
          
          // Cleanup
          this.cleanup();
          
          resolve(audioBlob);
        };

        this.mediaRecorder.stop();
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.cleanup();
      return null;
    }
  }

  /**
   * Transcribe audio using Bhashini ASR
   */
  async transcribeAudio(
    audioBlob: Blob, 
    language: string = 'hi'
  ): Promise<ASRResult> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      formData.append('language', language);
      formData.append('audio_format', 'wav');

      const response = await axios.post(
        `${this.baseURL}/api/v1/voice/asr`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('ASR request failed:', error);
      return {
        success: false,
        transcription: '',
        confidence: 0,
        language,
        error: 'Speech recognition failed. Please try again.',
        fallback: true
      };
    }
  }

  /**
   * Synthesize speech using Bhashini TTS
   */
  async synthesizeSpeech(
    text: string,
    language: string = 'hi',
    voiceGender: 'male' | 'female' = 'female'
  ): Promise<TTSResult> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/v1/voice/tts`,
        {
          text,
          language,
          voice_gender: voiceGender,
          audio_format: 'wav'
        },
        {
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('TTS request failed:', error);
      return {
        success: false,
        text,
        language,
        error: 'Speech synthesis failed.',
        fallback: true
      };
    }
  }

  /**
   * Get TTS audio as playable URL
   */
  async getTTSAudio(
    text: string,
    language: string = 'hi',
    voiceGender: 'male' | 'female' = 'female'
  ): Promise<string | null> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/v1/voice/tts/audio`,
        {
          text,
          language,
          voice_gender: voiceGender,
          audio_format: 'wav'
        },
        {
          responseType: 'blob',
          timeout: 30000,
        }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS audio request failed:', error);
      return null;
    }
  }

  /**
   * Process complete voice query (ASR + Intent + TTS)
   */
  async processVoiceQuery(
    audioBlob: Blob,
    language: string = 'hi',
    context?: Record<string, any>
  ): Promise<VoiceProcessResult> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      formData.append('language', language);
      
      if (context) {
        formData.append('context', JSON.stringify(context));
      }

      const response = await axios.post(
        `${this.baseURL}/api/v1/voice/process`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 45000, // 45 second timeout for full processing
        }
      );

      return response.data;
    } catch (error) {
      console.error('Voice query processing failed:', error);
      return {
        success: false,
        error: 'Voice processing failed. Please try again.',
        fallbackMessage: 'कृपया दोबारा बोलें या टाइप करें'
      };
    }
  }

  /**
   * Detect language from audio
   */
  async detectLanguage(audioBlob: Blob): Promise<LanguageDetectionResult> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');

      const response = await axios.post(
        `${this.baseURL}/api/v1/voice/detect-language`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 20000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Language detection failed:', error);
      return {
        language: 'hi',
        confidence: 0.5
      };
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/v1/voice/supported-languages`
      );

      return response.data.languages || [];
    } catch (error) {
      console.error('Failed to get supported languages:', error);
      return [
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
      ];
    }
  }

  /**
   * Play audio from ArrayBuffer or base64
   */
  async playAudio(audioData: ArrayBuffer | string): Promise<boolean> {
    try {
      let audioBlob: Blob;

      if (typeof audioData === 'string') {
        // Base64 string
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioBlob = new Blob([bytes], { type: 'audio/wav' });
      } else {
        // ArrayBuffer
        audioBlob = new Blob([audioData], { type: 'audio/wav' });
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      return false;
    }
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording duration
   */
  getRecordingDuration(): number {
    // This would need to be tracked during recording
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Setup noise detection for better recording quality
   */
  private async setupNoiseDetection(stream: MediaStream): Promise<void> {
    if (!this.audioContext) return;

    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    source.connect(this.analyser);

    // Monitor audio levels
    this.monitorAudioLevels();
  }

  /**
   * Monitor audio levels for noise detection
   */
  private monitorAudioLevels(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevel = () => {
      if (!this.analyser || !this.isRecording) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedLevel = average / 255;

      // Check if audio level is above noise gate
      if (normalizedLevel > this.noiseGate) {
        // Reset silence timeout
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
          this.silenceTimeout = null;
        }
      }

      // Continue monitoring
      if (this.isRecording) {
        requestAnimationFrame(checkAudioLevel);
      }
    };

    checkAudioLevel();
  }

  /**
   * Setup silence detection for auto-stop
   */
  private setupSilenceDetection(): void {
    // This would work with the audio level monitoring
    // For now, just set a basic timeout
    this.silenceTimeout = setTimeout(() => {
      if (this.isRecording) {
        console.log('Auto-stopping due to silence');
        this.stopRecording();
      }
    }, 3000); // 3 seconds of silence
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.isRecording = false;
    
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }

    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  /**
   * Destroy service and cleanup all resources
   */
  destroy(): void {
    if (this.isRecording) {
      this.stopRecording();
    }
    this.cleanup();
  }
}

// Export singleton instance
export const voiceService = new VoiceService();