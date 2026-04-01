import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  delay: number
}

interface ParticleEffectProps {
  trigger: boolean
  count?: number
  color?: string
}

export function ParticleEffect({ trigger, count = 20, color = 'var(--color-primary)' }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.3,
      }))
      setParticles(newParticles)

      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([])
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [trigger, count])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: color,
            animationDelay: `${particle.delay}s`,
            '--particle-x': `${(Math.random() - 0.5) * 100}px`,
          } as React.CSSProperties & { '--particle-x': string }}
        />
      ))}
    </div>
  )
}

