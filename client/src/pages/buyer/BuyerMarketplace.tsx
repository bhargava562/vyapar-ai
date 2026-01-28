
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const BuyerMarketplace: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Search Header */}
            <header className="bg-white p-4 pb-2 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search e.g. 'Fresh Potato'"
                            className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <div className="absolute left-3 top-3.5 text-gray-400">🔍</div>
                    </div>
                    <div onClick={() => navigate('/profile')} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
                        B
                    </div>
                </div>

                {/* Categories */}
                <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
                    {['All', 'Vegetables', 'Fruits', 'Grains'].map(c => (
                        <button key={c} className="whitespace-nowrap px-4 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-600 active:bg-gray-200">
                            {c}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 space-y-6">

                {/* Best Value Today */}
                <div>
                    <h2 className="font-bold text-gray-900 mb-3 text-lg">⭐ Best Value Today</h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="min-w-[240px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-[10px] uppercase">
                                        Save 15%
                                    </div>
                                    <div className="text-xl">{i === 1 ? '🥔' : '🧅'}</div>
                                </div>
                                <h3 className="font-bold text-gray-900">Potato (Agra)</h3>
                                <p className="text-xs text-gray-500 mb-2">Azadpur Mandi • 5km</p>

                                <div className="flex justify-between items-end">
                                    <div className="text-lg font-bold text-green-600">₹14/kg</div>
                                    <button className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                        Buy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nearby Mandis */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-gray-900 text-lg">📍 Nearby Mandis</h2>
                        <button className="text-green-600 text-sm font-medium">Map View</button>
                    </div>
                    <div className="space-y-3">
                        {['Azadpur', 'Okhla', 'Ghazipur'].map(m => (
                            <div key={m} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">🏢</div>
                                    <div>
                                        <div className="font-bold text-gray-900">{m} Mandi</div>
                                        <div className="text-xs text-gray-400">Open • 4.2km away</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-bold">Best for Veg</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compare Promo */}
                <div
                    onClick={() => navigate('/buyer/compare')}
                    className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between cursor-pointer"
                >
                    <div>
                        <h3 className="font-bold text-lg">Price Comparison</h3>
                        <p className="text-indigo-200 text-sm">Compare prices across 5 mandis</p>
                    </div>
                    <div className="text-3xl">⚖️</div>
                </div>

            </div>

            <BottomNav activeTab="home" role="buyer" />
        </div>
    );
};

export default BuyerMarketplace;
