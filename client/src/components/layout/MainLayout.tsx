
import React from 'react';
import Sidebar from './Sidebar';
import LanguageSelector from '../LanguageSelector';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 p-8">
                {/* Top Header with Language Selector */}
                <div className="flex justify-end mb-8">
                    <LanguageSelector />
                </div>

                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
