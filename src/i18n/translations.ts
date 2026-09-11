import { partyStrings } from './party'

export type Language = 'sv' | 'da' | 'en' | 'ar'

export const defaultLanguage: Language = 'sv'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const mergeDeep = (base: unknown, extra: unknown): unknown => {
  if (!isRecord(base) || !isRecord(extra)) return extra ?? base
  const output: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(extra)) {
    output[key] = key in output ? mergeDeep(output[key], value) : value
  }
  return output
}

const sv = {
    language: {
      sv: 'Svenska',
      da: 'Danska',
      en: 'Engelska',
      ar: 'Arabiska',
    },
    labels: {
      language: 'Språk',
    },
    home: {
      title: 'Leyla Games',
      lead: 'Välj ett spel och spela direkt i webbläsaren.',
      leadAlt: 'Flera spel på samma sida – flaggor, memory och matte.',
      startGame: 'Starta spelet',
      footerNote: 'Fler spel kan läggas till i biblioteket utan att ändra resten av sidan.',
    },
    menu: {
      playing: 'Spelar: {gameName}',
      backToLibrary: 'Till spelbiblioteket',
    },
    errors: {
      gameNotFound: 'Spelet hittades inte',
      backToStart: 'Tillbaka till start',
    },
    categories: {
      featured: {
        name: 'Utvalda spel',
        description: 'Snabbstarta med våra populäraste spel.',
      },
      geography: {
        name: 'Geografi',
        description: 'Lär dig länder och flaggor.',
      },
      numbers: {
        name: 'Siffror',
        description: 'Korta räknespel.',
      },
    },
    games: {
      'flag-quiz': {
        name: 'Flaggquiz',
        shortDescription: 'Gissa landet från flaggan och ordna bokstäverna.',
      },
      'flag-choice': {
        name: 'Gissa flaggan',
        shortDescription: 'Se flaggan och välj rätt land.',
      },
      'flag-memory': {
        name: 'Flaggmemory',
        shortDescription: 'Hitta två likadana flaggor.',
      },
      'math-quiz': {
        name: 'Räknespel',
        shortDescription: 'Räkna plus med fyra svarsalternativ.',
      },
    },
    play: {
      score: 'Poäng: {score}',
      streak: 'Streak',
      rounds: 'Rundor',
      correct: 'Rätt!',
      incorrect: 'Rätt svar: {answer}',
      next: 'Nästa',
      again: 'Spela igen',
    },
    flagChoice: {
      prompt: 'Vilket land är det här?',
    },
    flagMemory: {
      prompt: 'Vänd två kort och hitta samma flagga.',
      moves: 'Drag',
      pairs: 'Par',
      hiddenCard: 'Dolt kort',
      complete: 'Alla par hittade!',
    },
    mathQuiz: {
      prompt: 'Vad blir summan?',
    },
    flagGame: {
      loading: 'Laddar...',
      timeUp: 'Tiden är ute! Rätt svar: {country}',
      correct:
        'Rätt! +{total} poäng (bas {base}, tid {timeBonus}, streak {streakBonus}, x{multiplier})',
      incorrect: 'Inte rätt. Försök igen!',
      difficultyNotice: 'Svårighet: {label}',
      voiceUpdated: 'Röster uppdaterade',
      settings: {
        title: 'Inställningar',
        difficulty: 'Svårighet',
        timeLimit: 'Tidsbegränsning',
        on: 'På',
        off: 'Av',
        seconds: 'sekunder',
        voice: 'Röst',
        autoVoice: '(Auto röst)',
        updateVoices: 'Uppdatera röster',
        close: 'Stäng',
        language: 'Språk',
        timeInputAria: 'Tidsgräns i sekunder',
      },
      help: {
        title: 'Hur spelar jag?',
        items: [
          'Dra bokstäver eller använd vänster/höger piltangenter för att flytta dem.',
          'Tid kvar + streak ger bonuspoäng. Svårighet multiplicerar poängen.',
          'Lyssna-knappen läser upp landsnamnet om TTS finns.',
          'Topplista kräver Supabase (miljövariabler VITE_SUPABASE_URL/KEY).',
        ],
        close: 'Stäng',
      },
      arrangeLetters: 'Arrangera bokstäverna:',
      letterAria: 'Bokstav {letter}, position {position}',
      checkAnswer: 'Kontrollera svar',
      listenTitle: 'Spela upp landets namn',
      listenAria: 'Lyssna på landets namn',
      listen: 'Lyssna',
      nextRound: 'Nästa runda',
      next: 'Nästa',
      showAnswer: 'Visa svar',
      hideAnswer: 'Dölj svar',
      autoFill: 'Autofyll svar (dev)',
      skip: 'Hoppa över',
      answer: 'Svar:',
      roundComplete: 'Runda klar',
      roundSummary:
        '+{roundScore}p (svårighet x{multiplier}, streak {streak})',
      totalScore: 'Totalt: {score}p',
      closeSummary: 'Stäng sammanfattning',
      statsLabel: 'Statistik',
      backToLibrary: 'Tillbaka till spelbiblioteket',
      backShort: 'Tillbaka',
      scoreLabel: 'Poäng: {score}',
      audioHelp: 'Ljudhjälp',
      audioHelpTitle: 'Ljudhjälp på/av',
      audioHelpStatus: 'Ljudhjälp: {status}',
      helpButton: 'Hjälp',
      leaderboard: 'Topplista',
      closeLeaderboard: 'Stäng topplista',
      maxStreak: '(max {best})',
      flagAlt: 'Flagga för {country}',
      flagAria: 'Flagga för {country}',
      difficulty: {
        easy: 'Lätt',
        medium: 'Mellan',
        hard: 'Svår',
      },
    },
    leaderboard: {
      title: 'Topplista',
      configureNote: '(Aktivera Supabase med VITE_SUPABASE_URL och VITE_SUPABASE_KEY för att spara poäng.)',
      loading: 'Hämtar…',
      empty: 'Inga poster ännu.',
      error: 'Kunde inte hämta topplista',
      nameLabel: 'Namn',
      namePlaceholder: 'Ditt namn',
      save: 'Spara poäng',
      saved: 'Sparat!',
      saveError: 'Kunde inte spara poäng',
      needScore: 'Spela en runda först för att spara poäng.',
    },
}

