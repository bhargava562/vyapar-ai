/**
 * Voice Input Component
 * Enhanced with Bhashini ASR/TTS integration for multilingual support
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { voiceService } from '../services/voiceService';
import type { ASRResult } from '../services/voiceService';

interface VoiceInputProps {
  onVoiceResult: (text: string, confidence?: number) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  language?: string;
  disabled?: boolean;
  className?: string;
  useBhashini?: boolean; // Toggle between browser and Bhashini ASR
  showConfidence?: boolean;
  maxDuration?: number;
  noiseReduction?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceResult,
  onError,
  placeholder,
  language,
  disabled = false,
  className = '',
  useBhashini = true,
  showConfidence = false,
  maxDuration = 30,
  noiseReduction = true
}) => {
  const { t } = useTranslation(['vendor', 'voice']);
  const { currentLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const effectiveLanguage = language || currentLanguage.code;

  // Initialize voice service
  useEffect(() => {
    const initializeVoice = async () => {
      if (useBhashini) {
        const initialized = await voiceService.initialize();
        const hasPermission = await voiceService.requestMicrophonePermission();
        setIsSupported(initialized && hasPermission);
      } else {
        // Fallback to browser speech recognition
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
      }
    };

    initializeVoice();
  }, [useBhashini]);

  // Start recording with Bhashini
  const startBhashiniRecording = useCallback(async () => {
    try {
      setIsListening(true);
      setIsProcessing(false);
      setConfidence(0);
      setRecordingDuration(0);

      const started = await voiceService.startRecording({
        language: effectiveLanguage,
        noiseReduction,
        autoStop: true,
        maxDuration
      });

      if (!started) {
        throw new Error('Failed to start recording');
      }

      // Start duration counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);

    } catch (error) {
      console.error('Bhashini recording failed:', error);
      setIsListening(false);
      const errorMessage = t('voice.recording_failed');
      onError?.(errorMessage);
    }
  }, [effectiveLanguage, noiseReduction, maxDuration, t, onError]);

  // Stop recording and process with Bhashini
  const stopBhashiniRecording = useCallback(async () => {
    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      setIsListening(false);
      setIsProcessing(true);

      const audioBlob = await voiceService.stopRecording();

      if (!audioBlob) {
        throw new Error('No audio recorded');
      }

      const result: ASRResult = await voiceService.transcribeAudio(audioBlob, effectiveLanguage);

      if (result.success && result.transcription) {
        setConfidence(result.confidence);
        onVoiceResult(result.transcription, result.confidence);
      } else {
        throw new Error(result.error || 'Transcription failed');
      }

    } catch (error) {
      console.error('Bhashini processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : t('voice.processing_failed');
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  }, [effectiveLanguage, onVoiceResult, onError, t]);

  // Fallback browser speech recognition
  const startBrowserRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.(t('voice.not_supported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = `${effectiveLanguage}-IN`;

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onresult = (event: any) => {
      setIsProcessing(true);
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence || 0.8;

      const cleanedText = transcript.trim();

      if (cleanedText) {
        setConfidence(confidence);
        onVoiceResult(cleanedText, confidence);
      }

      setIsProcessing(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsProcessing(false);

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
        default:
          errorMessage = t('voice.try_again');
      }

      onError?.(errorMessage);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.(t('voice.try_again'));
    }
  }, [effectiveLanguage, onVoiceResult, onError, t]);

  // Main start listening function
  const startListening = useCallback(() => {
    if (!isSupported || disabled || isListening) return;

    if (useBhashini) {
      startBhashiniRecording();
    } else {
      startBrowserRecognition();
    }
  }, [isSupported, disabled, isListening, useBhashini, startBhashiniRecording, startBrowserRecognition]);

  // Main stop listening function
  const stopListening = useCallback(() => {
    if (!isListening) return;

    if (useBhashini) {
      stopBhashiniRecording();
    } else {
      // Browser recognition stops automatically
      setIsListening(false);
    }
  }, [isListening, useBhashini, stopBhashiniRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (isListening && useBhashini) {
        voiceService.stopRecording();
      }
    };
  }, [isListening, useBhashini]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || isProcessing}
        className={`
          inline-flex items-center justify-center
          w-12 h-12 rounded-full
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
          ${isProcessing ? 'bg-yellow-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={
          isListening
            ? t('voice.listening')
            : isProcessing
              ? t('voice.processing')
              : placeholder || t('voice.speak_name')
        }
      >
        {isListening ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        ) : isProcessing ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Recording duration indicator */}
      {isListening && useBhashini && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {recordingDuration.toFixed(1)}s
        </div>
      )}

      {/* Confidence indicator */}
      {showConfidence && confidence > 0 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-nowrap">
          {Math.round(confidence * 100)}% {t('voice.confidence')}
        </div>
      )}

      {/* Bhashini indicator */}
      {useBhashini && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          title="Bhashini AI powered" />
      )}
    </div>
  );
};

export default VoiceInput;