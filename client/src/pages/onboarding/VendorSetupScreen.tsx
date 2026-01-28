
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VendorSetupScreen: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        market: '',
        categories: [] as string[]
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    const handleFinish = () => {
        // Save profile logic here
        localStorage.setItem('vendor_profile', JSON.stringify(formData));
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Progress Bar */}
            <div className="h-2 bg-gray-200">
                <div
                    className="h-full bg-green-600 transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                ></div>
            </div>

            <div className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full">
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in-right">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">What is your shop name?</h2>
                            <p className="text-gray-500">This will appear on your fair price certificates.</p>
                        </div>

                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Ramesh Vegetables"
                            className="w-full p-4 text-xl border-b-2 border-gray-300 focus:border-green-600 outline-none bg-transparent"
                            autoFocus
                        />

                        <button
                            onClick={nextStep}
                            disabled={!formData.name}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 disabled:opacity-50 mt-8"
                        >
                            Next
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in-right">
                        <button onClick={prevStep} className="text-gray-500 mb-4 flex items-center">
                            ← Back
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select your Market</h2>
                            <p className="text-gray-500">We found these mandis near you.</p>
                        </div>

                        <div className="space-y-3">
                            {['Azadpur Mandi, Delhi', 'Okhla Sabzi Mandi', 'Ghazipur Mandi', 'Keshopur Mandi'].map((market) => (
                                <button
                                    key={market}
                                    onClick={() => {
                                        setFormData({ ...formData, market });
                                        nextStep();
                                    }}
                                    className={`w-full p-4 rounded-xl text-left border-2 transition-all ${formData.market === market ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 bg-white hover:border-green-200'
                                        }`}
                                >
                                    <span className="font-semibold text-lg">{market}</span>
                                </button>
                            ))}

                            <button className="w-full p-4 rounded-xl text-center text-green-600 font-medium border-2 border-dashed border-green-300 hover:bg-green-50">
                                + Enter manually
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fade-in-right">
                        <button onClick={prevStep} className="text-gray-500 mb-4 flex items-center">
                            ← Back
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you sell?</h2>
                            <p className="text-gray-500">Select all categories that apply.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'veg', label: 'Vegetables', icon: '🥦' },
                                { id: 'fruit', label: 'Fruits', icon: '🍎' },
                                { id: 'grain', label: 'Grains', icon: '🌾' },
                                { id: 'spices', label: 'Spices', icon: '🌶️' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`p-6 rounded-xl flex flex-col items-center justify-center space-y-3 border-2 transition-all ${formData.categories.includes(cat.id)
                                            ? 'border-green-600 bg-green-600 text-white shadow-lg transform scale-105'
                                            : 'border-gray-100 bg-white text-gray-700 hover:border-green-200'
                                        }`}
                                >
                                    <span className="text-4xl">{cat.icon}</span>
                                    <span className="font-semibold">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleFinish}
                            disabled={formData.categories.length === 0}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 disabled:opacity-50 mt-8"
                        >
                            Finish Setup
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorSetupScreen;
