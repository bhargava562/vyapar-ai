
import React from 'react';
import BottomNav from '../../components/layout/BottomNav';

const PriceInsightsScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900">Price Insights</h1>
                <p className="text-xs text-gray-500">AI-driven selling recommendations</p>
            </header>

            <div className="p-4 space-y-6">
                {/* Best Mandi Recommendation */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-lg">Best Mandi Today</h2>
                            <p className="text-indigo-200 text-sm">For your Red Onion</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg text-2xl">🏆</div>
                    </div>

                    <div className="mb-4">
                        <div className="text-3xl font-bold">Okhla Mandi</div>
                        <div className="text-sm text-indigo-200">24km away • Higher demand</div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                        <span>Potential Profit</span>
                        <span className="font-bold text-green-300">+ ₹150 / quintal</span>
                    </div>
                </div>

                {/* Suggested Price Range */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">Fair Price Range</h3>
                    <p className="text-sm text-gray-500 mb-4">Based on today's supply in Delhi NCR</p>

                    <div className="relative pt-6 pb-2">
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div className="absolute top-6 h-2 bg-green-500 rounded-full" style={{ left: '20%', width: '40%' }}></div>
                        </div>

                        {/* Markers */}
                        <div className="absolute top-0 left-[20%] -translate-x-1/2 flex flex-col items-center">
                            <span className="font-bold text-gray-900">₹2200</span>
                            <div className="h-4 w-0.5 bg-gray-300"></div>
                        </div>
                        <div className="absolute top-0 left-[60%] -translate-x-1/2 flex flex-col items-center">
                            <span className="font-bold text-gray-900">₹2600</span>
                            <div className="h-4 w-0.5 bg-gray-300"></div>
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-600">
                            We recommend listing between <b>₹2300 - ₹2500</b>
                        </div>
                    </div>
                </div>

                {/* Warnings */}
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 flex items-start space-x-3">
                    <div className="text-yellow-600 text-xl">⚠️</div>
                    <div>
                        <h4 className="font-bold text-yellow-800">High Supply Alert</h4>
                        <p className="text-sm text-yellow-700">
                            Truck arrivals for Onion increased by 40% in Azadpur. Prices might drop by evening.
                        </p>
                    </div>
                </div>
            </div>

            <BottomNav activeTab="insights" role="farmer" />
        </div>
    );
};

export default PriceInsightsScreen;
