/**
 * useSound
 *
 * Thin React hook that wires together four focused utility modules:
 *
 *   audioContext   — shared Web Audio API context lifecycle
 *   audioCache     — HTMLAudioElement preloading + cloning
 *   fallbackSounds — Web Audio API beeps and generated background tune
 *   musicManager   — background music play / stop / fade state machine
 *
 * The public API surface is unchanged from the previous monolithic version,
 * so all existing call sites (AudioSplash, MainMenu, App) work without
 * modification.
 */

import { useCallback, useEffect } from 'react'
import type { SoundEffect } from '../lib/sounds'
import { SOUND_VOLUMES } from '../lib/sounds'
import { getAudioContext, resumeAudioContext } from '../lib/audioContext'
import {
  preloadSound as cachePreload,
  preloadAll as cachePreloadAll,
  getPlayableClone,
} from '../lib/audioCache'
import {
  playFallbackSound,
  startGeneratedTune,
  stopGeneratedTune,
  isGeneratedTunePlaying,
} from '../lib/fallbackSounds'
import {
  playMusicTrack,
  stopMusicTrack,
  fadeMusicTrack,
  isAutoplayBlocked,
} from '../lib/musicManager'

export function useSound(enabled: boolean) {
  // Eagerly initialise the AudioContext so it's ready before the first
  // user interaction (avoids a small latency spike on the first beep).
  useEffect(() => {
    getAudioContext()
  }, [])

  // ---------------------------------------------------------------------------
  // Sound effects
  // ---------------------------------------------------------------------------

  const playSound = useCallback(
    (sound: SoundEffect, options?: { volume?: number; useFallback?: boolean }) => {
      if (!enabled) return

      const volume = options?.volume ?? SOUND_VOLUMES[sound]
      const clone = getPlayableClone(sound, volume)

      if (clone) {
        clone.play().catch(() => {
          if (options?.useFallback !== false) {
            const ctx = getAudioContext()
            if (ctx) playFallbackSound(ctx, sound, volume)
          }
        })
        return
      }

      // No cached element available — go straight to Web Audio fallback
      if (options?.useFallback !== false) {
        const ctx = getAudioContext()
        if (ctx) playFallbackSound(ctx, sound, volume)
      }
    },
    [enabled]
  )

  // ---------------------------------------------------------------------------
  // Background music (HTMLAudioElement-based)
  // ---------------------------------------------------------------------------

  const playMusic = useCallback(
    async (
      sound: SoundEffect,
      options?: { volume?: number; loop?: boolean; allowAfterAutoplayBlock?: boolean }
    ): Promise<void> => {
      if (!enabled) throw new Error('Sound is disabled')
      await playMusicTrack(sound, options ?? {})
    },
    [enabled]
  )

  const stopMusic = useCallback(() => {
    stopMusicTrack()
    stopGeneratedTune()
  }, [])

  const fadeOutMusic = useCallback((duration: number = 1000): Promise<void> => {
    stopGeneratedTune()
    return fadeMusicTrack(duration)
  }, [])

  // ---------------------------------------------------------------------------
  // Preloading
  // ---------------------------------------------------------------------------

  const preloadSound = useCallback((sound: SoundEffect) => {
    cachePreload(sound)
  }, [])

  const preloadAll = useCallback(() => {
    cachePreloadAll()
  }, [])

  // ---------------------------------------------------------------------------
  // Audio context unlock (called on the user's first interaction)
  // ---------------------------------------------------------------------------

  const unlockAudio = useCallback(() => {
    resumeAudioContext().catch(() => {})
  }, [])

  // ---------------------------------------------------------------------------
  // Generated background tune (Web Audio API fallback for intro-song)
  // ---------------------------------------------------------------------------

  const playGeneratedTune = useCallback(
    async (options?: {
      volume?: number
      allowAfterAutoplayBlock?: boolean
    }): Promise<void> => {
      if (!enabled) throw new Error('Sound is disabled')

      const { volume = 0.3, allowAfterAutoplayBlock = false } = options ?? {}

      if (!allowAfterAutoplayBlock && isAutoplayBlocked()) {
        throw new Error('Autoplay was blocked — requires user interaction')
      }

      if (isGeneratedTunePlaying()) return

      const ctx = getAudioContext()
      if (!ctx) throw new Error('AudioContext not available')

      await resumeAudioContext()
      startGeneratedTune(ctx, volume)
    },
    [enabled]
  )

  return {
    playSound,
    playMusic,
    stopMusic,
    fadeOutMusic,
    preloadSound,
    preloadAll,
    unlockAudio,
    playGeneratedTune,
  }
}