const da = {
    language: {
      sv: 'Svensk',
      da: 'Dansk',
      en: 'Engelsk',
      ar: 'Arabisk',
    },
    labels: {
      language: 'Sprog',
    },
    home: {
      title: 'Leyla Games',
      lead: 'Vælg et spil og spil direkte i browseren.',
      leadAlt: 'Flere spil på samme side – flag, memory og matematik.',
      startGame: 'Start spillet',
      footerNote: 'Flere spil kan lægges i biblioteket uden at ændre resten af siden.',
    },
    menu: {
      playing: 'Spiller: {gameName}',
      backToLibrary: 'Til spilbiblioteket',
    },
    errors: {
      gameNotFound: 'Spillet blev ikke fundet',
      backToStart: 'Tilbage til start',
    },
    categories: {
      featured: {
        name: 'Udvalgte spil',
        description: 'Kom hurtigt i gang med vores mest populære spil.',
      },
      geography: {
        name: 'Geografi',
        description: 'Lær lande og flag.',
      },
      numbers: {
        name: 'Tal',
        description: 'Korte regnespil.',
      },
    },
    games: {
      'flag-quiz': {
        name: 'Flagquiz',
        shortDescription: 'Gæt landet ud fra flaget og arrangér bogstaverne.',
      },
      'flag-choice': {
        name: 'Gæt flaget',
        shortDescription: 'Se flaget og vælg det rigtige land.',
      },
      'flag-memory': {
        name: 'Flagmemory',
        shortDescription: 'Find to ens flag.',
      },
      'math-quiz': {
        name: 'Regnespil',
        shortDescription: 'Plus med fire svarmuligheder.',
      },
    },
    play: {
      score: 'Point: {score}',
      streak: 'Streak',
      rounds: 'Runder',
      correct: 'Rigtigt!',
      incorrect: 'Rigtigt svar: {answer}',
      next: 'Næste',
      again: 'Spil igen',
    },
    flagChoice: {
      prompt: 'Hvilket land er det her?',
    },
    flagMemory: {
      prompt: 'Vend to kort og find det samme flag.',
      moves: 'Træk',
      pairs: 'Par',
      hiddenCard: 'Skjult kort',
      complete: 'Alle par er fundet!',
    },
    mathQuiz: {
      prompt: 'Hvad bliver summen?',
    },
    flagGame: {
      loading: 'Indlæser...',
      timeUp: 'Tiden er ude! Rigtigt svar: {country}',
      correct:
        'Rigtigt! +{total} point (basis {base}, tid {timeBonus}, streak {streakBonus}, x{multiplier})',
      incorrect: 'Ikke rigtigt. Prøv igen!',
      difficultyNotice: 'Sværhedsgrad: {label}',
      voiceUpdated: 'Stemmer opdateret',
      settings: {
        title: 'Indstillinger',
        difficulty: 'Sværhedsgrad',
        timeLimit: 'Tidsbegrænsning',
        on: 'Til',
        off: 'Fra',
        seconds: 'sekunder',
        voice: 'Stemme',
        autoVoice: '(Auto stemme)',
        updateVoices: 'Opdater stemmer',
        close: 'Luk',
        language: 'Sprog',
        timeInputAria: 'Tidsgrænse i sekunder',
      },
      help: {
        title: 'Hvordan spiller jeg?',
        items: [
          'Træk bogstaver eller brug venstre/højre piletaster for at flytte dem.',
          'Tid tilbage + streak giver bonuspoint. Sværhedsgrad multiplicerer pointene.',
          'Lytte-knappen oplæser landets navn, hvis TTS findes.',
          'Leaderboard kræver Supabase (miljøvariabler VITE_SUPABASE_URL/KEY).',
        ],
        close: 'Luk',
      },
      arrangeLetters: 'Arrangér bogstaverne:',
      letterAria: 'Bogstav {letter}, position {position}',
      checkAnswer: 'Tjek svar',
      listenTitle: 'Afspil landets navn',
      listenAria: 'Lyt til landets navn',
      listen: 'Lyt',
      nextRound: 'Næste runde',
      next: 'Næste',
      showAnswer: 'Vis svar',
      hideAnswer: 'Skjul svar',
      autoFill: 'Udfyld svar automatisk (dev)',
      skip: 'Spring over',
      answer: 'Svar:',
      roundComplete: 'Runde klar',
      roundSummary:
        '+{roundScore}p (sværhedsgrad x{multiplier}, streak {streak})',
      totalScore: 'I alt: {score}p',
      closeSummary: 'Luk opsummering',
      statsLabel: 'Statistik',
      backToLibrary: 'Tilbage til spilbiblioteket',
      backShort: 'Tilbage',
      scoreLabel: 'Point: {score}',
      audioHelp: 'Lydhjælp',
      audioHelpTitle: 'Lydhjælp til/fra',
      audioHelpStatus: 'Lydhjælp: {status}',
      helpButton: 'Hjælp',
      leaderboard: 'Leaderboard',
      closeLeaderboard: 'Luk leaderboard',
      maxStreak: '(maks {best})',
      flagAlt: 'Flag for {country}',
      flagAria: 'Flag for {country}',
      difficulty: {
        easy: 'Let',
        medium: 'Mellem',
        hard: 'Svær',
      },
    },
    leaderboard: {
      title: 'Leaderboard',
      configureNote: '(Aktiver Supabase med VITE_SUPABASE_URL og VITE_SUPABASE_KEY for at gemme point.)',
      loading: 'Henter…',
      empty: 'Ingen poster endnu.',
      error: 'Kunne ikke hente leaderboard',
      nameLabel: 'Navn',
      namePlaceholder: 'Dit navn',
      save: 'Gem point',
      saved: 'Gemt!',
      saveError: 'Kunne ikke gemme point',
      needScore: 'Spil en runde først for at gemme point.',
    },
}

