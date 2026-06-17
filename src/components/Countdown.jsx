import { useEffect, useState } from 'react'
import { sounds } from '../audio.js'

export default function Countdown({ onDone, startAt = 3 }) {
  const [n, setN] = useState(startAt)

  useEffect(() => {
    if (n > 0) {
      sounds.tick()
      const t = setTimeout(() => setN((v) => v - 1), 550)
      return () => clearTimeout(t)
    }
    sounds.shoot()
    const t = setTimeout(() => onDone?.(), 350)
    return () => clearTimeout(t)
  }, [n, onDone])

  return (
    <div
      key={n}
      className="font-display text-5xl sm:text-6xl text-pink-300 neon-text animate-pop"
    >
      {n > 0 ? n : 'SHOOT!'}
    </div>
  )
}
