
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductDetailScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Image Area */}
            <div className="relative h-64 bg-gray-200">
                <img
                    src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80"
                    alt="Onion"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="absolute bottom-4 left-4 text-white">
                    <h1 className="text-3xl font-bold">Onion (Red/Nasik)</h1>
                    <p className="text-gray-200">Fresh Stock • Grade A</p>
                </div>
            </div>

            <div className="p-4 space-y-6 -mt-6 relative z-10 bg-gray-50 rounded-t-3xl">

                {/* Price Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Live Price Range</p>
                        <div className="text-3xl font-bold text-green-700">₹2200 - 2400</div>
                        <p className="text-xs text-gray-400">per quintal</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Demand: High</span>
                    </div>
                </div>

                {/* AI USP Zone */}
                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xl">🤖</span>
                        <h3 className="font-bold text-indigo-900">Vyapar AI Insights</h3>
                    </div>
                    <p className="text-sm text-indigo-800 mb-2">
                        "Price is stable. Demand from hoteliers is increasing this week. Good time to verify deal."
                    </p>
                    <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Predicted to rise 2% tmrw</span>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Seller Information</h3>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            RV
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Ramesh Vegetables</h4>
                            <p className="text-sm text-gray-500">Trader • Verified</p>
                        </div>
                        <div className="ml-auto">
                            <span className="text-yellow-500">★ 4.8</span>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors">
                        Contact Seller
                    </button>
                    <button className="w-full py-3 bg-white text-green-600 border border-green-600 rounded-xl font-bold mt-3 hover:bg-green-50 transition-colors">
                        Request Deal
                    </button>
                </div>

                {/* Quality Parameters */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Quality Parameters</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Size</span>
                            <span className="font-medium">45-55 mm</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Moisture</span>
                            <span className="font-medium">Low (&lt;12%)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Origin</span>
                            <span className="font-medium">Nashik, MH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Non-MRP Disclaimer</span>
                            <span className="font-medium text-orange-500 text-xs text-right max-w-[150px]">Prices fluctuate based on quality and real-time market conditions.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailScreen;
