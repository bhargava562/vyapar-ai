
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<'farmer' | 'trader' | 'buyer'>('farmer');

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) setRole(storedRole as any);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const getRoleBadge = () => {
        if (role === 'farmer') return { label: 'Farmer • Verified', color: 'text-green-100', bg: 'bg-green-600' };
        if (role === 'trader') return { label: 'Trader • Aggregator', color: 'text-blue-100', bg: 'bg-blue-700' };
        return { label: 'Buyer • Retail', color: 'text-gray-100', bg: 'bg-gray-800' };
    };

    const theme = getRoleBadge();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className={`${theme.bg} p-6 text-white text-center pb-12 rounded-b-3xl`}>
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-white/30 p-1">
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                        {role === 'farmer' ? 'RV' : role === 'trader' ? 'MK' : 'AK'}
                    </div>
                </div>
                <h1 className="text-2xl font-bold capitalize">
                    {role === 'farmer' ? 'Ramesh Vegetables' : role === 'trader' ? 'Mukesh Trading Co.' : 'Ankit Kitchens'}
                </h1>
                <p className={theme.color}>{theme.label}</p>
            </header>

            <div className="-mt-8 px-4 space-y-4">

                {/* Stats Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between text-center">
                    <div className="flex-1">
                        <div className="text-xl font-bold text-gray-900">12</div>
                        <div className="text-xs text-gray-500">{role === 'buyer' ? 'Orders' : 'Listings'}</div>
                    </div>
                    <div className="flex-1 border-l border-gray-100">
                        <div className="text-xl font-bold text-gray-900">4.8</div>
                        <div className="text-xs text-gray-500">Rating</div>
                    </div>
                    <div className="flex-1 border-l border-gray-100">
                        <div className="text-xl font-bold text-gray-900">85</div>
                        <div className="text-xs text-gray-500">{role === 'trader' ? 'Bids' : 'Deals'}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Info */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-50 pb-2">My Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Role</span>
                                <span className="font-medium text-gray-900 capitalize">{role}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium text-gray-900">+91 98765 43210</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Location</span>
                                <span className="font-medium text-gray-900">Delhi NCR, India</span>
                            </div>
                        </div>
                    </div>

                    {/* Settings Links */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 border-b border-gray-50"
                        >
                            <span className="font-medium text-gray-900">App Settings</span>
                            <span className="text-gray-400">&rarr;</span>
                        </button>
                        <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50">
                            <span className="font-medium text-gray-900">Help & Support</span>
                            <span className="text-gray-400">&rarr;</span>
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-4 bg-white text-red-600 rounded-xl font-bold border border-red-100 shadow-sm hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <BottomNav activeTab="profile" role={role} />
        </div>
    );
};

export default ProfileScreen;
