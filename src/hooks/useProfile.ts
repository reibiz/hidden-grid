import { useEffect, useState } from 'react'
import { levelFromXP, DIFFICULTY_CONFIG, type DifficultyKey } from '../lib/progression'
import { defaultStats, type Stats } from '../lib/stats'
import { defaultAchievements, type AchievementState } from '../lib/achievements'

export interface PlayerSettings {
  difficulty:         DifficultyKey
  theme?:             'dark' | 'light'
  // ── Sounds ──────────────────────────────────────────────────────────────────
  sound?:             boolean   // master sound on/off (legacy, kept for compat)
  melodyVolume?:      number    // 0-100, default 80
  effectsVolume?:     number    // 0-100, default 80
  autoMute?:          boolean   // default false
  // ── Game ────────────────────────────────────────────────────────────────────
  autoRemoveMarkers?: boolean   // default false
  useHints?:          boolean   // default true
  showImageNames?:    boolean   // default true
  useLevelBestScore?: boolean   // default false
  // ── Interface ───────────────────────────────────────────────────────────────
  showStatusBar?:     boolean   // default true
  numberTabDelay?:    number    // ms, 0-2000, default 500
  showTimer?:         boolean   // default true  (hide = false)
  // ── Advanced ────────────────────────────────────────────────────────────────
  gameCenter?:        boolean   // default false
}

export interface PlayerProfile {
  xp: number
  totalSolved: number
  medals: { bronze: number; silver: number; gold: number }
  settings: PlayerSettings
  streak: { current: number; best: number; lastSolvedDate: string | null }
  achievements: AchievementState
  stats: Stats
  picturesSolved: string[]        // IDs of solved picture puzzles
  lastDailyBonusDate?: string | null
  profileVersion?: number
}

const PROFILE_VERSION = 2

const DEFAULT_PROFILE: PlayerProfile = {
  xp: 0,
  totalSolved: 0,
  medals: { bronze: 0, silver: 0, gold: 0 },
  settings: {
    difficulty:         'easy',
    theme:              'dark',
    sound:              true,
    melodyVolume:       80,
    effectsVolume:      80,
    autoMute:           false,
    autoRemoveMarkers:  false,
    useHints:           true,
    showImageNames:     true,
    useLevelBestScore:  false,
    showStatusBar:      true,
    numberTabDelay:     500,
    showTimer:          true,
    gameCenter:         false,
  },
  streak: { current: 0, best: 0, lastSolvedDate: null },
  achievements: defaultAchievements(),
  stats: defaultStats(),
  picturesSolved: [],
  lastDailyBonusDate: null,
  profileVersion: PROFILE_VERSION,
}

const LEGACY_DIFFICULTY_MAP: Record<string, DifficultyKey> = {
  beginner: 'easy',
  medium: 'medium',
  hard: 'hard',
}

const KEY = 'hidden-grid-profile'

function mapDifficultyKey(raw?: string | null): DifficultyKey | undefined {
  if (!raw) return undefined
  if (Object.prototype.hasOwnProperty.call(DIFFICULTY_CONFIG, raw)) {
    return raw as DifficultyKey
  }
  if (raw in LEGACY_DIFFICULTY_MAP) {
    return LEGACY_DIFFICULTY_MAP[raw]
  }
  return undefined
}

function normalizeDifficultySetting(raw?: string | null): DifficultyKey {
  return mapDifficultyKey(raw) ?? DEFAULT_PROFILE.settings.difficulty
}

function mergeNumberRecord(
  source: Record<string, number> | undefined,
  target: Record<DifficultyKey, number>
) {
  if (!source) return
  Object.entries(source).forEach(([key, value]) => {
    if (typeof value !== 'number') return
    const mapped = mapDifficultyKey(key)
    if (!mapped) return
    target[mapped] += value
  })
}

function mergeBestTimeRecord(
  source: Record<string, number | null> | undefined,
  target: Record<DifficultyKey, number | null>
) {
  if (!source) return
  Object.entries(source).forEach(([key, value]) => {
    if (value === null || typeof value !== 'number') return
    const mapped = mapDifficultyKey(key)
    if (!mapped) return
    const current = target[mapped]
    if (current === null || value < current) {
      target[mapped] = value
    }
  })
}

function mergeScoreRecord(
  source: Record<string, number> | undefined,
  target: Record<DifficultyKey, number>
) {
  if (!source) return
  Object.entries(source).forEach(([key, value]) => {
    if (typeof value !== 'number') return
    const mapped = mapDifficultyKey(key)
    if (!mapped) return
    target[mapped] = Math.max(target[mapped], value)
  })
}

