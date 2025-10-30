import type { DifficultyKey, Medal } from './progression'
export interface Stats {
  solvesByDifficulty: Record<DifficultyKey, number>
  timeTotalsByDifficulty: Record<DifficultyKey, number>
  perfectSolves: number
  bestTime: Record<DifficultyKey, number | null>
}
export function defaultStats(): Stats {
  return {
    solvesByDifficulty: { beginner: 0, medium: 0, hard: 0 },
    timeTotalsByDifficulty: { beginner: 0, medium: 0, hard: 0 },
    perfectSolves: 0,
    bestTime: { beginner: null, medium: null, hard: null }
  }
}
export function recordSolve(stats: Stats, difficulty: DifficultyKey, seconds: number, perfect: boolean, medal: Medal): Stats {
  const s: Stats = { ...stats,
    solvesByDifficulty: { ...stats.solvesByDifficulty },
    timeTotalsByDifficulty: { ...stats.timeTotalsByDifficulty },
    bestTime: { ...stats.bestTime }
  }
  s.solvesByDifficulty[difficulty] += 1
  s.timeTotalsByDifficulty[difficulty] += seconds
  if (perfect) s.perfectSolves += 1
  const best = s.bestTime[difficulty]
  if (best === null || seconds < best) s.bestTime[difficulty] = seconds
  return s
}
