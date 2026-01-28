
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RoleSelectionScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const selectRole = (role: 'vendor' | 'consumer') => {
        if (role === 'vendor') {
            navigate('/login');
        } else {
            navigate('/scan-qr');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 flex flex-col justify-center">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    How will you use<br />Vyapar AI?
                </h1>
                <p className="text-gray-600">Select your role to continue</p>
            </div>

            <div className="space-y-6 max-w-md mx-auto w-full">
                {/* Vendor Card */}
                <button
                    onClick={() => selectRole('vendor')}
                    className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-lg transition-all text-left flex items-center space-x-6 group"
                >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 px-3">
                        <span className="text-3xl">🧑‍🌾</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">I sell in the market</h3>
                        <p className="text-sm text-gray-500">Farmers, Traders, Commission Agents</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Consumer Card */}
                <button
                    onClick={() => selectRole('consumer')}
                    className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-green-500 hover:shadow-lg transition-all text-left flex items-center space-x-6 group"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 px-3">
                        <span className="text-3xl">🧍</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">I want to check price</h3>
                        <p className="text-sm text-gray-500">Buyers, Consumers, General Public</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-300 group-hover:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="mt-12 text-center">
                <p className="text-sm text-gray-400">
                    Vyapar AI helps you execute fair trade deals.
                </p>
            </div>
        </div>
    );
};

export default RoleSelectionScreen;
