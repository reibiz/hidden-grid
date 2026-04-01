import { useState, useEffect, useRef, useCallback } from 'react'
import { useSound } from '../hooks/useSound'
import {
  hasMusicPlayedFromSplash,
  markMusicPlayedFromSplash,
  markMainMenuMounted,
  hasMainMenuMounted,
} from '../lib/musicState'
import { DIFFICULTY_CONFIG, type DifficultyKey } from '../lib/progression'
import type { Stats } from '../lib/stats'
import type { PlayerSettings } from '../hooks/useProfile'
import { StatsPanel } from '../components/StatsPanel'
import { UI_STRINGS } from '../lib/uiStrings'

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface MainMenuProps {
  soundOn: boolean
  setSoundOn: (v: boolean) => void
  settings: PlayerSettings
  onUpdateSettings: (next: Partial<PlayerSettings>) => void
  level: number
  xpInto: number
  xpNext: number
  title: string
  onStartGame: (difficulty: DifficultyKey) => void
  onOpenTutorial: () => void
  onOpenPuzzles: () => void
  stats: Stats
}

type Page = 'home' | 'play' | 'difficulty' | 'stats' | 'options' | 'about'

// ─── Shared style for home nav items ──────────────────────────────────────────

const NAV_ITEM_STYLE: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 'clamp(26px, 7vw, 38px)',
  lineHeight: 1.25,
  color: 'var(--color-text-primary)',
  background: 'none',
  border: 'none',
  padding: '10px 0',
  cursor: 'pointer',
  touchAction: 'manipulation',
  width: '100%',
  textAlign: 'center',
}

// ─── MainMenu ──────────────────────────────────────────────────────────────────

