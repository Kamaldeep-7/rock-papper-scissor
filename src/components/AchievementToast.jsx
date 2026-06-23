import { useEffect } from 'react'
import { ACHIEVEMENTS } from '../game/achievements.js'

export default function AchievementToast({ ids, onClear }) {
  useEffect(() => {
    if (!ids?.length) return
    const t = setTimeout(onClear, 4000)
    return () => clearTimeout(t)
  }, [ids, onClear])

  if (!ids?.length) return null
  const items = ids
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {items.map((a) => (
        <div
          key={a.id}
          className="animate-pop px-4 py-3 rounded-2xl bg-slate-900/95 border-2 border-pink-400
            shadow-[0_0_24px_rgba(236,72,153,0.55)] flex items-center gap-3"
        >
          <span className="text-3xl">{a.emoji}</span>
          <div>
            <div className="text-[10px] tracking-widest uppercase text-pink-300 font-display">
              Achievement Unlocked
            </div>
            <div className="font-display text-sm text-white">{a.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
