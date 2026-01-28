
import React from 'react';
import { useNavigate } from 'react-router-dom';

const VerificationResultScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Fair Price Verified</h1>
                <p className="text-sm text-gray-500 mb-8">This price is within the fair market range.</p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                    <div className="mb-1 text-sm text-gray-400 uppercase tracking-widest">PRODUCT</div>
                    <div className="text-2xl font-bold text-gray-800 mb-4">Onion (Nasik)</div>

                    <div className="mb-1 text-sm text-gray-400 uppercase tracking-widest">FAIR PRICE</div>
                    <div className="text-4xl font-extrabold text-green-600">₹24<span className="text-lg text-gray-400 font-normal">/kg</span></div>
                </div>

                <div className="text-xs text-gray-400 mb-8">
                    Verified at {new Date().toLocaleTimeString()} • {new Date().toLocaleDateString()}
                </div>

                <button
                    onClick={() => navigate('/role-select')}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                >
                    Scan Another
                </button>

                <p className="mt-6 text-xs text-gray-300 font-medium">Powered by Vyapar AI</p>
            </div>
        </div>
    );
};

export default VerificationResultScreen;
