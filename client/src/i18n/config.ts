import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Import translation files
import enCommon from '../locales/en/common.json'
import enAuth from '../locales/en/auth.json'
import enVendor from '../locales/en/vendor.json'
import enPpi from '../locales/en/ppi.json'
import enVoice from '../locales/en/voice.json'

import hiCommon from '../locales/hi/common.json'
import hiAuth from '../locales/hi/auth.json'
import hiVendor from '../locales/hi/vendor.json'
import hiPpi from '../locales/hi/ppi.json'
import hiVoice from '../locales/hi/voice.json'

import taCommon from '../locales/ta/common.json'
import taAuth from '../locales/ta/auth.json'
import taVendor from '../locales/ta/vendor.json'
import taPpi from '../locales/ta/ppi.json'
import taVoice from '../locales/ta/voice.json'

import teCommon from '../locales/te/common.json'
import teAuth from '../locales/te/auth.json'
import teVendor from '../locales/te/vendor.json'
import tePpi from '../locales/te/ppi.json'
import teVoice from '../locales/te/voice.json'

import bnCommon from '../locales/bn/common.json'
import bnAuth from '../locales/bn/auth.json'
import bnVendor from '../locales/bn/vendor.json'
import bnPpi from '../locales/bn/ppi.json'
import bnVoice from '../locales/bn/voice.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    vendor: enVendor,
    ppi: enPpi,
    voice: enVoice,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    vendor: hiVendor,
    ppi: hiPpi,
    voice: hiVoice,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
    vendor: taVendor,
    ppi: taPpi,
    voice: taVoice,
  },
  te: {
    common: teCommon,
    auth: teAuth,
    vendor: teVendor,
    ppi: tePpi,
    voice: teVoice,
  },
  bn: {
    common: bnCommon,
    auth: bnAuth,
    vendor: bnVendor,
    ppi: bnPpi,
    voice: bnVoice,
  }
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferred-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value: any, format?: string, lng?: string): string => {
        if (format === 'currency') {
          // Indian currency formatting with proper locale
          const localeMap: Record<string, string> = {
            'hi': 'hi-IN',
            'ta': 'ta-IN', 
            'te': 'te-IN',
            'bn': 'bn-IN',
            'en': 'en-IN'
          }
          return new Intl.NumberFormat(localeMap[lng || 'en'] || 'en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(Number(value))
        }
        
        if (format === 'number') {
          // Indian number formatting (lakhs, crores)
          const localeMap: Record<string, string> = {
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN', 
            'bn': 'bn-IN',
            'en': 'en-IN'
          }
          return new Intl.NumberFormat(localeMap[lng || 'en'] || 'en-IN', {
            maximumFractionDigits: 2,
          }).format(Number(value))
        }
        
        if (format === 'date') {
          // Indian date formatting
          const localeMap: Record<string, string> = {
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'bn': 'bn-IN', 
            'en': 'en-IN'
          }
          return new Intl.DateTimeFormat(localeMap[lng || 'en'] || 'en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(new Date(value))
        }
        
        if (format === 'time') {
          // Indian time formatting (12-hour format)
          const localeMap: Record<string, string> = {
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'bn': 'bn-IN',
            'en': 'en-IN'
          }
          return new Intl.DateTimeFormat(localeMap[lng || 'en'] || 'en-IN', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }).format(new Date(value))
        }
        
        return String(value)
      }
    },

    // Namespace separation
    ns: ['common', 'auth', 'vendor', 'ppi', 'voice'],

    // Indian locale specific formatting
    react: {
      useSuspense: false,
    },

    // Pluralization rules for Indian languages
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Load missing translations
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng: readonly string[], ns: string, key: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng}.${ns}.${key}`)
      }
    },
  })

export default i18n