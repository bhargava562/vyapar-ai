
import React, { useState, useRef, useEffect } from 'react';

const SpeakerTest: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);

    useEffect(() => {
        return () => {
            stopTone();
        };
    }, []);

    const startTone = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4 note

            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillatorRef.current = oscillator;
            setIsPlaying(true);

            // Auto stop after 3 seconds
            setTimeout(() => {
                stopTone();
            }, 3000);

        } catch (error) {
            console.error("Failed to play tone:", error);
        }
    };

    const stopTone = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            } catch (e) {
                // Ignore error if already stopped
            }
            oscillatorRef.current = null;
        }
        setIsPlaying(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Speaker Test</h3>
            <p className="text-gray-600 mb-4">
                Click the button below to play a test tone (A4 - 440Hz). Verify that you can hear the sound clearly.
            </p>

            <div className="flex items-center space-x-4">
                <button
                    onClick={isPlaying ? stopTone : startTone}
                    className={`
             w-full sm:w-auto px-6 py-3 rounded-md font-medium text-white transition-colors
             flex items-center justify-center space-x-2
             ${isPlaying
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'}
          `}
                >
                    {isPlaying ? (
                        <>
                            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <span>Playing...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Test Speaker</span>
                        </>
                    )}
                </button>

                {isPlaying && (
                    <div className="flex space-x-1 items-end h-8">
                        <div className="w-1 bg-blue-500 h-2 animate-pulse"></div>
                        <div className="w-1 bg-blue-500 h-4 animate-pulse delay-75"></div>
                        <div className="w-1 bg-blue-500 h-6 animate-pulse delay-150"></div>
                        <div className="w-1 bg-blue-500 h-3 animate-pulse delay-100"></div>
                        <div className="w-1 bg-blue-500 h-5 animate-pulse delay-200"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakerTest;
