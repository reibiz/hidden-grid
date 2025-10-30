import { useEffect, useState } from 'react'
import MainMenu, { ThemeMode } from '../ui/MainMenu'
import GameView from './GameView'
import { useProfile } from '../hooks/useProfile'
import { levelFromXP } from '../lib/progression'

type Screen = 'menu' | 'game'

export default function Shell() {
  const [theme, setTheme] = useState<ThemeMode>('retro')
  const [soundOn, setSoundOn] = useState(true)
  const [screen, setScreen] = useState<Screen>('menu')
  const [mode, setMode] = useState<'daily'|'practice'>('daily')

  useEffect(() => {
    document.documentElement.classList.remove('theme-retro','theme-zen')
    document.documentElement.classList.add(theme === 'retro' ? 'theme-retro' : 'theme-zen')
  }, [theme])

  const profile = useProfile()
  const p = profile.get()
  const lvl = levelFromXP(p.xp)

  return screen === 'menu' ? (
    <MainMenu
      theme={theme}
      setTheme={setTheme}
      soundOn={soundOn}
      setSoundOn={setSoundOn}
      level={lvl.level}
      xpInto={lvl.intoLevel}
      xpNext={lvl.nextLevelXP}
      title={titleFor(lvl.level)}
      onPlayDaily={() => { setMode('daily'); setScreen('game') }}
      onPlayPractice={() => { setMode('practice'); setScreen('game') }}
      onOpenArchive={() => alert('Archive (v1.3)')}
      onOpenStats={() => alert('Stats (v1.3)')}
      onOpenAchievements={() => alert('Achievements (v1.3)')}
      onOpenSettings={() => alert('Settings (v1.3)')}
      versionLabel={`v1.3 RC • ${theme==='retro' ? 'Retro Pixel' : 'Minimal Zen'}`}
    />
  ) : (
    <GameView theme={theme} mode={mode} onExit={() => setScreen('menu')} />
  )
}
function titleFor(level:number){ if(level>=20)return'Architect'; if(level>=15)return'Grid Master'; if(level>=10)return'Logic Adept'; if(level>=5)return'Pattern Solver'; return'Grid Apprentice' }
