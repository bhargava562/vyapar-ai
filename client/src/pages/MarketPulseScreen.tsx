
import React from 'react';
import BottomNav from '../components/layout/BottomNav';

const MarketPulseScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900">Market Pulse</h1>
                <p className="text-sm text-gray-500">Azadpur Mandi • Live Updates</p>
            </header>

            <div className="p-4 space-y-6">
                {['Onion', 'Tomato', 'Potato'].map((item) => (
                    <div key={item} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="text-3xl">
                                    {item === 'Onion' ? '🧅' : item === 'Tomato' ? '🍅' : '🥔'}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{item}</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-green-600 font-bold flex items-center justify-end">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Up 5%
                                </div>
                                <div className="text-xs text-gray-400">vs yesterday</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 rounded-xl p-3">
                                <div className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1">DEMAND</div>
                                <div className="text-lg font-bold text-gray-900">High</div>
                                <div className="w-full bg-red-200 h-1.5 rounded-full mt-2">
                                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-3">
                                <div className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">SUPPLY</div>
                                <div className="text-lg font-bold text-gray-900">Medium</div>
                                <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav activeTab="market" />
        </div>
    );
};

export default MarketPulseScreen;
