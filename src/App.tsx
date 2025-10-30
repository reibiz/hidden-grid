import { useEffect, useMemo, useState } from 'react'
import { mulberry32, hashStringToSeed, todayKey } from './lib/seed'
import { DIFFICULTY_CONFIG, type DifficultyKey as Difficulty, computeMedal, computeXP, type Medal, levelFromXP, titleForLevel } from './lib/progression'
import { useProfile } from './hooks/useProfile'
import { XpBar } from './components/XpBar'
import { CompletionModal } from './components/CompletionModal'
import { StatsPanel } from './components/StatsPanel'
import { SettingsModal } from './components/SettingsModal'
import { updateStreak } from './lib/streak'
import { recordSolve } from './lib/stats'
import { evaluateAchievements } from './lib/achievements'
import './index.css'

type CellState = 0 | 1 | 2
interface Puzzle { id: string; size: number; solution: boolean[][]; rowCounts: number[]; colCounts: number[] }

function generatePuzzle(seed: string, size = 8, density = 0.45): Puzzle {
  const rng = mulberry32(hashStringToSeed(seed))
  const solution: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => rng() < density))
  for (let r = 0; r < size; r++) if (solution[r].every(v => !v)) { solution[r][Math.floor(rng() * size)] = true }
  for (let c = 0; c < size; c++) if (solution.every(row => !row[c])) { solution[Math.floor(rng() * size)][c] = true }
  const rowCounts = solution.map(row => row.reduce((a, b) => a + (b ? 1 : 0), 0))
  const colCounts = Array.from({ length: size }, (_, c) => solution.reduce((a, row) => a + (row[c] ? 1 : 0), 0))
  return { id: seed, size, solution, rowCounts, colCounts }
}

