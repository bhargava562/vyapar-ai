import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

// Components
import LanguageSelector from './components/LanguageSelector'
import LanguageProvider from './contexts/LanguageContext'
import VoiceDemo from './components/VoiceDemo'
import I18nDemo from './components/I18nDemo'
import VendorProfile from './components/VendorProfile'
import VendorProfileSetup from './components/VendorProfileSetup'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    },
  },
})

function App() {
  const { i18n } = useTranslation()
  
  // Set document direction based on language
  React.useEffect(() => {
    const direction = ['ar', 'ur'].includes(i18n.language) ? 'rtl' : 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Language selector - always visible */}
            <div className="fixed top-4 right-4 z-50">
              <LanguageSelector />
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={
                  <div className="space-y-8">
                    <header className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Market Mania
                      </h1>
                      <p className="text-lg text-gray-600">
                        Multilingual Marketplace Platform
                      </p>
                    </header>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Voice Interface</h2>
                        <VoiceDemo />
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Internationalization</h2>
                        <I18nDemo />
                      </div>
                    </div>
                  </div>
                } />
                
                <Route path="/voice" element={<VoiceDemo />} />
                <Route path="/i18n" element={<I18nDemo />} />
                <Route path="/vendor-profile" element={<VendorProfile />} />
                <Route path="/vendor-setup" element={<VendorProfileSetup />} />
                
                {/* Catch all route */}
                <Route path="*" element={
                  <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  )
}

export default App