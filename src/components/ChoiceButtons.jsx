export default function ChoiceButtons({ choices, onPick, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 sm:gap-x-5 sm:gap-y-5">
      {choices.map((c) => (
        <div key={c.id} className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => onPick(c.id)}
            disabled={disabled}
            className="group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl
              bg-gradient-to-br from-purple-600/30 to-pink-600/30
              border-2 border-purple-400/60 hover:border-pink-400
              hover:scale-110 active:scale-95 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              animate-glow flex items-center justify-center"
            aria-label={c.label}
            title={c.hotkey ? `${c.label} [${c.hotkey.toUpperCase()}]` : c.label}
          >
            <span className="text-4xl sm:text-5xl block group-hover:rotate-12 transition-transform">
              {c.emoji}
            </span>
          </button>
          <span className="text-[10px] sm:text-xs font-display text-slate-400 whitespace-nowrap">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  )
}
