/**
 * App
 *
 * Thin orchestrator for a single game session.
 *
 * Responsibilities:
 *   1. Wire hooks (game state, profile, sound, animations, completion)
 *   2. Compose sound + action into single callbacks for child components
 *   3. Render the layout shell and delegate all visual work to components
 *
 * GameHeader     → title, streak, XP bar, back button, settings gear
 * GameBoard      → clue headers + interactive cell grid
 * GameControls   → Reveal / Reset buttons + live timer
 * GameSidebar    → difficulty selector + puzzle stats (desktop only)
 * CompletionModal / SettingsModal → overlays
 */

import { useCallback, useEffect, useState } from 'react'
import { type DifficultyKey, levelFromXP, titleForLevel } from './lib/progression'
import { type PuzzlePicture, puzzleFromPicture, SIZE_TO_DIFFICULTY } from './lib/puzzlePictures'
import { useProfile } from './hooks/useProfile'
import { useGameState, type CellState, type Puzzle } from './hooks/useGameState'
import { useGameCompletion } from './hooks/useGameCompletion'
import { useSound } from './hooks/useSound'
import { useAnimations } from './hooks/useAnimations'
import { GameHeader } from './components/GameHeader'
import { GameBoard } from './components/GameBoard'
import { GameControls } from './components/GameControls'
import { GameSidebar } from './components/GameSidebar'
import { CompletionModal } from './components/CompletionModal'
import { SettingsModal } from './components/SettingsModal'
import { ParticleEffect } from './components/ParticleEffect'
import './index.css'

interface AppProps {
  initialDifficultyOverride?: DifficultyKey
  initialPicture?: PuzzlePicture   // picture mode: use this specific puzzle
  onReturnToMenu?: () => void
}

