export default function VictoryScreen({ outcome, scores, playerLabel, opponentLabel, onPlayAgain, onExit, playAgainLabel = 'Play Again', waitingForOpponent = false }) {
  const win = outcome === 'win'
  return (
    <div className="flex flex-col items-center gap-7 mt-6 sm:mt-12 animate-pop">
      <span className="text-xs sm:text-sm tracking-widest uppercase text-slate-400">
        Match {win ? 'won' : 'over'}
      </span>
      <h2
        className={`font-display text-4xl sm:text-6xl neon-text
          ${win
            ? 'text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.7)]'
            : 'text-rose-300 drop-shadow-[0_0_18px_rgba(244,114,128,0.7)]'}`}
      >
        {win ? 'VICTORY' : 'DEFEAT'}
      </h2>

      <div className="flex items-center gap-4 sm:gap-6 font-display text-2xl sm:text-3xl">
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest mb-1">
            {playerLabel}
          </span>
          <span className="text-emerald-300">{scores.player}</span>
        </div>
        <span className="text-slate-500">—</span>
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest mb-1">
            {opponentLabel}
          </span>
          <span className="text-rose-300">{scores.opponent}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mt-3">
        <button
          onClick={onPlayAgain}
          disabled={waitingForOpponent}
          className="px-8 py-3 rounded-2xl font-display text-xs sm:text-sm tracking-widest uppercase
            bg-gradient-to-br from-purple-600/60 to-pink-600/60 border border-purple-400 text-white
            hover:scale-105 active:scale-95 transition-transform animate-glow
            disabled:opacity-60 disabled:hover:scale-100"
        >
          {waitingForOpponent ? 'Waiting for opponent…' : playAgainLabel}
        </button>
        <button
          onClick={onExit}
          className="px-6 py-2 rounded-xl text-xs font-display tracking-widest uppercase
            text-slate-400 hover:text-pink-300"
        >
          ← Menu
        </button>
      </div>
    </div>
  )
}
