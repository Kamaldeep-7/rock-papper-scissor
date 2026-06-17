import { CHOICE_MAP } from '../game/constants.js'

export default function ChoiceCard({ choice, owner, shaking, hidden }) {
  const emoji = hidden ? '❔' : choice ? CHOICE_MAP[choice].emoji : '❔'
  const label = hidden ? 'Locked in' : choice ? CHOICE_MAP[choice].label : 'Waiting…'
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <span className="text-xs sm:text-sm tracking-widest uppercase text-purple-300/80 font-display">
        {owner}
      </span>
      <div
        className={`relative flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 rounded-3xl
          bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur
          border-2 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.25)]
          ${shaking ? 'animate-shake' : 'animate-float'}`}
      >
        <span
          key={`${choice || 'empty'}-${hidden ? 'h' : 'v'}`}
          className={`text-7xl sm:text-8xl ${choice || hidden ? 'animate-pop' : ''}`}
        >
          {emoji}
        </span>
      </div>
      <span className="text-sm sm:text-base text-slate-300 font-display">{label}</span>
    </div>
  )
}
