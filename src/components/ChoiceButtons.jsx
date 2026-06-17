import { CHOICES } from '../game/constants.js'

export default function ChoiceButtons({ onPick, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {CHOICES.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          disabled={disabled}
          className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl
            bg-gradient-to-br from-purple-600/30 to-pink-600/30
            border-2 border-purple-400/60 hover:border-pink-400
            hover:scale-110 active:scale-95 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            animate-glow"
          aria-label={c.label}
        >
          <span className="text-5xl sm:text-6xl block group-hover:rotate-12 transition-transform">
            {c.emoji}
          </span>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-display text-slate-400 group-hover:text-pink-300">
            {c.label}
          </span>
        </button>
      ))}
    </div>
  )
}
