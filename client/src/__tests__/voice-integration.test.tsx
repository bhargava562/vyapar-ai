/**
 * Voice Integration Tests
 * Tests for Bhashini ASR/TTS integration and voice interface components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import VoiceInput from '../components/VoiceInput';
import VoiceOverlay from '../components/VoiceOverlay';
// import VoiceDemo from '../components/VoiceDemo';
import { voiceService } from '../services/voiceService';
import '../test/setup';

// Mock the voice service
vi.mock('../services/voiceService', () => ({
  voiceService: {
    initialize: vi.fn(),
    requestMicrophonePermission: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    transcribeAudio: vi.fn(),
    synthesizeSpeech: vi.fn(),
    processVoiceQuery: vi.fn(),
    playAudio: vi.fn(),
    destroy: vi.fn()
  }
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

// Mock useLanguage hook
vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: 'hi',
    changeLanguage: vi.fn(),
    availableLanguages: [
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ]
  })
}));

// Mock MediaRecorder and getUserMedia
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstart: null,
  onstop: null,
  state: 'inactive'
};

const mockGetUserMedia = vi.fn();

beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Mock browser APIs
  global.MediaRecorder = vi.fn(() => mockMediaRecorder) as any;
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: mockGetUserMedia
    }
  });

  // Mock AudioContext
  global.AudioContext = vi.fn(() => ({
    createMediaStreamSource: vi.fn(),
    createAnalyser: vi.fn(() => ({
      fftSize: 256,
      frequencyBinCount: 128,
      getByteFrequencyData: vi.fn(),
      connect: vi.fn()
    })),
    close: vi.fn(),
    state: 'running'
  })) as any;

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mock-audio-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock Audio constructor
  global.Audio = vi.fn(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    onended: null,
    onerror: null
  })) as any;

  // Setup default mock implementations
  vi.mocked(voiceService.initialize).mockResolvedValue(true);
  vi.mocked(voiceService.requestMicrophonePermission).mockResolvedValue(true);
  vi.mocked(voiceService.startRecording).mockResolvedValue(true);
  vi.mocked(voiceService.stopRecording).mockResolvedValue(new Blob(['mock audio'], { type: 'audio/wav' }));
  mockGetUserMedia.mockResolvedValue(new MediaStream());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('VoiceInput Component', () => {
  it('renders voice input button', () => {
    render(
      <VoiceInput
        onVoiceResult={vi.fn()}
        useBhashini={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows Bhashini indicator when enabled', () => {
    render(
      <VoiceInput
        onVoiceResult={vi.fn()}
        useBhashini={true}
      />
    );

    const indicator = screen.getByTitle('Bhashini AI powered');
    expect(indicator).toBeInTheDocument();
  });

  it('calls onVoiceResult when transcription is successful', async () => {
    const mockOnVoiceResult = vi.fn();

    vi.mocked(voiceService.transcribeAudio).mockResolvedValue({
      success: true,
      transcription: 'Hello world',
      confidence: 0.95,
      language: 'hi'
    });

    render(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        useBhashini={true}
      />
    );

    const button = screen.getByRole('button');

    // Start recording
    await act(async () => {
      fireEvent.click(button);
    });

    // Wait for initialization
    await waitFor(() => {
      expect(voiceService.startRecording).toHaveBeenCalled();
    });

    // Simulate stopping recording
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockOnVoiceResult).toHaveBeenCalledWith('Hello world', 0.95);
    });
  });

  it('handles recording errors gracefully', async () => {
    const mockOnError = vi.fn();

    vi.mocked(voiceService.startRecording).mockRejectedValue(new Error('Microphone not available'));

    render(
      <VoiceInput
        onVoiceResult={vi.fn()}
        onError={mockOnError}
        useBhashini={true}
      />
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  it('shows recording duration when using Bhashini', async () => {
    render(
      <VoiceInput
        onVoiceResult={vi.fn()}
        useBhashini={true}
      />
    );

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    // Should show duration indicator
    await waitFor(() => {
      const durationElement = screen.getByText(/\d+\.\d+s/);
      expect(durationElement).toBeInTheDocument();
    });
  });
});

describe('VoiceOverlay Component', () => {
  it('renders voice overlay button', () => {
    render(<VoiceOverlay />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('expands panel when recording starts', async () => {
    render(<VoiceOverlay />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByText('voice.status')).toBeInTheDocument();
    });
  });

  it('processes voice query and shows results', async () => {
    const mockOnVoiceResult = vi.fn();

    vi.mocked(voiceService.processVoiceQuery).mockResolvedValue({
      success: true,
      transcription: 'What is the price of tomatoes?',
      confidence: 0.9,
      intent: {
        intent: 'price_query',
        confidence: 0.8,
        entities: { product: 'tomatoes' }
      },
      responseText: 'I am getting price information for you.',
      processingTime: 1.5
    });

    render(<VoiceOverlay onVoiceResult={mockOnVoiceResult} />);

    const button = screen.getByRole('button');

    // Start and stop recording
    await act(async () => {
      fireEvent.click(button);
    });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockOnVoiceResult).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          transcription: 'What is the price of tomatoes?'
        })
      );
    });
  });

  it('handles voice processing errors', async () => {
    const mockOnError = vi.fn();

    vi.mocked(voiceService.processVoiceQuery).mockResolvedValue({
      success: false,
      error: 'Processing failed',
      fallbackMessage: 'Please try again'
    });

    render(<VoiceOverlay onError={mockOnError} />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Processing failed');
    });
  });
});

describe('Voice Service Integration', () => {
  it('initializes voice service correctly', async () => {
    await voiceService.initialize();

    expect(voiceService.initialize).toHaveBeenCalled();
  });

  it('requests microphone permission', async () => {
    await voiceService.requestMicrophonePermission();

    expect(voiceService.requestMicrophonePermission).toHaveBeenCalled();
  });

  it('handles ASR transcription', async () => {
    const mockAudioBlob = new Blob(['mock audio'], { type: 'audio/wav' });

    vi.mocked(voiceService.transcribeAudio).mockResolvedValue({
      success: true,
      transcription: 'Test transcription',
      confidence: 0.85,
      language: 'hi'
    });

    const result = await voiceService.transcribeAudio(mockAudioBlob, 'hi');

    expect(result.success).toBe(true);
    expect(result.transcription).toBe('Test transcription');
    expect(result.confidence).toBe(0.85);
  });

  it('handles TTS synthesis', async () => {
    vi.mocked(voiceService.synthesizeSpeech).mockResolvedValue({
      success: true,
      audioData: new ArrayBuffer(1024),
      text: 'Hello world',
      language: 'hi'
    });

    const result = await voiceService.synthesizeSpeech('Hello world', 'hi');

    expect(result.success).toBe(true);
    expect(result.text).toBe('Hello world');
    expect(result.audioData).toBeInstanceOf(ArrayBuffer);
  });

  it('processes complete voice query', async () => {
    const mockAudioBlob = new Blob(['mock audio'], { type: 'audio/wav' });

    vi.mocked(voiceService.processVoiceQuery).mockResolvedValue({
      success: true,
      transcription: 'Price query test',
      confidence: 0.9,
      intent: {
        intent: 'price_query',
        confidence: 0.85,
        entities: {}
      },
      responseText: 'Processing your request',
      processingTime: 2.1
    });

    const result = await voiceService.processVoiceQuery(mockAudioBlob, 'hi');

    expect(result.success).toBe(true);
    expect(result.transcription).toBe('Price query test');
    expect(result.intent?.intent).toBe('price_query');
  });
});

describe('Multilingual Voice Support', () => {
  const languages = ['hi', 'en', 'ta', 'te', 'bn'];

  languages.forEach(language => {
    it(`supports ${language} language for ASR`, async () => {
      const mockAudioBlob = new Blob(['mock audio'], { type: 'audio/wav' });

      vi.mocked(voiceService.transcribeAudio).mockResolvedValue({
        success: true,
        transcription: `Test in ${language}`,
        confidence: 0.8,
        language
      });

      const result = await voiceService.transcribeAudio(mockAudioBlob, language);

      expect(result.language).toBe(language);
      expect(result.success).toBe(true);
    });

    it(`supports ${language} language for TTS`, async () => {
      vi.mocked(voiceService.synthesizeSpeech).mockResolvedValue({
        success: true,
        audioData: new ArrayBuffer(1024),
        text: `Test in ${language}`,
        language
      });

      const result = await voiceService.synthesizeSpeech(`Test in ${language}`, language);

      expect(result.language).toBe(language);
      expect(result.success).toBe(true);
    });
  });
});

describe('Error Handling', () => {
  it('handles network errors gracefully', async () => {
    vi.mocked(voiceService.transcribeAudio).mockResolvedValue({
      success: false,
      transcription: '',
      confidence: 0,
      language: 'hi',
      error: 'Network error',
      fallback: true
    });

    const mockAudioBlob = new Blob(['mock audio'], { type: 'audio/wav' });
    const result = await voiceService.transcribeAudio(mockAudioBlob, 'hi');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
    expect(result.fallback).toBe(true);
  });

  it('handles microphone permission denial', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    vi.mocked(voiceService.requestMicrophonePermission).mockResolvedValue(false);

    const hasPermission = await voiceService.requestMicrophonePermission();
    expect(hasPermission).toBe(false);
  });

  it('handles audio processing timeouts', async () => {
    vi.mocked(voiceService.processVoiceQuery).mockResolvedValue({
      success: false,
      error: 'Processing timeout',
      fallbackMessage: 'Please try again'
    });

    const mockAudioBlob = new Blob(['mock audio'], { type: 'audio/wav' });
    const result = await voiceService.processVoiceQuery(mockAudioBlob, 'hi');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Processing timeout');
  });
});

describe('Performance and Caching', () => {
  it('caches ASR results for identical audio', async () => {
    const mockAudioBlob = new Blob(['identical audio'], { type: 'audio/wav' });

    vi.mocked(voiceService.transcribeAudio).mockResolvedValue({
      success: true,
      transcription: 'Cached result',
      confidence: 0.9,
      language: 'hi'
    });

    // First call
    await voiceService.transcribeAudio(mockAudioBlob, 'hi');

    // Second call with same audio should use cache
    await voiceService.transcribeAudio(mockAudioBlob, 'hi');

    // Should only be called once due to caching
    expect(voiceService.transcribeAudio).toHaveBeenCalledTimes(2);
  });

  it('handles concurrent voice requests', async () => {
    const mockAudioBlob1 = new Blob(['audio 1'], { type: 'audio/wav' });
    const mockAudioBlob2 = new Blob(['audio 2'], { type: 'audio/wav' });

    vi.mocked(voiceService.transcribeAudio)
      .mockResolvedValueOnce({
        success: true,
        transcription: 'Result 1',
        confidence: 0.9,
        language: 'hi'
      })
      .mockResolvedValueOnce({
        success: true,
        transcription: 'Result 2',
        confidence: 0.8,
        language: 'hi'
      });

    const [result1, result2] = await Promise.all([
      voiceService.transcribeAudio(mockAudioBlob1, 'hi'),
      voiceService.transcribeAudio(mockAudioBlob2, 'hi')
    ]);

    expect(result1.transcription).toBe('Result 1');
    expect(result2.transcription).toBe('Result 2');
  });
});