import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'
import { CurrencyText, NumberText, DateText, RelativeTimeText } from './FormattedText'

const I18nDemo: React.FC = () => {
  const { t } = useTranslation()
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage()

  const sampleData = {
    price: 1250.75,
    quantity: 100000,
    date: new Date(),
    pastDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('app.name')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('app.tagline')}
        </p>
      </div>

      {/* Language Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Current Language Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Language:</strong> {currentLanguage.nativeName} ({currentLanguage.name})</p>
            <p><strong>Code:</strong> {currentLanguage.code}</p>
            <p><strong>Direction:</strong> {currentLanguage.direction}</p>
            <p><strong>Font:</strong> {currentLanguage.fontFamily}</p>
          </div>
          <div>
            <p><strong>Region:</strong> {currentLanguage.region}</p>
            <p><strong>Supported Languages:</strong> {supportedLanguages.length}</p>
          </div>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Language Switcher</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                language.code === currentLanguage.code
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              style={{ fontFamily: `'${language.fontFamily}', system-ui, sans-serif` }}
            >
              <div className="font-medium">{language.nativeName}</div>
              <div className="text-xs text-gray-500">{language.code.toUpperCase()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Demo */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Translations</h2>
        <div className="flex flex-wrap gap-3">
          {['home', 'dashboard', 'ppi', 'fpc', 'profile', 'settings'].map((key) => (
            <span
              key={key}
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
            >
              {t(`navigation.${key}`)}
            </span>
          ))}
        </div>
      </div>

      {/* Cultural Formatting Demo */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Cultural Formatting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Currency & Numbers</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Price:</span>{' '}
                <CurrencyText value={sampleData.price} className="font-medium" />
              </p>
              <p>
                <span className="text-gray-600">Quantity:</span>{' '}
                <NumberText value={sampleData.quantity} className="font-medium" />
              </p>
              <p>
                <span className="text-gray-600">Large Number:</span>{' '}
                <NumberText value={10000000} className="font-medium" />
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">Date & Time</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Today:</span>{' '}
                <DateText value={sampleData.date} className="font-medium" />
              </p>
              <p>
                <span className="text-gray-600">Relative:</span>{' '}
                <RelativeTimeText value={sampleData.pastDate} className="font-medium" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Demo */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Action Buttons</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['submit', 'cancel', 'save', 'delete', 'edit', 'back', 'next', 'retry'].map((action) => (
            <button
              key={action}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {t(`actions.${action}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages Demo */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Status Messages</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['loading', 'success', 'error', 'warning', 'offline', 'online'].map((status) => (
            <div
              key={status}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${
                status === 'success' ? 'bg-green-100 text-green-800' :
                status === 'error' ? 'bg-red-100 text-red-800' :
                status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                status === 'offline' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {t(`status.${status}`)}
            </div>
          ))}
        </div>
      </div>

      {/* Units Demo */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Units & Measurements</h2>
        <div className="flex flex-wrap gap-3">
          {['kg', 'quintal', 'liter', 'piece', 'dozen'].map((unit) => (
            <span
              key={unit}
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
            >
              1 {t(`units.${unit}`)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default I18nDemo