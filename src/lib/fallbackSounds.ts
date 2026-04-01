/**
 * Fallback Sounds
 *
 * Web Audio API-based sound synthesis used when audio files are unavailable
 * or fail to load. Also provides the procedurally generated background tune
 * that plays when the intro-song audio file cannot be played.
 *
 * All functions require a live (non-closed) AudioContext from audioContext.ts.
 */

import type { SoundEffect } from './sounds'

// ---------------------------------------------------------------------------
// Primitive: single oscillator beep
// ---------------------------------------------------------------------------

function playBeep(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.frequency.value = frequency
  osc.type = 'sine'

  // Short attack + exponential decay for a natural, non-clicky sound
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

// ---------------------------------------------------------------------------
// Fallback sound dispatch table
// ---------------------------------------------------------------------------

type FallbackFn = (ctx: AudioContext, volume: number) => void

const FALLBACK_SOUNDS: Record<SoundEffect, FallbackFn> = {
  'cell-fill':        (ctx, v) => playBeep(ctx, 440, 0.1, v),
  'cell-mark':        (ctx, v) => playBeep(ctx, 220, 0.1, v),
  'cell-clear':       (ctx, v) => playBeep(ctx, 330, 0.08, v),
  'row-complete':     (ctx, v) => {
    playBeep(ctx, 523.25, 0.15, v)
    setTimeout(() => playBeep(ctx, 659.25, 0.15, v), 50)
    setTimeout(() => playBeep(ctx, 783.99, 0.15, v), 100)
  },
  'col-complete':     (ctx, v) => {
    playBeep(ctx, 523.25, 0.15, v)
    setTimeout(() => playBeep(ctx, 659.25, 0.15, v), 50)
    setTimeout(() => playBeep(ctx, 783.99, 0.15, v), 100)
  },
  'puzzle-solved':    (ctx, v) => {
    playBeep(ctx, 523.25, 0.2, v)
    setTimeout(() => playBeep(ctx, 659.25, 0.2, v), 100)
    setTimeout(() => playBeep(ctx, 783.99, 0.2, v), 200)
    setTimeout(() => playBeep(ctx, 1046.50, 0.3, v), 300)
  },
  'button-click':     (ctx, v) => playBeep(ctx, 800, 0.05, v * 0.5),
  'modal-open':       (ctx, v) => playBeep(ctx, 600, 0.2, v),
  'modal-close':      (ctx, v) => playBeep(ctx, 400, 0.2, v),
  'error':            (ctx, v) => {
    playBeep(ctx, 440, 0.1, v)
    setTimeout(() => playBeep(ctx, 392, 0.1, v), 100)
    setTimeout(() => playBeep(ctx, 349, 0.1, v), 200)
  },
  'level-up':         (ctx, v) => {
    playBeep(ctx, 523.25, 0.15, v)
    setTimeout(() => playBeep(ctx, 587.33, 0.15, v), 80)
    setTimeout(() => playBeep(ctx, 659.25, 0.15, v), 160)
    setTimeout(() => playBeep(ctx, 783.99, 0.2, v), 240)
  },
  'streak-milestone': (ctx, v) => {
    playBeep(ctx, 659.25, 0.2, v)
    setTimeout(() => playBeep(ctx, 783.99, 0.2, v), 100)
    setTimeout(() => playBeep(ctx, 987.77, 0.3, v), 200)
  },
  // intro-song is handled by startGeneratedTune, not a beep fallback
  'intro-song': () => {},
}

/**
 * Plays a Web Audio API fallback for the given sound effect.
 * Resumes a suspended AudioContext before playing if needed.
 */
export function playFallbackSound(
  ctx: AudioContext,
  sound: SoundEffect,
  volume: number
): void {
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  FALLBACK_SOUNDS[sound]?.(ctx, volume)
}

// ---------------------------------------------------------------------------
// Generated background tune (C-major arpeggio, loops every ~4.4s)
// ---------------------------------------------------------------------------

const TUNE_NOTES = [
  { freq: 261.63,  time: 0,   duration: 0.3 }, // C4
  { freq: 329.63,  time: 0.3, duration: 0.3 }, // E4
  { freq: 392.00,  time: 0.6, duration: 0.3 }, // G4
  { freq: 523.25,  time: 0.9, duration: 0.4 }, // C5
  { freq: 659.25,  time: 1.3, duration: 0.3 }, // E5
  { freq: 783.99,  time: 1.6, duration: 0.3 }, // G5
  { freq: 1046.50, time: 1.9, duration: 0.5 }, // C6
  { freq: 783.99,  time: 2.4, duration: 0.3 }, // G5
  { freq: 659.25,  time: 2.7, duration: 0.3 }, // E5
  { freq: 523.25,  time: 3.0, duration: 0.4 }, // C5
  { freq: 392.00,  time: 3.4, duration: 0.3 }, // G4
  { freq: 329.63,  time: 3.7, duration: 0.3 }, // E4
  { freq: 261.63,  time: 4.0, duration: 0.4 }, // C4
] as const

const LOOP_DURATION_MS = 4400
const ATTACK_TIME = 0.05
const RELEASE_TIME = 0.1

let tuneInterval: ReturnType<typeof setInterval> | null = null

function scheduleTuneLoop(ctx: AudioContext, volume: number): void {
  const startTime = ctx.currentTime
  for (const note of TUNE_NOTES) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value = note.freq
    osc.type = 'sine'

    const t = startTime + note.time
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + ATTACK_TIME)
    gain.gain.setValueAtTime(volume, t + note.duration - RELEASE_TIME)
    gain.gain.linearRampToValueAtTime(0, t + note.duration)

    osc.start(t)
    osc.stop(t + note.duration)
  }
}

/**
 * Starts the looping generated background tune.
 * Stops any previously running tune first.
 * The AudioContext is resumed if suspended before scheduling notes.
 */
export function startGeneratedTune(ctx: AudioContext, volume: number): void {
  stopGeneratedTune()

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  scheduleTuneLoop(ctx, volume)

  tuneInterval = setInterval(() => {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    scheduleTuneLoop(ctx, volume)
  }, LOOP_DURATION_MS)
}

/** Stops the generated background tune loop immediately. */
export function stopGeneratedTune(): void {
  if (tuneInterval !== null) {
    clearInterval(tuneInterval)
    tuneInterval = null
  }
}

/** Returns true if the generated tune is currently scheduled to loop. */
export function isGeneratedTunePlaying(): boolean {
  return tuneInterval !== null
}
