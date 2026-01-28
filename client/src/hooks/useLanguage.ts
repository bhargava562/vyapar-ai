import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

export interface LanguageInfo {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  fontFamily: string
  region: string
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    fontFamily: 'Inter',
    region: 'IN'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    direction: 'ltr',
    fontFamily: 'Noto Sans Devanagari',
    region: 'IN'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    fontFamily: 'Noto Sans Tamil',
    region: 'IN'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    fontFamily: 'Noto Sans Telugu',
    region: 'IN'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    fontFamily: 'Noto Sans Bengali',
    region: 'IN'
  }
]

export const useLanguage = () => {
  const { i18n, t } = useTranslation()

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0]

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode)
      
      // Store preference in localStorage
      localStorage.setItem('preferred-language', languageCode)
      
      // Update document attributes
      const newLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)
      if (newLanguage) {
        document.documentElement.lang = languageCode
        document.documentElement.dir = newLanguage.direction
        
        // Apply language-specific font
        document.body.style.fontFamily = `'${newLanguage.fontFamily}', system-ui, sans-serif`
      }
      
      return true
    } catch (error) {
      console.error('Failed to change language:', error)
      return false
    }
  }

  // Format currency according to Indian locale
  const formatCurrency = (amount: number): string => {
    const locale = `${currentLanguage.code}-${currentLanguage.region}`
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format numbers according to Indian locale (lakhs, crores)
  const formatNumber = (number: number): string => {
    const locale = `${currentLanguage.code}-${currentLanguage.region}`
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
    }).format(number)
  }

  // Format date according to Indian locale
  const formatDate = (date: Date | string): string => {
    const locale = `${currentLanguage.code}-${currentLanguage.region}`
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  // Format time according to Indian locale (12-hour format)
  const formatTime = (date: Date | string): string => {
    const locale = `${currentLanguage.code}-${currentLanguage.region}`
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date(date))
  }

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (date: Date | string): string => {
    const now = new Date()
    const targetDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return t('time.now')
    } else if (diffInMinutes < 60) {
      return t('time.minutes_ago', { count: diffInMinutes })
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return t('time.hours_ago', { count: hours })
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return t('time.days_ago', { count: days })
    }
  }

  // Initialize language settings on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && savedLanguage !== i18n.language) {
      changeLanguage(savedLanguage)
    } else {
      // Apply current language settings
      document.documentElement.lang = currentLanguage.code
      document.documentElement.dir = currentLanguage.direction
      document.body.style.fontFamily = `'${currentLanguage.fontFamily}', system-ui, sans-serif`
    }
  }, [])

  return {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    formatCurrency,
    formatNumber,
    formatDate,
    formatTime,
    getRelativeTime,
    isRTL: currentLanguage.direction === 'rtl',
    t,
  }
}

export default useLanguage