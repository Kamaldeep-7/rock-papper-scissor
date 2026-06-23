import { ACHIEVEMENTS } from '../game/achievements.js'
import { getUnlocked } from '../storage.js'

export default function AchievementsRow() {
  const unlocked = new Set(getUnlocked().map((a) => a.id))
  const count = unlocked.size

  return (
    <div className="w-full max-w-3xl mt-2 px-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] sm:text-xs tracking-widest uppercase text-slate-400 font-display">
          Achievements
        </span>
        <span className="text-[10px] sm:text-xs tracking-widest uppercase text-slate-500 font-display">
          {count} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id)
          return (
            <div
              key={a.id}
              title={`${a.name} — ${a.desc}`}
              className={`flex-none w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2
                flex items-center justify-center text-2xl sm:text-3xl transition-all
                ${on
                  ? 'bg-purple-700/40 border-pink-400 shadow-[0_0_14px_rgba(236,72,153,0.45)]'
                  : 'bg-slate-900/40 border-slate-700 grayscale opacity-40'}`}
            >
              {a.emoji}
            </div>
          )
        })}
      </div>
    </div>
  )
}
