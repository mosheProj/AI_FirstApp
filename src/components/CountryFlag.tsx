import { useState } from 'react'
import { getCountryCode, getFlagUrl } from '../utils/flags'
import './CountryFlag.css'

export type FlagSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const WIDTH: Record<FlagSize, number> = {
  xs: 20,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
}

interface CountryFlagProps {
  country: string
  size?: FlagSize
  className?: string
  title?: string
}

function FallbackFlag({
  country,
  size,
  className,
  title,
}: CountryFlagProps) {
  return (
    <span
      className={`country-flag country-flag--${size} country-flag--fallback ${className ?? ''}`}
      title={title ?? country}
      aria-label={country}
    >
      ?
    </span>
  )
}

export default function CountryFlag({
  country,
  size = 'md',
  className = '',
  title,
}: CountryFlagProps) {
  const [failed, setFailed] = useState(false)
  const code = getCountryCode(country)
  const url = getFlagUrl(country, WIDTH[size] * 2)

  if (!url || !code || failed) {
    return (
      <FallbackFlag
        country={country}
        size={size}
        className={className}
        title={title}
      />
    )
  }

  return (
    <img
      src={url}
      alt={`${country} flag`}
      title={title ?? country}
      className={`country-flag country-flag--${size} ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
