export function XpBar(props: { level: number; into: number; next: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((props.into / Math.max(1, props.next)) * 100)))
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm"><span className="opacity-80">Level</span> <span className="font-semibold">{props.level}</span></div>
      <div className="flex-1 h-2 bg-neutral-800 rounded-full w-40 md:w-64">
        <div className="h-2 rounded-full" style={{ background: 'var(--accent)', width: `${pct}%` }} />
      </div>
      <div className="text-xs opacity-70 w-24 text-right">{props.into} / {props.next} XP</div>
    </div>
  )
}
