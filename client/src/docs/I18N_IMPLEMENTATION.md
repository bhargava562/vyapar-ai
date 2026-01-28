# Internationalization (i18n) Implementation

## Overview

This document describes the complete internationalization implementation for Market Mania, supporting Hindi, English, Tamil, Telugu, and Bengali languages with proper cultural adaptation for the Indian market context.

## Features Implemented

### ✅ Complete i18n Configuration
- **Framework**: react-i18next with TypeScript support
- **Language Detection**: Automatic browser language detection with localStorage persistence
- **Fallback Strategy**: English as fallback language
- **Namespace Support**: Organized translations by feature (common, auth, vendor, ppi)

### ✅ Supported Languages
1. **English (en)** - Primary language
2. **Hindi (hi)** - Devanagari script
3. **Tamil (ta)** - Tamil script
4. **Telugu (te)** - Telugu script  
5. **Bengali (bn)** - Bengali script

### ✅ Translation Files Structure
```
frontend/src/locales/
├── en/
│   ├── common.json     # Common UI elements
│   ├── auth.json       # Authentication flows
│   ├── vendor.json     # Vendor-specific content
│   └── ppi.json        # Price Power Index content
├── hi/
│   ├── common.json
│   ├── auth.json
│   ├── vendor.json
│   └── ppi.json
├── ta/
│   ├── common.json
│   ├── auth.json
│   ├── vendor.json
│   └── ppi.json
├── te/
│   ├── common.json
│   ├── auth.json
│   ├── vendor.json
│   └── ppi.json
└── bn/
    ├── common.json
    ├── auth.json
    ├── vendor.json
    └── ppi.json
```

### ✅ Font Support for Regional Scripts
- **Devanagari**: Noto Sans Devanagari (Hindi)
- **Tamil**: Noto Sans Tamil
- **Telugu**: Noto Sans Telugu
- **Bengali**: Noto Sans Bengali
- **Latin**: Inter (English)

### ✅ Cultural Adaptation
- **Currency**: Indian Rupee (₹) formatting with proper locale
- **Numbers**: Indian numbering system (lakhs, crores)
- **Dates**: Localized date formats for each language
- **Time**: 12-hour format with AM/PM
- **Units**: Regional measurement units (kg, quintal, liter, etc.)

### ✅ Language Switching & Persistence
- **Dynamic Switching**: Real-time language change without page reload
- **Persistence**: Language preference stored in localStorage
- **Document Attributes**: Automatic lang and dir attribute updates
- **Font Loading**: Dynamic font family application

## Implementation Details

### Core Configuration (`frontend/src/i18n/config.ts`)

```typescript
// Key features:
- Language detection from localStorage, navigator, and HTML tag
- Custom formatting for Indian context (currency, numbers, dates)
- Namespace separation for organized translations
- Missing translation handling in development mode
```

### Language Context (`frontend/src/contexts/LanguageContext.tsx`)

```typescript
// Provides:
- Centralized language state management
- Error handling for language changes
- Loading states during language switching
- Custom events for language change notifications
```

### Language Hook (`frontend/src/hooks/useLanguage.ts`)

```typescript
// Utilities:
- formatCurrency() - Indian rupee formatting
- formatNumber() - Indian number system
- formatDate() - Localized date formatting
- formatTime() - 12-hour time formatting
- getRelativeTime() - Relative time strings
```

### Formatted Text Components (`frontend/src/components/FormattedText.tsx`)

```typescript
// Components:
- <CurrencyText value={1000} />
- <NumberText value={100000} />
- <DateText value={new Date()} />
- <TimeText value={new Date()} />
- <RelativeTimeText value={pastDate} />
```

## Usage Examples

### Basic Translation
```typescript
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.tagline')}</p>
    </div>
  )
}
```

### Language Switching
```typescript
import { useLanguageContext } from '../contexts/LanguageContext'

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguageContext()
  
  const handleChange = async (langCode: string) => {
    const success = await changeLanguage(langCode)
    if (success) {
      console.log('Language changed successfully')
    }
  }
  
  return (
    <button onClick={() => handleChange('hi')}>
      Switch to Hindi
    </button>
  )
}
```

