export function XpBar(props: { level: number; into: number; next: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((props.into / Math.max(1, props.next)) * 100)))
  return (
    <div className="flex items-center gap-md">
      <div className="text-sm">
        <span className="text-text-secondary">Level</span>{' '}
        <span className="font-semibold text-text-primary">{props.level}</span>
      </div>
      <div className="flex-1 h-2 bg-surface rounded-full w-40 md:w-64 overflow-hidden border border-grid-line">
        <div 
          className="h-full rounded-full bg-gradient-primary transition-all duration-500 ease-out relative xp-bar-fill"
          style={{ width: `${pct}%` }}
        >
          <div className="xp-bar-shimmer" />
        </div>
      </div>
      <div className="text-xs text-text-secondary w-24 text-right font-mono">
        {props.into} / {props.next} XP
      </div>
    </div>
  )
}
