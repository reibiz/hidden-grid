import { DEFAULT_PUZZLE_DENSITY, PERFECT_SOLVE_BONUS, TIME_BONUS_MIN, TIME_BONUS_MAX } from './constants'

export type DifficultyConfig = {
  size: number
  density: number
  revealsAllowed: number
  parTimes: { bronze: number; silver: number; gold: number }
  multiplier: number
  hideCountsUntilComplete?: boolean
}

export type Difficulty = 'flash' | 'easy' | 'medium' | 'hard' | 'expert' | 'insane'
export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  flash:   { size: 4,  density: DEFAULT_PUZZLE_DENSITY, revealsAllowed: -1, parTimes: { bronze: 180,  silver: 120, gold: 60 },  multiplier: 0.5 },
  easy:    { size: 6,  density: DEFAULT_PUZZLE_DENSITY, revealsAllowed: -1, parTimes: { bronze: 300,  silver: 180, gold: 120 }, multiplier: 1.0 },
  medium:  { size: 8,  density: 0.50,                  revealsAllowed: 1,  parTimes: { bronze: 420,  silver: 300, gold: 180 }, multiplier: 1.5 },
  hard:    { size: 10, density: 0.55,                  revealsAllowed: 0,  parTimes: { bronze: 540,  silver: 420, gold: 300 }, multiplier: 2.0 },
  expert:  { size: 15, density: 0.60,                  revealsAllowed: 0,  parTimes: { bronze: 1200, silver: 900, gold: 600 }, multiplier: 3.0 },
  insane:  { size: 15, density: 0.60,                  revealsAllowed: 0,  parTimes: { bronze: 1200, silver: 900, gold: 600 }, multiplier: 3.0, hideCountsUntilComplete: true },
}
export type Medal = 'none' | 'bronze' | 'silver' | 'gold'
export type DifficultyKey = keyof typeof DIFFICULTY_CONFIG
export function computeMedal(difficulty: DifficultyKey, seconds: number): Medal {
  const p = DIFFICULTY_CONFIG[difficulty].parTimes
  if (seconds <= p.gold) return 'gold'
  if (seconds <= p.silver) return 'silver'
  if (seconds <= p.bronze) return 'bronze'
  return 'none'
}
export function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)) }
export function baseXP(size: number) { return size * 10 }
export function computeXP(params: { size: number; difficulty: DifficultyKey; seconds: number; perfect: boolean }): number {
  const { size, difficulty, seconds, perfect } = params
  const base = baseXP(size)
  const mult = DIFFICULTY_CONFIG[difficulty].multiplier
  const par = DIFFICULTY_CONFIG[difficulty].parTimes.silver
  const timeBonus = clamp(par / Math.max(seconds, 1), TIME_BONUS_MIN, TIME_BONUS_MAX)
  const accBonus = perfect ? PERFECT_SOLVE_BONUS : 1.0
  return Math.round(base * mult * timeBonus * accBonus)
}
export function xpForLevel(level: number): number {
  const thr = Math.round(100 * Math.pow(level, 1.4)); return level <= 1 ? 0 : thr
}
export function levelFromXP(totalXP: number): { level: number; intoLevel: number; nextLevelXP: number } {
  let level = 1; while (xpForLevel(level + 1) <= totalXP) level++
  const currThreshold = xpForLevel(level); const nextThreshold = xpForLevel(level + 1)
  return { level, intoLevel: totalXP - currThreshold, nextLevelXP: nextThreshold - currThreshold }
}
export function titleForLevel(level: number): string {
  if (level >= 20) return 'Architect'
  if (level >= 15) return 'Grid Master'
  if (level >= 10) return 'Logic Adept'
  if (level >= 5) return 'Pattern Solver'
  return 'Grid Apprentice'
}
