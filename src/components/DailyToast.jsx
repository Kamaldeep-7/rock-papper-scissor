import { useEffect } from 'react'

export default function DailyToast({ challenge, onClear }) {
  useEffect(() => {
    if (!challenge) return
    const t = setTimeout(onClear, 4000)
    return () => clearTimeout(t)
  }, [challenge, onClear])

  if (!challenge) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xs w-[18rem]">
      <div
        className="animate-pop px-4 py-3 rounded-2xl bg-slate-900/95 border-2 border-emerald-400
          shadow-[0_0_24px_rgba(52,211,153,0.55)] flex items-center gap-3"
      >
        <span className="text-3xl">✅</span>
        <div>
          <div className="text-[10px] tracking-widest uppercase text-emerald-300 font-display">
            Daily Challenge Complete
          </div>
          <div className="font-display text-sm text-white">{challenge.title}</div>
        </div>
      </div>
    </div>
  )
}
