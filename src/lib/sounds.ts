/**
 * Sound Configuration
 * 
 * Define all sound effects used in the game.
 * Sound files should be placed in the public/sounds/ directory.
 */

export type SoundEffect =
  | 'cell-fill'      // When a cell is filled
  | 'cell-mark'      // When a cell is marked (X)
  | 'cell-clear'     // When a cell is cleared
  | 'row-complete'   // When a row is completed
  | 'col-complete'   // When a column is completed
  | 'puzzle-solved'  // When the puzzle is solved
  | 'button-click'   // Button click
  | 'modal-open'     // Modal opens
  | 'modal-close'    // Modal closes
  | 'error'          // Error/mistake sound
  | 'level-up'       // Level up sound
  | 'streak-milestone' // Streak milestone reached
  | 'intro-song'     // Background music for main menu

export interface SoundConfig {
  volume: number // 0.0 to 1.0
  enabled: boolean
}

/**
 * Sound file paths
 * Place sound files in public/sounds/ directory
 * For now, we'll use programmatically generated sounds as fallback
 */
export const SOUND_PATHS: Record<SoundEffect, string> = {
  'cell-fill': '/sounds/cell-fill.mp3',
  'cell-mark': '/sounds/cell-mark.mp3',
  'cell-clear': '/sounds/cell-clear.mp3',
  'row-complete': '/sounds/row-complete.mp3',
  'col-complete': '/sounds/col-complete.mp3',
  'puzzle-solved': '/sounds/puzzle-solved.mp3',
  'button-click': '/sounds/button-click.mp3',
  'modal-open': '/sounds/modal-open.mp3',
  'modal-close': '/sounds/modal-close.mp3',
  'error': '/sounds/error.mp3',
  'level-up': '/sounds/level-up.mp3',
  'streak-milestone': '/sounds/streak-milestone.mp3',
  'intro-song': '/sounds/intro-song.mp3',
}

/**
 * Default volume levels for each sound type
 */
export const SOUND_VOLUMES: Record<SoundEffect, number> = {
  'cell-fill': 0.3,
  'cell-mark': 0.25,
  'cell-clear': 0.2,
  'row-complete': 0.4,
  'col-complete': 0.4,
  'puzzle-solved': 0.6,
  'button-click': 0.2,
  'modal-open': 0.3,
  'modal-close': 0.3,
  'error': 0.4,
  'level-up': 0.5,
  'streak-milestone': 0.6,
  'intro-song': 0.4, // Background music volume (lower than sound effects)
}

