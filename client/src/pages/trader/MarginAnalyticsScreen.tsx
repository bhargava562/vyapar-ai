
import React, { useState } from 'react';
import BottomNav from '../../components/layout/BottomNav';

const MarginAnalyticsScreen: React.FC = () => {
    const [buyPrice, setBuyPrice] = useState('1800');
    const [sellPrice, setSellPrice] = useState('2200');
    const [qty, setQty] = useState('50'); // Quintals

    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    const quantity = parseFloat(qty) || 0;

    const revenue = sell * quantity;
    const cost = buy * quantity;
    const transportCost = quantity * 50; // Mock 50/q transport
    const mandiTax = revenue * 0.01; // Mock 1% tax

    const totalCost = cost + transportCost + mandiTax;
    const profit = revenue - totalCost;
    const margin = (profit / revenue) * 100;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900">Margin Calculator</h1>
            </header>

            <div className="p-4 space-y-6">

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Deal Parameters</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase">Buy Price (₹/q)</label>
                            <input
                                type="number"
                                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-lg font-bold"
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase">Target Sell (₹/q)</label>
                            <input
                                type="number"
                                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-lg font-bold"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase">Quantity (Quintals)</label>
                        <input
                            type="number"
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-lg font-bold"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                        <span className="text-xs text-gray-400">Example: 1 Truck ≈ 100q</span>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-blue-300 text-sm">Net Profit</p>
                            <h2 className="text-3xl font-bold mt-1">₹{profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${margin > 15 ? 'bg-green-500' : margin > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {margin.toFixed(1)}% Margin
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-blue-200">
                        <div className="flex justify-between">
                            <span>Revenue</span>
                            <span>₹{revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Product Cost</span>
                            <span>- ₹{cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Est. Transport</span>
                            <span>- ₹{transportCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Mandi Tax (1%)</span>
                            <span>- ₹{mandiTax.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-blue-800">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase text-blue-300">Risk Score</span>
                            <span className="text-yellow-400 font-bold">Medium</span>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav activeTab="margin" role="trader" />
        </div>
    );
};

export default MarginAnalyticsScreen;
