export interface Country {
  name: string
  flag: string
  code: string
}

export const countries: Country[] = [
  { name: 'Sverige', flag: '🇸🇪', code: 'SE' },
  { name: 'Norge', flag: '🇳🇴', code: 'NO' },
  { name: 'Danmark', flag: '🇩🇰', code: 'DK' },
  { name: 'Finland', flag: '🇫🇮', code: 'FI' },
  { name: 'Frankrike', flag: '🇫🇷', code: 'FR' },
  { name: 'Tyskland', flag: '🇩🇪', code: 'DE' },
  { name: 'Spanien', flag: '🇪🇸', code: 'ES' },
  { name: 'Italien', flag: '🇮🇹', code: 'IT' },
  { name: 'Polen', flag: '🇵🇱', code: 'PL' },
  { name: 'Grekland', flag: '🇬🇷', code: 'GR' },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
  { name: 'Belgien', flag: '🇧🇪', code: 'BE' },
  { name: 'Nederländerna', flag: '🇳🇱', code: 'NL' },
  { name: 'Österrike', flag: '🇦🇹', code: 'AT' },
  { name: 'Schweiz', flag: '🇨🇭', code: 'CH' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { name: 'Kina', flag: '🇨🇳', code: 'CN' },
  { name: 'Indien', flag: '🇮🇳', code: 'IN' },
  { name: 'Brasilien', flag: '🇧🇷', code: 'BR' },
  { name: 'Mexiko', flag: '🇲🇽', code: 'MX' },
  { name: 'Kanada', flag: '🇨🇦', code: 'CA' },
  { name: 'Australien', flag: '🇦🇺', code: 'AU' },
  { name: 'Egypten', flag: '🇪🇬', code: 'EG' },
  { name: 'Kenya', flag: '🇰🇪', code: 'KE' },
  { name: 'Sydafrika', flag: '🇿🇦', code: 'ZA' },
  { name: 'USA', flag: '🇺🇸', code: 'US' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
  { name: 'Chile', flag: '🇨🇱', code: 'CL' },
  { name: 'Colombia', flag: '🇨🇴', code: 'CO' },
  { name: 'Peru', flag: '🇵🇪', code: 'PE' },
  { name: 'Island', flag: '🇮🇸', code: 'IS' },
  { name: 'Irland', flag: '🇮🇪', code: 'IE' },
  { name: 'Storbritannien', flag: '🇬🇧', code: 'GB' },
  { name: 'Turkiet', flag: '🇹🇷', code: 'TR' },
  { name: 'Saudiarabien', flag: '🇸🇦', code: 'SA' },
  { name: 'Förenade Arabemiraten', flag: '🇦🇪', code: 'AE' },
  { name: 'Thailand', flag: '🇹🇭', code: 'TH' },
  { name: 'Vietnam', flag: '🇻🇳', code: 'VN' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
  { name: 'Sydkorea', flag: '🇰🇷', code: 'KR' },
  { name: 'Filippinerna', flag: '🇵🇭', code: 'PH' },
  { name: 'Nya Zeeland', flag: '🇳🇿', code: 'NZ' },
  { name: 'Marocko', flag: '🇲🇦', code: 'MA' },
  { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  { name: 'Etiopien', flag: '🇪🇹', code: 'ET' },
  { name: 'Ghana', flag: '🇬🇭', code: 'GH' },
  { name: 'Tanzania', flag: '🇹🇿', code: 'TZ' },
]

export function getRandomCountry(): Country {
  return countries[Math.floor(Math.random() * countries.length)]
}

export function getCountryByCode(code: string): Country | undefined {
  const match = countries.find((c) => c.code.toLowerCase() === code.toLowerCase())
  return match
}

export function shuffleLetters(text: string): string[] {
  const letters = text.toUpperCase().split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]]
  }
  return letters
}
