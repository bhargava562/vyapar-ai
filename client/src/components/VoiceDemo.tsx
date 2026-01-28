/**
 * Voice Demo Component
 * Demonstrates Bhashini ASR/TTS integration with multilingual support
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import useVoice from '../hooks/useVoice';
import VoiceOverlay from './VoiceOverlay';
import VoiceInput from './VoiceInput';

const VoiceDemo: React.FC = () => {
  const { t } = useTranslation(['voice', 'common']);
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    text: string;
    confidence?: number;
    timestamp: Date;
  }>>([]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [voiceConfig, setVoiceConfig] = useState({
    useBhashini: true,
    noiseReduction: true,
    autoStop: true,
    maxDuration: 30,
    voiceGender: 'female' as 'male' | 'female',
    enableTTS: true
  });

  const { voiceState, speak, clearError, isReady } = useVoice(
    voiceConfig,
    {
      onVoiceResult: (result) => {
        if (result.success && result.transcription) {
          // Add user message
          const userMessage = {
            id: `user-${Date.now()}`,
            type: 'user' as const,
            text: result.transcription,
            confidence: result.confidence,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, userMessage]);

          // Add assistant response if available
          if (result.responseText) {
            const assistantMessage = {
              id: `assistant-${Date.now()}`,
              type: 'assistant' as const,
              text: result.responseText,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
          }
        }
      },
      onError: (error) => {
        console.error('Voice error:', error);
      }
    }
  );

  const handleVoiceInput = (text: string, confidence?: number) => {
    const message = {
      id: `input-${Date.now()}`,
      type: 'user' as const,
      text,
      confidence,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);

    // Simple response generation for demo
    const responses = {
      'hi': [
        'मैं आपकी बात समझ गया हूं।',
        'यह बहुत अच्छा है।',
        'क्या मैं आपकी और मदद कर सकता हूं?'
      ],
      'en': [
        'I understand what you said.',
        'That sounds great.',
        'How else can I help you?'
      ],
      'ta': [
        'நீங்கள் சொன்னது எனக்குப் புரிந்தது.',
        'அது நன்றாக இருக்கிறது.',
        'வேறு எப்படி உதவ முடியும்?'
      ],
      'te': [
        'మీరు చెప్పినది నాకు అర్థమైంది.',
        'అది చాలా బాగుంది.',
        'నేను మరెలా సహాయం చేయగలను?'
      ],
      'bn': [
        'আপনি যা বলেছেন তা আমি বুঝতে পেরেছি।',
        'এটা খুব ভালো।',
        'আমি আর কীভাবে সাহায্য করতে পারি?'
      ]
    };

    const langResponses = responses[currentLanguage.code as keyof typeof responses] || responses['en'];
    const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];

    setTimeout(() => {
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant' as const,
        text: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if TTS is enabled
      if (voiceConfig.enableTTS) {
        speak(randomResponse);
      }
    }, 1000);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const testTTS = async () => {
    const testMessages = {
      'hi': 'नमस्ते! मैं भाषिणी आवाज़ सहायक हूं।',
      'en': 'Hello! I am the Bhashini voice assistant.',
      'ta': 'வணக்கம்! நான் பாஷிணி குரல் உதவியாளர்.',
      'te': 'నమస్కారం! నేను భాషిణి వాయిస్ అసిస్టెంట్.',
      'bn': 'নমস্কার! আমি ভাষিণী ভয়েস অ্যাসিস্ট্যান্ট।'
    };

    const message = testMessages[currentLanguage.code as keyof typeof testMessages] || testMessages['en'];
    await speak(message);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('voice.tutorial.title')}
        </h1>
        <p className="text-gray-600">
          {t('voice.responses.welcome')}
        </p>
      </div>

      {/* Language Selector */}
      <div className="flex justify-center">
        <select
          value={currentLanguage.code}
          onChange={(e) => changeLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {supportedLanguages.map((lang: any) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>

      {/* Voice Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('voice.status')}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              isReady ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isReady ? t('voice.ready') : t('voice.not_supported')}
            </span>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              voiceState.isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm text-gray-600">
              {voiceState.isListening ? t('voice.listening') : t('voice.ready')}
            </span>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              voiceState.isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm text-gray-600">
              {voiceState.isProcessing ? t('voice.processing') : t('voice.ready')}
            </span>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              voiceState.isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm text-gray-600">
              {voiceState.isPlaying ? t('voice.playing') : t('voice.ready')}
            </span>
          </div>
        </div>

        {voiceState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{voiceState.error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {voiceState.transcription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-700">{t('voice.transcription')}</span>
              <span className="text-sm text-blue-600">
                {Math.round(voiceState.confidence * 100)}% {t('voice.confidence')}
              </span>
            </div>
            <p className="text-blue-800">{voiceState.transcription}</p>
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Voice Controls</h2>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <VoiceInput
            onVoiceResult={handleVoiceInput}
            useBhashini={voiceConfig.useBhashini}
            showConfidence={true}
            className="mx-2"
          />
          
          <button
            onClick={testTTS}
            disabled={voiceState.isPlaying}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voiceState.isPlaying ? t('voice.playing') : 'Test TTS'}
          </button>
          
          <button
            onClick={clearMessages}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Clear Messages
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('voice.settings.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={voiceConfig.useBhashini}
              onChange={(e) => setVoiceConfig(prev => ({ ...prev, useBhashini: e.target.checked }))}
              className="mr-2"
            />
            Use Bhashini AI
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={voiceConfig.noiseReduction}
              onChange={(e) => setVoiceConfig(prev => ({ ...prev, noiseReduction: e.target.checked }))}
              className="mr-2"
            />
            {t('voice.settings.noise_reduction')}
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={voiceConfig.enableTTS}
              onChange={(e) => setVoiceConfig(prev => ({ ...prev, enableTTS: e.target.checked }))}
              className="mr-2"
            />
            Enable Text-to-Speech
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={(e) => setShowOverlay(e.target.checked)}
              className="mr-2"
            />
            Show Voice Overlay
          </label>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('voice.settings.voice_gender')}
          </label>
          <select
            value={voiceConfig.voiceGender}
            onChange={(e) => setVoiceConfig(prev => ({ ...prev, voiceGender: e.target.value as 'male' | 'female' }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="female">{t('voice.settings.female')}</option>
            <option value="male">{t('voice.settings.male')}</option>
          </select>
        </div>
      </div>

      {/* Conversation History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Conversation History</h2>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No messages yet. Try speaking something!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.confidence && (
                      <span className="text-xs opacity-75">
                        {Math.round(message.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Voice Overlay */}
      {showOverlay && (
        <VoiceOverlay
          onVoiceResult={(result) => {
            if (result.success && result.transcription) {
              handleVoiceInput(result.transcription, result.confidence);
            }
          }}
          position="bottom-right"
          size="medium"
          noiseReduction={voiceConfig.noiseReduction}
        />
      )}
    </div>
  );
};

export default VoiceDemo;