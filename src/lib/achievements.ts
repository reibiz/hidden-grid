import type { DifficultyKey, Medal } from './progression'
export type AchievementId = 'first_gold' | 'fast_thinker' | 'week_warrior' | 'sampler'
export interface AchievementState { [id: string]: { unlocked: boolean; date?: string } }
export function defaultAchievements(): AchievementState {
  return { first_gold: { unlocked: false }, fast_thinker: { unlocked: false }, week_warrior: { unlocked: false }, sampler: { unlocked: false } }
}
export function evaluateAchievements(ach: AchievementState, context: {
  difficulty: DifficultyKey; seconds: number; medal: Medal; perfect: boolean; dateISO: string; currentStreak: number; solvedByDifficulty: Record<DifficultyKey, number>
}): { updated: AchievementState; newlyUnlocked: AchievementId[] } {
  const updated: AchievementState = { ...ach }; const newly: AchievementId[] = []
  function unlock(id: AchievementId) { if (!updated[id]?.unlocked) { updated[id] = { unlocked: true, date: context.dateISO }; newly.push(id) } }
  if (context.medal === 'gold') unlock('first_gold')
  if (context.seconds <= 120) unlock('fast_thinker')
  if (context.currentStreak >= 7) unlock('week_warrior')
  const hasAll = (['beginner','medium','hard'] as const).every(d => (context.solvedByDifficulty[d] ?? 0) > 0)
  if (hasAll) unlock('sampler')
  return { updated, newlyUnlocked: newly }
}