function normalizeStats(stats?: Stats): Stats {
  const normalized: Stats = {
    solvesByDifficulty: { ...DEFAULT_PROFILE.stats.solvesByDifficulty },
    timeTotalsByDifficulty: { ...DEFAULT_PROFILE.stats.timeTotalsByDifficulty },
    perfectSolves: stats?.perfectSolves ?? DEFAULT_PROFILE.stats.perfectSolves,
    bestTime: { ...DEFAULT_PROFILE.stats.bestTime },
    bestScoreByDifficulty: { ...DEFAULT_PROFILE.stats.bestScoreByDifficulty },
    highestScore: stats?.highestScore ?? DEFAULT_PROFILE.stats.highestScore,
  }

  mergeNumberRecord(stats?.solvesByDifficulty, normalized.solvesByDifficulty)
  mergeNumberRecord(stats?.timeTotalsByDifficulty, normalized.timeTotalsByDifficulty)
  mergeBestTimeRecord(stats?.bestTime, normalized.bestTime)
  mergeScoreRecord(stats?.bestScoreByDifficulty, normalized.bestScoreByDifficulty)
  const mergedHighestScore = Math.max(stats?.highestScore ?? 0, ...Object.values(normalized.bestScoreByDifficulty))
  normalized.highestScore = Math.max(normalized.highestScore, mergedHighestScore)

  return normalized
}

function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_PROFILE }
    const parsed = JSON.parse(raw) as PlayerProfile
    const normalizedDifficulty = normalizeDifficultySetting(parsed.settings?.difficulty)
    const normalizedStats = normalizeStats(parsed.stats)
    const needsReset = parsed.profileVersion !== PROFILE_VERSION
    const statsToUse = needsReset ? defaultStats() : normalizedStats
    const totalSolved = needsReset ? 0 : parsed.totalSolved ?? DEFAULT_PROFILE.totalSolved
    const medals = needsReset ? { ...DEFAULT_PROFILE.medals } : { ...DEFAULT_PROFILE.medals, ...(parsed.medals || {}) }
    return { ...DEFAULT_PROFILE, ...parsed,
      totalSolved,
      medals,
      settings: { ...DEFAULT_PROFILE.settings, ...(parsed.settings||{}), difficulty: normalizedDifficulty },
      streak: { ...DEFAULT_PROFILE.streak, ...(parsed.streak||{}) },
      achievements: { ...DEFAULT_PROFILE.achievements, ...(parsed.achievements||{}) },
      stats: statsToUse,
      picturesSolved: Array.isArray(parsed.picturesSolved) ? parsed.picturesSolved : [],
      profileVersion: PROFILE_VERSION,
    }
  } catch { return { ...DEFAULT_PROFILE } }
}

function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile())

  // Sync profile to localStorage whenever it changes
  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  const get = () => profile

  const updateProfile = (updater: (prev: PlayerProfile) => PlayerProfile) => {
    setProfile(prev => updater(prev))
  }

  const addXP = (amount: number) => {
    updateProfile(prev => ({
      ...prev,
      xp: Math.max(0, prev.xp + amount)
    }))
  }

  const addMedal = (kind: 'bronze' | 'silver' | 'gold') => {
    updateProfile(prev => ({
      ...prev,
      medals: { ...prev.medals, [kind]: prev.medals[kind] + 1 }
    }))
  }

  const incrementSolved = () => {
    updateProfile(prev => ({
      ...prev,
      totalSolved: prev.totalSolved + 1
    }))
  }

  const setDifficulty = (d: DifficultyKey) => {
    updateProfile(prev => ({
      ...prev,
      settings: { ...prev.settings, difficulty: d }
    }))
  }

  const loadLevel = () => levelFromXP(profile.xp)

  const setSettings = (next: Partial<PlayerProfile['settings']>) => {
    updateProfile(prev => ({
      ...prev,
      settings: { ...prev.settings, ...next }
    }))
  }

  const setStreak = (next: PlayerProfile['streak']) => {
    updateProfile(prev => ({
      ...prev,
      streak: next
    }))
  }

  const setAchievements = (next: AchievementState) => {
    updateProfile(prev => ({
      ...prev,
      achievements: next
    }))
  }

  const setStats = (next: Stats) => {
    updateProfile(prev => ({
      ...prev,
      stats: next
    }))
  }

  const setLastDailyBonusDate = (dateISO: string) => {
    updateProfile(prev => ({
      ...prev,
      lastDailyBonusDate: dateISO
    }))
  }

  const markPictureSolved = (id: string) => {
    updateProfile(prev => {
      if (prev.picturesSolved.includes(id)) return prev
      return { ...prev, picturesSolved: [...prev.picturesSolved, id] }
    })
  }

  return {
    get,
    addXP,
    addMedal,
    incrementSolved,
    setDifficulty,
    loadLevel,
    setSettings,
    setStreak,
    setAchievements,
    setStats,
    setLastDailyBonusDate,
    markPictureSolved,
  }
}
