import type { DifficultyKey, Medal } from './progression'
export interface Stats {
  solvesByDifficulty: Record<DifficultyKey, number>
  timeTotalsByDifficulty: Record<DifficultyKey, number>
  perfectSolves: number
  bestTime: Record<DifficultyKey, number | null>
  bestScoreByDifficulty: Record<DifficultyKey, number>
  highestScore: number
}
export function defaultStats(): Stats {
  return {
    solvesByDifficulty: { flash: 0, easy: 0, medium: 0, hard: 0, expert: 0, insane: 0 },
    timeTotalsByDifficulty: { flash: 0, easy: 0, medium: 0, hard: 0, expert: 0, insane: 0 },
    perfectSolves: 0,
    bestTime: { flash: null, easy: null, medium: null, hard: null, expert: null, insane: null },
    bestScoreByDifficulty: { flash: 0, easy: 0, medium: 0, hard: 0, expert: 0, insane: 0 },
    highestScore: 0,
  }
}
export function recordSolve(
  stats: Stats,
  difficulty: DifficultyKey,
  seconds: number,
  perfect: boolean,
  medal: Medal,
  score: number
): Stats {
  const s: Stats = { ...stats,
    solvesByDifficulty: { ...stats.solvesByDifficulty },
    timeTotalsByDifficulty: { ...stats.timeTotalsByDifficulty },
    bestTime: { ...stats.bestTime },
    bestScoreByDifficulty: { ...stats.bestScoreByDifficulty },
  }
  s.solvesByDifficulty[difficulty] += 1
  s.timeTotalsByDifficulty[difficulty] += seconds
  if (perfect) s.perfectSolves += 1
  const best = s.bestTime[difficulty]
  if (best === null || seconds < best) s.bestTime[difficulty] = seconds
  s.bestScoreByDifficulty[difficulty] = Math.max(s.bestScoreByDifficulty[difficulty], score)
  s.highestScore = Math.max(s.highestScore, score)
  return s
}
