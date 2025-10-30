import type { Medal } from '../lib/progression'
export function CompletionModal(props:{open:boolean;onClose:()=>void;seconds:number;medal:Medal;gainedXP:number;levelUp?:{from:number;to:number}|null;dailyBonus?:number;newlyUnlocked?:string[]}){
  if(!props.open) return null; const mm=Math.floor(props.seconds/60), ss=String(props.seconds%60).padStart(2,'0'); const medalColor=props.medal==='gold'?'text-yellow-400':props.medal==='silver'?'text-slate-200':props.medal==='bronze'?'text-amber-500':'text-neutral-300';
  return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="w-full max-w-md panel border border-accent rounded-2xl p-5"><h3 className="text-xl font-semibold mb-2">Solved!</h3>
    <div className="text-sm opacity-80">Time: <span className="font-mono">{mm}:{ss}</span></div>
    <div className={`mt-1 text-sm ${medalColor}`}>Medal: <span className="capitalize font-semibold">{props.medal}</span></div>
    <div className="mt-2" style={{color:'var(--accent)'}}>+{props.gainedXP} XP</div>
    {props.dailyBonus ? <div className="mt-1" style={{color:'var(--accent2)'}}>Daily bonus +{props.dailyBonus} XP</div>:null}
    {props.levelUp && (<div className="mt-2 text-amber-300">Level Up! {props.levelUp.from} → {props.levelUp.to}</div>)}
    {props.newlyUnlocked && props.newlyUnlocked.length>0 && (<div className="mt-3 text-sm"><div className="opacity-80 mb-1">New badges:</div><ul className="list-disc list-inside">{props.newlyUnlocked.map(id=><li key={id}>{id}</li>)}</ul></div>)}
    <div className="mt-4 flex gap-2 justify-end"><button onClick={props.onClose} className="btn btn-accent">Next Puzzle</button></div></div></div>)}
