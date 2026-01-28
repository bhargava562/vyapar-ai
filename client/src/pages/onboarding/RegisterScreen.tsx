
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const RegisterScreen: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: 'farmer' as 'farmer' | 'trader' | 'buyer',
        state: '',
        district: '',
        mandi: ''
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up with Supabase Auth (Mocking phone auth for demo if standard signup is email)
            // For demo, we'll just simulate success or use a basic email/pass if configured
            // const { data, error } = await supabase.auth.signUp({ ... });

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Insert into users table (Mock)
            console.log("Registering user:", formData);

            // Store role for demo routing
            localStorage.setItem('userRole', formData.role);

            // Navigate to Dashboard logic
            if (formData.role === 'trader') navigate('/trader/dashboard');
            else if (formData.role === 'buyer') navigate('/buyer/dashboard');
            else navigate('/farmer/dashboard');
        } catch (error) {
            console.error("Registration failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-600">Join the Transparent Mandi Intelligence</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="mt-1">
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="98765 43210"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['farmer', 'trader', 'buyer'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role as any })}
                                        className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${formData.role === role
                                            ? 'bg-green-600 text-white border-transparent shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location (Simplified) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nearest Mandi</label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={formData.mandi}
                                onChange={e => setFormData({ ...formData, mandi: e.target.value })}
                                required
                            >
                                <option value="">Select Mandi</option>
                                <option value="azadpur">Azadpur Mandi, Delhi</option>
                                <option value="khazipur">Ghazipur Mandi</option>
                                <option value="okhla">Okhla Mandi</option>
                            </select>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : 'Register'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                                Log in here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
