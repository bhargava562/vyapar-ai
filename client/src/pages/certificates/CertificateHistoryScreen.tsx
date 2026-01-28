
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';

const CertificateHistoryScreen: React.FC = () => {
    const navigate = useNavigate();

    const certificates = [
        { id: '1', product: 'Onion (Nasik)', price: 24, date: 'Today, 2:30 PM', status: 'active' },
        { id: '2', product: 'Tomato (Hybrid)', price: 18, date: 'Yesterday', status: 'expired' },
        { id: '3', product: 'Potato (Local)', price: 12, date: '25 Jan', status: 'expired' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-30">
                <h1 className="text-xl font-bold text-gray-900">My Certificates</h1>
                <button className="text-green-600 font-medium text-sm">Filter</button>
            </header>

            <div className="p-4 space-y-4">
                {certificates.map((cert) => (
                    <div
                        key={cert.id}
                        onClick={() => navigate('/certificate-view')}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transform transition-transform"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${cert.product.includes('Onion') ? 'bg-purple-100' :
                                    cert.product.includes('Tomato') ? 'bg-red-100' : 'bg-yellow-100'
                                }`}>
                                {cert.product.includes('Onion') ? '🧅' :
                                    cert.product.includes('Tomato') ? '🍅' : '🥔'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{cert.product}</h3>
                                <p className="text-sm text-gray-500">{cert.date}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">₹{cert.price}</div>
                            <span className={`text-xs px-2 py-1 rounded-full ${cert.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                {cert.status === 'active' ? 'Active' : 'Expired'}
                            </span>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => navigate('/price-result')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-green-500 hover:text-green-600 transition-colors mt-4"
                >
                    + Create New Certificate
                </button>
            </div>

            <BottomNav activeTab="certificates" />
        </div>
    );
};

export default CertificateHistoryScreen;
