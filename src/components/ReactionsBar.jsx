import { REACTIONS } from '../game/constants.js'

export default function ReactionsBar({ onReact, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2">
      {REACTIONS.map((r) => (
        <button
          key={r}
          disabled={disabled}
          onClick={() => onReact(r)}
          className="text-2xl sm:text-3xl px-3 py-2 rounded-xl
            bg-slate-800/60 border border-slate-600
            hover:scale-110 hover:border-pink-400 active:scale-95
            transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label={`React with ${r}`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
