
import React, { useState, useRef, useEffect } from 'react';

const MicTest: React.FC = () => {
    const [isTesting, setIsTesting] = useState(false);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            stopTest();
        };
    }, []);

    const analyzeAudio = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;

            // Normalize to 0-100 (approximately)
            const normalizedVolume = Math.min(100, Math.round(average * 2.5));
            setVolume(normalizedVolume);

            requestRef.current = requestAnimationFrame(analyzeAudio);
        }
    };

    const startTest = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();

            analyser.fftSize = 256;
            source.connect(analyser);

            analyserRef.current = analyser;
            setIsTesting(true);

            analyzeAudio();

        } catch (error) {
            console.error("Failed to access microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopTest = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        setIsTesting(false);
        setVolume(0);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Microphone Test</h3>
            <p className="text-gray-600 mb-4">
                Speak into your microphone to verify the input level.
            </p>

            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={isTesting ? stopTest : startTest}
                        className={`
               w-full sm:w-auto px-6 py-3 rounded-md font-medium text-white transition-colors
               flex items-center justify-center space-x-2
               ${isTesting
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'}
            `}
                    >
                        {isTesting ? (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                                <span>Stop Test</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <span>Start Mic Test</span>
                            </>
                        )}
                    </button>

                    <div className="text-sm text-gray-500 font-medium">
                        {isTesting ? (volume > 10 ? 'Detecting Audio...' : 'Listening...') : 'Ready'}
                    </div>
                </div>

                {/* Volume Meter */}
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                        className={`h-full transition-all duration-100 ${volume > 80 ? 'bg-red-500' : volume > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${volume}%` }}
                    ></div>

                    {/* Marker lines */}
                    <div className="absolute top-0 left-1/4 h-full w-px bg-white opacity-50"></div>
                    <div className="absolute top-0 left-2/4 h-full w-px bg-white opacity-50"></div>
                    <div className="absolute top-0 left-3/4 h-full w-px bg-white opacity-50"></div>
                </div>
            </div>
        </div>
    );
};

export default MicTest;
