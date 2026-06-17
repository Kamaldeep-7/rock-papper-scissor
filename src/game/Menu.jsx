export default function Menu({ onPick }) {
  return (
    <div className="flex flex-col items-center gap-10 mt-10">
      <h1 className="font-display text-2xl sm:text-4xl text-center neon-text">
        <span className="text-purple-300">ROCK</span>
        <span className="text-slate-300"> · </span>
        <span className="text-pink-300">PAPER</span>
        <span className="text-slate-300"> · </span>
        <span className="text-cyan-300">SCISSORS</span>
      </h1>
      <p className="text-xs sm:text-sm tracking-widest uppercase text-slate-400">
        Choose your battle
      </p>
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
        <MenuButton
          title="Play vs CPU"
          subtitle="Solo arcade mode"
          accent="from-purple-600/40 to-fuchsia-600/40 hover:border-pink-400"
          onClick={() => onPick('cpu')}
        />
        <MenuButton
          title="Play with Friend"
          subtitle="Share a room key"
          accent="from-cyan-600/40 to-emerald-600/40 hover:border-cyan-300"
          onClick={() => onPick('friend')}
        />
      </div>
    </div>
  )
}

function MenuButton({ title, subtitle, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-64 sm:w-72 px-6 py-7 rounded-3xl bg-gradient-to-br ${accent}
        border-2 border-purple-400/50 transition-all duration-200
        hover:scale-105 active:scale-95 animate-glow text-left`}
    >
      <div className="font-display text-base sm:text-lg text-white">{title}</div>
      <div className="text-xs sm:text-sm text-slate-200/80 mt-2 tracking-wider uppercase">
        {subtitle}
      </div>
    </button>
  )
}
