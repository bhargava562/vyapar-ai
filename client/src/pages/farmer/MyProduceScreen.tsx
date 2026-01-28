
import React, { useState } from 'react';
import BottomNav from '../../components/layout/BottomNav';

const MyProduceScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Active');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900 mb-4">My Produce Listing</h1>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                    {['Active', 'Sold', 'Expired'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* Produce Item */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Red Onion</h3>
                            <p className="text-xs text-gray-500">Listed 2 days ago • Grade A</p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-gray-900">₹2250/q</div>
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">Live</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                        <div>
                            <div className="text-xs text-gray-400">Quantity</div>
                            <div className="font-semibold">500 kg</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Views</div>
                            <div className="font-semibold">42</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Offers</div>
                            <div className="font-semibold">3</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Edit Details
                        </button>
                        <button className="py-2 bg-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 shadow-sm">
                            Mark Sold
                        </button>
                    </div>
                </div>
            </div>

            <BottomNav activeTab="produce" role="farmer" />
        </div>
    );
};

export default MyProduceScreen;
