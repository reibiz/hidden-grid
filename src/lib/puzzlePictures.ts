/**
 * puzzlePictures
 *
 * Curated pixel-art puzzle library for Picture Puzzle mode.
 *
 * Each PuzzlePicture stores only the boolean[][] grid — row and column
 * counts are derived at runtime via countsFromGrid(), so the grid IS the
 * single source of truth. Adding a new puzzle is as simple as adding an
 * entry to PICTURE_LIBRARY.
 *
 * Visual convention used below:
 *   T = true  (filled cell  ■)
 *   F = false (empty cell   □)
 */

import type { DifficultyKey } from './progression'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PictureCategory =
  | 'Symbols'
  | 'Animals'
  | 'Nature'
  | 'Objects'
  | 'Space'
  | 'Food'

export interface PuzzlePicture {
  id:       string
  title:    string
  category: PictureCategory
  size:     4 | 6 | 8 | 10 | 15
  grid:     boolean[][]
}

// ─── Category display metadata ────────────────────────────────────────────────

export const CATEGORY_EMOJI: Record<PictureCategory, string> = {
  Symbols: '🔷',
  Animals: '🐾',
  Nature:  '🌿',
  Objects: '📦',
  Space:   '🚀',
  Food:    '🍎',
}

export const CATEGORY_ORDER: PictureCategory[] = [
  'Symbols', 'Animals', 'Nature', 'Objects', 'Space', 'Food',
]

// ─── Size → difficulty mapping ────────────────────────────────────────────────

