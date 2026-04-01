/**
 * SettingsModal
 *
 * In-game settings overlay: timer visibility, sound on/off.
 * Sound calls are self-contained — this component manages its own audio
 * so the parent doesn't need to wire sound callbacks.
 */

import { useEffect } from 'react'
import { UI_STRINGS } from '../lib/uiStrings'
import { useSound } from '../hooks/useSound'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  settings: { showTimer?: boolean; sound?: boolean }
  onChange: (next: Partial<{ showTimer: boolean; sound: boolean }>) => void
}

export function SettingsModal({ open, onClose, settings, onChange }: SettingsModalProps) {
  const { showTimer = true, sound = true } = settings
  const soundEnabled = sound !== false
  const soundManager = useSound(soundEnabled)

  useEffect(() => {
    if (open) soundManager.playSound('modal-open')
  }, [open, soundManager])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-lg z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="panel border border-accent w-full max-w-sm"
        style={{ animation: 'scaleIn 220ms var(--transition-modal)' }}
      >
        <h3 className="text-lg font-semibold mb-md text-text-primary">
          {UI_STRINGS.SETTINGS_TITLE}
        </h3>

        <div className="space-y-md">
          {/* Show timer */}
          <div className="flex items-center justify-between py-sm">
            <span className="text-text-primary">{UI_STRINGS.LABEL_SHOW_TIMER}</span>
            <input
              type="checkbox"
              checked={!!showTimer}
              onChange={(e) => onChange({ showTimer: e.target.checked })}
              className="w-5 h-5 rounded-sm border-grid-line accent-primary cursor-pointer"
            />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between py-sm">
            <span className="text-text-primary">{UI_STRINGS.LABEL_SOUND}</span>
            <input
              type="checkbox"
              checked={!!sound}
              onChange={(e) => onChange({ sound: e.target.checked })}
              className="w-5 h-5 rounded-sm border-grid-line accent-primary cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-xl flex justify-end">
          <button
            onClick={() => {
              soundManager.playSound('button-click')
              onClose()
            }}
            className="btn btn-primary"
          >
            {UI_STRINGS.BUTTON_CLOSE}
          </button>
        </div>
      </div>
    </div>
  )
}
