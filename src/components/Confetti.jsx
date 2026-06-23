import { useMemo } from 'react'

const COLORS = ['#a855f7', '#f472b6', '#22d3ee', '#fcd34d', '#34d399', '#fb7185', '#ffffff']

export default function Confetti({ count = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.4,
        duration: 2.8 + Math.random() * 2.4,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 720 - 360,
        drift: -30 + Math.random() * 60,
        size: 6 + Math.random() * 8,
      })),
    [count]
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.45,
            backgroundColor: p.color,
            '--rotate': `${p.rotate}deg`,
            '--drift': `${p.drift}vw`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
