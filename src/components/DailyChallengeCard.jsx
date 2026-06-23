import { getTodaysChallenge } from '../game/dailyChallenges.js'
import { getDailyDoneDate } from '../storage.js'

export default function DailyChallengeCard() {
  const challenge = getTodaysChallenge()
  const done = getDailyDoneDate() === challenge.date
  return (
    <div
      className={`w-full max-w-3xl rounded-2xl border-2 p-4 sm:p-5 transition-all
        ${done
          ? 'bg-emerald-700/20 border-emerald-400/70 shadow-[0_0_18px_rgba(52,211,153,0.25)]'
          : 'bg-gradient-to-br from-purple-700/25 to-fuchsia-700/25 border-purple-400/60 shadow-[0_0_18px_rgba(168,85,247,0.25)]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div
            className={`text-[10px] sm:text-xs tracking-widest uppercase font-display
              ${done ? 'text-emerald-300' : 'text-amber-300'}`}
          >
            {done ? "Today's Challenge ✓ Done" : "Today's Challenge"}
          </div>
          <div className="font-display text-base sm:text-lg text-white mt-1.5">
            {challenge.title}
          </div>
          <div className="text-xs sm:text-sm text-slate-300 mt-1">
            {challenge.desc}
          </div>
        </div>
        <div
          className={`text-3xl sm:text-4xl ${done ? 'opacity-90' : 'opacity-70'}`}
          aria-hidden
        >
          {done ? '✅' : '🎯'}
        </div>
      </div>
    </div>
  )
}
