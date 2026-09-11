import type { Language } from '../i18n/translations'

interface CountryRecord {
  names: { sv: string; da: string }
  flag: string
  code: string
}

export interface Country {
  name: string
  flag: string
  code: string
}

export interface LetterTile {
  id: string
  char: string
}

const countries: CountryRecord[] = [
  { names: { sv: 'Sverige', da: 'Sverige' }, flag: '🇸🇪', code: 'SE' },
  { names: { sv: 'Norge', da: 'Norge' }, flag: '🇳🇴', code: 'NO' },
  { names: { sv: 'Danmark', da: 'Danmark' }, flag: '🇩🇰', code: 'DK' },
  { names: { sv: 'Finland', da: 'Finland' }, flag: '🇫🇮', code: 'FI' },
  { names: { sv: 'Frankrike', da: 'Frankrig' }, flag: '🇫🇷', code: 'FR' },
  { names: { sv: 'Tyskland', da: 'Tyskland' }, flag: '🇩🇪', code: 'DE' },
  { names: { sv: 'Spanien', da: 'Spanien' }, flag: '🇪🇸', code: 'ES' },
  { names: { sv: 'Italien', da: 'Italien' }, flag: '🇮🇹', code: 'IT' },
  { names: { sv: 'Polen', da: 'Polen' }, flag: '🇵🇱', code: 'PL' },
  { names: { sv: 'Grekland', da: 'Grækenland' }, flag: '🇬🇷', code: 'GR' },
  { names: { sv: 'Portugal', da: 'Portugal' }, flag: '🇵🇹', code: 'PT' },
  { names: { sv: 'Belgien', da: 'Belgien' }, flag: '🇧🇪', code: 'BE' },
  { names: { sv: 'Nederländerna', da: 'Nederlandene' }, flag: '🇳🇱', code: 'NL' },
  { names: { sv: 'Österrike', da: 'Østrig' }, flag: '🇦🇹', code: 'AT' },
  { names: { sv: 'Schweiz', da: 'Schweiz' }, flag: '🇨🇭', code: 'CH' },
  { names: { sv: 'Japan', da: 'Japan' }, flag: '🇯🇵', code: 'JP' },
  { names: { sv: 'Kina', da: 'Kina' }, flag: '🇨🇳', code: 'CN' },
  { names: { sv: 'Indien', da: 'Indien' }, flag: '🇮🇳', code: 'IN' },
  { names: { sv: 'Brasilien', da: 'Brasilien' }, flag: '🇧🇷', code: 'BR' },
  { names: { sv: 'Mexiko', da: 'Mexico' }, flag: '🇲🇽', code: 'MX' },
  { names: { sv: 'Kanada', da: 'Canada' }, flag: '🇨🇦', code: 'CA' },
  { names: { sv: 'Australien', da: 'Australien' }, flag: '🇦🇺', code: 'AU' },
  { names: { sv: 'Egypten', da: 'Egypten' }, flag: '🇪🇬', code: 'EG' },
  { names: { sv: 'Kenya', da: 'Kenya' }, flag: '🇰🇪', code: 'KE' },
  { names: { sv: 'Sydafrika', da: 'Sydafrika' }, flag: '🇿🇦', code: 'ZA' },
  { names: { sv: 'USA', da: 'USA' }, flag: '🇺🇸', code: 'US' },
  { names: { sv: 'Argentina', da: 'Argentina' }, flag: '🇦🇷', code: 'AR' },
  { names: { sv: 'Chile', da: 'Chile' }, flag: '🇨🇱', code: 'CL' },
  { names: { sv: 'Colombia', da: 'Colombia' }, flag: '🇨🇴', code: 'CO' },
  { names: { sv: 'Peru', da: 'Peru' }, flag: '🇵🇪', code: 'PE' },
  { names: { sv: 'Island', da: 'Island' }, flag: '🇮🇸', code: 'IS' },
  { names: { sv: 'Irland', da: 'Irland' }, flag: '🇮🇪', code: 'IE' },
  { names: { sv: 'Storbritannien', da: 'Storbritannien' }, flag: '🇬🇧', code: 'GB' },
  { names: { sv: 'Turkiet', da: 'Tyrkiet' }, flag: '🇹🇷', code: 'TR' },
  { names: { sv: 'Saudiarabien', da: 'Saudi-Arabien' }, flag: '🇸🇦', code: 'SA' },
  { names: { sv: 'Förenade Arabemiraten', da: 'De Forenede Arabiske Emirater' }, flag: '🇦🇪', code: 'AE' },
  { names: { sv: 'Thailand', da: 'Thailand' }, flag: '🇹🇭', code: 'TH' },
  { names: { sv: 'Vietnam', da: 'Vietnam' }, flag: '🇻🇳', code: 'VN' },
  { names: { sv: 'Singapore', da: 'Singapore' }, flag: '🇸🇬', code: 'SG' },
  { names: { sv: 'Sydkorea', da: 'Sydkorea' }, flag: '🇰🇷', code: 'KR' },
  { names: { sv: 'Filippinerna', da: 'Filippinerne' }, flag: '🇵🇭', code: 'PH' },
  { names: { sv: 'Nya Zeeland', da: 'New Zealand' }, flag: '🇳🇿', code: 'NZ' },
  { names: { sv: 'Marocko', da: 'Marokko' }, flag: '🇲🇦', code: 'MA' },
  { names: { sv: 'Nigeria', da: 'Nigeria' }, flag: '🇳🇬', code: 'NG' },
  { names: { sv: 'Etiopien', da: 'Etiopien' }, flag: '🇪🇹', code: 'ET' },
  { names: { sv: 'Ghana', da: 'Ghana' }, flag: '🇬🇭', code: 'GH' },
  { names: { sv: 'Tanzania', da: 'Tanzania' }, flag: '🇹🇿', code: 'TZ' },
]

