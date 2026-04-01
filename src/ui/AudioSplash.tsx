import { useState } from 'react'
import { useSound } from '../hooks/useSound'
import { markMusicPlayedFromSplash } from '../lib/musicState'

export interface AudioSplashProps {
  soundOn: boolean
  onUnlock: () => void
}

/**
 * AudioSplash
 *
 * Full-screen "tap to begin" gate required by browsers to unlock the Web Audio
 * API before any sound can play. Once the user interacts we:
 *   1. Resume the AudioContext
 *   2. Optionally start the intro music
 *   3. Hand off to the main menu via onUnlock
 *
 * Uses onPointerDown instead of onClick + onTouchStart to avoid the
 * synthesised double-fire that mobile browsers emit for touch events.
 * touch-action: manipulation eliminates the 300 ms tap delay without needing
 * a separate touchstart handler.
 */
export default function AudioSplash({ soundOn, onUnlock }: AudioSplashProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const sound = useSound(soundOn)

  const handleUnlock = async () => {
    if (isUnlocking) return
    setIsUnlocking(true)

    try {
      sound.unlockAudio()

      if (soundOn) {
        try {
          await sound.playMusic('intro-song', { loop: false, allowAfterAutoplayBlock: true })
          markMusicPlayedFromSplash()
        } catch {
          // Music is optional — continue regardless
        }
      }

      // Small buffer to ensure the AudioContext is fully resumed
      await new Promise<void>(resolve => setTimeout(resolve, 100))
      onUnlock()
    } catch {
      // Always proceed even if audio fails entirely
      onUnlock()
    }
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center px-4 py-8 cursor-pointer select-none"
      style={{ touchAction: 'manipulation' }}
      onPointerDown={handleUnlock}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleUnlock()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Tap to begin"
    >
      <div className="text-center flex flex-col items-center gap-8">

        {/* Game title */}
        <div>
          <h1 className="text-display font-display tracking-tight text-text-primary">
            Hidden Grid
          </h1>
          <p className="text-sm text-text-secondary mt-2 tracking-widest uppercase">
            Nonogram Puzzle
          </p>
        </div>

        {/* Decorative preview grid */}
        <SplashGrid />

        {/* Call to action */}
        <p
          className="text-base text-text-secondary"
          style={{
            animation: isUnlocking ? 'none' : 'pulse 2s ease-in-out infinite',
            opacity: isUnlocking ? 0.5 : 1,
          }}
        >
          {isUnlocking ? 'Loading…' : 'Tap anywhere to begin'}
        </p>

        {/* Copyright */}
        <p className="text-xs text-text-muted">
          © 2026 RABID NYC
        </p>
      </div>
    </div>
  )
}

/**
 * A static 5×5 decorative grid that hints at what the game looks like.
 * Filled cells form a simple cross / plus pattern.
 */
const SPLASH_PATTERN: boolean[][] = [
  [false, false, true,  false, false],
  [false, false, true,  false, false],
  [true,  true,  true,  true,  true ],
  [false, false, true,  false, false],
  [false, false, true,  false, false],
]

function SplashGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '3px',
        width: '80px',
        opacity: 0.6,
      }}
      aria-hidden="true"
    >
      {SPLASH_PATTERN.flat().map((filled, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '1',
            background: filled ? 'var(--color-cell-filled)' : 'var(--color-cell-empty)',
            border: '1px solid var(--color-grid-line)',
          }}
        />
      ))}
    </div>
  )
}