export default function MainMenu({
  soundOn,
  setSoundOn,
  settings,
  onUpdateSettings,
  level,
  title,
  onStartGame,
  onOpenTutorial,
  onOpenPuzzles,
  stats,
}: MainMenuProps) {
  const [page, setPage] = useState<Page>('home')
  const sound = useSound(soundOn)
  const audioUnlocked = useRef(false)

  // On returning from a game (not the very first mount), resume music.
  useEffect(() => {
    const isFirstMount = !hasMainMenuMounted()
    markMainMenuMounted()
    if (isFirstMount) return
    if (soundOn && hasMusicPlayedFromSplash()) {
      sound.playMusic('intro-song', { loop: false, allowAfterAutoplayBlock: true }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Unlock Web Audio on the player's very first tap (replaces AudioSplash gate).
  const ensureAudioUnlocked = useCallback(() => {
    if (audioUnlocked.current) return
    audioUnlocked.current = true
    sound.unlockAudio()
    if (soundOn) {
      sound.playMusic('intro-song', { loop: false, allowAfterAutoplayBlock: true }).catch(() => {})
    }
    markMusicPlayedFromSplash()
  }, [sound, soundOn])

  // Navigate forward (used from home page — also unlocks audio on first call).
  const go = useCallback((to: Page) => {
    ensureAudioUnlocked()
    sound.playSound('button-click')
    setPage(to)
  }, [ensureAudioUnlocked, sound])

  // Navigate backward with optional explicit destination.
  const back = useCallback((to: Page = 'home') => {
    sound.playSound('button-click')
    setPage(to)
  }, [sound])

  // ── Home ────────────────────────────────────────────────────────────────────
  if (page === 'home') {
    return (
      <div
        className="w-full flex flex-col select-none"
        style={{ minHeight: '100dvh' }}
      >

        {/* Header */}
        <div className="px-6 pt-10">
          <h1
            className="text-center font-display tracking-tight"
            style={{
              fontSize: 'clamp(40px, 11vw, 60px)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
            }}
          >
            Hidden Grid
          </h1>
          <p
            className="text-center"
            style={{
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginTop: '6px',
            }}
          >
            Nonogram Puzzle
          </p>

          {/* Decorative pixel grid — aligned with "H" of title */}
          <div style={{ marginTop: '20px', marginLeft: '55px' }}>
            <MenuGrid />
          </div>
        </div>

        {/* Fixed spacer — positions nav top at y≈450 on a 390×844 iPhone */}
        <div style={{ height: '150px', flexShrink: 0 }} />

        {/* Navigation */}
        <nav className="flex flex-col items-center px-4 pb-1" aria-label="Main menu">
          <button style={NAV_ITEM_STYLE} onClick={() => go('play')}>Play</button>
          <button style={NAV_ITEM_STYLE} onClick={() => go('stats')}>Stats</button>
          <button style={NAV_ITEM_STYLE} onClick={() => go('options')}>Options</button>
          <button
            style={NAV_ITEM_STYLE}
            onClick={() => { ensureAudioUnlocked(); sound.playSound('button-click'); onOpenTutorial() }}
          >
            Help
          </button>
          <button style={NAV_ITEM_STYLE} onClick={() => go('about')}>About</button>
        </nav>

        <div className="flex-1" />

        <footer
          className="text-center pt-1"
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
          }}
        >
          © 2026 RABID NYC
        </footer>
      </div>
    )
  }

  // ── Play ────────────────────────────────────────────────────────────────────
  if (page === 'play') {
    return (
      <SubPage onBack={() => back()}>
        <div className="flex flex-col gap-3 pt-2">
          <SubPageNavItem
            label="Practice"
            description="Random puzzles by difficulty"
            onClick={() => back('difficulty')}
          />
          <SubPageNavItem
            label="Picture Puzzles"
            description="Reveal pixel-art images"
            onClick={() => { sound.playSound('button-click'); setPage('home'); onOpenPuzzles() }}
          />
        </div>
      </SubPage>
    )
  }

  // ── Difficulty ──────────────────────────────────────────────────────────────
  if (page === 'difficulty') {
    return (
      <SubPage onBack={() => back('play')}>
        <div className="flex flex-col gap-2 pt-2">
          {(Object.keys(DIFFICULTY_CONFIG) as DifficultyKey[]).map((key) => (
            <button
              key={key}
              className="w-full flex items-center justify-between px-4 py-4 text-left"
              style={{
                background: 'var(--color-surface-raised)',
                border: '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
              onClick={() => {
                sound.playSound('button-click')
                onStartGame(key)
              }}
            >
              <span
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(20px, 5vw, 26px)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {DIFFICULTY_LABELS[key]}
              </span>
              <span
                className="font-mono text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {DIFFICULTY_CONFIG[key].size}×{DIFFICULTY_CONFIG[key].size}
              </span>
            </button>
          ))}
        </div>
      </SubPage>
    )
  }

  // ── Stats ───────────────────────────────────────────────────────────────────
  if (page === 'stats') {
    return (
      <SubPage onBack={() => back()}>
        <div className="pt-2">
          <StatsPanel stats={stats} />
        </div>
      </SubPage>
    )
  }

  // ── Options ─────────────────────────────────────────────────────────────────
  if (page === 'options') {
    const s   = settings
    const set = onUpdateSettings
    return (
      <SubPage onBack={() => back()}>
        <div style={{ paddingBottom: 'max(48px, env(safe-area-inset-bottom, 48px))' }}>

          {/* ─── SOUNDS ─────────────────────────────────── */}
          <SectionHeader label="Sounds" />

          <SliderRow
            label="Melody Volume"
            description="Background music volume"
            value={s.melodyVolume ?? 80}
            min={0} max={100} step={1}
            format={v => v === 0 ? 'Muted' : `${v}%`}
            onChange={v => set({ melodyVolume: v })}
          />
          <SliderRow
            label="Effects Volume"
            description="Sound effects volume"
            value={s.effectsVolume ?? 80}
            min={0} max={100} step={1}
            format={v => v === 0 ? 'Muted' : `${v}%`}
            onChange={v => set({ effectsVolume: v })}
          />
          <ToggleRow
            label="Auto Mute Sounds"
            value={s.autoMute ?? false}
            onChange={v => set({ autoMute: v })}
          />

          {/* ─── GAME ───────────────────────────────────── */}
          <SectionHeader label="Game" />

          <ToggleRow
            label="Auto Remove Empty Markers"
            description="Automatically remove all Xs from the puzzle marking empty grid boxes"
            value={s.autoRemoveMarkers ?? false}
            onChange={v => set({ autoRemoveMarkers: v })}
          />
          <ToggleRow
            label="Use Hints"
            description='Adds a "Hint" button to the puzzle that highlights one random grid box to be filled in'
            value={s.useHints ?? true}
            onChange={v => set({ useHints: v })}
          />
          <ToggleRow
            label="Image Names"
            description="Shows the name of the image you are trying to solve"
            value={s.showImageNames ?? true}
            onChange={v => set({ showImageNames: v })}
          />
          <ToggleRow
            label="Use Level Best Score"
            description="At game end, compare scores using level best score instead of the overall best"
            value={s.useLevelBestScore ?? false}
            onChange={v => set({ useLevelBestScore: v })}
          />

          {/* ─── INTERFACE ──────────────────────────────── */}
          <SectionHeader label="Interface" />

          <ToggleRow
            label="Show Status Bar"
            description="Always show the status bar when playing a game"
            value={s.showStatusBar ?? true}
            onChange={v => set({ showStatusBar: v })}
          />
          <SliderRow
            label="Number-Tab Delay"
            description="Time delay before the number-tab is displayed while a tile is being touched"
            value={s.numberTabDelay ?? 500}
            min={0} max={2000} step={100}
            format={v => v === 0 ? 'Off' : `${(v / 1000).toFixed(1)}s`}
            onChange={v => set({ numberTabDelay: v })}
          />
          <ToggleRow
            label="Hide Timer"
            description="Hide the timer while playing (total time is shown at the end of the session)"
            value={!(s.showTimer ?? true)}
            onChange={v => set({ showTimer: !v })}
          />

          {/* ─── ADVANCED ───────────────────────────────── */}
          <SectionHeader label="Advanced" />

          <ToggleRow
            label="Game Center"
            description="Enable the uploading of scores to Game Center"
            value={s.gameCenter ?? false}
            onChange={v => set({ gameCenter: v })}
          />

        </div>
      </SubPage>
    )
  }

  // ── About ───────────────────────────────────────────────────────────────────
  if (page === 'about') {
    return (
      <SubPage onBack={() => back()}>
        <div className="pt-8 flex flex-col items-center text-center gap-2">
          <p
            className="font-display"
            style={{ fontSize: 'clamp(28px, 7vw, 38px)', fontWeight: 700, color: 'var(--color-text-primary)' }}
          >
            Hidden Grid
          </p>
          <p
            style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}
          >
            Nonogram Puzzle
          </p>
          <p className="text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
            {title} · Level {level}
          </p>
          <p className="text-xs mt-8" style={{ color: 'var(--color-text-muted)' }}>
            © 2026 RABID NYC
          </p>
        </div>
      </SubPage>
    )
  }

  return null
}

// ─── SubPage ──────────────────────────────────────────────────────────────────

function SubPage({
  onBack,
  children,
}: {
  onBack: () => void
  children: React.ReactNode
}) {
  return (
    <div className="w-full flex flex-col select-none" style={{ minHeight: '100dvh' }}>
      {/* Back button row */}
      <div className="px-5 pt-10 pb-2">
        <button
          onClick={onBack}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            touchAction: 'manipulation',
            padding: '8px 0',
            lineHeight: 1,
          }}
          aria-label="Back"
        >
          ← back
        </button>
      </div>

      {/* Page content */}
      <div className="px-5 flex-1">
        {children}
      </div>
    </div>
  )
}

// ─── SubPageNavItem ───────────────────────────────────────────────────────────

function SubPageNavItem({
  label,
  description,
  onClick,
}: {
  label: string
  description?: string
  onClick: () => void
}) {
  return (
    <button
      className="w-full text-left px-4 py-4"
      style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
      onClick={onClick}
    >
      <span
        style={{
          display: 'block',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 5.5vw, 28px)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.25,
        }}
      >
        {label}
      </span>
      {description && (
        <span
          className="text-xs mt-1 block"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {description}
        </span>
      )}
    </button>
  )
}

