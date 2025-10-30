function toDateOnlyISO(iso: string): string { return iso.split('T')[0] }
export function updateStreak(streak: { current: number; best: number; lastSolvedDate: string | null }, todayISO: string) {
  const today = toDateOnlyISO(todayISO)
  if (!streak.lastSolvedDate) { const current = 1; return { current, best: Math.max(streak.best, current), lastSolvedDate: today } }
  const last = new Date(streak.lastSolvedDate + 'T00:00:00Z')
  const curr = new Date(today + 'T00:00:00Z')
  const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000*60*60*24))
  if (diffDays <= 0) return { ...streak, lastSolvedDate: today }
  if (diffDays === 1) { const current = streak.current + 1; return { current, best: Math.max(streak.best, current), lastSolvedDate: today } }
  const current = 1; return { current, best: Math.max(streak.best, current, streak.best), lastSolvedDate: today }
}
