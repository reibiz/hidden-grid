/**
 * AudioContext Singleton
 *
 * Manages the shared Web Audio API context for the entire app session.
 * A module-level singleton is preferred over per-component instances because
 * browsers enforce a limit on the number of concurrent AudioContext objects,
 * and the context should outlive any individual React component.
 *
 * Uses a Window type augmentation to handle the webkit-prefixed constructor
 * without resorting to `any`.
 */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

let sharedContext: AudioContext | null = null

/**
 * Returns the shared AudioContext, creating it on first call.
 * Returns null in SSR environments or when the Web Audio API is unavailable.
 */
export function getAudioContext(): AudioContext | null {
  if (sharedContext && sharedContext.state !== 'closed') return sharedContext
  if (typeof window === 'undefined') return null

  const Ctor = window.AudioContext ?? window.webkitAudioContext
  if (!Ctor) return null

  sharedContext = new Ctor()
  return sharedContext
}

/**
 * Resumes the shared AudioContext if it has been suspended by the browser's
 * autoplay policy. Safe to call multiple times; no-ops if already running.
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx?.state === 'suspended') {
    await ctx.resume().catch(() => {})
  }
}
