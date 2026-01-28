
import React from 'react';
import BottomNav from '../../components/layout/BottomNav';

const MandiFeedScreen: React.FC = () => {
    const feedItems = Array(10).fill(null).map((_, i) => ({
        id: i,
        product: i % 2 === 0 ? 'Potato' : 'Onion',
        icon: i % 2 === 0 ? '🥔' : '🧅',
        qty: (Math.random() * 5 + 1).toFixed(1),
        mandi: 'Azadpur',
        price: 1800 + Math.floor(Math.random() * 400),
        time: `${i * 5}m ago`
    }));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">Live Feed</h1>
                <div className="flex space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-green-600 font-bold">LIVE</span>
                </div>
            </header>

            <div className="p-4 space-y-3">
                {feedItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                        {/* Bulk Tag */}
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">
                            Bulk
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">{item.icon}</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.product}</h3>
                                    <div className="text-sm font-medium text-gray-600">{item.qty} Tonnes</div>
                                    <div className="text-xs text-gray-400 mt-1">{item.mandi} • {item.time}</div>
                                </div>
                            </div>
                            <div className="text-right mt-4">
                                <div className="text-xl font-bold text-gray-900">₹{item.price}</div>
                                <span className="text-xs text-gray-400">/quintal</span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-3">
                            <button className="text-blue-600 font-bold text-xs bg-blue-50 py-2 rounded">
                                Contact Seller
                            </button>
                            <button className="text-white font-bold text-xs bg-blue-600 py-2 rounded shadow-sm hover:bg-blue-700">
                                Place Bid
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav activeTab="feed" role="trader" />
        </div>
    );
};

export default MandiFeedScreen;
