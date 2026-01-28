
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

// Content
import LanguageProvider from './contexts/LanguageContext'

// Onboarding Pages
import SplashScreen from './pages/onboarding/SplashScreen'
import LoginScreen from './pages/onboarding/LoginScreen'
import RegisterScreen from './pages/onboarding/RegisterScreen'
import LanguageSelectionScreen from './pages/onboarding/LanguageSelectionScreen'
import RoleSelectionScreen from './pages/onboarding/RoleSelectionScreen'

// Role Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import MyProduceScreen from './pages/farmer/MyProduceScreen'
import PriceInsightsScreen from './pages/farmer/PriceInsightsScreen'

import TraderConsole from './pages/trader/TraderConsole'
import MandiFeedScreen from './pages/trader/MandiFeedScreen'
import MarginAnalyticsScreen from './pages/trader/MarginAnalyticsScreen'

import BuyerMarketplace from './pages/buyer/BuyerMarketplace'
import PriceCompareScreen from './pages/buyer/PriceCompareScreen'

// Shared/Legacy Pages
import SettingsPage from './pages/SettingsPage'
import ProfileScreen from './pages/ProfileScreen'
import MandiSelectionScreen from './pages/mandi/MandiSelectionScreen'
import MandiDetailScreen from './pages/mandi/MandiDetailScreen'
import ProductDetailScreen from './pages/products/ProductDetailScreen'
import AddProductScreen from './pages/products/AddProductScreen'
import PriceResultScreen from './pages/PriceResultScreen'
import QRScanScreen from './pages/QRScanScreen'
import VerificationResultScreen from './pages/VerificationResultScreen'
import VoiceDemo from './components/VoiceDemo'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
})

// Role Redirect Component
const DashboardRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'farmer';
    if (role === 'trader') navigate('/trader/dashboard', { replace: true });
    else if (role === 'buyer') navigate('/buyer/dashboard', { replace: true });
    else navigate('/farmer/dashboard', { replace: true });
  }, [navigate]);
  return <div className="p-4 text-center">Redirecting...</div>;
};

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const direction = ['ar', 'ur'].includes(i18n.language) ? 'rtl' : 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Auth & Onboarding */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/language" element={<LanguageSelectionScreen />} />
            <Route path="/role-select" element={<RoleSelectionScreen />} />

            {/* Redirect /dashboard to role-specific dashboard */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Farmer Routes */}
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/produce" element={<MyProduceScreen />} />
            <Route path="/farmer/insights" element={<PriceInsightsScreen />} />
            <Route path="/farmer/add-produce" element={<AddProductScreen />} />

            {/* Trader Routes */}
            <Route path="/trader/dashboard" element={<TraderConsole />} />
            <Route path="/trader/feed" element={<MandiFeedScreen />} />
            <Route path="/trader/margin" element={<MarginAnalyticsScreen />} />
            <Route path="/trader/add-stock" element={<AddProductScreen />} /> {/* Can reuse or separate */}

            {/* Buyer Routes */}
            <Route path="/buyer/dashboard" element={<BuyerMarketplace />} />
            <Route path="/buyer/search" element={<BuyerMarketplace />} /> {/* Or separate search */}
            <Route path="/buyer/compare" element={<PriceCompareScreen />} />

            {/* Shared */}
            <Route path="/mandi-selection" element={<MandiSelectionScreen />} />
            <Route path="/mandi/:id" element={<MandiDetailScreen />} />
            <Route path="/product/:id" element={<ProductDetailScreen />} />
            <Route path="/add-product" element={<AddProductScreen />} /> {/* Legacy/Direct Access */}
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Extra Features */}
            <Route path="/price-result" element={<PriceResultScreen />} />
            <Route path="/scan-qr" element={<QRScanScreen />} />
            <Route path="/verification-result" element={<VerificationResultScreen />} />
            <Route path="/voice" element={<VoiceDemo />} />

            {/* Catch all */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">404</h2>
                  <p className="text-gray-500">Page Not Found</p>
                  <button onClick={() => window.location.href = '/dashboard'} className="mt-4 text-green-600">
                    Go Home
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  )
}

export default App