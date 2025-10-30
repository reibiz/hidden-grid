import App from '../App'
export default function GameView(props: { theme: 'retro'|'zen'; mode: 'daily'|'practice'; onExit: ()=>void }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <button className="btn btn-neutral border-accent" onClick={props.onExit}>← Back</button>
        <div className="text-sm opacity-80">Theme: {props.theme} • Mode: {props.mode}</div>
      </div>
      <App />
    </div>
  )
}
