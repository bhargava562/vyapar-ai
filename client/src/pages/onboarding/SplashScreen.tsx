
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const SplashScreen: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            // Simulate/Check Supabase session
            const { data: { session } } = await supabase.auth.getSession();

            setTimeout(() => {
                if (session) {
                    navigate('/dashboard');
                } else {
                    navigate('/login');
                }
            }, 2500);
        };

        checkAuth();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex flex-col items-center justify-center text-white p-4">
            <div className="animate-fade-in-up text-center">
                {/* Logo Placeholder */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-green-600 text-4xl">
                    🌿
                </div>

                <h1 className="text-4xl font-bold mb-2 tracking-tight">Market Mania</h1>
                <p className="text-xl text-green-100 font-medium">Transparent Mandi Intelligence</p>

                <div className="mt-12">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto opacity-70"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
