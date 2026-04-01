import { useCallback, useEffect, useState } from 'react'
import MainMenu from '../ui/MainMenu'
import GameView from './GameView'
import TutorialView from '../ui/TutorialView'
import BrowseView from '../ui/BrowseView'
import { useProfile, type PlayerSettings } from '../hooks/useProfile'
import { levelFromXP, titleForLevel, type DifficultyKey } from '../lib/progression'
import type { PuzzlePicture } from '../lib/puzzlePictures'
import { SIZE_TO_DIFFICULTY } from '../lib/puzzlePictures'

type Screen = 'menu' | 'game' | 'tutorial' | 'browse'

export default function Shell() {
  const profile = useProfile()

  const [soundOn, setSoundOnState] = useState<boolean>(
    () => profile.get().settings.sound !== false
  )
  const [screen, setScreen] = useState<Screen>('menu')
  const [difficulty, setDifficulty] = useState<DifficultyKey>(
    () => profile.get().settings.difficulty
  )
  // Picture mode — null means practice mode
  const [currentPicture, setCurrentPicture] = useState<PuzzlePicture | null>(null)

  // Persist sound changes to the player profile.
  const setSoundOn = (v: boolean) => {
    setSoundOnState(v)
    profile.setSettings({ sound: v })
  }

  // Full settings update — also keeps local soundOn in sync.
  const handleUpdateSettings = (next: Partial<PlayerSettings>) => {
    profile.setSettings(next)
    if ('sound' in next && typeof next.sound === 'boolean') {
      setSoundOnState(next.sound)
    }
  }

  const openTutorial    = useCallback(() => setScreen('tutorial'), [])
  const openBrowse      = useCallback(() => setScreen('browse'),   [])

  const handleTutorialComplete = useCallback(() => setScreen('menu'), [])

  // Practice mode: random puzzle at chosen difficulty
  const startPracticeGame = (selectedDifficulty: DifficultyKey) => {
    profile.setDifficulty(selectedDifficulty)
    setDifficulty(selectedDifficulty)
    setCurrentPicture(null)
    setScreen('game')
  }

  // Picture mode: start a specific picture puzzle
  const startPictureGame = useCallback((picture: PuzzlePicture) => {
    const d = SIZE_TO_DIFFICULTY[picture.size]
    setDifficulty(d)
    setCurrentPicture(picture)
    setScreen('game')
  }, [])

  // Re-read the difficulty from the profile when the player returns to the
  // menu, so the last-used difficulty is always pre-selected.
  useEffect(() => {
    if (screen === 'menu') {
      setDifficulty(profile.get().settings.difficulty)
    }
  }, [screen, profile])

  // When exiting a game, return to browse if we came from there, else menu.
  const handleGameExit = useCallback(() => {
    setScreen(currentPicture ? 'browse' : 'menu')
  }, [currentPicture])

  // ── Tutorial ─────────────────────────────────────────────────────────────────
  if (screen === 'tutorial') {
    return (
      <TutorialView
        onComplete={handleTutorialComplete}
        soundOn={soundOn}
      />
    )
  }

  // ── Browse ───────────────────────────────────────────────────────────────────
  if (screen === 'browse') {
    return (
      <BrowseView
        solvedIds={profile.get().picturesSolved}
        soundOn={soundOn}
        onSelect={startPictureGame}
        onBack={() => setScreen('menu')}
      />
    )
  }

  // ── Menu ────────────────────────────────────────────────────────────────────
  if (screen === 'menu') {
    const snapshot = profile.get()
    const lvl = levelFromXP(snapshot.xp)

    return (
      <MainMenu
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        settings={snapshot.settings}
        onUpdateSettings={handleUpdateSettings}
        level={lvl.level}
        xpInto={lvl.intoLevel}
        xpNext={lvl.nextLevelXP}
        title={titleForLevel(lvl.level)}
        onStartGame={startPracticeGame}
        onOpenTutorial={openTutorial}
        onOpenPuzzles={openBrowse}
        stats={snapshot.stats}
      />
    )
  }

  // ── Game ────────────────────────────────────────────────────────────────────
  return (
    <GameView
      difficulty={difficulty}
      picture={currentPicture ?? undefined}
      onExit={handleGameExit}
    />
  )
}
