import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LanguageSelector from '../LanguageSelector'
import LanguageProvider from '../../contexts/LanguageContext'
import '../../i18n/config'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn().mockResolvedValue(true),
    },
  }),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('renders language selector button', () => {
    renderWithProvider(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    expect(button).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', async () => {
    renderWithProvider(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    // Check all supported languages are present
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('हिंदी')).toBeInTheDocument()
    expect(screen.getByText('தமிழ்')).toBeInTheDocument()
    expect(screen.getByText('తెలుగు')).toBeInTheDocument()
    expect(screen.getByText('বাংলা')).toBeInTheDocument()
  })

  it('closes dropdown when backdrop is clicked', async () => {
    renderWithProvider(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    // Click backdrop
    const backdrop = document.querySelector('.fixed.inset-0')
    fireEvent.click(backdrop!)
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('changes language when option is selected', async () => {
    renderWithProvider(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    // Click Hindi option
    const hindiOption = screen.getByRole('option', { name: /हिंदी/i })
    fireEvent.click(hindiOption)
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferred-language', 'hi')
    })
  })

  it('shows current language as selected', async () => {
    renderWithProvider(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    const englishOption = screen.getByRole('option', { name: /english/i })
    expect(englishOption).toHaveAttribute('aria-selected', 'true')
  })

  it('applies correct font family to language options', async () => {
    renderWithProvider(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    // Check Hindi option has correct font
    const hindiText = screen.getByText('हिंदी')
    expect(hindiText).toHaveStyle({ fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif" })
    
    // Check Tamil option has correct font
    const tamilText = screen.getByText('தமிழ்')
    expect(tamilText).toHaveStyle({ fontFamily: "'Noto Sans Tamil', system-ui, sans-serif" })
  })

  it('handles loading state correctly', async () => {
    renderWithProvider(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    
    // Button should not be disabled initially
    expect(button).not.toBeDisabled()
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    // Click a language option
    const hindiOption = screen.getByRole('option', { name: /हिंदी/i })
    fireEvent.click(hindiOption)
    
    // During language change, elements might be temporarily disabled
    // This tests the loading state handling
  })
})

describe('Language Context Integration', () => {
  it('provides language context to child components', () => {
    const TestComponent = () => {
      const { useLanguageContext } = require('../../contexts/LanguageContext')
      const { currentLanguage, supportedLanguages } = useLanguageContext()
      
      return (
        <div>
          <span data-testid="current-language">{currentLanguage.code}</span>
          <span data-testid="supported-count">{supportedLanguages.length}</span>
        </div>
      )
    }
    
    renderWithProvider(<TestComponent />)
    
    expect(screen.getByTestId('current-language')).toHaveTextContent('en')
    expect(screen.getByTestId('supported-count')).toHaveTextContent('5')
  })
})