
import React from 'react';
import VoiceDemo from '../components/VoiceDemo';
import I18nDemo from '../components/I18nDemo';

const HomePage: React.FC = () => {
    return (
        <div className="space-y-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Market Mania
                </h1>
                <p className="text-xl text-gray-600">
                    Intelligent Multilingual Marketplace Platform
                </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mr-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Voice Assistant</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Experience our advanced multilingual voice interface powered by Bhashini AI.
                        Speak in your native language to interact with the marketplace.
                    </p>
                    <VoiceDemo />
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-green-100 rounded-lg text-green-600 mr-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Global Access</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Full internationalization support for multiple Indian languages including Hindi, Tamil, Telugu, and more.
                    </p>
                    <I18nDemo />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
