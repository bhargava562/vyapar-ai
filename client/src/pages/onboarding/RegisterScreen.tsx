
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import MandiMap, { type Mandi } from '../../components/map/MandiMap';
import { useLocation } from '../../contexts/LocationContext';

const RegisterScreen: React.FC = () => {
    const navigate = useNavigate();
    const { latitude, longitude, requestLocation, permissionDenied } = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: 'farmer' as 'farmer' | 'trader' | 'buyer',
        state: '',
        district: '',
        mandi: '',
        preferred_language: 'en'
    });

    const [availableMandis, setAvailableMandis] = useState<Mandi[]>([]);
    const [mandisLoading, setMandisLoading] = useState(false);

    // Calculate Haversine Distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Fetch Mandis
    useEffect(() => {
        const fetchMandis = async () => {
            setMandisLoading(true);
            try {
                const { data, error } = await supabase.from('mandis').select('*');
                if (error) throw error;

                if (data) {
                    let mandisWithDistance: Mandi[] = data.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        latitude: m.latitude,
                        longitude: m.longitude,
                        district: m.district,
                        state: m.state,
                        distance: 0
                    }));

                    if (latitude && longitude) {
                        mandisWithDistance = mandisWithDistance.map(m => ({
                            ...m,
                            distance: calculateDistance(latitude, longitude, m.latitude, m.longitude)
                        })).sort((a, b) => a.distance - b.distance);
                    }
                    setAvailableMandis(mandisWithDistance);

                    // Auto-select nearest
                    if (mandisWithDistance.length > 0 && !formData.mandi && latitude) {
                        const nearest = mandisWithDistance[0];
                        setFormData(prev => ({
                            ...prev,
                            mandi: nearest.name,
                            state: nearest.state || '',
                            district: nearest.district || ''
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching mandis:", err);
                const fallbackMandis: Mandi[] = [
                    { id: '1', name: 'Azadpur Mandi', latitude: 28.7104, longitude: 77.1695, state: 'Delhi', district: 'North Delhi' },
                    { id: '2', name: 'Ghazipur Mandi', latitude: 28.6279, longitude: 77.3364, state: 'Delhi', district: 'East Delhi' },
                    { id: '3', name: 'Okhla Mandi', latitude: 28.5524, longitude: 77.2655, state: 'Delhi', district: 'South East Delhi' },
                ];
                setAvailableMandis(fallbackMandis);
            } finally {
                setMandisLoading(false);
            }
        };
        fetchMandis();
    }, [latitude, longitude]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log("Registering user:", formData);
            localStorage.setItem('userRole', formData.role);
            localStorage.setItem('userMandi', formData.mandi);
            if (formData.role === 'trader') navigate('/trader/dashboard');
            else if (formData.role === 'buyer') navigate('/buyer/dashboard');
            else navigate('/farmer/dashboard');
        } catch (error) {
            console.error("Registration failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMandiSelect = (mandi: Mandi) => {
        setFormData({
            ...formData,
            mandi: mandi.name,
            state: mandi.state || '',
            district: mandi.district || ''
        });
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Column - Hero Image (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
                <img
                    src="/assets/images/mandi_hero.png"
                    alt="Indian Mandi Market"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>

                <div className="relative z-10 flex flex-col justify-end h-full px-12 pb-24 text-white">
                    <div className="mb-6">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                            #1 Agri-Tech Platform
                        </span>
                        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
                            Smart Mandi <br /> Intelligence
                        </h1>
                        <p className="text-xl text-gray-200 max-w-md">
                            Connect directly with updated prices, find the best buyers, and maximize your profits with transparent market data.
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex -space-x-2 overflow-hidden">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-xs font-bold text-gray-700">
                                    User
                                </div>
                            ))}
                        </div>
                        <p className="text-sm self-center text-gray-300">
                            Trusted by <span className="font-bold text-white">50,000+</span> farmers and traders across India.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Registration Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 bg-gray-50 lg:bg-white overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Join Market Mania</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                                Log in
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="mt-1 flex">
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

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['farmer', 'trader', 'buyer'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role as any })}
                                        className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${formData.role === role
                                            ? 'bg-green-600 text-white border-transparent shadow-md transform scale-105'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mandi Selection via Map */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nearest Mandi: <span className="text-green-600 font-bold">{formData.mandi || "Not Selected"}</span>
                                </label>
                                {permissionDenied && (
                                    <button
                                        type="button"
                                        onClick={requestLocation}
                                        className="text-xs text-blue-600 hover:text-blue-500 underline"
                                    >
                                        Retry GPS
                                    </button>
                                )}
                            </div>

                            <div className="border rounded-xl overflow-hidden relative mb-2 shadow-sm ring-1 ring-black ring-opacity-5">
                                <MandiMap
                                    mandis={availableMandis}
                                    onSelectMandi={handleMandiSelect}
                                    height="250px"
                                />
                                {mandisLoading && (
                                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {latitude ? "Based on your current location." : "Enable location services for better accuracy."}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
