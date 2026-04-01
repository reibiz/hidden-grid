/**
 * Music Manager
 *
 * Module-level singleton that manages background music playback.
 *
 * Why module scope instead of React state or a hook ref?
 * React StrictMode double-invokes effects (mount → unmount → mount), which
 * causes hook-local refs to reset between invocations. Module-level state
 * persists across React's lifecycle and ensures exactly one music track
 * plays at a time, even when multiple useSound hook instances are active
 * (e.g. AudioSplash, MainMenu, and App all mount useSound concurrently).
 */

import type { SoundEffect } from './sounds'
import { SOUND_PATHS, SOUND_VOLUMES } from './sounds'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let activeAudio: HTMLAudioElement | null = null
let isPlaying = false
let autoplayBlocked = false
let fadeInterval: ReturnType<typeof setInterval> | null = null

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function cancelFade(): void {
  if (fadeInterval !== null) {
    clearInterval(fadeInterval)
    fadeInterval = null
  }
}

function clearActiveAudio(): void {
  cancelFade()
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
    activeAudio.loop = false
    activeAudio = null
  }
  isPlaying = false
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function isMusicPlaying(): boolean {
  return isPlaying
}

export function isAutoplayBlocked(): boolean {
  return autoplayBlocked
}

/**
 * Plays a music track, stopping any currently playing audio first.
 *
 * Rejects when:
 *   - autoplay was previously blocked and allowAfterAutoplayBlock is false
 *   - a play attempt is already in progress (isPlaying guard)
 *   - the browser's autoplay policy blocks the play() call (NotAllowedError)
 *
 * On success, sets isPlaying = true and keeps it set while the track plays.
 */
export async function playMusicTrack(
  sound: SoundEffect,
  options: {
    volume?: number
    loop?: boolean
    allowAfterAutoplayBlock?: boolean
  } = {}
): Promise<void> {
  const {
    volume = SOUND_VOLUMES[sound],
    loop = true,
    allowAfterAutoplayBlock = false,
  } = options

  if (!allowAfterAutoplayBlock && autoplayBlocked) {
    throw new Error('Autoplay was blocked — requires user interaction')
  }

  if (isPlaying) {
    throw new Error('Music already starting')
  }

  clearActiveAudio()
  isPlaying = true

  const audio = new Audio(SOUND_PATHS[sound])
  audio.volume = volume
  audio.loop = loop
  audio.preload = 'auto'
  activeAudio = audio

  try {
    await audio.play()
  } catch (err) {
    activeAudio = null
    isPlaying = false
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      autoplayBlocked = true
    }
    throw err
  }
}

/** Stops the currently playing music track immediately, cancelling any active fade. */
export function stopMusicTrack(): void {
  clearActiveAudio()
}

/**
 * Fades out the current music track over `duration` milliseconds.
 * Resolves immediately if no track is playing.
 * Uses a quadratic (ease-in) curve for a natural-sounding fade.
 */
export function fadeMusicTrack(duration: number = 1000): Promise<void> {
  if (!activeAudio || activeAudio.paused) {
    isPlaying = false
    return Promise.resolve()
  }

  cancelFade()

  const audio = activeAudio
  // Fallback: if volume was 0 for some reason, use the sound's default
  const startVolume = audio.volume > 0 ? audio.volume : SOUND_VOLUMES['intro-song']
  const startTime = Date.now()

  return new Promise<void>((resolve) => {
    fadeInterval = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)

      // Quadratic ease-in: perceived volume drops naturally
      try {
        audio.volume = Math.max(0, startVolume * (1 - progress) * (1 - progress))
      } catch {
        // HTMLAudioElement may have been garbage-collected; stop the interval
        cancelFade()
        resolve()
        return
      }

      if (progress >= 1) {
        cancelFade()
        audio.pause()
        audio.currentTime = 0
        audio.volume = startVolume // restore for potential future plays
        if (activeAudio === audio) activeAudio = null
        isPlaying = false
        resolve()
      }
    }, 16) // ~60 fps for smooth volume interpolation
  })
}
