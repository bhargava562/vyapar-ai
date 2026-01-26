/**
 * Voice Interface Overlay Component
 * Provides floating voice interface with ASR/TTS capabilities using Bhashini
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { voiceService, VoiceProcessResult } from '../services/voiceService';

interface VoiceOverlayProps {
  onVoiceResult?: (result: VoiceProcessResult) => void;
  onTranscription?: (text: string, confidence: number) => void;
  onError?: (error: string) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: 'small' | 'medium' | 'large';
  autoHide?: boolean;
  noiseReduction?: boolean;
  pushToTalk?: boolean;
  className?: string;
  disabled?: boolean;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  isInitialized: boolean;
  hasPermission: boolean;
  error: string | null;
  transcription: string;
  confidence: number;
  recordingDuration: number;
}

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  onVoiceResult,
  onTranscription,
  onError,
  position = 'bottom-right',
  size = 'medium',
  autoHide = true,
  noiseReduction = true,
  pushToTalk = false,
  className = '',
  disabled = false
}) => {
  const { t } = useTranslation(['common', 'voice']);
  const { currentLanguage } = useLanguage();
  
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isPlaying: false,
    isInitialized: false,
    hasPermission: false,
    error: null,
    transcription: '',
    confidence: 0,
    recordingDuration: 0
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize voice service on mount
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        const initialized = await voiceService.initialize();
        if (initialized) {
          const hasPermission = await voiceService.requestMicrophonePermission();
          setVoiceState(prev => ({
            ...prev,
            isInitialized: initialized,
            hasPermission
          }));
        } else {
          setVoiceState(prev => ({
            ...prev,
            error: t('voice.not_supported')
          }));
        }
      } catch (error) {
        console.error('Voice initialization failed:', error);
        setVoiceState(prev => ({
          ...prev,
          error: t('voice.initialization_failed')
        }));
      }
    };

    initializeVoice();

    return () => {
      // Cleanup on unmount
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      voiceService.destroy();
    };
  }, [t]);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && !voiceState.isListening && !voiceState.isProcessing && !voiceState.isPlaying) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setShowTranscription(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [autoHide, voiceState.isListening, voiceState.isProcessing, voiceState.isPlaying]);

  // Start voice recording
  const startRecording = useCallback(async () => {
    if (!voiceState.isInitialized || !voiceState.hasPermission || disabled) {
      return;
    }

    try {
      setVoiceState(prev => ({
        ...prev,
        isListening: true,
        error: null,
        transcription: '',
        confidence: 0,
        recordingDuration: 0
      }));

      setIsExpanded(true);

      const started = await voiceService.startRecording({
        language: currentLanguage.code,
        noiseReduction,
        autoStop: !pushToTalk,
        maxDuration: 30
      });

      if (!started) {
        throw new Error('Failed to start recording');
      }

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setVoiceState(prev => ({
          ...prev,
          recordingDuration: prev.recordingDuration + 0.1
        }));
      }, 100);

      // Auto-stop after 30 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 30000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      const errorMessage = t('voice.recording_failed');
      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  }, [voiceState.isInitialized, voiceState.hasPermission, disabled, currentLanguage, noiseReduction, pushToTalk, t, onError]);

  // Stop voice recording and process
  const stopRecording = useCallback(async () => {
    if (!voiceState.isListening) return;

    try {
      // Clear timers
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        isProcessing: true
      }));

      const audioBlob = await voiceService.stopRecording();
      
      if (!audioBlob) {
        throw new Error('No audio recorded');
      }

      // Process the audio
      const result = await voiceService.processVoiceQuery(
        audioBlob,
        currentLanguage.code,
        { source: 'voice_overlay' }
      );

      if (result.success) {
        setVoiceState(prev => ({
          ...prev,
          transcription: result.transcription || '',
          confidence: result.confidence || 0,
          isProcessing: false
        }));

        setShowTranscription(true);

        // Call callbacks
        onVoiceResult?.(result);
        if (result.transcription) {
          onTranscription?.(result.transcription, result.confidence || 0);
        }

        // Play response audio if available
        if (result.responseAudio) {
          await playResponseAudio(result.responseAudio);
        }

      } else {
        throw new Error(result.error || 'Voice processing failed');
      }

    } catch (error) {
      console.error('Voice processing error:', error);
      const errorMessage = error instanceof Error ? error.message : t('voice.processing_failed');
      
      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        isProcessing: false,
        error: errorMessage
      }));

      onError?.(errorMessage);
    }
  }, [voiceState.isListening, currentLanguage, onVoiceResult, onTranscription, onError, t]);

  // Play response audio
  const playResponseAudio = useCallback(async (audioData: ArrayBuffer) => {
    try {
      setVoiceState(prev => ({ ...prev, isPlaying: true }));
      
      await voiceService.playAudio(audioData);
      
      setVoiceState(prev => ({ ...prev, isPlaying: false }));
    } catch (error) {
      console.error('Failed to play response audio:', error);
      setVoiceState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Handle push-to-talk
  const handleMouseDown = useCallback(() => {
    if (pushToTalk && !voiceState.isListening) {
      startRecording();
    }
  }, [pushToTalk, voiceState.isListening, startRecording]);

  const handleMouseUp = useCallback(() => {
    if (pushToTalk && voiceState.isListening) {
      stopRecording();
    }
  }, [pushToTalk, voiceState.isListening, stopRecording]);

  // Handle click for normal mode
  const handleClick = useCallback(() => {
    if (pushToTalk) return;

    if (voiceState.isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [pushToTalk, voiceState.isListening, startRecording, stopRecording]);

  // Clear error
  const clearError = useCallback(() => {
    setVoiceState(prev => ({ ...prev, error: null }));
  }, []);

  // Get position classes
  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    };
    return positions[position];
  };

  // Get size classes
  const getSizeClasses = () => {
    const sizes = {
      'small': 'w-12 h-12',
      'medium': 'w-16 h-16',
      'large': 'w-20 h-20'
    };
    return sizes[size];
  };

  // Get button state classes
  const getButtonStateClasses = () => {
    if (disabled || !voiceState.isInitialized || !voiceState.hasPermission) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    
    if (voiceState.isListening) {
      return 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50';
    }
    
    if (voiceState.isProcessing) {
      return 'bg-yellow-500 hover:bg-yellow-600';
    }
    
    if (voiceState.isPlaying) {
      return 'bg-green-500 hover:bg-green-600 animate-pulse';
    }
    
    return 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg';
  };

  // Don't render if not supported
  if (!voiceState.isInitialized && !voiceState.error) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      {/* Main voice button */}
      <div className="relative">
        <button
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          disabled={disabled || !voiceState.isInitialized || !voiceState.hasPermission}
          className={`
            ${getSizeClasses()}
            rounded-full text-white font-semibold
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-4 focus:ring-blue-300
            ${getButtonStateClasses()}
            ${isExpanded ? 'scale-110' : 'scale-100'}
          `}
          title={
            !voiceState.hasPermission 
              ? t('voice.permission_required')
              : voiceState.isListening 
                ? (pushToTalk ? t('voice.release_to_stop') : t('voice.listening'))
                : voiceState.isProcessing 
                  ? t('voice.processing')
                  : voiceState.isPlaying
                    ? t('voice.playing_response')
                    : (pushToTalk ? t('voice.hold_to_speak') : t('voice.tap_to_speak'))
          }
        >
          {/* Voice icon */}
          {voiceState.isListening ? (
            <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : voiceState.isProcessing ? (
            <svg className="w-6 h-6 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : voiceState.isPlaying ? (
            <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Recording duration indicator */}
        {voiceState.isListening && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {voiceState.recordingDuration.toFixed(1)}s
          </div>
        )}

        {/* Permission indicator */}
        {!voiceState.hasPermission && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div className={`
          absolute ${position.includes('bottom') ? 'bottom-full mb-2' : 'top-full mt-2'}
          ${position.includes('right') ? 'right-0' : 'left-0'}
          bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-64 max-w-80
        `}>
          {/* Error display */}
          {voiceState.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-red-700 text-sm">{voiceState.error}</p>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Status display */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t('voice.status')}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                voiceState.isListening 
                  ? 'bg-red-100 text-red-700'
                  : voiceState.isProcessing
                    ? 'bg-yellow-100 text-yellow-700'
                    : voiceState.isPlaying
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
              }`}>
                {voiceState.isListening 
                  ? t('voice.listening')
                  : voiceState.isProcessing
                    ? t('voice.processing')
                    : voiceState.isPlaying
                      ? t('voice.playing')
                      : t('voice.ready')
                }
              </span>
            </div>

            {/* Language indicator */}
            <div className="text-xs text-gray-500">
              {t('voice.language')}: {currentLanguage.code.toUpperCase()}
            </div>
          </div>

          {/* Transcription display */}
          {showTranscription && voiceState.transcription && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">
                  {t('voice.transcription')}
                </span>
                <span className="text-xs text-blue-600">
                  {Math.round(voiceState.confidence * 100)}% {t('voice.confidence')}
                </span>
              </div>
              <p className="text-sm text-blue-800">{voiceState.transcription}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            {pushToTalk 
              ? t('voice.hold_to_speak_instruction')
              : t('voice.tap_to_speak_instruction')
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceOverlay;