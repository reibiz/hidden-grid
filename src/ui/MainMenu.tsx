import { useMemo, useState } from 'react'

export type ThemeMode = 'retro' | 'zen'

export interface MainMenuProps {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  soundOn: boolean
  setSoundOn: (v: boolean) => void
  level: number
  xpInto: number
  xpNext: number
  title: string
  onPlayDaily: () => void
  onPlayPractice: () => void
  onOpenArchive: () => void
  onOpenStats: () => void
  onOpenAchievements: () => void
  onOpenSettings: () => void
  versionLabel?: string
}

export default function MainMenu(props: MainMenuProps) {
  const {
    theme, setTheme, soundOn, setSoundOn,
    level, xpInto, xpNext, title,
    onPlayDaily, onPlayPractice, onOpenArchive, onOpenStats,
    onOpenAchievements, onOpenSettings, versionLabel = 'v1.3',
  } = props

  const pct = useMemo(
    () => Math.max(0, Math.min(100, Math.round((xpInto / Math.max(1, xpNext)) * 100))),
    [xpInto, xpNext]
  )

  const [showDifficulty, setShowDifficulty] = useState<null | 'daily' | 'practice'>(null)

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8" data-theme={theme}>
      <div className="w-full max-w-3xl grid gap-4">
        <header className="text-center select-none">
          <div className="inline-block px-4 py-2 font-bold tracking-widest border-2" style={{ borderColor: 'var(--accent)' }}>
            <span className={theme==='retro' ? 'font-[\"Press_Start_2P\",monospace]' : 'font-semibold'}>HIDDEN GRID</span>
          </div>
          <div className="mt-2 text-xs opacity-80">{versionLabel}</div>
        </header>

        <section className="grid gap-2">
          <MenuButton label="Play Daily Puzzle" onClick={() => setShowDifficulty('daily')} accent />
          <MenuButton label="Practice Mode" onClick={() => setShowDifficulty('practice')} />
          <MenuButton label="Puzzle Archive" onClick={onOpenArchive} subtle />
        </section>

        <section className="rounded-xl p-4 border panel" style={{ borderColor: 'color-mix(in oklab, var(--accent) 35%, transparent)' }}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="opacity-80">Profile</div>
              <div className="font-medium">{title} • Level {level}</div>
            </div>
            <XPBar pct={pct} into={xpInto} next={xpNext} />
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <MenuChip label="Stats" onClick={onOpenStats} />
          <MenuChip label="Achievements" onClick={onOpenAchievements} />
          <MenuChip label="Settings" onClick={onOpenSettings} />
        </section>

        <section className="flex flex-wrap items-center gap-3 text-sm">
          <Toggle label="Theme" options={[['retro','Retro'],['zen','Zen']]} value={theme} onChange={v => setTheme(v as ThemeMode)} />
          <Toggle label="Sound" options={[['on','On'],['off','Off']]} value={soundOn ? 'on' : 'off'} onChange={v => setSoundOn(v==='on')} />
        </section>

        <footer className="mt-2 text-xs opacity-60 text-center">
          © {new Date().getFullYear()} Hidden Grid
        </footer>
      </div>

      {showDifficulty && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl p-4 border panel" style={{ borderColor: 'var(--accent)' }}>
            <div className="text-lg font-semibold mb-3">Choose Difficulty</div>

            {/* ✅ Updated grid layout for better fit */}
            <div className="grid grid-cols-3 gap-2">
              <MenuButton label="Beginner" onClick={() => handleStart(showDifficulty, 'beginner', { onPlayDaily, onPlayPractice, setShowDifficulty })} small tight />
              <MenuButton label="Medium" onClick={() => handleStart(showDifficulty, 'medium', { onPlayDaily, onPlayPractice, setShowDifficulty })} small tight />
              <MenuButton label="Hard" onClick={() => handleStart(showDifficulty, 'hard', { onPlayDaily, onPlayPractice, setShowDifficulty })} small tight />
            </div>

            <div className="mt-3 text-right">
              <button
                className="px-3 py-2 text-sm border rounded-md hover:opacity-80"
                onClick={() => setShowDifficulty(null)}
                style={{ borderColor: 'color-mix(in oklab, var(--text) 25%, transparent)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function handleStart(
  mode: 'daily'|'practice',
  _difficulty: 'beginner'|'medium'|'hard',
  ctx: { onPlayDaily: ()=>void; onPlayPractice: ()=>void; setShowDifficulty: (v:null)=>void }
) {
  if (mode === 'daily') ctx.onPlayDaily()
  else ctx.onPlayPractice()
  ctx.setShowDifficulty(null as unknown as null)
}

function MenuButton({ label, onClick, accent, subtle, small, tight }:{
  label: string; onClick?: ()=>void; accent?: boolean; subtle?: boolean; small?: boolean; tight?: boolean
}) {
  const base = 'w-full border rounded-lg select-none transition inline-flex items-center justify-center'
  const size = small ? (tight ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm') : 'px-4 py-3 text-base'
  const cls = accent
    ? `${base} ${size} btn btn-accent`
    : subtle
    ? `${base} ${size} btn btn-neutral`
    : `${base} ${size} btn btn-neutral`

  return (
    <button className={cls} onClick={onClick}>
      <span className="flex-1 text-center">{label}</span>
    </button>
  )
}

function MenuChip({ label, onClick }:{ label: string; onClick?: ()=>void }) {
  return (
    <button onClick={onClick} className="btn btn-neutral border-accent text-sm">
      <span className="opacity-90">{label}</span>
    </button>
  )
}

function XPBar({ pct, into, next }:{ pct: number; into: number; next: number }) {
  return (
    <div className="flex items-center gap-3 w-64 max-w-full">
      <div className="text-xs opacity-80">XP</div>
      <div className="flex-1 h-3 rounded-sm overflow-hidden border border-accent">
        <div className="h-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
      <div className="text-[10px] opacity-70 w-20 text-right">{into} / {next}</div>
    </div>
  )
}

function Toggle({ label, options, value, onChange }:{
  label: string; options: [string,string][]; value: string; onChange: (v:string)=>void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="opacity-80">{label}:</span>
      <div className="inline-flex rounded-lg overflow-hidden border border-accent">
        {options.map(([val, text]) => (
          <button key={val}
                  className={`px-3 py-1 text-sm ${value===val ? 'btn-accent' : ''}`}
                  onClick={() => onChange(val)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}