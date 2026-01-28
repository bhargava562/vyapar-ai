
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<'password' | 'otp'>('password');

    // Form State
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mock Login
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In real app: await supabase.auth.signInWithPassword(...)

            // Check role
            const role = localStorage.getItem('userRole') || 'farmer';

            if (role === 'trader') navigate('/trader/dashboard');
            else if (role === 'buyer') navigate('/buyer/dashboard');
            else navigate('/farmer/dashboard');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                        register as a new user
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>

                        {/* Toggle Method */}
                        <div className="flex justify-center border-b border-gray-200 mb-6">
                            <button
                                type="button"
                                onClick={() => setMethod('password')}
                                className={`pb-2 px-4 text-sm font-medium border-b-2 ${method === 'password' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
                                    }`}
                            >
                                Password
                            </button>
                            <button
                                type="button"
                                onClick={() => setMethod('otp')}
                                className={`pb-2 px-4 text-sm font-medium border-b-2 ${method === 'otp' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
                                    }`}
                            >
                                OTP Login
                            </button>
                        </div>

                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                Phone Number / Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        {method === 'password' ? (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="text-sm text-right mt-1">
                                    <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <button
                                    type="button"
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => alert("OTP Sent!")}
                                >
                                    Send OTP
                                </button>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
