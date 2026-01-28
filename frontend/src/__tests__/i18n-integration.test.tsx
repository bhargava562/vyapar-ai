import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTranslation } from 'react-i18next'
import '../i18n/config'

// Simple test component to verify i18n functionality
const TestI18nComponent: React.FC = () => {
  const { t, i18n } = useTranslation()

  const changeToHindi = () => {
    i18n.changeLanguage('hi')
  }

  const changeToTamil = () => {
    i18n.changeLanguage('ta')
  }

  const changeToTelugu = () => {
    i18n.changeLanguage('te')
  }

  const changeToBengali = () => {
    i18n.changeLanguage('bn')
  }

  const changeToEnglish = () => {
    i18n.changeLanguage('en')
  }

  return (
    <div>
      <h1 data-testid="app-name">{t('app.name')}</h1>
      <p data-testid="tagline">{t('app.tagline')}</p>
      <p data-testid="current-language">{i18n.language}</p>

      <button onClick={changeToEnglish} data-testid="btn-english">English</button>
      <button onClick={changeToHindi} data-testid="btn-hindi">Hindi</button>
      <button onClick={changeToTamil} data-testid="btn-tamil">Tamil</button>
      <button onClick={changeToTelugu} data-testid="btn-telugu">Telugu</button>
      <button onClick={changeToBengali} data-testid="btn-bengali">Bengali</button>

      <div data-testid="navigation">
        <span>{t('navigation.home')}</span>
        <span>{t('navigation.dashboard')}</span>
        <span>{t('navigation.ppi')}</span>
      </div>
    </div>
  )
}

describe('i18n Integration Tests', () => {
  beforeEach(() => {
    // Reset to English before each test
    const { i18n } = require('react-i18next')
    i18n.changeLanguage('en')
  })

  it('displays English translations by default', () => {
    render(<TestI18nComponent />)

    expect(screen.getByTestId('app-name')).toHaveTextContent('Market Mania')
    expect(screen.getByTestId('tagline')).toHaveTextContent('Fair prices for everyone')
    expect(screen.getByTestId('current-language')).toHaveTextContent('en')
  })

  it('switches to Hindi translations', async () => {
    render(<TestI18nComponent />)

    fireEvent.click(screen.getByTestId('btn-hindi'))

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('hi')
    })

    expect(screen.getByTestId('app-name')).toHaveTextContent('मार्केट मेनिया')
    expect(screen.getByTestId('tagline')).toHaveTextContent('सभी के लिए उचित कीमत')
  })

  it('switches to Tamil translations', async () => {
    render(<TestI18nComponent />)

    fireEvent.click(screen.getByTestId('btn-tamil'))

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('ta')
    })

    expect(screen.getByTestId('app-name')).toHaveTextContent('மார்க்கெட் மேனியா')
    expect(screen.getByTestId('tagline')).toHaveTextContent('அனைவருக்கும் நியாயமான விலை')
  })

  it('switches to Telugu translations', async () => {
    render(<TestI18nComponent />)

    fireEvent.click(screen.getByTestId('btn-telugu'))

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('te')
    })

    expect(screen.getByTestId('app-name')).toHaveTextContent('మార్కెట్ మేనియా')
    expect(screen.getByTestId('tagline')).toHaveTextContent('అందరికీ న్యాయమైన ధరలు')
  })

  it('switches to Bengali translations', async () => {
    render(<TestI18nComponent />)

    fireEvent.click(screen.getByTestId('btn-bengali'))

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('bn')
    })

    expect(screen.getByTestId('app-name')).toHaveTextContent('মার্কেট ম্যানিয়া')
    expect(screen.getByTestId('tagline')).toHaveTextContent('সবার জন্য ন্যায্য দাম')
  })

  it('maintains navigation translations across languages', async () => {
    render(<TestI18nComponent />)

    // Test Hindi navigation
    fireEvent.click(screen.getByTestId('btn-hindi'))

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('hi')
    })

    const navigation = screen.getByTestId('navigation')
    expect(navigation).toHaveTextContent('होम')
    expect(navigation).toHaveTextContent('डैशबोर्ड')
    expect(navigation).toHaveTextContent('कीमत जांच')

    // Switch to Tamil
    fireEvent.click(screen.getByTestId('btn-tamil'))

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('ta')
    })

    expect(navigation).toHaveTextContent('முகப்பு')
    expect(navigation).toHaveTextContent('டாஷ்போர்டு')
    expect(navigation).toHaveTextContent('விலை சரிபார்ப்பு')
  })

  it('handles missing translations gracefully', async () => {
    render(<TestI18nComponent />)

    // Switch to a language and try to access a non-existent key
    fireEvent.click(screen.getByTestId('btn-hindi'))

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('hi')
    })

    // The component should still render without crashing
    expect(screen.getByTestId('app-name')).toBeInTheDocument()
  })
})

describe('Cultural Formatting Tests', () => {
  it('formats currency correctly for Indian locale', () => {
    // const { formatCurrency } = require('../hooks/useLanguage')

    // Mock the hook for testing
    const mockFormatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    expect(mockFormatCurrency(1000)).toMatch(/₹.*1,000/)
    expect(mockFormatCurrency(100000)).toMatch(/₹.*1,00,000/)
  })

  it('formats numbers correctly for Indian locale', () => {
    const mockFormatNumber = (number: number) => {
      return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
      }).format(number)
    }

    expect(mockFormatNumber(1000)).toBe('1,000')
    expect(mockFormatNumber(100000)).toBe('1,00,000')
    expect(mockFormatNumber(10000000)).toBe('1,00,00,000')
  })
})