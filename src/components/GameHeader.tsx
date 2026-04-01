/**
 * GameHeader
 *
 * Top bar rendered during an active game session.
 *
 * Layout (single row on all breakpoints):
 *   [← Menu]  Hidden Grid  |  streak  |  [⚙]
 *   [──────────── XP bar ─────────────────────]  (second row)
 *
 * The Back button and Settings gear live here so GameSidebar can be
 * hidden on mobile without losing access to either action.
 */

import { XpBar } from './XpBar'
import { UI_STRINGS } from '../lib/uiStrings'

interface GameHeaderProps {
  title: string
  streak: { current: number }
  level: number
  xpInto: number
  xpNext: number
  onReturnToMenu?: () => void
  onOpenSettings: () => void
}

export function GameHeader({
  title,
  streak,
  level,
  xpInto,
  xpNext,
  onReturnToMenu,
  onOpenSettings,
}: GameHeaderProps) {
  return (
    <header className="w-full max-w-5xl mb-md">

      {/* Row 1: nav + title + settings */}
      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-3 min-w-0">
          {onReturnToMenu && (
            <button
              className="btn btn-secondary text-sm shrink-0"
              onClick={onReturnToMenu}
              aria-label="Return to main menu"
            >
              ← Menu
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-display font-display leading-none">
              {UI_STRINGS.GAME_TITLE}
            </h1>
            <p className="text-xs text-text-secondary mt-1 truncate">
              {title}
              {streak.current > 0 && (
                <span className="ml-2 streak-active">
                  · 🔥 {streak.current}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          className="btn btn-secondary shrink-0"
          onClick={onOpenSettings}
          aria-label="Open settings"
          title="Settings"
        >
          ⚙
        </button>
      </div>

      {/* Row 2: XP bar */}
      <div className="mt-3">
        <XpBar level={level} into={xpInto} next={xpNext} />
      </div>
    </header>
  )
}