### Cultural Formatting
```typescript
import { useLanguage } from '../hooks/useLanguage'

const PriceDisplay = ({ amount }: { amount: number }) => {
  const { formatCurrency } = useLanguage()
  
  return <span>{formatCurrency(amount)}</span>
  // Output: ₹1,250 (English), ₹१,२५० (Hindi)
}
```

### Namespaced Translations
```typescript
const { t } = useTranslation('vendor') // Use vendor namespace

return (
  <div>
    <h1>{t('profile.title')}</h1>
    <p>{t('dashboard.welcome', { name: 'राम' })}</p>
  </div>
)
```

## Translation Keys Structure

### Common Namespace (`common.json`)
```json
{
  "app": { "name": "...", "tagline": "..." },
  "navigation": { "home": "...", "dashboard": "..." },
  "actions": { "submit": "...", "cancel": "..." },
  "status": { "loading": "...", "success": "..." },
  "units": { "kg": "...", "quintal": "..." },
  "currency": { "rupees": "₹", "format": "₹{{amount}}" },
  "time": { "now": "...", "minutes_ago": "..." }
}
```

### Authentication Namespace (`auth.json`)
```json
{
  "login": {
    "title": "...",
    "phone_label": "...",
    "send_otp": "..."
  },
  "registration": {
    "title": "...",
    "complete_registration": "..."
  },
  "errors": {
    "invalid_phone": "...",
    "network_error": "..."
  }
}
```

## CSS and Styling

### Language-Specific Fonts
```css
[lang="hi"] { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; }
[lang="ta"] { font-family: 'Noto Sans Tamil', 'Inter', sans-serif; }
[lang="te"] { font-family: 'Noto Sans Telugu', 'Inter', sans-serif; }
[lang="bn"] { font-family: 'Noto Sans Bengali', 'Inter', sans-serif; }
```

### Tailwind Font Classes
```javascript
// tailwind.config.js
fontFamily: {
  'hindi': ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
  'tamil': ['Noto Sans Tamil', 'system-ui', 'sans-serif'],
  'telugu': ['Noto Sans Telugu', 'system-ui', 'sans-serif'],
  'bengali': ['Noto Sans Bengali', 'system-ui', 'sans-serif'],
}
```

## Testing

### Integration Tests
- Language switching functionality
- Translation loading and fallbacks
- Cultural formatting accuracy
- Font application verification

### Test Files
- `frontend/src/__tests__/i18n-integration.test.tsx`
- `frontend/src/components/__tests__/LanguageSelector.test.tsx`

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Translations loaded on-demand
2. **Caching**: Browser caching for translation files
3. **Font Loading**: Optimized Google Fonts loading
4. **Bundle Splitting**: Separate chunks per language (future enhancement)

### Bundle Size Impact
- Base i18n libraries: ~50KB
- Translation files: ~5KB per language
- Font files: Loaded from Google Fonts CDN

## Accessibility Features

### Screen Reader Support
- Proper `lang` attribute updates
- ARIA labels for language selector
- Semantic HTML structure

### Visual Accessibility
- High contrast color support
- Proper font sizing for regional scripts
- Touch-friendly language selector (44px minimum)

## Browser Support

### Compatibility
- **Modern Browsers**: Full support (Chrome 90+, Firefox 88+, Safari 14+)
- **Intl API**: Required for number/date formatting
- **Font Support**: Fallback to system fonts if Google Fonts unavailable

## Future Enhancements

### Planned Features
1. **RTL Support**: For Urdu and Arabic (if needed)
2. **Pluralization**: Advanced plural rules for Indian languages
3. **Translation Management**: Integration with translation services
4. **Voice Interface**: Text-to-speech in regional languages
5. **Offline Support**: Cached translations for PWA functionality

### Maintenance
- Regular translation updates
- Community contribution system
- Translation quality assurance
- Performance monitoring

## Troubleshooting

### Common Issues
1. **Missing Translations**: Check namespace and key structure
2. **Font Loading**: Verify Google Fonts CDN access
3. **Formatting Issues**: Ensure proper locale codes
4. **Performance**: Monitor bundle size and loading times

### Debug Mode
```typescript
// Enable in development
i18n.init({
  debug: process.env.NODE_ENV === 'development',
  saveMissing: true,
})
```

This implementation provides a robust, scalable internationalization system specifically designed for the Indian market context with proper cultural adaptation and accessibility features.