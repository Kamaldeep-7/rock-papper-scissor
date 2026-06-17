import { getChoiceMap } from '../game/constants.js'

export default function ChoiceCard({ choice, variant, owner, shaking, hidden, reaction }) {
  const map = getChoiceMap(variant)
  const display = choice && map[choice]
  const emoji = hidden ? '❔' : display ? display.emoji : '❔'
  const label = hidden ? 'Locked in' : display ? display.label : 'Waiting…'
  return (
    <div className="flex flex-col items-center gap-3 w-full relative">
      <span className="text-xs sm:text-sm tracking-widest uppercase text-purple-300/80 font-display truncate max-w-[160px] sm:max-w-[200px]">
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
        {reaction && (
          <span
            key={reaction.id}
            className="absolute -top-4 -right-2 text-4xl sm:text-5xl animate-pop drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]"
          >
            {reaction.emoji}
          </span>
        )}
      </div>
      <span className="text-sm sm:text-base text-slate-300 font-display">{label}</span>
    </div>
  )
}
