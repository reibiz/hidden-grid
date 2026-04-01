import { useEffect, useRef, useState } from 'react'
import { computeMedal, computeXP, levelFromXP, type DifficultyKey, type Medal } from '../lib/progression'
import { recordSolve } from '../lib/stats'
import { evaluateAchievements } from '../lib/achievements'
import { useProfile } from './useProfile'

export interface CompletionResult {
  seconds: number
  medal: Medal
  gainedXP: number
  levelUp: { from: number; to: number } | null
  newlyUnlocked?: string[]
}

export interface UseGameCompletionParams {
  countsMatch: boolean
  startTime: number
  difficulty: DifficultyKey
  size: number
  seed: string
  profile: ReturnType<typeof useProfile>
}

export function useGameCompletion({
  countsMatch,
  startTime,
  difficulty,
  size,
  seed, // Keep for resetting completion flag when puzzle changes
  profile,
}: UseGameCompletionParams) {
  const [result, setResult] = useState<CompletionResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const hasProcessedCompletion = useRef(false)

  // Reset completion flag when puzzle changes
  useEffect(() => {
    hasProcessedCompletion.current = false
    setResult(null)
    setIsOpen(false)
  }, [seed])

  // Handle puzzle completion - only checks row/column counts, not exact solution match
  useEffect(() => {
    if (!countsMatch || hasProcessedCompletion.current) return
    hasProcessedCompletion.current = true

    const seconds = Math.floor((Date.now() - startTime) / 1000)
    const medal = computeMedal(difficulty, seconds)
    const perfect = true
    const gainedXP = computeXP({ size, difficulty, seconds, perfect })

    // No daily bonus or streak tracking - all puzzles are practice mode

    const p = profile.get()
    const newStats = recordSolve(p.stats, difficulty, seconds, perfect, medal, gainedXP)
    profile.setStats(newStats)

    const evalRes = evaluateAchievements(p.achievements, {
      difficulty,
      seconds,
      medal,
      perfect,
      dateISO: new Date().toISOString(),
      currentStreak: p.streak.current,
      solvedByDifficulty: newStats.solvesByDifficulty,
    })
    profile.setAchievements(evalRes.updated)

    const before = levelFromXP(profile.get().xp)
    profile.addXP(gainedXP)
    profile.incrementSolved()
    if (medal !== 'none') {
      profile.addMedal(medal)
    }
    const after = levelFromXP(profile.get().xp)
    const levelUp = after.level > before.level ? { from: before.level, to: after.level } : null

    const completionResult: CompletionResult = {
      seconds,
      medal,
      gainedXP: gainedXP,
      levelUp,
      newlyUnlocked: evalRes.newlyUnlocked,
    }

    setResult(completionResult)
    setIsOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countsMatch]) // Only depend on countsMatch - other values are captured when countsMatch becomes true

  const closeModal = () => {
    setIsOpen(false)
  }

  return {
    result,
    isOpen,
    closeModal,
  }
}

