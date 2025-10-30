import { levelFromXP } from '../lib/progression'
import { defaultStats, type Stats } from '../lib/stats'
import { defaultAchievements, type AchievementState } from '../lib/achievements'

export interface PlayerProfile {
  xp: number
  totalSolved: number
  medals: { bronze: number; silver: number; gold: number }
  settings: { difficulty: 'beginner' | 'medium' | 'hard'; theme?: 'dark'|'light'; showTimer?: boolean; sound?: boolean }
  streak: { current: number; best: number; lastSolvedDate: string | null }
  achievements: AchievementState
  stats: Stats
  lastDailyBonusDate?: string | null
}

const DEFAULT_PROFILE: PlayerProfile = {
  xp: 0,
  totalSolved: 0,
  medals: { bronze: 0, silver: 0, gold: 0 },
  settings: { difficulty: 'beginner', theme: 'dark', showTimer: true, sound: true },
  streak: { current: 0, best: 0, lastSolvedDate: null },
  achievements: defaultAchievements(),
  stats: defaultStats(),
  lastDailyBonusDate: null,
}

const KEY = 'hidden-grid-profile'

export function useProfile() {
  function load(): PlayerProfile {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { ...DEFAULT_PROFILE }
      const parsed = JSON.parse(raw) as PlayerProfile
      return { ...DEFAULT_PROFILE, ...parsed,
        medals: { ...DEFAULT_PROFILE.medals, ...(parsed.medals||{}) },
        settings: { ...DEFAULT_PROFILE.settings, ...(parsed.settings||{}) },
        streak: { ...DEFAULT_PROFILE.streak, ...(parsed.streak||{}) },
        achievements: { ...DEFAULT_PROFILE.achievements, ...(parsed.achievements||{}) },
        stats: { ...DEFAULT_PROFILE.stats, ...(parsed.stats||{}) },
      }
    } catch { return { ...DEFAULT_PROFILE } }
  }
  function save(p: PlayerProfile) { try { localStorage.setItem(KEY, JSON.stringify(p)) } catch {} return p }
  function get() { return load() }
  function addXP(amount: number) { const p = load(); p.xp = Math.max(0, p.xp + amount); return save(p) }
  function addMedal(kind: 'bronze' | 'silver' | 'gold') { const p = load(); p.medals[kind]++; return save(p) }
  function incrementSolved() { const p = load(); p.totalSolved++; return save(p) }
  function setDifficulty(d: 'beginner' | 'medium' | 'hard') { const p = load(); p.settings.difficulty = d; return save(p) }
  function loadLevel() { const p = load(); return levelFromXP(p.xp) }
  function setSettings(next: Partial<PlayerProfile['settings']>) { const p = load(); p.settings = { ...p.settings, ...next }; return save(p) }
  function setStreak(next: PlayerProfile['streak']) { const p = load(); p.streak = next; return save(p) }
  function setAchievements(next: AchievementState) { const p = load(); p.achievements = next; return save(p) }
  function setStats(next: Stats) { const p = load(); p.stats = next; return save(p) }
  function setLastDailyBonusDate(dateISO: string) { const p = load(); p.lastDailyBonusDate = dateISO; return save(p) }
  return { get, save, addXP, addMedal, incrementSolved, setDifficulty, loadLevel, setSettings, setStreak, setAchievements, setStats, setLastDailyBonusDate }
}
