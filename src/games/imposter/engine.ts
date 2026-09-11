import { labelForWord, type ImposterWord } from '../../data/imposterWords'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 15

export type PlayMode = 'online' | 'inPerson'
export type RoundChoice = 'again' | 'vote'
export type ImposterPhase = 'lobby' | 'reveal' | 'clues' | 'roundVote' | 'vote' | 'wordGuess' | 'result'

export interface ImposterPlayer {
  id: string
  name: string
  isHost: boolean
  isImposter: boolean
  ready: boolean
  joinedVia: 'qr' | 'local'
  score: number
}

export interface ImposterClue {
  playerId: string
  text: string
  spoken?: boolean
}

export interface ImposterRoom {
  code: string
  version: number
  phase: ImposterPhase
  playMode: PlayMode
  categoryId: string
  word: ImposterWord
  wordOptions: ImposterWord[]
  imposterCount: number
  players: ImposterPlayer[]
  clueOrder: string[]
  clues: ImposterClue[]
  roundVotes: Record<string, RoundChoice>
  votes: Record<string, string>
  wordGuesses: Record<string, string>
  accusedId: string | null
  guess: string | null
  winner: 'civilians' | 'imposters' | null
  discussEndsAt: number | null
}

export function suggestedImposters(playerCount: number) {
  if (playerCount <= 6) return 1
  if (playerCount <= 11) return 2
  return 3
}

export function maxImposters(playerCount: number) {
  return Math.max(1, Math.min(3, Math.floor((playerCount - 1) / 2)))
}

export function newPlayerId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `p-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function newRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

export function playerScore(player: ImposterPlayer) {
  return player.score ?? 0
}

export function assignImposters(players: ImposterPlayer[], count: number): ImposterPlayer[] {
  const n = Math.min(count, maxImposters(players.length))
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const imposters = new Set(shuffled.slice(0, n).map((player) => player.id))
  return players.map((player) => ({
    ...player,
    score: playerScore(player),
    joinedVia: player.joinedVia ?? 'local',
    isImposter: imposters.has(player.id),
    ready: false,
  }))
}

export function tallyRoundChoice(votes: Record<string, RoundChoice>): RoundChoice {
  let again = 0
  let vote = 0
  for (const choice of Object.values(votes)) {
    if (choice === 'vote') vote += 1
    else again += 1
  }
  return vote > again ? 'vote' : 'again'
}

export function awardVoteScores(players: ImposterPlayer[], votes: Record<string, string>): ImposterPlayer[] {
  const imposters = new Set(players.filter((player) => player.isImposter).map((player) => player.id))
  return players.map((player) => ({
    ...player,
    score: playerScore(player) + (imposters.has(votes[player.id] ?? '') ? 1 : 0),
  }))
}

export function awardGuessScores(
  players: ImposterPlayer[],
  guesses: Record<string, string>,
  word: ImposterWord,
): ImposterPlayer[] {
  return players.map((player) => {
    if (!player.isImposter) return player
    const pick = guesses[player.id]
    if (!pick) return player
    const correct = guessMatchesWord(pick, word) || pick.trim().toLowerCase() === word.en.trim().toLowerCase()
    return { ...player, score: playerScore(player) + (correct ? 1 : 0) }
  })
}

export function majorityVote(votes: Record<string, string>, playerIds: string[]) {
  const tally = new Map<string, number>()
  for (const target of Object.values(votes)) {
    tally.set(target, (tally.get(target) ?? 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  let tie = false
  for (const id of playerIds) {
    const count = tally.get(id) ?? 0
    if (count > bestCount) {
      best = id
      bestCount = count
      tie = false
    } else if (count === bestCount && count > 0) {
      tie = true
    }
  }
  if (!best || bestCount === 0 || tie) return null
  return best
}

export function guessMatchesWord(guess: string, word: ImposterWord) {
  const needle = guess.trim().toLowerCase()
  if (!needle) return false
  return [word.en, word.ar, word.sv].some((value) => value.trim().toLowerCase() === needle)
}

export function displayWord(word: ImposterWord, language: string) {
  return labelForWord(word, language)
}

export function getPlayer(room: ImposterRoom, playerId: string) {
  return room.players.find((player) => player.id === playerId)
}

export function shuffledOrder(playerIds: string[]) {
  return [...playerIds].sort(() => Math.random() - 0.5)
}
