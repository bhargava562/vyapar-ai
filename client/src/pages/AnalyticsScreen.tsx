
import React from 'react';
import BottomNav from '../components/layout/BottomNav';

const AnalyticsScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900">Market Analytics</h1>
                <p className="text-xs text-gray-500">Azadpur Mandi Insights</p>
            </header>

            <div className="p-4 space-y-6">

                {/* Volatility Index */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">Volatility Index</h2>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">High Risk</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                        <div className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">Market is highly volatile today</p>
                </div>

                {/* Price Trend Graph (Mock) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-900">Onion Price Trend</h2>
                        <select className="bg-gray-100 rounded-lg text-xs p-1 border-none outline-none">
                            <option>7 Days</option>
                            <option>30 Days</option>
                        </select>
                    </div>

                    {/* CSS Chart */}
                    <div className="h-40 flex items-end space-x-2 border-b border-gray-200 pb-2">
                        {[40, 60, 45, 70, 80, 75, 90].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div
                                    className="w-full bg-green-500 rounded-t-md opacity-70 group-hover:opacity-100 transition-opacity"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                    <p className="text-center text-green-700 font-bold mt-4 text-sm">
                        Trending ↑ 12% this week
                    </p>
                </div>

                {/* AI Selling Hint */}
                <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-start space-x-3">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">AI Recommendation</h3>
                            <p className="text-indigo-100 text-sm">
                                Sell <b>Red Onion</b> at <b>Okhla Mandi</b> today for approx ₹50-100 better profit per quintal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav activeTab="analytics" />
        </div>
    );
};

export default AnalyticsScreen;
