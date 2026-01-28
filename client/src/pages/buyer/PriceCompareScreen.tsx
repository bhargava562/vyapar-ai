
import React from 'react';
import BottomNav from '../../components/layout/BottomNav';

const PriceCompareScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900">Compare Prices</h1>
                <p className="text-xs text-gray-500">For "Red Onion (Grade A)"</p>
            </header>

            <div className="p-4 space-y-4">

                {/* Comparison Table/Matrix */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Header */}
                    <div className="grid grid-cols-4 bg-gray-50 p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                        <div className="text-left col-span-2">Mandi</div>
                        <div>Price</div>
                        <div>Dist.</div>
                    </div>

                    {/* Rows */}
                    {[
                        { name: 'Okhla', price: 2300, dist: '12km', best: true },
                        { name: 'Azadpur', price: 2450, dist: '5km', best: false },
                        { name: 'Ghazipur', price: 2400, dist: '22km', best: false },
                        { name: 'Keshopur', price: 2380, dist: '18km', best: false },
                    ].map((row, i) => (
                        <div key={i} className={`grid grid-cols-4 p-4 border-t border-gray-100 items-center ${row.best ? 'bg-green-50' : ''}`}>
                            <div className="col-span-2 text-left">
                                <div className="font-bold text-gray-900">{row.name}</div>
                                {row.best && <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-bold">Best Value</span>}
                            </div>
                            <div className={`text-center font-bold ${row.best ? 'text-green-700' : 'text-gray-900'}`}>
                                ₹{row.price}
                            </div>
                            <div className="text-center text-xs text-gray-500">
                                {row.dist}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Visual Graph */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Price vs Quality Matrix</h3>
                    <div className="relative h-48 border-l border-b border-gray-200">
                        {/* Y-axis label */}
                        <div className="absolute -left-6 top-1/2 -rotate-90 text-xs text-gray-400">Price (High)</div>
                        {/* X-axis label */}
                        <div className="absolute left-1/2 -bottom-6 text-xs text-gray-400">Quality (Premium)</div>

                        {/* Points */}
                        <div className="absolute left-[80%] bottom-[40%] text-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto shadow-lg ring-4 ring-red-100"></div>
                            <span className="text-[10px] font-bold mt-1 text-gray-600 block">Azadpur</span>
                        </div>
                        <div className="absolute left-[70%] bottom-[30%] text-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto shadow-lg ring-4 ring-green-100 animate-pulse"></div>
                            <span className="text-[10px] font-bold mt-1 text-gray-600 block">Okhla</span>
                        </div>
                        <div className="absolute left-[40%] bottom-[60%] text-center">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto"></div>
                            <span className="text-[10px] mt-1 text-gray-400 block">Ghazipur</span>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav activeTab="compare" role="buyer" />
        </div>
    );
};

export default PriceCompareScreen;
