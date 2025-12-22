export type Language = 'sv' | 'da'

export const defaultLanguage: Language = 'sv'

export const translations = {
  sv: {
    language: {
      sv: 'Svenska',
      da: 'Danska',
    },
    labels: {
      language: 'Språk',
    },
    home: {
      title: 'Leyla Games',
      lead: 'Spela direkt i webbläsaren. Den här portalen är redo att växa med fler spel.',
      leadAlt: 'En liten spelplattform där vi kan lägga till fler spel över tid.',
      startGame: 'Starta spelet',
      footerNote:
        'Plattformen är byggd så att vi enkelt kan lägga till fler spel, koppla på global leaderboard och senare flytta till t.ex. Next.js/edge utan att ändra varje spel.',
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
    },
    games: {
      'flag-quiz': {
        name: 'Flaggquiz',
        shortDescription: 'Gissa landet från flaggan och ordna bokstäverna.',
      },
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
    },
  },
  da: {
    language: {
      sv: 'Svensk',
      da: 'Dansk',
    },
    labels: {
      language: 'Sprog',
    },
    home: {
      title: 'Leyla Games',
      lead: 'Spil direkte i browseren. Denne portal er klar til at vokse med flere spil.',
      leadAlt: 'En lille spilplatform, hvor vi kan tilføje flere spil over tid.',
      startGame: 'Start spillet',
      footerNote:
        'Platformen er bygget, så vi nemt kan tilføje flere spil, koble global leaderboard på og senere flytte til f.eks. Next.js/edge uden at ændre hvert spil.',
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
    },
    games: {
      'flag-quiz': {
        name: 'Flagquiz',
        shortDescription: 'Gæt landet ud fra flaget og arrangér bogstaverne.',
      },
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
    },
  },
} as const

const formatString = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = params[key]
    return value === undefined || value === null ? `{${key}}` : String(value)
  })
}

const getNestedValue = (source: any, key: string) => {
  const parts = key.split('.')
  let current = source
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return undefined
    }
  }
  return current
}

export const isLanguage = (value: string | null | undefined): value is Language => value === 'sv' || value === 'da'

export const translate = (language: Language, key: string, params?: Record<string, string | number>) => {
  const primary = getNestedValue(translations[language], key)
  const fallback = primary ?? getNestedValue(translations[defaultLanguage], key)
  if (typeof fallback !== 'string') return key
  return formatString(fallback, params)
}
