/**
 * GameControls
 *
 * Action bar rendered directly below the game grid.
 * Responsibilities: Undo, Redo, Reveal Mistakes, Reset Board, live timer.
 *
 * Sound calls are deliberately absent — the parent (App.tsx) wires up fully
 * composed callbacks so this component has no audio dependency.
 */

import { UI_STRINGS } from '../lib/uiStrings'

interface GameControlsProps {
  onUndo: () => void
  onRedo: () => void
  onReveal: () => void
  onReset: () => void
  canUndo: boolean
  canRedo: boolean
  seconds: number
  showTimer: boolean
}

export function GameControls({
  onUndo,
  onRedo,
  onReveal,
  onReset,
  canUndo,
  canRedo,
  seconds,
  showTimer,
}: GameControlsProps) {
  const mm = Math.floor(seconds / 60)
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="mt-md flex flex-wrap items-center gap-sm text-sm">

      {/* Undo / Redo — primary game actions, most frequently used */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="btn btn-neutral"
        aria-label="Undo last move"
        title="Undo (Ctrl+Z)"
      >
        {UI_STRINGS.BUTTON_UNDO}
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="btn btn-neutral"
        aria-label="Redo last undone move"
        title="Redo (Ctrl+Shift+Z)"
      >
        {UI_STRINGS.BUTTON_REDO}
      </button>

      {/* Reveal / Reset — destructive actions, visually separated */}
      <div
        className="flex gap-sm"
        style={{ borderLeft: '1px solid var(--color-grid-line)', paddingLeft: 'var(--spacing-sm)' }}
      >
        <button onClick={onReveal} className="btn btn-neutral">
          {UI_STRINGS.BUTTON_REVEAL_MISTAKES}
        </button>

        <button onClick={onReset} className="btn btn-neutral">
          {UI_STRINGS.BUTTON_RESET_BOARD}
        </button>
      </div>

      {showTimer && (
        <span className="ml-auto text-text-secondary">
          {UI_STRINGS.LABEL_TIME}{' '}
          <span className="text-mono font-mono">
            {mm}:{ss}
          </span>
        </span>
      )}
    </div>
  )
}