export const translations = {
  sv: mergeDeep(sv, partyStrings.sv),
  da: mergeDeep(da, partyStrings.da),
  en: mergeDeep(sv, partyStrings.en),
  ar: mergeDeep(mergeDeep(sv, partyStrings.en), partyStrings.ar),
} as Record<Language, unknown>

const formatString = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = params[key]
    return value === undefined || value === null ? `{${key}}` : String(value)
  })
}

const getNestedValue = (source: unknown, key: string): unknown => {
  const parts = key.split('.')
  let current: unknown = source
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return current
}

export const isLanguage = (value: string | null | undefined): value is Language =>
  value === 'sv' || value === 'da' || value === 'en' || value === 'ar'

export const translate = (language: Language, key: string, params?: Record<string, string | number>) => {
  const primary = getNestedValue(translations[language], key)
  const fallback = primary ?? getNestedValue(translations[defaultLanguage], key)
  if (typeof fallback !== 'string') return key
  return formatString(fallback, params)
}

export const translateList = (language: Language, key: string): string[] => {
  const primary = getNestedValue(translations[language], key)
  const fallback = primary ?? getNestedValue(translations[defaultLanguage], key)
  if (Array.isArray(fallback) && fallback.every((item) => typeof item === 'string')) {
    return fallback
  }
  return []
}
