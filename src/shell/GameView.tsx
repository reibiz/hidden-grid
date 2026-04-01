/**
 * GameView
 *
 * Thin wrapper that mounts App inside the Shell navigation context.
 * Supports both practice mode (difficulty only) and picture mode
 * (a specific PuzzlePicture passed as initialPicture).
 */

import App from '../App'
import type { DifficultyKey } from '../lib/progression'
import type { PuzzlePicture } from '../lib/puzzlePictures'

interface GameViewProps {
  difficulty: DifficultyKey
  picture?: PuzzlePicture   // present in picture mode, absent in practice mode
  onExit: () => void
}

export default function GameView({ difficulty, picture, onExit }: GameViewProps) {
  return (
    <App
      initialDifficultyOverride={difficulty}
      initialPicture={picture}
      onReturnToMenu={onExit}
    />
  )
}
