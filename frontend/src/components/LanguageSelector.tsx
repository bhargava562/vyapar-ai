import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageContext } from '../contexts/LanguageContext'

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation()
  const { currentLanguage, supportedLanguages, changeLanguage, isLoading } = useLanguageContext()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = async (languageCode: string) => {
    const success = await changeLanguage(languageCode)
    if (success) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label={t('common.actions.select_language', 'Select language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="w-4 h-4">🌐</span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        <span className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isLoading ? 'animate-spin' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div 
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
            role="listbox"
            aria-label="Language options"
          >
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                disabled={isLoading}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  language.code === currentLanguage.code 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="option"
                aria-selected={language.code === currentLanguage.code}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ fontFamily: `'${language.fontFamily}', system-ui, sans-serif` }}>
                      {language.nativeName}
                    </div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {language.code === currentLanguage.code && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSelector