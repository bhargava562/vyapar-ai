/**
 * Voice Interface Hook
 * Provides comprehensive voice functionality with Bhashini integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './useLanguage';
import { voiceService, VoiceProcessResult } from '../services/voiceService';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  isInitialized: boolean;
  hasPermission: boolean;
  isSupported: boolean;
  error: string | null;
  transcription: string;
  confidence: number;
  recordingDuration: number;
  lastResult: VoiceProcessResult | null;
}

export interface VoiceConfig {
  useBhashini?: boolean;
  noiseReduction?: boolean;
  autoStop?: boolean;
  maxDuration?: number;
  voiceGender?: 'male' | 'female';
  showConfidence?: boolean;
  enableTTS?: boolean;
}

export interface VoiceCallbacks {
  onVoiceResult?: (result: VoiceProcessResult) => void;
  onTranscription?: (text: string, confidence: number) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

export const useVoice = (config: VoiceConfig = {}, callbacks: VoiceCallbacks = {}) => {
  const { t } = useTranslation(['voice', 'common']);
  const { currentLanguage } = useLanguage();
  
  const defaultConfig: Required<VoiceConfig> = {
    useBhashini: true,
    noiseReduction: true,
    autoStop: true,
    maxDuration: 30,
    voiceGender: 'female',
    showConfidence: true,
    enableTTS: true,
    ...config
  };

  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isPlaying: false,
    isInitialized: false,
    hasPermission: false,
    isSupported: false,
    error: null,
    transcription: '',
    confidence: 0,
    recordingDuration: 0,
    lastResult: null
  });

  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize voice service
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        if (defaultConfig.useBhashini) {
          const initialized = await voiceService.initialize();
          const hasPermission = await voiceService.requestMicrophonePermission();
          
          setVoiceState(prev => {
            const newState = {
              ...prev,
              isInitialized: initialized,
              hasPermission,
              isSupported: initialized && hasPermission
            };
            callbacks.onStateChange?.(newState);
            return newState;
          });
        } else {
          // Check browser speech recognition support
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const isSupported = !!SpeechRecognition;
          
          setVoiceState(prev => {
            const newState = {
              ...prev,
              isInitialized: true,
              hasPermission: true, // Browser will prompt when needed
              isSupported
            };
            callbacks.onStateChange?.(newState);
            return newState;
          });
        }
      } catch (error) {
        console.error('Voice initialization failed:', error);
        const errorMessage = t('voice.initialization_failed');
        setVoiceState(prev => {
          const newState = {
            ...prev,
            error: errorMessage,
            isSupported: false
          };
          callbacks.onStateChange?.(newState);
          return newState;
        });
        callbacks.onError?.(errorMessage);
      }
    };

    initializeVoice();
  }, [defaultConfig.useBhashini, t, callbacks]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!voiceState.isSupported || voiceState.isListening || voiceState.isProcessing) {
      return false;
    }

    try {
      setVoiceState(prev => {
        const newState = {
          ...prev,
          isListening: true,
          isProcessing: false,
          error: null,
          transcription: '',
          confidence: 0,
          recordingDuration: 0
        };
        callbacks.onStateChange?.(newState);
        return newState;
      });

      if (defaultConfig.useBhashini) {
        const started = await voiceService.startRecording({
          language: currentLanguage.code,
          noiseReduction: defaultConfig.noiseReduction,
          autoStop: defaultConfig.autoStop,
          maxDuration: defaultConfig.maxDuration
        });

        if (!started) {
          throw new Error('Failed to start Bhashini recording');
        }

        // Start duration counter
        recordingIntervalRef.current = setInterval(() => {
          setVoiceState(prev => {
            const newState = {
              ...prev,
              recordingDuration: prev.recordingDuration + 0.1
            };
            callbacks.onStateChange?.(newState);
            return newState;
          });
        }, 100);

        // Auto-stop timeout
        recordingTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, defaultConfig.maxDuration * 1000);

      } else {
        // Use browser speech recognition
        startBrowserRecognition();
      }

      return true;

    } catch (error) {
      console.error('Failed to start recording:', error);
      const errorMessage = t('voice.recording_failed');
      
      setVoiceState(prev => {
        const newState = {
          ...prev,
          isListening: false,
          error: errorMessage
        };
        callbacks.onStateChange?.(newState);
        return newState;
      });
      
      callbacks.onError?.(errorMessage);
      return false;
    }
  }, [voiceState.isSupported, voiceState.isListening, voiceState.isProcessing, defaultConfig, currentLanguage, t, callbacks]);

  // Stop recording and process
  const stopRecording = useCallback(async () => {
    if (!voiceState.isListening) return null;

    try {
      // Clear timers
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      setVoiceState(prev => {
        const newState = {
          ...prev,
          isListening: false,
          isProcessing: true
        };
        callbacks.onStateChange?.(newState);
        return newState;
      });

      if (defaultConfig.useBhashini) {
        const audioBlob = await voiceService.stopRecording();
        
        if (!audioBlob) {
          throw new Error('No audio recorded');
        }

        // Process the audio
        const result = await voiceService.processVoiceQuery(
          audioBlob,
          currentLanguage.code,
          { source: 'useVoice_hook' }
        );

        setVoiceState(prev => {
          const newState = {
            ...prev,
            isProcessing: false,
            transcription: result.transcription || '',
            confidence: result.confidence || 0,
            lastResult: result,
            recordingDuration: 0
          };
          callbacks.onStateChange?.(newState);
          return newState;
        });

        // Call callbacks
        callbacks.onVoiceResult?.(result);
        if (result.transcription) {
          callbacks.onTranscription?.(result.transcription, result.confidence || 0);
        }

        // Play response audio if available and enabled
        if (result.responseAudio && defaultConfig.enableTTS) {
          await playAudio(result.responseAudio);
        }

        return result;

      } else {
        // Browser recognition handles this automatically
        setVoiceState(prev => {
          const newState = {
            ...prev,
            isProcessing: false,
            recordingDuration: 0
          };
          callbacks.onStateChange?.(newState);
          return newState;
        });
        return null;
      }

    } catch (error) {
      console.error('Voice processing error:', error);
      const errorMessage = error instanceof Error ? error.message : t('voice.processing_failed');
      
      setVoiceState(prev => {
        const newState = {
          ...prev,
          isListening: false,
          isProcessing: false,
          error: errorMessage,
          recordingDuration: 0
        };
        callbacks.onStateChange?.(newState);
        return newState;
      });

      callbacks.onError?.(errorMessage);
      return null;
    }
  }, [voiceState.isListening, defaultConfig, currentLanguage, t, callbacks]);

  // Browser speech recognition fallback
  const startBrowserRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const errorMessage = t('voice.not_supported');
      callbacks.onError?.(errorMessage);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = `${currentLanguage.code}-IN`;

    recognition.onstart = () => {
      setVoiceState(prev => {
        const newState = { ...prev, isListening: true, isProcessing: false };
        callbacks.onStateChange?.(newState);
        return newState;
      });
    };

    recognition.onend = () => {
      setVoiceState(prev => {
        const newState = { ...prev, isListening: false, isProcessing: false };
        callbacks.onStateChange?.(newState);
        return newState;
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setVoiceState(prev => {
        const newState = { ...prev, isProcessing: true };
        callbacks.onStateChange?.(newState);
        return newState;
      });

      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence || 0.8;
      
      const cleanedText = transcript.trim();
      
      if (cleanedText) {
        setVoiceState(prev => {
          const newState = {
            ...prev,
            transcription: cleanedText,
            confidence,
            isProcessing: false
          };
          callbacks.onStateChange?.(newState);
          return newState;
        });

        callbacks.onTranscription?.(cleanedText, confidence);
        
        // Create a mock VoiceProcessResult for consistency
        const mockResult: VoiceProcessResult = {
          success: true,
          transcription: cleanedText,
          confidence,
          intent: { intent: 'unknown', confidence: 0.5, entities: {} },
          responseText: '',
          processingTime: 0
        };
        
        callbacks.onVoiceResult?.(mockResult);
      }
      
      setVoiceState(prev => {
        const newState = { ...prev, isProcessing: false };
        callbacks.onStateChange?.(newState);
        return newState;
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = t('voice.try_again');
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = t('voice.no_speech');
          break;
        case 'audio-capture':
          errorMessage = t('voice.microphone_denied');
          break;
        case 'not-allowed':
          errorMessage = t('voice.permission_required');
          break;
        case 'network':
          errorMessage = t('voice.network_error');
          break;
      }
      
      setVoiceState(prev => {
        const newState = {
          ...prev,
          isListening: false,
          isProcessing: false,
          error: errorMessage
        };
        callbacks.onStateChange?.(newState);
        return newState;
      });

      callbacks.onError?.(errorMessage);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      const errorMessage = t('voice.try_again');
      callbacks.onError?.(errorMessage);
    }
  }, [currentLanguage, t, callbacks]);

  // Play audio
  const playAudio = useCallback(async (audioData: ArrayBuffer | string) => {
    try {
      setVoiceState(prev => {
        const newState = { ...prev, isPlaying: true };
        callbacks.onStateChange?.(newState);
        return newState;
      });

      await voiceService.playAudio(audioData);

      setVoiceState(prev => {
        const newState = { ...prev, isPlaying: false };
        callbacks.onStateChange?.(newState);
        return newState;
      });

      return true;
    } catch (error) {
      console.error('Failed to play audio:', error);
      setVoiceState(prev => {
        const newState = { ...prev, isPlaying: false };
        callbacks.onStateChange?.(newState);
        return newState;
      });
      return false;
    }
  }, [callbacks]);

  // Synthesize and play text
  const speak = useCallback(async (text: string) => {
    if (!defaultConfig.enableTTS || !text.trim()) return false;

    try {
      const result = await voiceService.synthesizeSpeech(
        text,
        currentLanguage.code,
        defaultConfig.voiceGender
      );

      if (result.success && result.audioData) {
        return await playAudio(result.audioData);
      }

      return false;
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
      return false;
    }
  }, [defaultConfig.enableTTS, defaultConfig.voiceGender, currentLanguage, playAudio]);

  // Clear error
  const clearError = useCallback(() => {
    setVoiceState(prev => {
      const newState = { ...prev, error: null };
      callbacks.onStateChange?.(newState);
      return newState;
    });
  }, [callbacks]);

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (voiceState.isListening) {
      return await stopRecording();
    } else {
      return await startRecording();
    }
  }, [voiceState.isListening, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (voiceState.isListening && defaultConfig.useBhashini) {
        voiceService.stopRecording();
      }
    };
  }, [voiceState.isListening, defaultConfig.useBhashini]);

  return {
    // State
    voiceState,
    
    // Actions
    startRecording,
    stopRecording,
    toggleRecording,
    playAudio,
    speak,
    clearError,
    
    // Computed properties
    isReady: voiceState.isSupported && !voiceState.error,
    canRecord: voiceState.isSupported && !voiceState.isListening && !voiceState.isProcessing,
    
    // Configuration
    config: defaultConfig
  };
};

export default useVoice;