export default function App({
  initialDifficultyOverride,
  initialPicture,
  onReturnToMenu,
}: AppProps = {}) {

  // ── Profile + initial settings ──────────────────────────────────────────────
  const profile = useProfile()

  // Derive difficulty and optional fixed puzzle from initialPicture when present
  const fixedPuzzle: Puzzle | undefined = initialPicture
    ? puzzleFromPicture(initialPicture)
    : undefined
  const initialDifficulty: DifficultyKey = initialPicture
    ? SIZE_TO_DIFFICULTY[initialPicture.size]
    : (initialDifficultyOverride ?? profile.get().settings.difficulty)

  // ── Game engine ─────────────────────────────────────────────────────────────
  const {
    difficulty,
    config: cfg,
    seed,
    puzzle,
    grid,
    moves,
    startTime,
    rowFilled,
    colFilled,
    countsMatch,
    canUndo,
    canRedo,
    cycleCell,
    undo,
    redo,
    revealMistakes,
    resetBoard,
    updateDifficulty,
    startNewPuzzle,
  } = useGameState(initialDifficulty, fixedPuzzle)

  // ── Audio ───────────────────────────────────────────────────────────────────
  const soundEnabled = profile.get().settings.sound !== false
  const sound = useSound(soundEnabled)

  useEffect(() => {
    if (soundEnabled) sound.preloadAll()
  }, [soundEnabled, sound])

  // ── Timer — tick every second so the display stays live ─────────────────────
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [startTime]) // restart interval whenever a new puzzle begins
  const secondsElapsed = Math.floor((Date.now() - startTime) / 1000)

  // ── Animations + per-row/col completion sounds ──────────────────────────────
  const { completedRows, completedCols, puzzleComplete, showParticles } =
    useAnimations({ rowFilled, colFilled, puzzle, countsMatch, seed, sound })

  // ── Completion modal ─────────────────────────────────────────────────────────
  const completion = useGameCompletion({
    countsMatch,
    startTime,
    difficulty,
    size: cfg.size,
    seed,
    profile,
  })

  useEffect(() => {
    if (completion.result?.levelUp) sound.playSound('level-up')
  }, [completion.result?.levelUp, sound])

  // Mark picture as solved the first time the completion modal opens
  useEffect(() => {
    if (completion.isOpen && initialPicture) {
      profile.markPictureSolved(initialPicture.id)
    }
  }, [completion.isOpen, initialPicture, profile])

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Persist chosen difficulty to profile whenever it changes mid-game
  useEffect(() => {
    profile.setDifficulty(difficulty)
  }, [difficulty, profile])

  // ── Derived display values ───────────────────────────────────────────────────
  const level = levelFromXP(profile.get().xp)
  const title = titleForLevel(level.level)
  const streak = profile.get().streak
  const settings = profile.get().settings

  // ── Wired callbacks — sound + action composed here, children stay pure ───────

  const handleCellClick = useCallback(
    (r: number, c: number, currentState: CellState) => {
      cycleCell(r, c, false)
      sound.playSound(currentState === 0 ? 'cell-fill' : 'cell-clear')
    },
    [cycleCell, sound]
  )

  const handleCellRightClick = useCallback(
    (r: number, c: number, currentState: CellState) => {
      cycleCell(r, c, true)
      sound.playSound(currentState === 0 ? 'cell-mark' : 'cell-clear')
    },
    [cycleCell, sound]
  )

  const handleUndo = useCallback(() => {
    if (!canUndo) return
    sound.playSound('cell-clear')
    undo()
  }, [canUndo, undo, sound])

  const handleRedo = useCallback(() => {
    if (!canRedo) return
    sound.playSound('cell-fill')
    redo()
  }, [canRedo, redo, sound])

  // Keyboard shortcuts: Ctrl+Z = undo, Ctrl+Shift+Z / Ctrl+Y = redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo() }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); handleRedo() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo, handleRedo])

  const handleReveal = useCallback(() => {
    sound.playSound('button-click')
    const hasMistakes =
      rowFilled.some((filled, i) => filled > puzzle.rowCounts[i]) ||
      colFilled.some((filled, i) => filled > puzzle.colCounts[i])
    revealMistakes()
    if (hasMistakes) setTimeout(() => sound.playSound('error'), 100)
  }, [sound, rowFilled, colFilled, puzzle, revealMistakes])

  const handleReset = useCallback(() => {
    sound.playSound('button-click')
    resetBoard()
  }, [sound, resetBoard])

  const handleChangeDifficulty = useCallback(
    (d: DifficultyKey) => {
      sound.playSound('button-click')
      updateDifficulty(d)
    },
    [sound, updateDifficulty]
  )

  const handleOpenSettings = useCallback(() => {
    sound.playSound('modal-open')
    setSettingsOpen(true)
  }, [sound])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-1 md:px-6 lg:px-8 py-4 md:py-6">

      <GameHeader
        title={title}
        streak={streak}
        level={level.level}
        xpInto={level.intoLevel}
        xpNext={level.nextLevelXP}
        onReturnToMenu={onReturnToMenu}
        onOpenSettings={handleOpenSettings}
      />

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] gap-6">

        {/* Grid panel */}
        <section className="panel border border-accent">
          <GameBoard
            puzzle={puzzle}
            grid={grid}
            rowFilled={rowFilled}
            colFilled={colFilled}
            hideCountsUntilComplete={cfg.hideCountsUntilComplete ?? false}
            completedRows={completedRows}
            completedCols={completedCols}
            puzzleComplete={puzzleComplete}
            onCellClick={handleCellClick}
            onCellRightClick={handleCellRightClick}
          />
          <GameControls
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReveal={handleReveal}
            onReset={handleReset}
            canUndo={canUndo}
            canRedo={canRedo}
            seconds={secondsElapsed}
            showTimer={settings.showTimer !== false}
          />
        </section>

        {/* Sidebar — hidden on mobile, visible on md+ */}
        <aside className="hidden md:block panel border border-accent">
          <GameSidebar
            difficulty={difficulty}
            revealsAllowed={cfg.revealsAllowed}
            moves={moves}
            seedId={puzzle.id}
            onChangeDifficulty={handleChangeDifficulty}
          />
        </aside>
      </main>

      <footer className="mt-xl text-xs text-text-secondary">
        © 2026 RABID NYC
      </footer>

      <CompletionModal
        open={completion.isOpen}
        onPlayAgain={() => {
          sound.playSound('modal-close')
          completion.closeModal()
          // Picture mode: reset the same puzzle. Practice mode: generate new one.
          if (initialPicture) resetBoard()
          else startNewPuzzle()
        }}
        onReturnToMenu={() => {
          sound.playSound('modal-close')
          completion.closeModal()
          onReturnToMenu?.()
        }}
        seconds={completion.result?.seconds ?? 0}
        medal={completion.result?.medal ?? 'none'}
        gainedXP={completion.result?.gainedXP ?? 0}
        levelUp={completion.result?.levelUp ?? null}
        newlyUnlocked={completion.result?.newlyUnlocked}
        soundEnabled={soundEnabled}
        picture={initialPicture}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => {
          sound.playSound('modal-close')
          setSettingsOpen(false)
        }}
        settings={profile.get().settings}
        onChange={(next) => profile.setSettings(next)}
      />

      <ParticleEffect trigger={showParticles} count={30} />
    </div>
  )
}
