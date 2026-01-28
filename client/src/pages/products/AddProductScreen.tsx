
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const AddProductScreen: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Vegetables',
        grade: 'A',
        quantity: '',
        price_min: '',
        price_max: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate Supabase Insert
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-30 flex items-center space-x-3">
                <button onClick={() => navigate(-1)} className="text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900">Add New Product</h1>
            </header>

            <div className="p-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Type & Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            >
                                <option value="">Select Product...</option>
                                <option value="Onion">Onion</option>
                                <option value="Tomato">Tomato</option>
                                <option value="Potato">Potato</option>
                                <option value="Garlic">Garlic</option>
                                <option value="Ginger">Ginger</option>
                                <option value="Chilli">Green Chilli</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Or type custom name if not listed</p>
                        </div>

                        {/* Category & Grade */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Vegetables</option>
                                    <option>Fruits</option>
                                    <option>Spices</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
                                <select
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    value={formData.grade}
                                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                >
                                    <option>A (Premium)</option>
                                    <option>B (Standard)</option>
                                    <option>C (Economy)</option>
                                </select>
                            </div>
                        </div>

                        {/* Qty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
                            <div className="flex">
                                <input
                                    type="number"
                                    className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:ring-green-500 focus:border-green-500"
                                    placeholder="e.g. 500"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                />
                                <span className="inline-flex items-center px-3 bg-gray-50 border border-gray-300 text-gray-500 rounded-r-lg">
                                    kg
                                </span>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price (₹/quintal)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    placeholder="Min"
                                    value={formData.price_min}
                                    onChange={e => setFormData({ ...formData, price_min: e.target.value })}
                                />
                                <input
                                    type="number"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    placeholder="Max"
                                    value={formData.price_max}
                                    onChange={e => setFormData({ ...formData, price_max: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Availability Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                            <input
                                type="date"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Listing Product...' : 'List Product'}
                        </button>
                    </form>
                </div>
            </div>

            <BottomNav activeTab="add" role={(localStorage.getItem('userRole') as any) || 'farmer'} />
        </div>
    );
};

export default AddProductScreen;