// ─── OptionsRow (legacy — kept for any existing usages) ──────────────────────

function OptionsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between py-4 px-1"
      style={{ borderBottom: '1px solid var(--color-grid-line)' }}
    >
      <span
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(20px, 5vw, 26px)',
          color: 'var(--color-text-primary)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--color-text-muted)',
        paddingTop: '24px',
        paddingBottom: '4px',
      }}
    >
      {label}
    </div>
  )
}

// ─── OptionToggle ─────────────────────────────────────────────────────────────

function OptionToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: '44px',
        height: '26px',
        borderRadius: '13px',
        background: value ? 'var(--color-primary)' : 'var(--color-cell-empty)',
        border: '2px solid',
        borderColor: value ? 'var(--color-primary)' : 'var(--color-text-muted)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background var(--transition-base), border-color var(--transition-base)',
        padding: 0,
        flexShrink: 0,
        touchAction: 'manipulation',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: value ? '18px' : '2px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left var(--transition-base)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
          display: 'block',
        }}
      />
    </button>
  )
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '14px',
        padding: '14px 0',
        borderBottom: '1px solid var(--color-grid-line)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-primary)',
          fontWeight: 500,
          lineHeight: 1.35,
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: '3px',
            lineHeight: 1.5,
          }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ paddingTop: '1px', flexShrink: 0 }}>
        <OptionToggle value={value} onChange={onChange} />
      </div>
    </div>
  )
}

