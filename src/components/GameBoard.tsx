/**
 * GameBoard
 *
 * Renders the nonogram grid: column clue headers, row clue labels, and the
 * interactive cell grid.
 *
 * Performance: each cell is a separate memoized component (GridCell) so React
 * only re-renders the cells whose state actually changed — not the entire grid
 * — on every player interaction.
 *
 * Cell sizing:
 * CSS calc() cannot divide by a variable expression like (N+1), so the optimal
 * mobile cell size is computed in JS and injected as --cell-size-mobile on the
 * grid container. The CSS formula remains as a server/hydration fallback.
 *
 * Formula: cellSize = (viewportWidth - chrome - N×gap) / (N+1)
 *   chrome = outer padding (16) + panel padding (32) + border (2) = 50px
 *   gap    = 4px for grids ≤8, 2px for grids >8 (saves ~30px on 15×15)
 */

import { memo, useEffect, useState } from 'react'
import type { CellState, Puzzle } from '../hooks/useGameState'

// ─── Cell size computation ─────────────────────────────────────────────────────

const MOBILE_BREAKPOINT = 768
const MOBILE_CHROME     = 26  // px-1 (8) + panel padding left+right (16) + border (2)
const GAP_SMALL         = 4   // gap-1  — grids ≤ 8
const GAP_LARGE         = 2   // gap-px — grids > 8

function gapPx(gridSize: number): number {
  return gridSize > 8 ? GAP_LARGE : GAP_SMALL
}

/**
 * Returns the largest integer cell size that fits (N+1) cells + N gaps
 * within the available mobile viewport width, clamped to [18, 44].
 * Returns null on desktop — CSS handles sizing there.
 */
function computeOptimalCellSize(gridSize: number): number | null {
  if (typeof window === 'undefined') return null
  if (window.innerWidth >= MOBILE_BREAKPOINT) return null
  const gap       = gapPx(gridSize)
  const available = window.innerWidth - MOBILE_CHROME
  const rawSize   = Math.floor((available - gap * gridSize) / (gridSize + 1))
  return Math.max(18, Math.min(44, rawSize))
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GameBoardProps {
  puzzle: Puzzle
  grid: CellState[][]
  rowFilled: number[]
  colFilled: number[]
  hideCountsUntilComplete: boolean
  completedRows: Set<number>
  completedCols: Set<number>
  puzzleComplete: boolean
  onCellClick: (row: number, col: number, currentState: CellState) => void
  onCellRightClick: (row: number, col: number, currentState: CellState) => void
}

// ─── Individual cell (memoized) ───────────────────────────────────────────────

interface GridCellProps {
  row: number
  col: number
  state: CellState
  isRowComplete: boolean
  isColComplete: boolean
  isPuzzleComplete: boolean
  puzzleSize: number
  onCellClick: (row: number, col: number, currentState: CellState) => void
  onCellRightClick: (row: number, col: number, currentState: CellState) => void
}

const GridCell = memo(function GridCell({
  row,
  col,
  state,
  isRowComplete,
  isColComplete,
  isPuzzleComplete,
  puzzleSize,
  onCellClick,
  onCellRightClick,
}: GridCellProps) {
  const centerR = Math.floor(puzzleSize / 2)
  const centerC = Math.floor(puzzleSize / 2)
  const distanceFromCenter = Math.max(
    Math.abs(row - centerR),
    Math.abs(col - centerC)
  )
  const animationDelay = isPuzzleComplete ? distanceFromCenter * 50 : 0

  const className = [
    'cell',
    state === 1 ? 'cell-filled' : state === 2 ? 'cell-marked' : 'cell-empty',
    isRowComplete  ? 'cell-row-complete' : '',
    isColComplete  ? 'cell-col-complete' : '',
    isPuzzleComplete ? 'puzzle-complete'  : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={className}
      style={
        isPuzzleComplete
          ? ({
              animationDelay: `${animationDelay}ms`,
              '--animation-delay': `${animationDelay}ms`,
            } as React.CSSProperties & { '--animation-delay': string })
          : undefined
      }
      onClick={() => onCellClick(row, col, state)}
      onContextMenu={(e) => {
        e.preventDefault()
        onCellRightClick(row, col, state)
      }}
      aria-label={`cell ${row + 1},${col + 1}`}
    >
      {state === 2 ? '✖' : ''}
    </button>
  )
})

// ─── GameBoard ────────────────────────────────────────────────────────────────

export function GameBoard({
  puzzle,
  grid,
  rowFilled,
  colFilled,
  hideCountsUntilComplete,
  completedRows,
  completedCols,
  puzzleComplete,
  onCellClick,
  onCellRightClick,
}: GameBoardProps) {
  // Compute JS-driven cell size for mobile and recalculate on orientation change.
  const [cellSizeOverride, setCellSizeOverride] = useState<number | null>(
    () => computeOptimalCellSize(puzzle.size)
  )

  useEffect(() => {
    const update = () => setCellSizeOverride(computeOptimalCellSize(puzzle.size))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [puzzle.size])

  // Use tighter gaps for large grids to recover horizontal space.
  const gapClass = puzzle.size > 8 ? 'gap-px' : 'gap-1'

  return (
    <div
      className="grid-container"
      style={{
        '--grid-size': puzzle.size,
        ...(cellSizeOverride != null
          ? { '--cell-size-mobile': `${cellSizeOverride}px` }
          : {}),
      } as React.CSSProperties}
    >
      {/* Column clue headers */}
      <div className={`flex items-center mb-1 justify-start ${gapClass}`}>
        <div className="corner-cell" />
        <div className={`grid grid-cols-[repeat(var(--grid-size),auto)] ${gapClass}`}>
          {puzzle.colCounts.map((n, i) => (
            <div
              key={i}
              className="col-label"
              data-complete={colFilled[i] === n}
            >
              <span
                style={{
                  visibility:
                    !hideCountsUntilComplete || colFilled[i] === n
                      ? 'visible'
                      : 'hidden',
                }}
              >
                {n}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row clue labels + cell grid */}
      <div className={`flex justify-start ${gapClass}`}>
        {/* Row labels */}
        <div className={`flex flex-col ${gapClass} flex-shrink-0`}>
          {puzzle.rowCounts.map((n, i) => (
            <div
              key={i}
              className="row-label"
              data-complete={rowFilled[i] === n}
            >
              <span
                style={{
                  visibility:
                    !hideCountsUntilComplete || rowFilled[i] === n
                      ? 'visible'
                      : 'hidden',
                }}
              >
                {n}
              </span>
            </div>
          ))}
        </div>

        {/* Cell grid */}
        <div className={`grid grid-cols-[repeat(var(--grid-size),auto)] ${gapClass}`}>
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <GridCell
                key={`${r}-${c}`}
                row={r}
                col={c}
                state={cell}
                isRowComplete={completedRows.has(r)}
                isColComplete={completedCols.has(c)}
                isPuzzleComplete={puzzleComplete}
                puzzleSize={puzzle.size}
                onCellClick={onCellClick}
                onCellRightClick={onCellRightClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
