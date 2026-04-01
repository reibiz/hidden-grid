/**
 * Audio Cache
 *
 * Module-level cache for preloaded HTMLAudioElement instances.
 * Sharing the cache across all useSound hook instances avoids redundant
 * network requests — sounds preloaded by one component (e.g. App) are
 * immediately available to another (e.g. MainMenu).
 */

import type { SoundEffect } from './sounds'
import { SOUND_PATHS, SOUND_VOLUMES } from './sounds'

const cache = new Map<SoundEffect, HTMLAudioElement>()

/** Preloads a single sound into the cache. No-op if already cached. */
export function preloadSound(sound: SoundEffect): void {
  if (cache.has(sound)) return
  try {
    const audio = new Audio(SOUND_PATHS[sound])
    audio.volume = SOUND_VOLUMES[sound]
    audio.preload = 'auto'
    cache.set(sound, audio)
  } catch (error) {
    console.warn(`Failed to preload sound: ${sound}`, error)
  }
}

/** Preloads all registered sound effects. */
export function preloadAll(): void {
  for (const sound of Object.keys(SOUND_PATHS) as SoundEffect[]) {
    preloadSound(sound)
  }
}

/**
 * Returns a volume-adjusted clone of a cached audio element, ready to play.
 * If the sound is not yet cached, creates and caches it on demand.
 * Returns null only if the Audio constructor throws (e.g. invalid src).
 */
export function getPlayableClone(sound: SoundEffect, volume: number): HTMLAudioElement | null {
  let source = cache.get(sound)

  if (!source) {
    try {
      source = new Audio(SOUND_PATHS[sound])
      source.volume = SOUND_VOLUMES[sound]
      source.preload = 'auto'
      cache.set(sound, source)
    } catch {
      return null
    }
  }

  const clone = source.cloneNode() as HTMLAudioElement
  clone.volume = volume
  return clone
}
