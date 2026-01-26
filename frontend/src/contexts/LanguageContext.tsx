import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type LanguageInfo } from '../hooks/useLanguage'

interface LanguageContextType {
  currentLanguage: LanguageInfo
  supportedLanguages: LanguageInfo[]
  changeLanguage: (languageCode: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguageContext = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0]

  const changeLanguage = async (languageCode: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate language code
      const targetLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)
      if (!targetLanguage) {
        throw new Error(`Unsupported language: ${languageCode}`)
      }

      // Change i18n language
      await i18n.changeLanguage(languageCode)
      
      // Store preference
      localStorage.setItem('preferred-language', languageCode)
      
      // Update document attributes
      document.documentElement.lang = languageCode
      document.documentElement.dir = targetLanguage.direction
      
      // Apply language-specific font
      document.body.style.fontFamily = `'${targetLanguage.fontFamily}', system-ui, sans-serif`
      
      // Add language class to body for CSS targeting
      document.body.className = document.body.className.replace(/lang-\w+/g, '')
      document.body.classList.add(`lang-${languageCode}`)

      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: targetLanguage }
      }))

      setIsLoading(false)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change language'
      setError(errorMessage)
      setIsLoading(false)
      console.error('Language change error:', err)
      return false
    }
  }

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      // Check for saved preference
      const savedLanguage = localStorage.getItem('preferred-language')
      
      if (savedLanguage && savedLanguage !== i18n.language) {
        await changeLanguage(savedLanguage)
      } else {
        // Apply current language settings without changing i18n
        document.documentElement.lang = currentLanguage.code
        document.documentElement.dir = currentLanguage.direction
        document.body.style.fontFamily = `'${currentLanguage.fontFamily}', system-ui, sans-serif`
        document.body.classList.add(`lang-${currentLanguage.code}`)
      }
    }

    initializeLanguage()
  }, [])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const value: LanguageContextType = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    isLoading,
    error,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider