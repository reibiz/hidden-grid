/**
 * useAnimations
 *
 * Manages all transient animation and sound-trigger state that fires when the
 * player completes a row, a column, or the full puzzle.
 *
 * Extracted from App.tsx so the orchestrator stays thin.
 *
 * ─── Bug fixed vs. original App.tsx ─────────────────────────────────────────
 * The original code had TWO separate useEffect calls that both read AND wrote
 * the same `prevCountsMatch` ref:
 *
 *   effect 1 → reads prevCountsMatch.current, then sets it to countsMatch
 *   effect 2 → reads prevCountsMatch.current (already updated!) → condition
 *              is now false → puzzle-solved sound + animation never fired
 *
 * React runs effects in declaration order within the same commit, so effect 2
 * always saw the updated ref value.  The fix: one effect owns the ref.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from 'react'
import type { Puzzle } from './useGameState'
import type { useSound } from './useSound'

interface UseAnimationsOptions {
  rowFilled: number[]
  colFilled: number[]
  puzzle: Puzzle
  countsMatch: boolean
  seed: string
  sound: ReturnType<typeof useSound>
}

export interface UseAnimationsResult {
  completedRows: Set<number>
  completedCols: Set<number>
  puzzleComplete: boolean
  showParticles: boolean
}

export function useAnimations({
  rowFilled,
  colFilled,
  puzzle,
  countsMatch,
  seed,
  sound,
}: UseAnimationsOptions): UseAnimationsResult {
  // Refs that track the previous render's values for delta detection
  const prevCountsMatch = useRef(countsMatch)
  const prevRowFilled = useRef<number[]>([])
  const prevColFilled = useRef<number[]>([])

  const [completedRows, setCompletedRows] = useState<Set<number>>(new Set())
  const [completedCols, setCompletedCols] = useState<Set<number>>(new Set())
  const [puzzleComplete, setPuzzleComplete] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  // ── Row completions ──────────────────────────────────────────────────────
  useEffect(() => {
    rowFilled.forEach((filled, i) => {
      const prev = prevRowFilled.current[i] ?? 0
      if (filled === puzzle.rowCounts[i] && prev !== filled) {
        sound.playSound('row-complete')
        setCompletedRows(prev => new Set(prev).add(i))
        setTimeout(() => {
          setCompletedRows(prev => {
            const next = new Set(prev)
            next.delete(i)
            return next
          })
        }, 400)
      }
    })
    prevRowFilled.current = [...rowFilled]
  }, [rowFilled, puzzle.rowCounts, sound])

  // ── Column completions ───────────────────────────────────────────────────
  useEffect(() => {
    colFilled.forEach((filled, i) => {
      const prev = prevColFilled.current[i] ?? 0
      if (filled === puzzle.colCounts[i] && prev !== filled) {
        sound.playSound('col-complete')
        setCompletedCols(prev => new Set(prev).add(i))
        setTimeout(() => {
          setCompletedCols(prev => {
            const next = new Set(prev)
            next.delete(i)
            return next
          })
        }, 400)
      }
    })
    prevColFilled.current = [...colFilled]
  }, [colFilled, puzzle.colCounts, sound])

  // ── Puzzle completion ────────────────────────────────────────────────────
  // Single effect owns prevCountsMatch — prevents the double-update race.
  useEffect(() => {
    const justCompleted = countsMatch && !prevCountsMatch.current
    prevCountsMatch.current = countsMatch

    if (justCompleted) {
      setPuzzleComplete(true)
      setShowParticles(true)
      sound.playSound('puzzle-solved')

      setTimeout(() => setPuzzleComplete(false), 1200)
      setTimeout(() => setShowParticles(false), 100)
    }
  }, [countsMatch, sound])

  // ── Reset on new puzzle ──────────────────────────────────────────────────
  useEffect(() => {
    setCompletedRows(new Set())
    setCompletedCols(new Set())
    setPuzzleComplete(false)
  }, [seed])

  return { completedRows, completedCols, puzzleComplete, showParticles }
}
