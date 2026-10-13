export const MATH_MAX = 20

export type MathMode = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'
export type MathOp = Exclude<MathMode, 'mixed'>

export interface MathQuestion {
  a: number
  b: number
  answer: number
  symbol: string
  op: MathOp
  options: number[]
}

const OPS: MathOp[] = ['addition', 'subtraction', 'multiplication', 'division']

const SYMBOLS: Record<MathOp, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
}

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffleCopy<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function pickOp(mode: MathMode): MathOp {
  if (mode === 'mixed') return OPS[randInt(0, OPS.length - 1)]
  return mode
}

function makePair(op: MathOp): Pick<MathQuestion, 'a' | 'b' | 'answer' | 'symbol' | 'op'> {
  if (op === 'addition') {
    const a = randInt(0, MATH_MAX)
    const b = randInt(0, MATH_MAX - a)
    return { a, b, answer: a + b, symbol: SYMBOLS.addition, op }
  }
  if (op === 'subtraction') {
    const a = randInt(0, MATH_MAX)
    const b = randInt(0, a)
    return { a, b, answer: a - b, symbol: SYMBOLS.subtraction, op }
  }
  if (op === 'multiplication') {
    const a = randInt(0, MATH_MAX)
    const maxB = a === 0 ? MATH_MAX : Math.floor(MATH_MAX / a)
    const b = randInt(0, maxB)
    return { a, b, answer: a * b, symbol: SYMBOLS.multiplication, op }
  }
  const b = randInt(1, MATH_MAX)
  const answer = randInt(0, Math.floor(MATH_MAX / b))
  return { a: b * answer, b, answer, symbol: SYMBOLS.division, op }
}

function makeOptions(answer: number): number[] {
  const options = new Set<number>([answer])
  let guard = 0
  while (options.size < 4 && guard < 80) {
    guard += 1
    const candidate = answer + randInt(-4, 4)
    if (candidate >= 0 && candidate <= MATH_MAX) options.add(candidate)
  }
  while (options.size < 4) options.add(randInt(0, MATH_MAX))
  return shuffleCopy([...options])
}

export function makeQuestion(mode: MathMode): MathQuestion {
  const pair = makePair(pickOp(mode))
  return { ...pair, options: makeOptions(pair.answer) }
}

export const MATH_MODES: MathMode[] = ['addition', 'subtraction', 'multiplication', 'division', 'mixed']

export const MATH_MODE_SYMBOLS: Record<MathMode, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
  mixed: '＋−×÷',
}
