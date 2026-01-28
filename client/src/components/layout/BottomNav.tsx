
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BottomNavProps {
    activeTab: string;
    role?: 'farmer' | 'trader' | 'buyer';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, role = 'farmer' }) => {
    const navigate = useNavigate();

    const getTabs = () => {
        const commonProfile = {
            id: 'profile', label: 'Profile', path: '/profile', icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        };

        switch (role) {
            case 'trader':
                return [
                    { id: 'home', label: 'Console', path: '/trader/dashboard', icon: <HomeIcon /> },
                    { id: 'feed', label: 'Feed', path: '/trader/feed', icon: <ChartIcon /> },
                    { id: 'add', label: 'Add Stock', path: '/trader/add-stock', icon: <AddIcon />, isFab: true },
                    { id: 'margin', label: 'Margin', path: '/trader/margin', icon: <CalculatorIcon /> },
                    commonProfile
                ];
            case 'buyer':
                return [
                    { id: 'home', label: 'Market', path: '/buyer/dashboard', icon: <HomeIcon /> },
                    { id: 'mandi', label: 'Mandis', path: '/mandi-selection', icon: <MapIcon /> },
                    { id: 'search', label: 'Search', path: '/buyer/search', icon: <SearchIcon />, isFab: true },
                    { id: 'compare', label: 'Compare', path: '/buyer/compare', icon: <ScaleIcon /> },
                    commonProfile
                ];
            case 'farmer':
            default:
                return [
                    { id: 'home', label: 'Home', path: '/farmer/dashboard', icon: <HomeIcon /> },
                    { id: 'produce', label: 'My Produce', path: '/farmer/produce', icon: <BoxIcon /> },
                    { id: 'add', label: 'Add', path: '/farmer/add-produce', icon: <AddIcon />, isFab: true },
                    { id: 'insights', label: 'Insights', path: '/farmer/insights', icon: <BulbIcon /> },
                    commonProfile
                ];
        }
    };

    const tabs = getTabs();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${tab.isFab ? 'overflow-visible' : ''
                            }`}
                    >
                        <div className={`${activeTab === tab.id && !tab.isFab ? 'text-green-600' : 'text-gray-400'
                            }`}>
                            {tab.icon}
                        </div>
                        {!tab.isFab && (
                            <span className={`text-[10px] font-medium ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                {tab.label}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
};

// Simple Icons
const HomeIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const AddIcon = () => (
    <div className="bg-green-600 rounded-full p-3 -mt-6 shadow-lg border-4 border-gray-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    </div>
);
const BoxIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);
const BulbIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
);
const CalculatorIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);
const SearchIcon = () => (
    <div className="bg-blue-600 rounded-full p-3 -mt-6 shadow-lg border-4 border-gray-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    </div>
);
const MapIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9 4" />
    </svg>
);
const ScaleIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
);

export default BottomNav;
