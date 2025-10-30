export function SettingsModal(props:{open:boolean;onClose:()=>void;settings:{theme?:'dark'|'light';showTimer?:boolean;sound?:boolean};onChange:(next:Partial<{theme:'dark'|'light';showTimer:boolean;sound:boolean}>)=>void}){
  if(!props.open) return null; const {theme='dark',showTimer=true,sound=true}=props.settings
  return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="panel border border-accent rounded-2xl p-4 w-full max-w-sm">
      <h3 className="text-lg font-semibold mb-3">Settings</h3>
      <div className="flex items-center justify-between py-2"><span>Theme</span>
        <div className="flex gap-2"><button onClick={()=>props.onChange({theme:'dark'})} className="btn btn-neutral">Dark</button><button onClick={()=>props.onChange({theme:'light'})} className="btn btn-neutral">Light</button></div></div>
      <div className="flex items-center justify-between py-2"><span>Show timer</span><input type="checkbox" checked={!!showTimer} onChange={e=>props.onChange({showTimer:e.target.checked})}/></div>
      <div className="flex items-center justify-between py-2"><span>Sound</span><input type="checkbox" checked={!!sound} onChange={e=>props.onChange({sound:e.target.checked})}/></div>
      <div className="mt-4 flex justify-end"><button onClick={props.onClose} className="btn btn-accent">Close</button></div>
    </div></div>)}
