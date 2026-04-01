import type { CellState } from '../hooks/useGameState'

interface PuzzleCounts {
  rowCounts: number[]
  colCounts: number[]
}

/**
 * Reveals mistakes by removing cells that exceed the required counts
 * for each row and column. This function modifies cells that are filled (1)
 * but cause the count to exceed the required amount.
 */
export function revealMistakes(
  grid: CellState[][],
  puzzle: PuzzleCounts,
  size: number,
  rowFilled: number[]
): CellState[][] {
  const next = grid.map(row => row.slice())

  // Fix rows that have too many filled cells
  for (let r = 0; r < size; r++) {
    const need = puzzle.rowCounts[r]
    let have = rowFilled[r]
    if (have > need) {
      for (let c = 0; c < size && have > need; c++) {
        if (next[r][c] === 1) {
          next[r][c] = 0
          have--
        }
      }
    }
  }

  // Recalculate column counts after row fixes
  const colNow = Array.from({ length: size }, (_, c) =>
    next.reduce<number>((a, row) => a + (row[c] === 1 ? 1 : 0), 0)
  )

  // Fix columns that have too many filled cells
  for (let c = 0; c < size; c++) {
    const need = puzzle.colCounts[c]
    let have = colNow[c]
    if (have > need) {
      for (let r = 0; r < size && have > need; r++) {
        if (next[r][c] === 1) {
          next[r][c] = 0
          have--
        }
      }
    }
  }

  return next
}

