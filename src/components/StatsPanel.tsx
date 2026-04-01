import type { Stats } from '../lib/stats'
import type { DifficultyKey } from '../lib/progression'

const DIFFICULTY_ORDER: DifficultyKey[] = ['flash', 'easy', 'medium', 'hard', 'expert', 'insane']

const DIFFICULTY_LABEL: Record<DifficultyKey, string> = {
  flash:  'Flash',
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
  expert: 'Expert',
  insane: 'Insane',
}

export function StatsPanel(props: { stats: Stats }) {
  const {
    solvesByDifficulty,
    timeTotalsByDifficulty,
    bestTime,
    bestScoreByDifficulty,
    highestScore,
  } = props.stats

  function fmt(sec: number | null) {
    if (sec === null) return '—'
    const m = Math.floor(sec / 60)
    const s = String(sec % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const totalGames = Object.values(solvesByDifficulty).reduce((a, v) => a + v, 0)
  const totalSeconds = Object.values(timeTotalsByDifficulty).reduce((a, v) => a + v, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Totals ─────────────────────────────────────────────────────────── */}
      <section>
        <h4
          style={{
            fontSize: '18px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          Latest Game
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <StatRow label="High score"    value={String(highestScore)} bold />
          <StatRow label="Games played"  value={String(totalGames)}   bold />
          <StatRow label="Playtime"      value={formatDuration(totalSeconds)} />
        </div>
      </section>

      {/* ── Per-difficulty ─────────────────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {DIFFICULTY_ORDER.map((key) => (
          <DifficultyBlock
            key={key}
            label={DIFFICULTY_LABEL[key]}
            bestScore={bestScoreByDifficulty[key]}
            runs={solvesByDifficulty[key]}
            bestTime={fmt(bestTime[key])}
          />
        ))}
      </section>

    </div>
  )
}

// ─── StatRow ──────────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '15px',
          fontFamily: 'var(--font-mono, monospace)',
          fontWeight: bold ? 700 : 400,
          color: 'var(--color-text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── DifficultyBlock ──────────────────────────────────────────────────────────

function DifficultyBlock({
  label,
  bestScore,
  runs,
  bestTime,
}: {
  label: string
  bestScore: number
  runs: number
  bestTime: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr auto',
        rowGap: '6px',
        columnGap: '8px',
        alignItems: 'start',
      }}
    >
      {/* Difficulty name — spans all 3 stat rows */}
      <span
        style={{
          gridRow: '1 / 4',
          fontWeight: 700,
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-text-primary)',
          paddingTop: '1px',
        }}
      >
        {label}
      </span>

      {/* Stat labels */}
      <span style={STAT_LABEL_STYLE}>Best score</span>
      <span style={STAT_VALUE_STYLE(true)}>{bestScore}</span>

      <span style={STAT_LABEL_STYLE}>Runs</span>
      <span style={STAT_VALUE_STYLE(false)}>{runs}</span>

      <span style={STAT_LABEL_STYLE}>Best time</span>
      <span style={STAT_VALUE_STYLE(false)}>{bestTime}</span>
    </div>
  )
}

// ─── Shared cell styles ───────────────────────────────────────────────────────

const STAT_LABEL_STYLE: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
}

function STAT_VALUE_STYLE(bold: boolean): React.CSSProperties {
  return {
    fontSize: '14px',
    fontFamily: 'var(--font-mono, monospace)',
    fontWeight: bold ? 700 : 400,
    color: 'var(--color-text-primary)',
    textAlign: 'right',
  }
}

// ─── Duration formatter ───────────────────────────────────────────────────────

function formatDuration(totalSeconds: number): string {
  const hours   = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []
  if (hours   > 0)             parts.push(`${hours}h`)
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  return parts.join(' ')
}
