const COUNTRY_CODES: Record<string, string> = {
  Algeria: 'dz',
  Argentina: 'ar',
  Australia: 'au',
  Austria: 'at',
  Belgium: 'be',
  'Bosnia-Herzegovina': 'ba',
  Brazil: 'br',
  'Cabo Verde': 'cv',
  'Cape Verde': 'cv',
  Canada: 'ca',
  Colombia: 'co',
  Croatia: 'hr',
  Curaçao: 'cw',
  Czechia: 'cz',
  'DR Congo': 'cd',
  Ecuador: 'ec',
  Egypt: 'eg',
  England: 'gb-eng',
  France: 'fr',
  Germany: 'de',
  Ghana: 'gh',
  Haiti: 'ht',
  Iran: 'ir',
  Iraq: 'iq',
  'Ivory Coast': 'ci',
  Japan: 'jp',
  Jordan: 'jo',
  Mexico: 'mx',
  Morocco: 'ma',
  Netherlands: 'nl',
  'New Zealand': 'nz',
  Norway: 'no',
  Panama: 'pa',
  Paraguay: 'py',
  Portugal: 'pt',
  Qatar: 'qa',
  'Saudi Arabia': 'sa',
  Scotland: 'gb-sct',
  Senegal: 'sn',
  'South Africa': 'za',
  'South Korea': 'kr',
  Spain: 'es',
  Sweden: 'se',
  Switzerland: 'ch',
  Tunisia: 'tn',
  Türkiye: 'tr',
  USA: 'us',
  Uruguay: 'uy',
  Uzbekistan: 'uz',
}

export function getCountryCode(countryName: string): string | null {
  return COUNTRY_CODES[countryName] ?? null
}

/** Local bundled flags — works offline and without external CDN */
export function getFlagUrl(countryName: string, _width = 80): string | null {
  const code = getCountryCode(countryName)
  if (!code) return null
  return `/flags/${code}.png`
}

export const ALL_FLAG_CODES = [...new Set(Object.values(COUNTRY_CODES))]
