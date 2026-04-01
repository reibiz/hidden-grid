import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { DIFFICULTY_CONFIG, type DifficultyKey } from '../lib/progression'
import { hashStringToSeed, mulberry32, todayKey } from '../lib/seed'
import { revealMistakes as revealMistakesUtil } from '../lib/puzzleValidation'
import { DEFAULT_PUZZLE_DENSITY } from '../lib/constants'
import { CellState as CellStateEnum } from '../lib/types'

export type CellState = 0 | 1 | 2
// Export enum for better type safety in new code
export { CellStateEnum }

export interface Puzzle {
  id: string
  size: number
  solution: boolean[][]
  rowCounts: number[]
  colCounts: number[]
}

// ─── Grid history reducer ──────────────────────────────────────────────────────
//
// Managing grid + undo/redo stacks in a single reducer guarantees that every
// state transition is atomic — no possibility of history and grid diverging.

interface GridHistoryState {
  grid: CellState[][]
  past: CellState[][][]   // undo stack — oldest first
  future: CellState[][][] // redo stack — most-recent-undone first
}

type GridHistoryAction =
  | {
      type: 'CYCLE_CELL'
      r: number
      c: number
      rightClick: boolean
      rowCounts: number[]
      colCounts: number[]
    }
  | { type: 'APPLY'; grid: CellState[][] }  // used by revealMistakes
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; size: number }

function applyAutoMark(
  grid: CellState[][],
  r: number,
  c: number,
  rowCounts: number[],
  colCounts: number[]
): void {
  // Auto-mark empty cells in a row once its filled count reaches the clue.
  const rowFilled = grid[r].reduce<number>((a, v) => a + (v === 1 ? 1 : 0), 0)
  if (rowFilled === rowCounts[r]) {
    for (let col = 0; col < grid[r].length; col++) {
      if (grid[r][col] === 0) grid[r][col] = 2
    }
  }

  // Auto-mark empty cells in a column once its filled count reaches the clue.
  const colFilled = grid.reduce<number>((a, row) => a + (row[c] === 1 ? 1 : 0), 0)
  if (colFilled === colCounts[c]) {
    for (let row = 0; row < grid.length; row++) {
      if (grid[row][c] === 0) grid[row][c] = 2
    }
  }
}

function gridHistoryReducer(
  state: GridHistoryState,
  action: GridHistoryAction
): GridHistoryState {
  switch (action.type) {

    case 'CYCLE_CELL': {
      const { r, c, rightClick, rowCounts, colCounts } = action
      const next = state.grid.map(row => row.slice()) as CellState[][]
      const cur = next[r][c]

      let nextValue: CellState
      if (rightClick) {
        nextValue = cur === 2 ? 0 : 2
      } else {
        nextValue = cur === 1 ? 0 : 1
      }
      next[r][c] = nextValue

      // Auto-mark only fires when the player fills a cell (0 → 1),
      // never when clearing or manually marking empty.
      if (!rightClick && nextValue === 1) {
        applyAutoMark(next, r, c, rowCounts, colCounts)
      }

      return {
        grid: next,
        past: [...state.past, state.grid],
        future: [],
      }
    }

    case 'APPLY': {
      // Used by revealMistakes — push current grid to past, apply new grid.
      return {
        grid: action.grid,
        past: [...state.past, state.grid],
        future: [],
      }
    }

    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        grid: previous,
        past: state.past.slice(0, -1),
        future: [state.grid, ...state.future],
      }
    }

    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        grid: next,
        past: [...state.past, state.grid],
        future: state.future.slice(1),
      }
    }

    case 'RESET': {
      return {
        grid: Array.from({ length: action.size }, () =>
          Array(action.size).fill(0)
        ) as CellState[][],
        past: [],
        future: [],
      }
    }
  }
}

function buildInitialGridState(size: number): GridHistoryState {
  return {
    grid: Array.from({ length: size }, () =>
      Array(size).fill(0)
    ) as CellState[][],
    past: [],
    future: [],
  }
}

// ─── Puzzle helpers ────────────────────────────────────────────────────────────

function generatePuzzle(seed: string, size = 8, density = DEFAULT_PUZZLE_DENSITY): Puzzle {
  const rng = mulberry32(hashStringToSeed(seed))
  const solution: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rng() < density)
  )

  for (let r = 0; r < size; r++) {
    if (solution[r].every(v => !v)) {
      solution[r][Math.floor(rng() * size)] = true
    }
  }

  for (let c = 0; c < size; c++) {
    if (solution.every(row => !row[c])) {
      solution[Math.floor(rng() * size)][c] = true
    }
  }

  const rowCounts = solution.map(row => row.reduce((a, b) => a + (b ? 1 : 0), 0))
  const colCounts = Array.from({ length: size }, (_, c) =>
    solution.reduce((a, row) => a + (row[c] ? 1 : 0), 0)
  )

  return { id: seed, size, solution, rowCounts, colCounts }
}

