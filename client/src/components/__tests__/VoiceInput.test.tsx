/**
 * Tests for VoiceInput component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import VoiceInput from '../VoiceInput';

// Mock SpeechRecognition
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: 'hi-IN',
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  onstart: vi.fn(),
  onend: vi.fn(),
  onresult: vi.fn(),
  onerror: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

const mockSpeechRecognitionConstructor = vi.fn(() => mockSpeechRecognition);

// Mock window.SpeechRecognition
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: mockSpeechRecognitionConstructor,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: mockSpeechRecognitionConstructor,
});

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('VoiceInput', () => {
  const mockOnVoiceResult = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders voice input button when speech recognition is supported', () => {
    renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
        placeholder="Test placeholder"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-500');
  });

  it('does not render when speech recognition is not supported', () => {
    // Temporarily remove SpeechRecognition support
    const originalSpeechRecognition = window.SpeechRecognition;
    const originalWebkitSpeechRecognition = window.webkitSpeechRecognition;

    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    const { container } = renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
      />
    );

    expect(container.firstChild).toBeNull();

    // Restore SpeechRecognition
    window.SpeechRecognition = originalSpeechRecognition;
    window.webkitSpeechRecognition = originalWebkitSpeechRecognition;
  });

  it('starts listening when button is clicked', () => {
    renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });

  it('handles voice result correctly', () => {
    renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
      />
    );

    // Simulate speech recognition result
    const mockEvent = {
      results: [
        [
          {
            transcript: 'Hello World',
            confidence: 0.9
          }
        ]
      ],
      resultIndex: 0
    };

    // Trigger the onresult callback
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent as any);
    }

    expect(mockOnVoiceResult).toHaveBeenCalledWith('Hello World');
  });

  it('handles speech recognition errors', () => {
    renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
      />
    );

    // Simulate speech recognition error
    const mockErrorEvent = {
      error: 'no-speech',
      message: 'No speech detected'
    };

    // Trigger the onerror callback
    if (mockSpeechRecognition.onerror) {
      mockSpeechRecognition.onerror(mockErrorEvent as any);
    }

    expect(mockOnError).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('uses correct language for speech recognition', () => {
    renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
        language="ta"
      />
    );

    expect(mockSpeechRecognition.lang).toBe('ta-IN');
  });

  it('shows listening state when active', () => {
    renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
      />
    );

    const button = screen.getByRole('button');

    // Simulate start listening
    fireEvent.click(button);

    // Trigger onstart callback to set listening state
    if (mockSpeechRecognition.onstart) {
      mockSpeechRecognition.onstart({} as any);
    }

    // The button should show listening state (red background with animation)
    expect(button).toHaveClass('bg-red-500', 'animate-pulse');
  });

  it('cleans up speech recognition on unmount', () => {
    const { unmount } = renderWithI18n(
      <VoiceInput
        onVoiceResult={mockOnVoiceResult}
        onError={mockOnError}
      />
    );

    unmount();

    expect(mockSpeechRecognition.abort).toHaveBeenCalled();
  });
});