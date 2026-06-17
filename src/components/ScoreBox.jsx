export default function ScoreBox({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-slate-900/60 border border-slate-700 min-w-[90px]">
      <span className={`text-[10px] sm:text-xs tracking-widest uppercase ${accent}`}>{label}</span>
      <span className="text-3xl sm:text-4xl font-display mt-1">{value}</span>
    </div>
  )
}
