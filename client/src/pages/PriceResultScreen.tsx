
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';

const PriceResultScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const product = searchParams.get('product') || 'Onion';
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 1500);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Connecting to Mandi Network...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm flex items-center space-x-3 sticky top-0 z-30">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-lg font-bold">Fair Price Check</h1>
            </header>

            <div className="p-4 space-y-6">
                {/* Main Price Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                        {product === 'Tomato' ? '🍅' : product === 'Potato' ? '🥔' : '🧅'}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{product} (Hybrid)</h2>
                    <p className="text-gray-500 mb-6">Azadpur Mandi • Today</p>

                    <div className="text-5xl font-extrabold text-green-700 mb-2">
                        ₹24<span className="text-2xl text-gray-400 font-normal">/kg</span>
                    </div>

                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        High Confidence (92%)
                    </div>

                    <p className="text-gray-600 italic">
                        "This is a fair market price today based on supply."
                    </p>

                    <div className="flex justify-center mt-4">
                        <button className="flex items-center text-blue-600 font-medium">
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            Hear Explanation
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={() => navigate('/certificate-view?new=true')}
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate Certificate</span>
                </button>

                <button className="w-full py-4 bg-white text-gray-700 rounded-xl font-bold text-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center space-x-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    <span>See Proof & Trends</span>
                </button>
            </div>

            <BottomNav activeTab="home" />
        </div>
    );
};

export default PriceResultScreen;
