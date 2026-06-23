export default function RoundHistory({ history, max = 10 }) {
  if (!history?.length) return null
  const trimmed = history.slice(-max)
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      <span className="text-[10px] text-slate-500 tracking-widest uppercase mr-1 font-display">
        Recent
      </span>
      {trimmed.map((r, i) => {
        const cls =
          r === 'win'
            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
            : r === 'lose'
              ? 'bg-rose-500/25 border-rose-400 text-rose-200'
              : 'bg-amber-500/25 border-amber-400 text-amber-200'
        const letter = r === 'win' ? 'W' : r === 'lose' ? 'L' : 'D'
        return (
          <span
            key={i}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded border ${cls}
              flex items-center justify-center text-[10px] sm:text-xs font-display`}
          >
            {letter}
          </span>
        )
      })}
    </div>
  )
}
