/**
 * GameSidebar
 *
 * Right-hand panel shown on md+ breakpoints during gameplay.
 * Hidden on mobile — Settings are accessible via the ⚙ button in GameHeader.
 *
 * Contains:
 *   • Difficulty selector (mid-game change)
 *   • Live puzzle stats (moves, seed ID)
 *
 * Sound calls are absent — the parent wires fully composed callbacks.
 */

import { DIFFICULTY_CONFIG, type DifficultyKey } from '../lib/progression'
import { UI_STRINGS } from '../lib/uiStrings'

interface GameSidebarProps {
  difficulty: DifficultyKey
  /** -1 means unlimited */
  revealsAllowed: number
  moves: number
  seedId: string
  onChangeDifficulty: (d: DifficultyKey) => void
}

export function GameSidebar({
  difficulty,
  revealsAllowed,
  moves,
  seedId,
  onChangeDifficulty,
}: GameSidebarProps) {
  return (
    <div className="flex flex-col gap-md h-full">

      {/* Difficulty selector */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-sm">
          Difficulty
        </h2>
        <div className="flex gap-sm flex-wrap">
          {(Object.keys(DIFFICULTY_CONFIG) as DifficultyKey[]).map((d) => (
            <button
              key={d}
              onClick={() => onChangeDifficulty(d)}
              className={`btn ${
                difficulty === d ? 'btn-primary' : 'btn-secondary'
              } capitalize px-sm py-xs text-xs leading-none whitespace-nowrap`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-sm">
          {UI_STRINGS.LABEL_REVEALS_ALLOWED}{' '}
          {revealsAllowed < 0 ? UI_STRINGS.LABEL_UNLIMITED : revealsAllowed}
        </p>
      </div>

      {/* Puzzle stats */}
      <div className="mt-auto text-sm text-text-secondary space-y-xs">
        <div>
          {UI_STRINGS.LABEL_TOTAL_MOVES}{' '}
          <span className="font-mono">{moves}</span>
        </div>
        <div>
          {UI_STRINGS.LABEL_SEED}{' '}
          <span className="font-mono">{seedId}</span>
        </div>
      </div>
    </div>
  )
}
