
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/layout/BottomNav';
import SpeakerTest from '../components/settings/SpeakerTest';
import MicTest from '../components/settings/MicTest';

const SettingsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [offlineMode, setOfflineMode] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900">Settings & Help</h1>
            </header>

            <div className="p-4 space-y-6">

                {/* Language & Voice */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">PREFERENCES</h2>

                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">App Language</h3>
                                <p className="text-sm text-gray-500">{i18n.language === 'hi' ? 'Hindi' : 'English'}</p>
                            </div>
                        </div>
                        <button className="text-green-600 font-medium text-sm">Change</button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Voice Assistance</h3>
                            </div>
                        </div>
                        <div
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${voiceEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Offline & Data */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">DATA & STORAGE</h2>

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Offline Mode</h3>
                                <p className="text-xs text-gray-500">Save data by caching prices</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setOfflineMode(!offlineMode)}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${offlineMode ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${offlineMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Testing Tools (Legacy/Dev) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">AUDIO DIAGNOSTICS</h2>
                    <div className="space-y-4">
                        <SpeakerTest />
                        <MicTest />
                    </div>
                </div>

                {/* Help & Support */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
                    <button className="w-full text-left py-2 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Help Tutorial</span>
                        <span className="text-gray-400">&rarr;</span>
                    </button>
                    <button className="w-full text-left py-2 flex items-center justify-between border-t border-gray-50">
                        <span className="font-semibold text-gray-900">Send Feedback</span>
                        <span className="text-gray-400">&rarr;</span>
                    </button>
                </div>

                <div className="text-center text-xs text-gray-400 pt-4">
                    Vyapar AI v1.0.2
                </div>
            </div>

            <BottomNav activeTab="settings" />
        </div>
    );
};

export default SettingsPage;