const toCountry = (record: CountryRecord, language: Language): Country => {
  if (language === 'en' || language === 'ar') {
    try {
      const label = new Intl.DisplayNames([language], { type: 'region' }).of(record.code)
      if (label) return { name: label, flag: record.flag, code: record.code }
    } catch {
      // Fall through to Swedish.
    }
  }
  return {
    name: record.names[language === 'da' ? 'da' : 'sv'],
    flag: record.flag,
    code: record.code,
  }
}

export function getRandomCountry(language: Language, exceptCode?: string | null): Country {
  const pool = exceptCode ? countries.filter((c) => c.code !== exceptCode) : countries
  const list = pool.length > 0 ? pool : countries
  return toCountry(list[Math.floor(Math.random() * list.length)], language)
}

export function getCountryByCode(code: string, language: Language): Country | undefined {
  const match = countries.find((c) => c.code.toLowerCase() === code.toLowerCase())
  return match ? toCountry(match, language) : undefined
}

export function getAllCountries(language: Language): Country[] {
  return countries.map((record) => toCountry(record, language))
}

export function shuffleCopy<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function pickCountries(language: Language, count: number, exceptCode?: string | null): Country[] {
  const pool = shuffleCopy(exceptCode ? countries.filter((c) => c.code !== exceptCode) : countries)
  return pool.slice(0, Math.max(0, count)).map((record) => toCountry(record, language))
}

export function countryChoices(language: Language, correct: Country, optionCount = 4): Country[] {
  const others = pickCountries(language, optionCount - 1, correct.code)
  return shuffleCopy([correct, ...others])
}

export function shuffleLetters(text: string): LetterTile[] {
  const letters: LetterTile[] = text.toUpperCase().split('').map((char, index) => ({
    id: `${index}-${char}`,
    char,
  }))
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]]
  }
  return letters
}

export function tilesFromName(name: string): LetterTile[] {
  return name.toUpperCase().split('').map((char, index) => ({
    id: `answer-${index}-${char}`,
    char,
  }))
}
