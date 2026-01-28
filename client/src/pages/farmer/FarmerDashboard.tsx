
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const FarmerDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-green-600 p-6 pb-12 rounded-b-3xl shadow-lg relative z-10">
                <div className="flex justify-between items-center text-white mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Namaste, Ramesh</h1>
                        <p className="text-green-100 text-sm">Farmer • Azadpur Mandi</p>
                    </div>
                    <div onClick={() => navigate('/profile')} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer">
                        <span className="font-bold">RV</span>
                    </div>
                </div>

                {/* Primary CTA (Floating Overlap) */}
                <div className="absolute -bottom-6 left-6 right-6">
                    <button
                        onClick={() => navigate('/farmer/add-produce')}
                        className="w-full bg-white text-green-700 py-4 rounded-xl shadow-xl font-bold text-lg flex items-center justify-center space-x-2 hover:bg-green-50 transition-colors"
                    >
                        <div className="bg-green-100 p-1 rounded-full">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span>Add New Produce</span>
                    </button>
                </div>
            </header>

            <div className="mt-10 p-4 space-y-6">

                {/* Price Alert Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-3">Today's Best Price</h2>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Onion (Red)</div>
                            <div className="text-3xl font-extrabold text-green-600">₹2400</div>
                            <div className="text-xs text-gray-400">per quintal</div>
                        </div>
                        <div className="text-right">
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold mb-1">↑ 5% High</div>
                            <div className="text-xs text-gray-400">at Azadpur</div>
                        </div>
                    </div>
                </div>

                {/* My Listings Preview */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-gray-900">My Active Listings</h2>
                        <button onClick={() => navigate('/farmer/produce')} className="text-green-600 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                        {[1].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">🧅</div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Red Onion</h3>
                                        <p className="text-xs text-gray-500">500kg • Grade A</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900">₹22.50/kg</div>
                                    <span className="text-xs text-green-600">Active</span>
                                </div>
                            </div>
                        ))}
                        {/* Empty state hint if needed */}
                    </div>
                </div>

                {/* Buyer Interest */}
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">Buyer Interest Alert</h3>
                            <p className="text-sm text-blue-800 mb-2">
                                3 Traders are looking for <b>Tomato (Hybrid)</b> in your area.
                            </p>
                            <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">
                                Check Prices
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <BottomNav activeTab="home" role="farmer" />
        </div>
    );
};

export default FarmerDashboard;
