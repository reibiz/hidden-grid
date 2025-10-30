import type { Stats } from '../lib/stats'
export function StatsPanel(props:{stats:Stats}){
  const {solvesByDifficulty,timeTotalsByDifficulty,bestTime,perfectSolves}=props.stats
  function fmt(sec:number|null){ if(sec===null) return '—'; const m=Math.floor(sec/60); const s=String(sec%60).padStart(2,'0'); return `${m}:${s}` }
  function avg(d:keyof typeof solvesByDifficulty){ const solves=solvesByDifficulty[d]; const total=timeTotalsByDifficulty[d]; if(solves===0) return '—'; return fmt(Math.round(total/solves)) }
  return (<div className="panel border border-accent rounded-2xl p-4">
    <h3 className="text-lg font-semibold mb-3">Stats</h3>
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>Total solves</div><div className="text-right">{solvesByDifficulty.beginner + solvesByDifficulty.medium + solvesByDifficulty.hard}</div>
      <div>Perfect solves</div><div className="text-right">{perfectSolves}</div>
      <div>Best time (Beginner)</div><div className="text-right">{fmt(bestTime.beginner)}</div>
      <div>Best time (Medium)</div><div className="text-right">{fmt(bestTime.medium)}</div>
      <div>Best time (Hard)</div><div className="text-right">{fmt(bestTime.hard)}</div>
      <div>Avg time (Beginner)</div><div className="text-right">{avg('beginner')}</div>
      <div>Avg time (Medium)</div><div className="text-right">{avg('medium')}</div>
      <div>Avg time (Hard)</div><div className="text-right">{avg('hard')}</div>
    </div></div>)}