// ─── SliderRow ────────────────────────────────────────────────────────────────

function SliderRow({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string
  description?: string
  value: number
  min: number
  max: number
  step?: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  const pct = `${((value - min) / (max - min)) * 100}%`
  return (
    <div
      style={{
        padding: '14px 0',
        borderBottom: '1px solid var(--color-grid-line)',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            lineHeight: 1.35,
          }}>
            {label}
          </div>
          {description && (
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              marginTop: '3px',
              lineHeight: 1.5,
            }}>
              {description}
            </div>
          )}
        </div>
        <span style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: 'var(--color-primary)',
          flexShrink: 0,
          marginLeft: '12px',
          minWidth: '44px',
          textAlign: 'right',
        }}>
          {format(value)}
        </span>
      </div>
      {/* Slider */}
      <input
        type="range"
        className="options-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        // Inline CSS variable drives the filled-track colour via index.css
        style={{ ['--slider-pct' as string]: pct } as React.CSSProperties}
      />
    </div>
  )
}

// ─── MenuGrid ─────────────────────────────────────────────────────────────────

const MENU_GRID_PATTERN: boolean[][] = [
  [false, false, true,  false, false],
  [false, false, true,  false, false],
  [true,  true,  true,  true,  true ],
  [false, false, true,  false, false],
  [false, false, true,  false, false],
]

function MenuGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '3px',
        width: '80px',
      }}
      aria-hidden="true"
    >
      {MENU_GRID_PATTERN.flat().map((filled, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '1',
            background: filled ? 'var(--color-cell-filled)' : 'var(--color-cell-empty)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Difficulty labels ────────────────────────────────────────────────────────

const DIFFICULTY_LABELS: Record<DifficultyKey, string> = {
  flash:  'Flash',
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
  expert: 'Expert',
  insane: 'Insane',
}
