
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';

const DashboardScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Bar */}
            <header className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-30">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-xs text-gray-500">Welcome back, Ramesh</p>
                </div>
                <div
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 cursor-pointer"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </header>

            <div className="p-4 space-y-6">

                {/* Today's Mandi Snapshot */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">Today's Mandi Snapshot</h2>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Azadpur</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <div className="text-green-600 font-bold text-lg">↑ 5%</div>
                            <div className="text-xs text-gray-500">Avg. Price</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <div className="text-orange-500 font-bold text-lg">High</div>
                            <div className="text-xs text-gray-500">Demand</div>
                        </div>
                    </div>
                </div>

                {/* Search Product */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products (e.g. Onion)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        onClick={() => navigate('/price-result')} // For demo, navigate to result
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Browse Mandis */}
                    <div
                        onClick={() => navigate('/mandi-selection')}
                        className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 cursor-pointer active:scale-95 transition-transform"
                    >
                        <svg className="w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="font-bold text-lg leading-tight mb-1">Browse Mandis</h3>
                        <p className="text-blue-200 text-xs">View prices across markets</p>
                    </div>

                    {/* Add Product */}
                    <div
                        onClick={() => navigate('/add-product')}
                        className="bg-green-600 rounded-2xl p-5 text-white shadow-lg shadow-green-200 cursor-pointer active:scale-95 transition-transform"
                    >
                        <svg className="w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <h3 className="font-bold text-lg leading-tight mb-1">Add Product</h3>
                        <p className="text-green-200 text-xs">List your harvest</p>
                    </div>
                </div>

                {/* Price Trends Link */}
                <div
                    onClick={() => navigate('/analytics')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer"
                >
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Price Trends</h3>
                            <p className="text-xs text-gray-500">View 7d/30d analysis</p>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>

            </div>

            <BottomNav activeTab="home" />
        </div>
    );
};

export default DashboardScreen;
