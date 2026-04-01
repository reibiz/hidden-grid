/**
 * BrowseView
 *
 * Two-level browser for Picture Puzzle mode:
 *
 *   Level 1 — Category grid: emoji + name + puzzle count + solved count
 *   Level 2 — Puzzle list:   title + size badge + ✓ checkmark if solved
 *
 * State is local — no routing needed since Shell manages screens.
 */

import { useState } from 'react'
import {
  PICTURE_LIBRARY,
  CATEGORY_ORDER,
  CATEGORY_EMOJI,
  picturesByCategory,
  populatedCategories,
  type PictureCategory,
  type PuzzlePicture,
} from '../lib/puzzlePictures'
import { useSound } from '../hooks/useSound'

// ─── Props ────────────────────────────────────────────────────────────────────

interface BrowseViewProps {
  solvedIds:  string[]              // IDs already solved — from profile.picturesSolved
  soundOn:    boolean
  onSelect:   (picture: PuzzlePicture) => void
  onBack:     () => void            // returns to main menu
}

// ─── BrowseView ───────────────────────────────────────────────────────────────

export default function BrowseView({
  solvedIds,
  soundOn,
  onSelect,
  onBack,
}: BrowseViewProps) {
  const [activeCategory, setActiveCategory] = useState<PictureCategory | null>(null)
  const sound = useSound(soundOn)
  const categories = populatedCategories()

  const handleBack = () => {
    sound.playSound('button-click')
    if (activeCategory) {
      setActiveCategory(null)
    } else {
      onBack()
    }
  }

  const handleSelectPicture = (picture: PuzzlePicture) => {
    sound.playSound('button-click')
    onSelect(picture)
  }

  const handleSelectCategory = (category: PictureCategory) => {
    sound.playSound('button-click')
    setActiveCategory(category)
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm flex flex-col gap-5">

        {/* Header */}
        <header className="flex items-center gap-3">
          <button
            className="btn btn-secondary text-sm"
            onClick={handleBack}
            aria-label="Back"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-text-primary">
            {activeCategory ?? 'Picture Puzzles'}
          </h1>
        </header>

        {/* Progress summary */}
        <div className="text-xs text-text-muted text-right">
          {solvedIds.length} / {PICTURE_LIBRARY.length} solved
        </div>

        {/* Category grid */}
        {!activeCategory && (
          <div className="flex flex-col gap-2">
            {categories.map(category => {
              const pictures = picturesByCategory(category)
              const solved   = pictures.filter(p => solvedIds.includes(p.id)).length
              const total    = pictures.length
              const allDone  = solved === total

              return (
                <button
                  key={category}
                  className="btn btn-secondary w-full flex items-center justify-between text-sm py-3"
                  onClick={() => handleSelectCategory(category)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_EMOJI[category]}</span>
                    <span className="font-medium">{category}</span>
                  </span>
                  <span className={`text-xs font-mono ${allDone ? 'text-primary' : 'text-text-muted'}`}>
                    {solved}/{total} {allDone ? '✓' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Puzzle list */}
        {activeCategory && (
          <div className="flex flex-col gap-2">
            {picturesByCategory(activeCategory).map(picture => {
              const solved = solvedIds.includes(picture.id)

              return (
                <button
                  key={picture.id}
                  className="btn btn-secondary w-full flex items-center justify-between text-sm py-3"
                  onClick={() => handleSelectPicture(picture)}
                >
                  <span className="font-medium">
                    {picture.title}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="font-mono">{picture.size}×{picture.size}</span>
                    {solved && (
                      <span className="text-primary font-bold">✓</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