function buildSeed(difficulty: DifficultyKey) {
  return `practice-${Math.random().toString(36).slice(2, 10)}-${difficulty}`
}

// ─── useGameState ──────────────────────────────────────────────────────────────

export function useGameState(
  initialDifficulty: DifficultyKey,
  fixedPuzzle?: Puzzle,            // picture mode: use this puzzle instead of generating
) {
  const [difficulty, setDifficultyState] = useState<DifficultyKey>(initialDifficulty)
  const [seed, setSeed] = useState(() => buildSeed(initialDifficulty))

  const config = useMemo(() => DIFFICULTY_CONFIG[difficulty], [difficulty])

  const [puzzle, setPuzzle] = useState<Puzzle>(() =>
    fixedPuzzle ?? generatePuzzle(seed, config.size, config.density)
  )

  const [gridState, dispatchGrid] = useReducer(
    gridHistoryReducer,
    fixedPuzzle?.size ?? config.size,
    buildInitialGridState
  )

  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState(() => Date.now())
  const [revealCount, setRevealCount] = useState(0)

  // Reset everything when the seed or config changes (new puzzle).
  // In picture mode the puzzle is fixed — skip regeneration entirely.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (fixedPuzzle) return
    const nextPuzzle = generatePuzzle(seed, config.size, config.density)
    setPuzzle(nextPuzzle)
    dispatchGrid({ type: 'RESET', size: config.size })
    setMoves(0)
    setStartTime(Date.now())
    setRevealCount(0)
  }, [seed, config]) // fixedPuzzle intentionally omitted — it never changes per session

  const { grid, past, future } = gridState

  // ── Derived counts ────────────────────────────────────────────────────────

  const rowFilled = useMemo(
    () => grid.map(row => row.reduce<number>((a, v) => a + (v === 1 ? 1 : 0), 0)),
    [grid]
  )

  const colFilled = useMemo(
    () =>
      Array.from({ length: config.size }, (_, c) =>
        grid.reduce<number>((a, row) => a + (row[c] === 1 ? 1 : 0), 0)
      ),
    [grid, config.size]
  )

  // Puzzle is solved when row and column counts match.
  // Allows multiple valid solutions — not just the exact solution grid.
  const countsMatch = useMemo(() => {
    const rowsMatch = puzzle.rowCounts.every((expected, i) => expected === rowFilled[i])
    const colsMatch = puzzle.colCounts.every((expected, i) => expected === colFilled[i])
    return rowsMatch && colsMatch
  }, [puzzle.rowCounts, puzzle.colCounts, rowFilled, colFilled])

  // ── Actions ───────────────────────────────────────────────────────────────

  const cycleCell = useCallback(
    (r: number, c: number, rightClick = false) => {
      dispatchGrid({
        type: 'CYCLE_CELL',
        r,
        c,
        rightClick,
        rowCounts: puzzle.rowCounts,
        colCounts: puzzle.colCounts,
      })
      setMoves(m => m + 1)
    },
    [puzzle.rowCounts, puzzle.colCounts]
  )

  const undo = useCallback(() => {
    if (past.length === 0) return
    dispatchGrid({ type: 'UNDO' })
    setMoves(m => Math.max(0, m - 1))
  }, [past.length])

  const redo = useCallback(() => {
    if (future.length === 0) return
    dispatchGrid({ type: 'REDO' })
    setMoves(m => m + 1)
  }, [future.length])

  const resetBoard = useCallback(() => {
    dispatchGrid({ type: 'RESET', size: config.size })
    setMoves(0)
    setStartTime(Date.now())
    setRevealCount(0)
  }, [config.size])

  const revealMistakes = useCallback(() => {
    const correctedGrid = revealMistakesUtil(grid, puzzle, config.size, rowFilled)
    dispatchGrid({ type: 'APPLY', grid: correctedGrid })
    setRevealCount(n => n + 1)
  }, [config.size, grid, puzzle, rowFilled])

  const updateDifficulty = useCallback((nextDifficulty: DifficultyKey) => {
    setDifficultyState(nextDifficulty)
    setSeed(buildSeed(nextDifficulty))
  }, [])

  const startNewPuzzle = useCallback(() => {
    setSeed(buildSeed(difficulty))
  }, [difficulty])

  return {
    difficulty,
    config,
    seed,
    puzzle,
    grid,
    moves,
    revealCount,
    startTime,
    rowFilled,
    colFilled,
    countsMatch,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    cycleCell,
    undo,
    redo,
    revealMistakes,
    resetBoard,
    updateDifficulty,
    startNewPuzzle,
  }
}