export default function App() {
  const profile = useProfile()
  const p0 = profile.get()
  const initialDifficulty = p0.settings.difficulty
  const [mode, setMode] = useState<'daily' | 'practice'>('daily')
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const cfg = DIFFICULTY_CONFIG[difficulty]

  const [seed, setSeed] = useState(() => `daily-${todayKey()}-${difficulty}`)
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle(seed, cfg.size, cfg.density))
  const [grid, setGrid] = useState<CellState[][]>(() => Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0)))
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState(() => Date.now())
  const [revealCount, setRevealCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [lastResult, setLastResult] = useState<{ seconds: number; medal: Medal; gainedXP: number; levelUp: { from: number; to: number } | null; dailyBonus?: number; newlyUnlocked?: string[] } | null>(null)

  useEffect(() => {
    const p = generatePuzzle(seed, cfg.size, cfg.density)
    setPuzzle(p)
    setGrid(Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0)))
    setMoves(0)
    setStartTime(Date.now())
    setRevealCount(0)
  }, [seed, difficulty])

  useEffect(() => { profile.setDifficulty(difficulty) }, [difficulty])

  const rowFilled = useMemo(() => grid.map(row => row.reduce((a, v) => a + (v === 1 ? 1 : 0), 0)), [grid])
  const colFilled = useMemo(() => Array.from({ length: cfg.size }, (_, c) => grid.reduce((a, row) => a + (row[c] === 1 ? 1 : 0), 0)), [grid, cfg.size])

  // counts-based solved check
  const countsOk = useMemo(() => (
    puzzle.rowCounts.every((v, i) => v === rowFilled[i]) && puzzle.colCounts.every((v, i) => v === colFilled[i])
  ), [puzzle, rowFilled, colFilled])

  useEffect(() => {
    if (!countsOk) return
    const seconds = Math.floor((Date.now() - startTime) / 1000)
    const medal = computeMedal(difficulty, seconds)
    const perfect = true
    const gainedXP = computeXP({ size: cfg.size, difficulty, seconds, perfect })

    const today = todayKey()
    const isDaily = seed.startsWith('daily-')
    let dailyBonus = 0
    if (isDaily && (profile.get().lastDailyBonusDate !== today)) dailyBonus = 25
    if (isDaily) {
      const st = updateStreak(profile.get().streak, today)
      profile.setStreak(st)
      if (dailyBonus > 0) profile.setLastDailyBonusDate(today)
    }
    const p = profile.get()
    const newStats = recordSolve(p.stats, difficulty, seconds, perfect, medal)
    profile.setStats(newStats)
    const evalRes = evaluateAchievements(p.achievements, {
      difficulty, seconds, medal, perfect, dateISO: new Date().toISOString(),
      currentStreak: p.streak.current,
      solvedByDifficulty: newStats.solvesByDifficulty
    })
    profile.setAchievements(evalRes.updated)
    const before = levelFromXP(profile.get().xp)
    profile.addXP(gainedXP + dailyBonus)
    profile.incrementSolved()
    if (medal !== 'none') profile.addMedal(medal)
    const after = levelFromXP(profile.get().xp)
    const levelUp = after.level > before.level ? { from: before.level, to: after.level } : null
    setModalOpen(true)
    setLastResult({ seconds, medal, gainedXP: gainedXP + dailyBonus, levelUp, dailyBonus: dailyBonus || undefined, newlyUnlocked: evalRes.newlyUnlocked })
  }, [countsOk])

  function cycleCell(r: number, c: number, rightClick = false) {
    setGrid(g => {
      const next = g.map(row => row.slice())
      const cur = next[r][c]
      let n: CellState
      if (rightClick) n = cur === 2 ? 0 : 2
      else n = cur === 1 ? 0 : 1
      next[r][c] = n
      return next
    })
    setMoves(m => m + 1)
  }

  function revealMistakes() {
    const next = grid.map(row => row.slice())
    for (let r = 0; r < cfg.size; r++) {
      const need = puzzle.rowCounts[r]
      let have = rowFilled[r]
      if (have > need) {
        for (let c = 0; c < cfg.size && have > need; c++) {
          if (next[r][c] === 1) { next[r][c] = 0; have-- }
        }
      }
    }
    const colNow = Array.from({ length: cfg.size }, (_, c) => next.reduce((a, row) => a + (row[c] === 1 ? 1 : 0), 0))
    for (let c = 0; c < cfg.size; c++) {
      const need = puzzle.colCounts[c]
      let have = colNow[c]
      if (have > need) {
        for (let r = 0; r < cfg.size && have > need; r++) {
          if (next[r][c] === 1) { next[r][c] = 0; have-- }
        }
      }
    }
    setGrid(next)
    setRevealCount(n => n + 1)
  }

  function newDaily() { setMode('daily'); setSeed(`daily-${todayKey()}-${difficulty}`) }
  function newPractice() { setMode('practice'); setSeed(`practice-${Math.random().toString(36).slice(2, 10)}-${difficulty}`) }

  const settings = profile.get().settings
  const secondsElapsed = Math.floor((Date.now() - startTime) / 1000)
  const level = levelFromXP(profile.get().xp)
  const title = titleForLevel(level.level)
  const streak = profile.get().streak
  const panelClass = 'panel border border-accent rounded-2xl p-4'

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <header className="w-full max-w-5xl flex items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Hidden Grid <span className="text-xs opacity-60 align-top">v1.3 RC</span></h1>
          <div className="text-xs opacity-70 mt-1">Title: {title} {streak.current > 0 ? <span className="ml-2">• Streak 🔥 {streak.current}</span> : null}</div>
        </div>
        <XpBar level={level.level} into={level.intoLevel} next={level.nextLevelXP} />
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] gap-6">
        <section className={panelClass}>
          <div className="flex items-end gap-4 mb-3">
            <div className="w-10" />
            <div className="grid" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 36px)` }}>
              {puzzle.colCounts.map((n, i) => (
                <div key={i} className={`text-center text-xs px-1 ${colFilled[i] === n ? 'text-emerald-400' : 'text-neutral-400'}`}>{n}</div>
              ))}
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col mr-2 gap-1">
              {puzzle.rowCounts.map((n, i) => (
                <div key={i} className={`h-9 w-10 flex items-center justify-center text-xs ${rowFilled[i] === n ? 'text-emerald-400' : 'text-neutral-400'}`}>{n}</div>
              ))}
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 36px)` }}>
              {grid.map((row, r) => row.map((cell, c) => (
                <button key={`${r}-${c}`} onClick={() => cycleCell(r, c, false)} onContextMenu={(e) => { e.preventDefault(); cycleCell(r, c, true) }}
                  className={`h-9 w-9 rounded-md border flex items-center justify-center select-none transition-colors ${cell === 1 ? 'bg-emerald-500/90 text-neutral-900' : cell === 2 ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800'}`}
                  aria-label={`cell ${r + 1},${c + 1}`}
                >{cell === 1 ? '' : cell === 2 ? '✖' : ''}</button>
              )))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <button onClick={revealMistakes} className="btn btn-neutral border-accent">Reveal mistakes</button>
            <button onClick={() => setGrid(Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0)))} className="btn btn-neutral border-accent">Reset board</button>
            {settings.showTimer !== false && (
              <span className="ml-auto opacity-80">Time: <span className="font-mono">{Math.floor(secondsElapsed / 60)}:{String(secondsElapsed % 60).padStart(2, '0')}</span></span>
            )}
          </div>
        </section>

        <aside className={panelClass + ' flex flex-col gap-3'}>
          <h2 className="text-lg font-semibold">Mode & Difficulty</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={newDaily}
              className="btn btn-neutral border-accent px-2 py-1 text-xs leading-none whitespace-nowrap"
            >
              Daily
            </button>
            <button
              onClick={newPractice}
              className="btn btn-neutral border-accent px-2 py-1 text-xs leading-none whitespace-nowrap"
            >
              Practice
            </button>
          </div>
          <div className="mt-1">
            <label className="text-sm opacity-80">Difficulty</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {(['beginner','medium','hard'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => { setDifficulty(d); setSeed(`${mode}-${todayKey()}-${d}`) }} className="btn btn-neutral border-accent capitalize px-2 py-1 text-xs leading-none whitespace-nowrap">{d}</button>
              ))}
            </div>
            <div className="text-xs opacity-60 mt-1">Reveals allowed: {cfg.revealsAllowed < 0 ? 'unlimited' : cfg.revealsAllowed}</div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowStats(s => !s)} className="btn btn-neutral border-accent">{showStats ? 'Hide Stats' : 'Show Stats'}</button>
            <button onClick={() => setSettingsOpen(true)} className="btn btn-neutral border-accent">Settings</button>
          </div>
          {showStats && <div className="mt-3"><StatsPanel stats={profile.get().stats} /></div>}
          <div className="mt-2 text-sm opacity-90">
            <p><span className="font-semibold">How to play:</span> Fill cells so each row/column matches the green number. Right-click (or long-press) to mark empty (✖). Finish faster for better medals.</p>
          </div>
          <div className="mt-2 text-sm opacity-80">
            <div>Total moves: <span className="font-mono">{moves}</span></div>
            <div>Seed: <span className="font-mono">{puzzle.id}</span></div>
          </div>
        </aside>
      </main>
      <footer className="mt-6 text-xs opacity-60">© {new Date().getFullYear()} Hidden Grid · v1.3 RC</footer>
      <CompletionModal open={modalOpen} onClose={() => { setModalOpen(false); mode === 'daily' ? newDaily() : newPractice() }} seconds={lastResult?.seconds ?? Math.floor((Date.now() - startTime) / 1000)} medal={lastResult?.medal ?? 'none'} gainedXP={lastResult?.gainedXP ?? 0} levelUp={lastResult?.levelUp ?? null} dailyBonus={lastResult?.dailyBonus} newlyUnlocked={lastResult?.newlyUnlocked} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={profile.get().settings} onChange={(next) => profile.setSettings(next)} />
    </div>
  )
}
