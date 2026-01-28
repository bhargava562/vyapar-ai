
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const QRScanScreen: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied or not available", err);
            }
        };

        startCamera();

        // Mock scanning delay
        const timer = setTimeout(() => {
            navigate('/verification-result');
        }, 3000);

        return () => {
            clearTimeout(timer);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black relative flex flex-col items-center justify-center">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            {/* Overlay UI */}
            <div className="relative z-10 w-64 h-64 border-2 border-white rounded-3xl flex flex-col items-center justify-center">
                <div className="w-60 h-0.5 bg-red-500 animate-scan absolute top-0"></div>
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1 rounded-br-lg"></div>
            </div>

            <div className="relative z-10 mt-8 text-center p-4">
                <h2 className="text-white font-bold text-xl mb-2">Scan Price QR</h2>
                <p className="text-gray-300 text-sm">Point camera at a Vyapar AI certificate</p>
            </div>

            <button
                onClick={() => navigate('/role-select')}
                className="absolute bottom-8 text-white bg-white/20 backdrop-blur-md px-6 py-2 rounded-full font-medium"
            >
                Cancel
            </button>

            <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default QRScanScreen;
