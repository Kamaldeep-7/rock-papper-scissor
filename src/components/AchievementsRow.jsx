import { ACHIEVEMENTS } from '../game/achievements.js'
import { getUnlocked } from '../storage.js'

export default function AchievementsRow() {
  const unlocked = new Set(getUnlocked().map((a) => a.id))
  const count = unlocked.size
  const pct = Math.round((count / ACHIEVEMENTS.length) * 100)

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-slate-900/40 border border-slate-700/70 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] sm:text-xs tracking-widest uppercase text-pink-300 font-display">
            Achievements
          </div>
          <div className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">
            {count} of {ACHIEVEMENTS.length} unlocked
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl sm:text-3xl text-white">{pct}%</div>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id)
          return (
            <div
              key={a.id}
              title={`${a.name} — ${a.desc}`}
              className={`group relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-1 transition-all
                ${on
                  ? 'bg-gradient-to-br from-purple-700/45 to-pink-700/30 border-pink-400 shadow-[0_0_14px_rgba(236,72,153,0.4)]'
                  : 'bg-slate-900/40 border-slate-700'}`}
            >
              <span className={`text-2xl sm:text-3xl transition-all ${on ? '' : 'grayscale opacity-40'}`}>
                {a.emoji}
              </span>
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-display text-center leading-tight
                  ${on ? 'text-pink-200' : 'text-slate-600'}`}
              >
                {a.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
