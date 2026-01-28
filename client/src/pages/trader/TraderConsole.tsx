
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const TraderConsole: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-blue-700 p-6 pb-2 text-white sticky top-0 z-30 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-bold">Trader Console</h1>
                        <p className="text-blue-200 text-xs">Aggregator • Delhi Zone</p>
                    </div>
                    <div onClick={() => navigate('/profile')} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border border-blue-400">
                        T
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between space-x-2 pb-4">
                    <div className="bg-blue-800/50 flex-1 rounded-lg p-3 text-center backdrop-blur-sm">
                        <div className="text-2xl font-bold">4.2t</div>
                        <div className="text-[10px] text-blue-200 uppercase tracking-widest">Inventory</div>
                    </div>
                    <div className="bg-blue-800/50 flex-1 rounded-lg p-3 text-center backdrop-blur-sm">
                        <div className="text-2xl font-bold text-green-300">₹85k</div>
                        <div className="text-[10px] text-blue-200 uppercase tracking-widest">Est Margin</div>
                    </div>
                </div>
            </header>

            <div className="p-4 space-y-6">

                {/* High Volume Alert */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-orange-500 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-gray-900">🔥 High Volume Today</h2>
                        <p className="text-sm text-gray-500">Potato (Agra) arrivals +200%</p>
                    </div>
                    <button className="bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg text-xs">
                        View Deals
                    </button>
                </div>

                {/* Live Mandi Feed Preview */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-gray-900">Live Mandi Feed</h2>
                        <button onClick={() => navigate('/trader/feed')} className="text-blue-600 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex justify-between items-start">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-gray-100 p-2 rounded-lg text-lg">
                                        {i === 1 ? '🥔' : i === 2 ? '🍅' : '🧅'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 line-clamp-1">Bulk {i === 1 ? 'Potato' : i === 2 ? 'Tomato' : 'Onion'} 5t</div>
                                        <div className="text-xs text-gray-500">Azadpur • 2 mins ago</div>
                                        <div className="mt-1 inline-flex items-center text-xs text-orange-600 font-medium space-x-1">
                                            <span>⚠️ Price Volatile</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900">₹1850</div>
                                    <button className="mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded shadow-sm hover:bg-blue-700">
                                        Bid
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Margin Calc Link */}
                <div
                    onClick={() => navigate('/trader/margin')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg flex justify-between items-center cursor-pointer"
                >
                    <div>
                        <h3 className="font-bold text-lg mb-1">Margin Calculator</h3>
                        <p className="text-green-100 text-sm">Analyze profit before buying</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

            </div>

            <BottomNav activeTab="home" role="trader" />
        </div>
    );
};

export default TraderConsole;
