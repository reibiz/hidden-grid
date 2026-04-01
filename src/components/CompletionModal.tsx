/**
 * CompletionModal
 *
 * Shown when the player solves a puzzle. In picture mode the top of the
 * modal reveals what the player just painted before showing the stats.
 *
 * Backdrop click is intentionally disabled — the player must choose an
 * explicit action.
 */

import { useEffect } from 'react'
import type React from 'react'
import type { Medal } from '../lib/progression'
import type { PuzzlePicture } from '../lib/puzzlePictures'
import { CATEGORY_EMOJI } from '../lib/puzzlePictures'
import { UI_STRINGS } from '../lib/uiStrings'
import { useSound } from '../hooks/useSound'

interface CompletionModalProps {
  open:           boolean
  onPlayAgain:    () => void
  onReturnToMenu: () => void
  seconds:        number
  medal:          Medal
  gainedXP:       number
  levelUp?:       { from: number; to: number } | null
  newlyUnlocked?: string[]
  soundEnabled?:  boolean
  // Picture mode — when set the reveal header is shown
  picture?:       PuzzlePicture
}

export function CompletionModal({
  open,
  onPlayAgain,
  onReturnToMenu,
  seconds,
  medal,
  gainedXP,
  levelUp,
  newlyUnlocked,
  soundEnabled,
  picture,
}: CompletionModalProps) {
  const sound = useSound(soundEnabled !== false)
  const isPictureMode = picture !== undefined

  useEffect(() => {
    if (open) sound.playSound('modal-open')
  }, [open, sound])

  if (!open) return null

  const mm = Math.floor(seconds / 60)
  const ss = String(seconds % 60).padStart(2, '0')

  const medalColor =
    medal === 'gold'   ? 'text-warning' :
    medal === 'silver' ? 'text-text-secondary' :
    medal === 'bronze' ? 'text-warning' :
    'text-text-muted'

  const handlePlayAgain = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    sound.playSound('button-click')
    onPlayAgain()
  }

  const handleReturnToMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    sound.playSound('button-click')
    onReturnToMenu()
  }

  // ── Picture mode: slide up from the bottom so the completed grid stays visible.
  // ── Practice mode: standard centred overlay.
  const backdropClass = isPictureMode
    ? 'fixed inset-0 bg-black/30 flex items-end justify-center px-4 pb-8 z-50'
    : 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-lg z-50'

  return (
    <div
      className={backdropClass}
      style={{ animation: 'fadeIn 200ms ease' }}
    >
      <div
        className={`w-full panel border border-accent ${isPictureMode ? 'max-w-sm' : 'max-w-md'}`}
        style={{ animation: isPictureMode ? 'slideUp 300ms var(--transition-modal)' : 'scaleIn 300ms var(--transition-modal)' }}
      >

        {/* ── Picture reveal (picture mode only) ── */}
        {isPictureMode && (
          <div className="flex items-center justify-between mb-md pb-md"
            style={{ borderBottom: '1px solid var(--color-grid-line)' }}
          >
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest">
                You painted
              </p>
              <p className="text-lg font-semibold text-text-primary mt-0.5">
                {CATEGORY_EMOJI[picture.category]} {picture.title}
              </p>
            </div>
            <div className="text-right text-xs text-text-muted leading-relaxed">
              <div className="font-mono">{mm}:{ss}</div>
              <div className={`${medalColor} font-semibold capitalize`}>{medal}</div>
              <div className="text-primary font-semibold">+{gainedXP} XP</div>
            </div>
          </div>
        )}

        {/* ── Standard completion header (practice mode only) ── */}
        {!isPictureMode && (
          <>
            <h3 className="text-display font-display mb-md">
              {UI_STRINGS.COMPLETION_TITLE}
            </h3>

            {/* ── Stats ── */}
            <div className="text-sm text-text-secondary">
              {UI_STRINGS.LABEL_TIME}{' '}
              <span className="font-mono">{mm}:{ss}</span>
            </div>

            <div className={`mt-sm text-sm ${medalColor} font-semibold`}>
              {UI_STRINGS.LABEL_MEDAL}{' '}
              <span className="capitalize">{medal}</span>
            </div>

            <div className="mt-md text-primary font-semibold">
              +{gainedXP} XP
            </div>
          </>
        )}

        {levelUp && (
          <div className="mt-md text-warning font-semibold text-sm">
            {UI_STRINGS.COMPLETION_LEVEL_UP} {levelUp.from} → {levelUp.to}
          </div>
        )}

        {newlyUnlocked && newlyUnlocked.length > 0 && (
          <div className="mt-md text-sm">
            <div className="text-text-secondary mb-sm">
              {UI_STRINGS.COMPLETION_NEW_BADGES}
            </div>
            <ul className="list-disc list-inside space-y-xs">
              {newlyUnlocked.map((id) => (
                <li key={id} className="text-text-primary">{id}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Actions ── */}
        <div className={`flex gap-sm justify-end ${isPictureMode ? 'mt-md' : 'mt-xl'}`}>
          <button onClick={handleReturnToMenu} className="btn btn-secondary">
            {isPictureMode ? 'All Puzzles' : 'Return to Menu'}
          </button>
          <button onClick={handlePlayAgain} className="btn btn-primary">
            {isPictureMode ? 'Try Again' : 'Play Again'}
          </button>
        </div>
      </div>
    </div>
  )
}
