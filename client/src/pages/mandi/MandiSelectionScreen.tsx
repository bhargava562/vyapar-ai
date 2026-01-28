
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const MandiSelectionScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    const mandis = [
        { id: 1, name: 'Azadpur Mandi', location: 'Delhi', trend: 'up', products: 120 },
        { id: 2, name: 'Ghazipur Mandi', location: 'Delhi', trend: 'down', products: 85 },
        { id: 3, name: 'Okhla Mandi', location: 'Delhi', trend: 'stable', products: 92 },
        { id: 4, name: 'Keshopur Mandi', location: 'Delhi', trend: 'up', products: 64 },
    ];

    const filteredMandis = mandis.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900 mb-4">Browse Mandis</h1>

                {/* Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search mandi..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filters */}
                <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                    {['All', 'Vegetables', 'Fruits', 'Spices'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 space-y-4">
                {filteredMandis.map((mandi) => (
                    <div
                        key={mandi.id}
                        onClick={() => navigate(`/mandi/${mandi.id}`)}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-98 transition-transform cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{mandi.name}</h3>
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {mandi.location}
                                </div>
                            </div>
                            {mandi.trend === 'up' && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Activity ↑</span>
                            )}
                            {mandi.trend === 'down' && (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Activity ↓</span>
                            )}
                            {mandi.trend === 'stable' && (
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">Stable</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-gray-50">
                            <span className="text-gray-500">{mandi.products} products listed</span>
                            <span className="text-green-600 font-medium">View Details &rarr;</span>
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav activeTab="mandi" />
        </div>
    );
};

export default MandiSelectionScreen;
