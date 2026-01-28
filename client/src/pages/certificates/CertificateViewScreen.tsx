
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const CertificateViewScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isNew = searchParams.get('new') === 'true';

    return (
        <div className="min-h-screen bg-gray-900 pb-20 text-white flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Status Badge */}
                <div className="bg-green-600 text-white text-center py-2 font-bold flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>VERIFIED FAIR PRICE</span>
                </div>

                <div className="p-8 text-center text-gray-900">
                    <h3 className="text-gray-500 uppercase text-xs tracking-wider mb-2">PRODUCT</h3>
                    <h2 className="text-3xl font-bold mb-6">Onion (Red/Nasik)</h2>

                    <div className="flex items-center justify-center space-x-2 mb-8">
                        <span className="text-5xl font-extrabold text-green-700">₹24</span>
                        <span className="text-xl text-gray-400">/kg</span>
                    </div>

                    <div className="border-t border-b border-gray-100 py-4 mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Vendor</span>
                            <span className="font-semibold">Ramesh Vegetables</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Location</span>
                            <span className="font-semibold">Azadpur Mandi, Shed 4</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Valid Till</span>
                            <span className="font-semibold text-red-500">Today, 6:00 PM</span>
                        </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="bg-gray-100 w-48 h-48 mx-auto rounded-xl flex items-center justify-center mb-6 border-4 border-dashed border-gray-300">
                        <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-2h4v-2h3v2m-3-12h1m-1 9h1m-7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {/* In real app, render actual QR here */}
                    </div>

                    <p className="text-xs text-gray-400">
                        Scan to verify on Vyapar AI app
                    </p>
                </div>

                <div className="bg-gray-50 p-4 grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors col-span-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>Share on WhatsApp</span>
                    </button>

                    <button
                        onClick={() => navigate('/certificates')}
                        className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100"
                    >
                        Close
                    </button>

                    <button className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100">
                        Fullscreen
                    </button>
                </div>
            </div>

            <button onClick={() => navigate(-1)} className="mt-8 text-gray-400 hover:text-white">
                &larr; Back to Dashboard
            </button>
        </div>
    );
};

export default CertificateViewScreen;
