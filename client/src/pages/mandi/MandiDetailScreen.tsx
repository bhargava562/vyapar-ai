
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const MandiDetailScreen: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Vegetables');

    // Limit content for scroll demo
    const products = Array(15).fill(null).map((_, i) => ({
        id: i + 1,
        name: i % 2 === 0 ? 'Onion (Red)' : 'Tomato (Hybrid)',
        grade: i % 3 === 0 ? 'A' : 'B',
        price: i % 2 === 0 ? '2200-2400' : '1800-2000',
        unit: '₹/quintal',
        seller: i % 2 === 0 ? 'Farmer' : 'Trader',
        quantity: '500 kg',
        time: '10 min ago'
    }));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="p-4 flex items-center space-x-3">
                    <button onClick={() => navigate(-1)} className="text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold">Azadpur Mandi</h1>
                </div>

                {/* Tab Bar */}
                <div className="flex px-4 space-x-6 overflow-x-auto no-scrollbar border-b border-gray-100">
                    {['Vegetables', 'Fruits', 'Spices', 'Flowers'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* Overview Info */}
            <div className="p-4 bg-green-50 border-b border-green-100">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1 text-green-800">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Open: 4 AM - 8 PM</span>
                    </div>
                    <div className="font-bold text-green-800">{products.length} Products Live</div>
                </div>
            </div>

            {/* Product List */}
            <div className="p-4 space-y-4">
                {products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">Grade {product.grade}</span>
                                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{product.seller}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-700 text-lg">{product.price}</div>
                                <div className="text-xs text-gray-400">{product.unit}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500">
                            <span>Qty: {product.quantity}</span>
                            <span>Updated {product.time}</span>
                        </div>
                    </div>
                ))}

                {/* Infinite Scroll Trigger / Loader */}
                <div className="text-center py-4 text-gray-400 text-sm">
                    Load more products...
                </div>
            </div>

            <BottomNav activeTab="mandi" />
        </div>
    );
};

export default MandiDetailScreen;
