import React from 'react'
import { useLanguage } from '../hooks/useLanguage'

interface FormattedTextProps {
  type: 'currency' | 'number' | 'date' | 'time' | 'relative-time'
  value: number | string | Date
  className?: string
  prefix?: string
  suffix?: string
}

const FormattedText: React.FC<FormattedTextProps> = ({
  type,
  value,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const { formatCurrency, formatNumber, formatDate, formatTime, getRelativeTime } = useLanguage()

  const getFormattedValue = (): string => {
    switch (type) {
      case 'currency':
        return formatCurrency(Number(value))
      case 'number':
        return formatNumber(Number(value))
      case 'date':
        return formatDate(value as Date | string)
      case 'time':
        return formatTime(value as Date | string)
      case 'relative-time':
        return getRelativeTime(value as Date | string)
      default:
        return String(value)
    }
  }

  return (
    <span className={className}>
      {prefix}
      {getFormattedValue()}
      {suffix}
    </span>
  )
}

export default FormattedText

// Convenience components for common use cases
export const CurrencyText: React.FC<Omit<FormattedTextProps, 'type'>> = (props) => (
  <FormattedText {...props} type="currency" />
)

export const NumberText: React.FC<Omit<FormattedTextProps, 'type'>> = (props) => (
  <FormattedText {...props} type="number" />
)

export const DateText: React.FC<Omit<FormattedTextProps, 'type'>> = (props) => (
  <FormattedText {...props} type="date" />
)

export const TimeText: React.FC<Omit<FormattedTextProps, 'type'>> = (props) => (
  <FormattedText {...props} type="time" />
)

export const RelativeTimeText: React.FC<Omit<FormattedTextProps, 'type'>> = (props) => (
  <FormattedText {...props} type="relative-time" />
)