export const SIZE_TO_DIFFICULTY: Record<4 | 6 | 8 | 10 | 15, DifficultyKey> = {
  4:  'flash',
  6:  'easy',
  8:  'medium',
  10: 'hard',
  15: 'expert',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive row and column counts from a boolean grid. */
export function countsFromGrid(grid: boolean[][]): {
  rowCounts: number[]
  colCounts: number[]
} {
  const size = grid.length
  const rowCounts = grid.map(row => row.filter(Boolean).length)
  const colCounts = Array.from({ length: size }, (_, c) =>
    grid.reduce((a, row) => a + (row[c] ? 1 : 0), 0)
  )
  return { rowCounts, colCounts }
}

/**
 * Build a Puzzle-shaped object from a PuzzlePicture.
 * The return type is intentionally untyped here to avoid importing Puzzle
 * from the hooks layer — the caller assigns it to a Puzzle variable and
 * TypeScript verifies structural compatibility at that point.
 */
export function puzzleFromPicture(picture: PuzzlePicture) {
  const { rowCounts, colCounts } = countsFromGrid(picture.grid)
  return {
    id:        `picture-${picture.id}`,
    size:      picture.size,
    solution:  picture.grid,
    rowCounts,
    colCounts,
  }
}

// ─── Grid shorthand ───────────────────────────────────────────────────────────

const T = true
const F = false

// ─── Picture Library ──────────────────────────────────────────────────────────

export const PICTURE_LIBRARY: PuzzlePicture[] = [

  // ╔══════════════════════════════╗
  // ║  4 × 4  —  Flash             ║
  // ╚══════════════════════════════╝

  {
    id: 'staircase', title: 'Staircase', category: 'Symbols', size: 4,
    // rowCounts: [1,2,3,4]   colCounts: [4,3,2,1]
    grid: [
      [T,F,F,F],
      [T,T,F,F],
      [T,T,T,F],
      [T,T,T,T],
    ],
  },

  {
    id: 'diamond', title: 'Diamond', category: 'Symbols', size: 4,
    // rowCounts: [2,4,4,2]   colCounts: [2,4,4,2]
    grid: [
      [F,T,T,F],
      [T,T,T,T],
      [T,T,T,T],
      [F,T,T,F],
    ],
  },

  {
    id: 'frame', title: 'Frame', category: 'Symbols', size: 4,
    // rowCounts: [4,2,2,4]   colCounts: [4,2,2,4]
    grid: [
      [T,T,T,T],
      [T,F,F,T],
      [T,F,F,T],
      [T,T,T,T],
    ],
  },

  {
    id: 'x-mark', title: 'X Mark', category: 'Symbols', size: 4,
    // rowCounts: [2,2,2,2]   colCounts: [2,2,2,2]
    grid: [
      [T,F,F,T],
      [F,T,T,F],
      [F,T,T,F],
      [T,F,F,T],
    ],
  },

  {
    id: 't-shape', title: 'T Shape', category: 'Symbols', size: 4,
    // rowCounts: [4,2,2,2]   colCounts: [1,4,4,1]
    grid: [
      [T,T,T,T],
      [F,T,T,F],
      [F,T,T,F],
      [F,T,T,F],
    ],
  },

  {
    id: 'l-shape', title: 'L Shape', category: 'Symbols', size: 4,
    // rowCounts: [1,1,1,4]   colCounts: [4,1,1,1]
    grid: [
      [T,F,F,F],
      [T,F,F,F],
      [T,F,F,F],
      [T,T,T,T],
    ],
  },

  {
    id: 'hourglass-4', title: 'Hourglass', category: 'Symbols', size: 4,
    // rowCounts: [4,2,2,4]   colCounts: [2,4,4,2]
    grid: [
      [T,T,T,T],
      [F,T,T,F],
      [F,T,T,F],
      [T,T,T,T],
    ],
  },

  {
    id: 'checkerboard', title: 'Checkerboard', category: 'Symbols', size: 4,
    // rowCounts: [2,2,2,2]   colCounts: [2,2,2,2]
    grid: [
      [T,F,T,F],
      [F,T,F,T],
      [T,F,T,F],
      [F,T,F,T],
    ],
  },

  {
    id: 'zigzag', title: 'Zigzag', category: 'Symbols', size: 4,
    // rowCounts: [2,2,2,2]   colCounts: [1,3,3,1]
    grid: [
      [T,T,F,F],
      [F,T,T,F],
      [F,T,T,F],
      [F,F,T,T],
    ],
  },

  {
    id: 'flag-4', title: 'Flag', category: 'Objects', size: 4,
    // rowCounts: [4,1,3,1]   colCounts: [4,2,2,1]
    grid: [
      [T,T,T,T],
      [T,F,F,F],
      [T,T,T,F],
      [T,F,F,F],
    ],
  },

  // ╔══════════════════════════════╗
  // ║  6 × 6  —  Easy              ║
  // ╚══════════════════════════════╝

  {
    id: 'heart', title: 'Heart', category: 'Symbols', size: 6,
    // rowCounts: [2,6,6,4,2,1]   colCounts: [2,4,4,5,4,2]
    grid: [
      [F,T,F,F,T,F],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [F,T,T,T,T,F],
      [F,F,T,T,F,F],
      [F,F,F,T,F,F],
    ],
  },

  {
    id: 'cross', title: 'Cross', category: 'Symbols', size: 6,
    // rowCounts: [2,2,6,6,2,2]   colCounts: [2,2,6,6,2,2]
    grid: [
      [F,F,T,T,F,F],
      [F,F,T,T,F,F],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [F,F,T,T,F,F],
      [F,F,T,T,F,F],
    ],
  },

  {
    id: 'arrow', title: 'Arrow', category: 'Symbols', size: 6,
    // rowCounts: [1,2,6,6,2,1]   colCounts: [2,2,4,6,2,2]
    grid: [
      [F,F,F,T,F,F],
      [F,F,T,T,F,F],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [F,F,T,T,F,F],
      [F,F,F,T,F,F],
    ],
  },

  {
    id: 'fish', title: 'Fish', category: 'Animals', size: 6,
    // rowCounts: [2,4,5,5,4,2]   colCounts: [2,4,2,4,6,6]
    // Tail fork on left (col 2 notch), body right, head tapers right
    grid: [
      [F,F,F,F,T,T],
      [F,T,F,T,T,T],
      [T,T,T,T,T,F],
      [T,T,T,T,T,F],
      [F,T,F,T,T,T],
      [F,F,F,F,T,T],
    ],
  },

  {
    id: 'sun-6', title: 'Sun', category: 'Nature', size: 6,
    // rowCounts: [2,4,6,6,4,2]   colCounts: [2,4,6,6,4,2]
    grid: [
      [F,F,T,T,F,F],
      [F,T,T,T,T,F],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [F,T,T,T,T,F],
      [F,F,T,T,F,F],
    ],
  },

  {
    id: 'crab', title: 'Crab', category: 'Animals', size: 6,
    // rowCounts: [2,4,4,4,4,2]   colCounts: [4,3,2,2,3,4]
    grid: [
      [T,F,F,F,F,T],
      [T,T,F,F,T,T],
      [F,T,T,T,T,F],
      [F,T,T,T,T,F],
      [T,T,F,F,T,T],
      [T,F,F,F,F,T],
    ],
  },

  {
    id: 'butterfly-6', title: 'Butterfly', category: 'Animals', size: 6,
    // rowCounts: [4,6,6,6,4,2]   colCounts: [5,5,3,3,5,5]
    grid: [
      [T,T,F,F,T,T],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [T,T,F,F,T,T],
      [F,F,T,T,F,F],
    ],
  },

  {
    id: 'flower-6', title: 'Flower', category: 'Nature', size: 6,
    // rowCounts: [4,4,6,6,4,4]   colCounts: [4,4,6,6,4,4]
    grid: [
      [F,T,T,T,T,F],
      [T,F,T,T,F,T],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [T,F,T,T,F,T],
      [F,T,T,T,T,F],
    ],
  },

  {
    id: 'lock-6', title: 'Lock', category: 'Objects', size: 6,
    // rowCounts: [4,2,2,6,6,6]   colCounts: [5,4,4,4,4,5]
    grid: [
      [F,T,T,T,T,F],
      [T,F,F,F,F,T],
      [T,F,F,F,F,T],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
      [T,T,T,T,T,T],
    ],
  },

  {
    id: 'sailboat', title: 'Sailboat', category: 'Objects', size: 6,
    // rowCounts: [1,2,3,6,4,2]   colCounts: [1,3,5,6,5,3]  (mast + sail + hull)
    grid: [
      [F,F,F,T,F,F],
      [F,F,T,T,F,F],
      [F,T,T,T,F,F],
      [T,T,T,T,T,T],
      [F,T,T,T,T,F],
      [F,F,T,T,F,F],
    ],
  },

  // ╔══════════════════════════════╗
  // ║  8 × 8  —  Medium            ║
  // ╚══════════════════════════════╝

  {
    id: 'house', title: 'House', category: 'Objects', size: 8,
    // Peaked roof rows 0-3, walls + door rows 4-7
    grid: [
      [F,F,F,T,T,F,F,F],
      [F,F,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T],
      [T,T,F,F,F,F,T,T],
      [T,T,F,F,F,F,T,T],
      [T,T,T,T,T,T,T,T],
    ],
  },

  {
    id: 'tree', title: 'Tree', category: 'Nature', size: 8,
    // Triangle canopy rows 0-3, trunk rows 4-7
    grid: [
      [F,F,F,T,T,F,F,F],
      [F,F,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T],
      [F,F,F,T,T,F,F,F],
      [F,F,F,T,T,F,F,F],
      [F,F,F,T,T,F,F,F],
      [F,F,T,T,T,T,F,F],
    ],
  },

  {
    id: 'mushroom', title: 'Mushroom', category: 'Nature', size: 8,
    // Round cap rows 0-3, stem rows 4-7
    grid: [
      [F,F,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T],
      [F,F,F,T,T,F,F,F],
      [F,F,F,T,T,F,F,F],
      [F,F,T,T,T,T,F,F],
      [F,F,T,T,T,T,F,F],
    ],
  },

  {
    id: 'rocket', title: 'Rocket', category: 'Space', size: 8,
    // Nose cone rows 0-1, body rows 2-4, fins rows 5-7
    grid: [
      [F,F,F,T,T,F,F,F],
      [F,F,T,T,T,T,F,F],
      [F,F,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,F],
      [F,T,T,T,T,T,T,F],
      [T,T,F,T,T,F,T,T],
      [T,F,F,T,T,F,F,T],
      [T,F,F,F,F,F,F,T],
    ],
  },

  {
    id: 'happy-face', title: 'Happy Face', category: 'Symbols', size: 8,
    // rowCounts: 4,6,6,6,8,6,2,4
    // colCounts: 4,4,6,6,6,6,4,4
    grid: [
      [F,F,T,T,T,T,F,F],  // row 1 — top of head (4)
      [F,T,T,T,T,T,T,F],  // row 2 — upper face (6)
      [T,F,T,T,T,T,F,T],  // row 3 — eyes (6)
      [T,F,T,T,T,T,F,T],  // row 4 — eyes (6)
      [T,T,T,T,T,T,T,T],  // row 5 — full width (8)
      [T,F,T,T,T,T,F,T],  // row 6 — mouth (6)
      [F,T,F,F,F,F,T,F],  // row 7 — mouth corners (2)
      [F,F,T,T,T,T,F,F],  // row 8 — chin (4)
    ],
  },

  {
    id: 'smiley', title: 'Smiley', category: 'Symbols', size: 8,
    // Round face, dot eyes row 2, curved mouth row 4
    grid: [
      [F,F,T,T,T,T,F,F],
      [F,T,T,F,F,T,T,F],
      [T,T,F,T,T,F,T,T],
      [T,F,F,F,F,F,F,T],
      [T,F,T,T,T,T,F,T],
      [T,F,F,F,F,F,F,T],
      [F,T,T,T,T,T,T,F],
      [F,F,T,T,T,T,F,F],
    ],
  },

  {
    id: 'star-8', title: 'Star', category: 'Symbols', size: 8,
    // 8-pointed star: cross + diagonals
    grid: [
      [F,F,F,T,T,F,F,F],
      [F,T,F,T,T,F,T,F],
      [F,F,T,T,T,T,F,F],
      [T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T],
      [F,F,T,T,T,T,F,F],
      [F,T,F,T,T,F,T,F],
      [F,F,F,T,T,F,F,F],
    ],
  },

  {
    id: 'cat-face', title: 'Cat Face', category: 'Animals', size: 8,
    // Pointy ears at corners, eyes, nose, chin
    grid: [
      [T,F,T,F,F,T,F,T],
      [T,T,T,T,T,T,T,T],
      [T,F,T,T,T,T,F,T],
      [T,T,T,T,T,T,T,T],
      [F,T,T,T,T,T,T,F],
      [F,T,F,T,T,F,T,F],
      [F,F,T,T,T,T,F,F],
      [F,F,F,T,T,F,F,F],
    ],
  },

  {
    id: 'mountain', title: 'Mountain', category: 'Nature', size: 8,
    // Triangle peak descending to full base
    grid: [
      [F,F,F,F,T,F,F,F],
      [F,F,F,T,T,T,F,F],
      [F,F,T,T,T,T,T,F],
      [F,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T],
    ],
  },

  {
    id: 'anchor', title: 'Anchor', category: 'Objects', size: 8,
    // Ring top, shank, crossbar, flukes
    grid: [
      [F,F,T,T,T,T,F,F],
      [F,T,F,F,F,F,T,F],
      [F,T,F,F,F,F,T,F],
      [F,F,T,T,T,T,F,F],
      [F,F,F,T,T,F,F,F],
      [T,T,T,T,T,T,T,T],
      [F,F,F,T,T,F,F,F],
      [F,F,T,T,T,T,F,F],
    ],
  },

  // ╔══════════════════════════════╗
  // ║  10 × 10  —  Hard            ║
  // ╚══════════════════════════════╝

  {
    id: 'big-star-10', title: 'Star', category: 'Symbols', size: 10,
    // 4-pointed star: diamond center + cardinal arms
    grid: [
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,T,T,T,T,F,F,F],
      [F,F,T,T,T,T,T,T,F,F],
      [F,T,T,T,F,F,T,T,T,F],
      [T,T,T,F,F,F,F,T,T,T],
      [T,T,T,F,F,F,F,T,T,T],
      [F,T,T,T,F,F,T,T,T,F],
      [F,F,T,T,T,T,T,T,F,F],
      [F,F,F,T,T,T,T,F,F,F],
      [F,F,F,F,T,T,F,F,F,F],
    ],
  },

  {
    id: 'whale', title: 'Whale', category: 'Animals', size: 10,
    // Whale swimming right, tail fin at left
    grid: [
      [F,F,F,F,F,F,F,T,F,F],
      [F,T,T,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,F],
      [F,T,T,T,T,T,T,F,F,F],
      [F,F,T,T,T,T,F,F,F,F],
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,F,T,F,F,F,F,F],
      [F,F,F,T,T,F,F,F,F,F],
    ],
  },

  {
    id: 'castle-10', title: 'Castle', category: 'Objects', size: 10,
    // Battlements row 0, gate opening rows 2-4, solid walls
    grid: [
      [T,F,T,F,T,T,F,T,F,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,F,F,F,F,T,T,T],
      [T,T,T,F,F,F,F,T,T,T],
      [T,T,T,F,F,F,F,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
    ],
  },

  {
    id: 'cactus-10', title: 'Cactus', category: 'Nature', size: 10,
    // Central trunk + side arms
    grid: [
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,F,T,T,F,F,F,F],
      [F,T,T,F,T,T,F,T,T,F],
      [F,T,T,T,T,T,T,T,T,F],
      [F,T,T,T,T,T,T,T,T,F],
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,F,T,T,F,F,F,F],
      [F,T,T,T,T,T,T,T,F,F],
      [F,F,F,T,T,T,T,F,F,F],
    ],
  },

  {
    id: 'crescent-moon', title: 'Crescent Moon', category: 'Space', size: 10,
    // Crescent: full disc minus inner offset circle
    grid: [
      [F,F,F,T,T,T,T,F,F,F],
      [F,F,T,T,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,F,F,F],
      [T,T,T,T,T,T,F,F,F,F],
      [T,T,T,T,T,F,F,F,F,F],
      [T,T,T,T,T,F,F,F,F,F],
      [T,T,T,T,T,T,F,F,F,F],
      [F,T,T,T,T,T,T,F,F,F],
      [F,F,T,T,T,T,T,T,F,F],
      [F,F,F,T,T,T,T,F,F,F],
    ],
  },

  {
    id: 'ufo-10', title: 'UFO', category: 'Space', size: 10,
    // Dome + wide saucer + landing legs
    grid: [
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,T,T,T,T,F,F,F],
      [F,T,T,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [F,T,T,F,F,F,F,T,T,F],
      [F,T,F,F,F,F,F,F,T,F],
      [F,T,T,F,F,F,F,T,T,F],
      [F,F,T,F,F,F,F,T,F,F],
      [F,T,T,T,F,F,T,T,T,F],
    ],
  },

  {
    id: 'pizza-slice', title: 'Pizza Slice', category: 'Food', size: 10,
    // Triangle slice, wide crust at bottom
    grid: [
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,T,T,T,T,F,F,F],
      [F,F,T,T,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,F,T,T,F,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,F,F,F,F,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
    ],
  },

  {
    id: 'crown-10', title: 'Crown', category: 'Objects', size: 10,
    // 5 points at top, solid band, open middle, solid base
    grid: [
      [T,F,T,F,T,T,F,T,F,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,F,F,F,F,F,F,T,T],
      [T,T,F,F,F,F,F,F,T,T],
      [T,T,F,F,F,F,F,F,T,T],
      [T,T,F,F,F,F,F,F,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T],
    ],
  },

  {
    id: 'hourglass-10', title: 'Hourglass', category: 'Symbols', size: 10,
    // Wide top and bottom, narrow middle
    grid: [
      [T,T,T,T,T,T,T,T,T,T],
      [F,T,T,T,T,T,T,T,T,F],
      [F,F,T,T,T,T,T,T,F,F],
      [F,F,F,T,T,T,T,F,F,F],
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,F,T,T,F,F,F,F],
      [F,F,F,T,T,T,T,F,F,F],
      [F,F,T,T,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T,T,T],
    ],
  },

  {
    id: 'lightning-10', title: 'Lightning Bolt', category: 'Symbols', size: 10,
    // Diagonal bolt from top-right to bottom-left
    grid: [
      [F,F,F,T,T,T,T,T,F,F],
      [F,F,T,T,T,T,T,F,F,F],
      [F,T,T,T,T,T,F,F,F,F],
      [T,T,T,T,T,F,F,F,F,F],
      [T,T,T,T,T,T,T,T,F,F],
      [F,F,T,T,T,T,T,T,T,T],
      [F,F,F,F,F,T,T,T,T,T],
      [F,F,F,F,T,T,T,T,T,F],
      [F,F,F,T,T,T,T,T,F,F],
      [F,F,T,T,T,T,T,F,F,F],
    ],
  },

  // ╔══════════════════════════════╗
  // ║  15 × 15  —  Expert          ║
  // ╚══════════════════════════════╝

  {
    id: 'big-heart', title: 'Big Heart', category: 'Symbols', size: 15,
    // rowCounts: 8,12,14,15,15,15,15,15,13,11,9,7,5,3,1
    // colCounts: 6,8,10,11,12,13,13,12,13,13,12,11,10,8,6
    grid: [
      [F,F,T,T,T,T,F,F,F,T,T,T,T,F,F],  // row  1 — twin humps (8)
      [F,T,T,T,T,T,T,F,T,T,T,T,T,T,F],  // row  2 — humps widen, notch at col 8 (12)
      [T,T,T,T,T,T,T,F,T,T,T,T,T,T,T],  // row  3 — notch closing (14)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  4 — full (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  5 — full (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  6 — full (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  7 — full (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  8 — full (15)
      [F,T,T,T,T,T,T,T,T,T,T,T,T,T,F],  // row  9 — taper starts (13)
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],  // row 10 — (11)
      [F,F,F,T,T,T,T,T,T,T,T,T,F,F,F],  // row 11 — (9)
      [F,F,F,F,T,T,T,T,T,T,T,F,F,F,F],  // row 12 — (7)
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],  // row 13 — (5)
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row 14 — (3)
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],  // row 15 — point (1)
    ],
  },

  {
    id: 'skull', title: 'Skull', category: 'Objects', size: 15,
    // rowCounts: 5,4,2,2,2,8,10,10,6,3,5,3,2,4,7
    // colCounts: 4,3,4,7,4,4,4,5,4,4,4,7,4,3,4
    grid: [
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],  // row  1 — crown top (5)
      [F,F,F,T,T,F,F,F,F,F,T,T,F,F,F],  // row  2 — crown bumps (4)
      [F,F,T,F,F,F,F,F,F,F,F,F,T,F,F],  // row  3 — skull curve (2)
      [F,T,F,F,F,F,F,F,F,F,F,F,F,T,F],  // row  4 — skull curve (2)
      [F,T,F,F,F,F,F,F,F,F,F,F,F,T,F],  // row  5 — skull curve (2)
      [T,F,F,T,T,T,F,F,F,T,T,T,F,F,T],  // row  6 — face top (8)
      [T,F,T,T,T,T,F,F,F,T,T,T,T,F,T],  // row  7 — eye sockets (10)
      [T,F,T,T,T,T,F,F,F,T,T,T,T,F,T],  // row  8 — eye sockets (10)
      [T,F,F,T,T,F,F,F,F,F,T,T,F,F,T],  // row  9 — cheekbones (6)
      [F,T,F,F,F,F,F,T,F,F,F,F,F,T,F],  // row 10 — chin curve (3)
      [F,F,T,F,F,F,T,T,T,F,F,F,T,F,F],  // row 11 — nose (5)
      [F,F,F,T,F,F,F,T,F,F,F,T,F,F,F],  // row 12 — nose tip (3)
      [F,F,F,T,F,F,F,F,F,F,F,T,F,F,F],  // row 13 — jaw (2)
      [F,F,F,T,F,T,F,F,F,T,F,T,F,F,F],  // row 14 — teeth gaps (4)
      [F,F,F,F,T,T,T,T,T,T,T,F,F,F,F],  // row 15 — teeth (7)
    ],
  },

  {
    id: 'dinosaur', title: 'Dinosaur', category: 'Animals', size: 15,
    // T-Rex facing right
    // rowCounts: 7,8,9,9,5,10,8,11,11,10,9,7,4,2,3
    // colCounts: 5,5,4,8,8,7,12,15,11,11,7,7,5,5,3
    grid: [
      [F,F,F,F,F,F,F,T,T,T,T,T,T,T,F],  // row  1 — head top (7)
      [F,F,F,F,F,F,T,T,F,T,T,T,T,T,T],  // row  2 — eye gap col 9 (8)
      [F,F,F,F,F,F,T,T,T,T,T,T,T,T,T],  // row  3 — full head (9)
      [F,F,F,F,F,F,T,T,T,T,T,T,T,T,T],  // row  4 — full head (9)
      [F,F,F,F,F,F,T,T,T,T,T,F,F,F,F],  // row  5 — neck (5)
      [T,F,F,F,F,T,T,T,T,T,T,T,T,T,F],  // row  6 — body top / tail tip (10)
      [T,T,F,F,T,T,T,T,T,T,F,F,F,F,F],  // row  7 — body (8)
      [T,T,F,T,T,T,T,T,T,T,T,T,F,F,F],  // row  8 — body wide (11)
      [T,T,T,T,T,T,T,T,T,T,F,T,F,F,F],  // row  9 — body wide (11)
      [T,T,T,T,T,T,T,T,T,T,F,F,F,F,F],  // row 10 — body (10)
      [F,T,T,T,T,T,T,T,T,T,F,F,F,F,F],  // row 11 — lower body (9)
      [F,F,T,T,T,T,T,T,T,F,F,F,F,F,F],  // row 12 — belly (7)
      [F,F,F,T,T,F,T,T,F,F,F,F,F,F,F],  // row 13 — upper legs (4)
      [F,F,F,T,F,F,F,T,F,F,F,F,F,F,F],  // row 14 — ankles (2)
      [F,F,F,T,T,F,F,T,F,F,F,F,F,F,F],  // row 15 — feet (3)
    ],
  },

  {
    id: 'space-shuttle', title: 'Space Shuttle', category: 'Space', size: 15,
    grid: [
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],
      [F,F,F,F,F,T,T,T,F,T,T,F,F,F,F],
      [F,F,F,F,T,T,T,F,F,T,T,F,F,F,F],
      [F,F,F,T,T,T,T,F,T,T,T,T,F,F,F],
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],
      [F,T,T,T,T,T,T,T,T,T,T,T,T,T,F],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,F,T,T,T,F,T,T,T,T,T],
      [F,F,F,F,T,T,T,T,T,T,T,F,F,F,F],
      [F,F,F,F,F,F,T,F,T,F,F,F,F,F,F],
    ],
  },

  {
    id: 'snowflake', title: 'Snowflake', category: 'Nature', size: 15,
    // 4-armed snowflake: horizontal + vertical + diagonal arms
    grid: [
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],  // row  1 — top tip (1)
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row  2 — (3)
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],  // row  3 — (1)
      [F,F,F,T,F,F,F,T,F,F,F,T,F,F,F],  // row  4 — diagonal (3)
      [F,F,F,F,T,F,F,T,F,F,T,F,F,F,F],  // row  5 — diagonal (3)
      [F,T,F,F,F,T,T,T,T,T,F,F,F,T,F],  // row  6 — arm burst (7)
      [F,F,F,F,F,T,F,T,F,T,F,F,F,F,F],  // row  7 — (3)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  8 — horizontal arm (15)
      [F,F,F,F,F,T,F,T,F,T,F,F,F,F,F],  // row  9 — (3)
      [F,T,F,F,F,T,T,T,T,T,F,F,F,T,F],  // row 10 — arm burst (7)
      [F,F,F,F,T,F,F,T,F,F,T,F,F,F,F],  // row 11 — diagonal (3)
      [F,F,F,T,F,F,F,T,F,F,F,T,F,F,F],  // row 12 — diagonal (3)
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],  // row 13 — (1)
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row 14 — (3)
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],  // row 15 — bottom tip (1)
    ],
  },

  {
    id: 'wolf-face', title: 'Wolf', category: 'Animals', size: 15,
    // Symmetric wolf face front-on: pointed ears, eyes, snout, jaw
    grid: [
      [T,T,F,F,F,F,F,F,F,F,F,F,F,T,T],  // row  1 — ear tips (4)
      [T,T,T,F,F,F,F,F,F,F,F,F,T,T,T],  // row  2 — ears wide (6)
      [T,T,T,T,F,F,F,F,F,F,F,T,T,T,T],  // row  3 — (8)
      [F,T,T,T,T,T,T,T,T,T,T,T,T,T,F],  // row  4 — forehead (13)
      [F,T,T,T,T,T,T,T,T,T,T,T,T,T,F],  // row  5 — (13)
      [F,T,T,F,T,T,T,T,T,T,T,F,T,T,F],  // row  6 — eyes (11)
      [F,T,T,F,T,T,T,T,T,T,T,F,T,T,F],  // row  7 — eyes (11)
      [F,T,T,T,T,T,T,T,T,T,T,T,T,T,F],  // row  8 — cheeks (13)
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],  // row  9 — snout top (11)
      [F,F,T,T,F,T,T,T,T,T,F,T,T,F,F],  // row 10 — nostrils (9)
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],  // row 11 — snout (11)
      [F,F,F,T,T,T,T,T,T,T,T,T,F,F,F],  // row 12 — jaw (9)
      [F,F,F,T,T,F,T,T,T,F,T,T,F,F,F],  // row 13 — teeth (7)
      [F,F,F,F,T,F,F,T,T,F,F,T,F,F,F],  // row 14 — (4)
      [F,F,F,F,T,T,F,F,F,F,T,T,F,F,F],  // row 15 — chin (4)
    ],
  },

  {
    id: 'robot', title: 'Robot', category: 'Objects', size: 15,
    // Boxy head with eyes, antenna, body with buttons, arms
    grid: [
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],  // row  1 — antenna (1)
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row  2 — antenna base (3)
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],  // row  3 — head top (11)
      [F,F,T,T,F,F,T,T,T,F,F,T,T,F,F],  // row  4 — eyes (7)
      [F,F,T,T,F,F,T,T,T,F,F,T,T,F,F],  // row  5 — eyes (7)
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],  // row  6 — head bottom (11)
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],  // row  7 — neck (5)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  8 — shoulders (15)
      [T,T,F,T,T,T,T,T,T,T,T,T,F,T,T],  // row  9 — body + arms (13)
      [T,T,F,T,T,F,T,T,T,F,T,T,F,T,T],  // row 10 — buttons (11)
      [T,T,F,T,T,T,T,T,T,T,T,T,F,T,T],  // row 11 — body + arms (13)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row 12 — hips (15)
      [F,F,F,T,T,F,F,F,F,F,T,T,F,F,F],  // row 13 — upper legs (4)
      [F,F,F,T,T,F,F,F,F,F,T,T,F,F,F],  // row 14 — legs (4)
      [F,F,F,T,T,T,F,F,F,T,T,T,F,F,F],  // row 15 — feet (6)
    ],
  },

  {
    id: 'lighthouse', title: 'Lighthouse', category: 'Objects', size: 15,
    // Tall tapering tower, light room, base, waves
    grid: [
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row  1 — light top (3)
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],  // row  2 — light room (5)
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],  // row  3 — (5)
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row  4 — balcony (3)
      [F,F,F,F,F,T,T,F,T,T,F,F,F,F,F],  // row  5 — window (4)
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],  // row  6 — (5)
      [F,F,F,F,F,T,T,F,T,T,F,F,F,F,F],  // row  7 — window (4)
      [F,F,F,F,F,T,T,T,T,T,F,F,F,F,F],  // row  8 — (5)
      [F,F,F,F,T,T,T,T,T,T,T,F,F,F,F],  // row  9 — wider section (7)
      [F,F,F,T,T,T,T,T,T,T,T,T,F,F,F],  // row 10 — (9)
      [F,F,T,T,T,T,T,T,T,T,T,T,T,F,F],  // row 11 — (11)
      [F,T,T,T,T,T,T,T,T,T,T,T,T,T,F],  // row 12 — base (13)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row 13 — ground (15)
      [T,F,T,T,F,T,T,F,T,T,F,T,T,F,T],  // row 14 — waves (10)
      [F,T,T,F,T,T,F,T,T,F,T,T,F,T,F],  // row 15 — waves (10)
    ],
  },

  {
    id: 'castle-15', title: 'Castle', category: 'Objects', size: 15,
    // Battlements on towers, gate arch, solid keep
    grid: [
      [T,F,T,F,F,F,F,F,F,F,F,F,T,F,T],  // row  1 — tower battlements (6)
      [T,T,T,T,F,F,F,F,F,F,F,T,T,T,T],  // row  2 — tower tops (8)
      [T,T,T,T,F,T,F,T,F,T,F,T,T,T,T],  // row  3 — wall battlements (10)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  4 — full wall (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row  5 — (15)
      [T,T,F,F,T,T,T,T,T,T,T,F,F,T,T],  // row  6 — tower windows (11)
      [T,T,F,F,T,T,T,T,T,T,T,F,F,T,T],  // row  7 — (11)
      [T,T,T,T,T,T,F,F,F,T,T,T,T,T,T],  // row  8 — gate arch (12)
      [T,T,T,T,T,F,F,F,F,F,T,T,T,T,T],  // row  9 — gate open (10)
      [T,T,T,T,T,F,F,F,F,F,T,T,T,T,T],  // row 10 — (10)
      [T,T,T,T,T,F,F,F,F,F,T,T,T,T,T],  // row 11 — (10)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row 12 — (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row 13 — (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row 14 — (15)
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],  // row 15 — base (15)
    ],
  },

  {
    id: 'dragon-head', title: 'Dragon', category: 'Animals', size: 15,
    // Dragon head facing right: horn, eye, snout, jaw, fire breath
    grid: [
      [F,F,F,F,F,F,F,T,F,F,F,F,F,F,F],  // row  1 — horn tip (1)
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row  2 — horn (3)
      [F,F,F,F,F,T,T,T,T,T,T,T,F,F,F],  // row  3 — crest (7)
      [F,F,F,F,T,T,T,T,T,T,T,T,T,F,F],  // row  4 — head top (9)
      [F,F,F,T,T,T,F,T,T,T,T,T,T,T,F],  // row  5 — eye (11)
      [F,F,F,T,T,T,T,T,T,T,T,T,T,T,T],  // row  6 — head full (12)
      [F,F,F,T,T,T,T,T,T,T,T,T,T,T,T],  // row  7 — (12)
      [F,F,T,T,T,T,T,T,T,T,T,T,T,T,F],  // row  8 — snout (13)
      [F,T,T,T,T,T,T,T,T,T,T,T,T,F,F],  // row  9 — jaw (12)
      [T,T,T,T,T,T,T,T,T,T,T,T,F,F,F],  // row 10 — lower jaw (12)
      [T,T,T,T,T,T,T,T,T,F,F,F,F,F,F],  // row 11 — neck (9)
      [F,T,T,T,T,T,T,T,F,F,F,F,F,F,F],  // row 12 — (8)
      [F,F,T,T,T,T,F,F,T,T,F,F,F,F,F],  // row 13 — fire breath (6)
      [F,F,F,T,T,F,F,T,T,T,T,F,F,F,F],  // row 14 — fire (6)
      [F,F,F,F,T,F,T,T,T,T,T,T,F,F,F],  // row 15 — fire spread (7)
    ],
  },

  {
    id: 'pig', title: 'Pig', category: 'Animals', size: 15,
    // rowCounts: 6,9,2,4,6,6,7,5,7,5,7,2,7,5,7
    grid: [
      [F,T,T,T,F,F,F,F,F,F,F,T,T,T,F],  // row  1 — ears (6)
      [T,F,F,F,T,T,T,T,T,T,T,F,F,F,T],  // row  2 — head top (9)
      [T,F,F,F,F,F,F,F,F,F,F,F,F,F,T],  // row  3 — head wide (2)
      [F,T,T,F,F,F,F,F,F,F,F,F,T,T,F],  // row  4 — cheeks (4)
      [F,T,F,T,T,F,F,F,F,F,T,T,F,T,F],  // row  5 — eyes (6)
      [T,F,F,T,T,F,F,F,F,F,T,T,F,F,T],  // row  6 — eyes (6)
      [T,F,F,F,F,T,T,T,T,T,F,F,F,F,T],  // row  7 — snout top (7)
      [T,F,F,F,T,F,F,F,F,F,T,F,F,F,T],  // row  8 — snout (5)
      [T,F,F,F,T,F,T,F,T,F,T,F,F,F,T],  // row  9 — nostrils (7)
      [T,F,F,F,T,F,F,F,F,F,T,F,F,F,T],  // row 10 — snout (5)
      [F,T,F,F,F,T,T,T,T,T,F,F,F,T,F],  // row 11 — snout bottom (7)
      [F,T,F,F,F,F,F,F,F,F,F,F,F,T,F],  // row 12 — chin (2)
      [F,F,T,F,F,T,T,T,T,T,F,F,T,F,F],  // row 13 — body top (7)
      [F,F,T,F,T,F,F,F,F,F,T,F,T,F,F],  // row 14 — body (5)
      [F,F,T,T,T,F,F,F,F,F,T,T,T,F,F],  // row 15 — legs (7)
    ],
  },

  {
    id: 'cactus-15', title: 'Cactus', category: 'Nature', size: 15,
    // rowCounts: 3,2,4,5,6,8,5,10,3,7,3,2,10,2,8
    grid: [
      [F,F,F,F,F,F,T,T,T,F,F,F,F,F,F],  // row  1 — top (3)
      [F,F,F,F,F,T,F,F,F,T,F,F,F,F,F],  // row  2 — upper trunk (2)
      [F,T,F,F,F,T,F,T,F,T,F,F,F,F,F],  // row  3 — left arm start (4)
      [T,F,T,F,F,T,F,T,F,T,F,F,F,F,F],  // row  4 — left arm (5)
      [T,F,T,F,F,T,F,T,F,T,F,F,F,T,F],  // row  5 — right arm tip (6)
      [T,F,T,T,T,T,F,T,F,T,F,F,T,F,T],  // row  6 — left arm join (8)
      [T,F,F,F,F,F,F,T,F,T,F,F,T,F,T],  // row  7 — trunk (5)
      [F,T,T,T,T,T,F,T,F,T,T,T,T,F,T],  // row  8 — left arm base (10)
      [F,F,F,F,F,T,F,T,F,F,F,F,F,F,T],  // row  9 — trunk (3)
      [F,F,F,F,F,T,F,T,F,T,T,T,T,T,F],  // row 10 — right arm (7)
      [F,F,F,F,F,T,F,T,F,T,F,F,F,F,F],  // row 11 — trunk (3)
      [F,F,F,F,F,T,F,F,F,T,F,F,F,F,F],  // row 12 — trunk (2)
      [F,F,F,T,T,T,T,T,T,T,T,T,T,F,F],  // row 13 — base top (10)
      [F,F,F,T,F,F,F,F,F,F,F,F,T,F,F],  // row 14 — base sides (2)
      [F,F,F,F,T,T,T,T,T,T,T,T,F,F,F],  // row 15 — base bottom (8)
    ],
  },

]

// ─── Derived lookup helpers ───────────────────────────────────────────────────

/** All pictures that belong to a given category. */
export function picturesByCategory(category: PictureCategory): PuzzlePicture[] {
  return PICTURE_LIBRARY.filter(p => p.category === category)
}

/** Look up a single picture by id. */
export function pictureById(id: string): PuzzlePicture | undefined {
  return PICTURE_LIBRARY.find(p => p.id === id)
}

/** All categories that have at least one picture in the library. */
export function populatedCategories(): PictureCategory[] {
  const set = new Set(PICTURE_LIBRARY.map(p => p.category))
  return CATEGORY_ORDER.filter(c => set.has(c))
}
