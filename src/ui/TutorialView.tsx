/**
 * TutorialView
 *
 * A guided 5×5 puzzle that teaches the core mechanics in four steps:
 *
 *   1. Introduction — what the clue numbers mean
 *   2. Fill a cell  — tap to fill; auto-advances when row 2 is complete
 *   3. Mark empty   — long-press / right-click to place ✕
 *   4. Finish       — free play; auto-advances when the puzzle is solved
 *
 * Reuses GameBoard so the tutorial looks and feels identical to the real game.
 * Tutorial completion is persisted to localStorage (separate from the profile).
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { GameBoard } from '../components/GameBoard'
import { useSound } from '../hooks/useSound'
import { markTutorialDone } from '../lib/tutorialState'
import type { CellState } from '../hooks/useGameState'

// ─── Tutorial puzzle ───────────────────────────────────────────────────────────
//
// Arrow shape pointing right. Uniquely solvable:
//   Step 1: row 2 (count=5) and col 0 (count=5) are forced fills.
//   Step 2: rows 0 and 4 are then complete (count=1, only col 0 remaining).
//   Step 3: col 1 needs 3 fills; row 2 + rows 1 & 3 is the only option.
//   Step 4: rows 1 and 3 are complete; cols 2-4 have only row 2 filled.

const TUTORIAL_PUZZLE = {
  id: 'tutorial',
  size: 5,
  solution: [
    [true,  false, false, false, false],
    [true,  true,  false, false, false],
    [true,  true,  true,  true,  true ],
    [true,  true,  false, false, false],
    [true,  false, false, false, false],
  ],
  rowCounts: [1, 2, 5, 2, 1],
  colCounts: [5, 3, 1, 1, 1],
}

const SIZE = TUTORIAL_PUZZLE.size

// ─── Step definitions ──────────────────────────────────────────────────────────

type AutoAdvance = 'row2-filled' | 'puzzle-complete' | null

interface Step {
  title: string
  body: string
  cta: string | null       // null = auto-advance only
  hint: string | null      // shown below CTA when auto-advancing
  autoAdvance: AutoAdvance
}

const STEPS: Step[] = [
  {
    title: 'Welcome to Hidden Grid',
    body: 'Each number beside a row or column tells you how many cells to fill in it. Your goal: match every clue to complete the picture.',
    cta: 'Got it →',
    hint: null,
    autoAdvance: null,
  },
  {
    title: 'Tap to fill',
    body: 'Tap a cell to fill it. The middle row\'s clue is 5 — the full width of the grid — so every cell in it must be filled. Give it a try!',
    cta: null,
    hint: 'Fill the middle row to continue…',
    autoAdvance: 'row2-filled',
  },
  {
    title: 'Mark empty cells',
    body: 'Long-press on mobile (or right-click on desktop) to mark a cell ✕. Use ✕ to track cells you know are empty — it keeps you organised and prevents mistakes.',
    cta: 'Got it →',
    hint: null,
    autoAdvance: null,
  },
  {
    title: 'Finish the puzzle!',
    body: 'You know the basics. Use the clue numbers to fill in the rest of the board. Each row and column must match its clue exactly.',
    cta: null,
    hint: 'Solve the puzzle to finish the tutorial…',
    autoAdvance: 'puzzle-complete',
  },
]

// ─── TutorialView ──────────────────────────────────────────────────────────────

interface TutorialViewProps {
  onComplete: () => void
  soundOn: boolean
}

const makeEmptyGrid = (): CellState[][] =>
  Array.from({ length: SIZE }, () => Array<CellState>(SIZE).fill(0))

export default function TutorialView({ onComplete, soundOn }: TutorialViewProps) {
  const [grid, setGrid] = useState<CellState[][]>(makeEmptyGrid)
  const [step, setStep] = useState(0)
  const sound = useSound(soundOn)

  // Keep a stable ref to onComplete so the auto-advance timeout never
  // captures a stale closure even if the parent re-renders.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  // ── Derived counts ────────────────────────────────────────────────────────

  const rowFilled = useMemo(
    () => grid.map(row => row.filter(c => c === 1).length),
    [grid]
  )

  const colFilled = useMemo(
    () =>
      Array.from({ length: SIZE }, (_, ci) =>
        grid.reduce((sum, row) => sum + (row[ci] === 1 ? 1 : 0), 0)
      ),
    [grid]
  )

  const completedRows = useMemo(() => {
    const s = new Set<number>()
    rowFilled.forEach((n, i) => { if (n === TUTORIAL_PUZZLE.rowCounts[i]) s.add(i) })
    return s
  }, [rowFilled])

  const completedCols = useMemo(() => {
    const s = new Set<number>()
    colFilled.forEach((n, i) => { if (n === TUTORIAL_PUZZLE.colCounts[i]) s.add(i) })
    return s
  }, [colFilled])

  const puzzleComplete =
    rowFilled.every((n, i) => n === TUTORIAL_PUZZLE.rowCounts[i]) &&
    colFilled.every((n, i) => n === TUTORIAL_PUZZLE.colCounts[i])

  // ── Auto-advance ──────────────────────────────────────────────────────────

  useEffect(() => {
    const current = STEPS[step]
    if (!current.autoAdvance) return

    if (current.autoAdvance === 'row2-filled' && rowFilled[2] === TUTORIAL_PUZZLE.rowCounts[2]) {
      const id = setTimeout(() => setStep(s => s + 1), 600)
      return () => clearTimeout(id)
    }

    if (current.autoAdvance === 'puzzle-complete' && puzzleComplete) {
      markTutorialDone()
      const id = setTimeout(() => onCompleteRef.current(), 900)
      return () => clearTimeout(id)
    }
  }, [step, rowFilled, puzzleComplete])

  // ── Cell interactions ─────────────────────────────────────────────────────

  const cycleCell = useCallback((r: number, c: number, rightClick: boolean) => {
    setGrid(prev => {
      const next = prev.map(row => [...row]) as CellState[][]
      const cur = next[r][c]
      next[r][c] = rightClick
        ? (cur === 2 ? 0 : 2)
        : (cur === 1 ? 0 : 1)
      return next
    })
  }, [])

  const handleCellClick = useCallback(
    (r: number, c: number, curState: CellState) => {
      cycleCell(r, c, false)
      sound.playSound(curState === 0 ? 'cell-fill' : 'cell-clear')
    },
    [cycleCell, sound]
  )

  const handleCellRightClick = useCallback(
    (r: number, c: number, curState: CellState) => {
      cycleCell(r, c, true)
      sound.playSound(curState === 0 ? 'cell-mark' : 'cell-clear')
    },
    [cycleCell, sound]
  )

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleCta = () => {
    sound.playSound('button-click')
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const handleSkip = () => {
    markTutorialDone()
    sound.playSound('button-click')
    onComplete()
  }

  const current = STEPS[step]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 py-6">

      {/* Header */}
      <header className="w-full max-w-sm flex items-center justify-between mb-6">
        <h1 className="text-display font-display">How to Play</h1>
        <button
          className="btn btn-secondary text-sm"
          onClick={handleSkip}
        >
          Skip
        </button>
      </header>

      {/* Game board — identical to the real game */}
      <div className="panel border border-accent w-full max-w-sm">
        <GameBoard
          puzzle={TUTORIAL_PUZZLE}
          grid={grid}
          rowFilled={rowFilled}
          colFilled={colFilled}
          hideCountsUntilComplete={false}
          completedRows={completedRows}
          completedCols={completedCols}
          puzzleComplete={puzzleComplete}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
        />
      </div>

      {/* Step card */}
      <div className="w-full max-w-sm mt-5">
        <div className="panel border border-accent">

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 items-center">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    height: '6px',
                    width: i === step ? '24px' : '8px',
                    background: i <= step
                      ? 'var(--color-primary)'
                      : 'var(--color-grid-line)',
                    opacity: i < step ? 0.45 : 1,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-text-muted">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Step content */}
          <h2 className="text-base font-semibold text-text-primary mb-2">
            {current.title}
          </h2>
          <p className="text-sm text-text-secondary" style={{ lineHeight: 'var(--leading-relaxed)' }}>
            {current.body}
          </p>

          {/* CTA or waiting hint */}
          {current.cta ? (
            <button
              className="btn btn-primary w-full mt-4"
              onClick={handleCta}
            >
              {current.cta}
            </button>
          ) : current.hint ? (
            <p className="text-xs text-text-muted mt-4 text-center">
              {current.hint}
            </p>
          ) : null}
        </div>
      </div>

    </div>
  )
}
