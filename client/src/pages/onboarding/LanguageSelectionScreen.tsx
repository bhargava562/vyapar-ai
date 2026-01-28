
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'hi', name: 'हिंदी', label: 'Hindi' },
    { code: 'ta', name: 'தமிழ்', label: 'Tamil' },
    { code: 'te', name: 'తెలుగు', label: 'Telugu' },
    { code: 'bn', name: 'বাংলা', label: 'Bengali' },
    { code: 'en', name: 'English', label: 'English' },
];

const LanguageSelectionScreen: React.FC = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const handleLanguageSelect = (langCode: string) => {
        i18n.changeLanguage(langCode);
        navigate('/role-select');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
            <header className="mb-8 text-center pt-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose your language</h1>
                <p className="text-gray-500">Select the language you are comfortable with</p>
            </header>

            <div className="flex-1 grid gap-4 max-w-md mx-auto w-full">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-md transition-all flex items-center justify-between group"
                    >
                        <div className="text-left">
                            <span className="text-xl font-bold text-gray-900 block">{lang.name}</span>
                            <span className="text-sm text-gray-500">{lang.label}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                className="p-2 rounded-full bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Play sample audio logic here
                                    alert(`Playing sample for ${lang.label}`);
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </button>
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green-500 group-hover:bg-green-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </button>
                ))}

                <button className="mt-6 bg-green-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:bg-green-700 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="font-semibold text-lg">Speak to choose language</span>
                </button>
            </div>
        </div>
    );
};

export default LanguageSelectionScreen;
