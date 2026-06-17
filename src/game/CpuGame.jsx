import { useEffect, useMemo, useState } from 'react'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ScoreBox from '../components/ScoreBox.jsx'
import ChoiceButtons from '../components/ChoiceButtons.jsx'
import { CHOICES, decide } from '../game/constants.js'

export default function CpuGame({ onExit }) {
  const [playerChoice, setPlayerChoice] = useState(null)
  const [cpuChoice, setCpuChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState({ player: 0, cpu: 0, draws: 0 })
  const [round, setRound] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const resultText = useMemo(() => {
    if (!result) return null
    if (result === 'win') return 'YOU WIN!'
    if (result === 'lose') return 'CPU WINS!'
    return "IT'S A DRAW"
  }, [result])

  const resultStyle = useMemo(() => {
    if (result === 'win') return 'text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.7)]'
    if (result === 'lose') return 'text-rose-300 drop-shadow-[0_0_18px_rgba(244,114,128,0.7)]'
    return 'text-amber-200 drop-shadow-[0_0_18px_rgba(252,211,77,0.7)]'
  }, [result])

  function play(choiceId) {
    if (isPlaying) return
    setIsPlaying(true)
    setResult(null)
    setPlayerChoice(choiceId)
    setCpuChoice(null)

    setTimeout(() => {
      const pick = CHOICES[Math.floor(Math.random() * 3)].id
      const outcome = decide(choiceId, pick)
      setCpuChoice(pick)
      setResult(outcome)
      setScores((s) => ({
        player: s.player + (outcome === 'win' ? 1 : 0),
        cpu: s.cpu + (outcome === 'lose' ? 1 : 0),
        draws: s.draws + (outcome === 'draw' ? 1 : 0),
      }))
      setRound((r) => r + 1)
      setIsPlaying(false)
    }, 900)
  }

  function reset() {
    setPlayerChoice(null)
    setCpuChoice(null)
    setResult(null)
    setScores({ player: 0, cpu: 0, draws: 0 })
    setRound(1)
    setIsPlaying(false)
  }

  useEffect(() => {
    function onKey(e) {
      const key = e.key.toLowerCase()
      if (key === 'r') play('rock')
      else if (key === 'p') play('paper')
      else if (key === 's') play('scissors')
      else if (key === 'escape') reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6">
      <header className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={onExit}
            className="text-xs sm:text-sm font-display tracking-widest uppercase text-slate-400 hover:text-pink-300"
          >
            ← Menu
          </button>
          <span className="text-xs sm:text-sm font-display tracking-widest uppercase text-purple-300">
            VS CPU
          </span>
          <span className="w-12" />
        </div>

        <h1 className="font-display text-2xl sm:text-4xl text-center neon-text">
          <span className="text-purple-300">ROCK</span>
          <span className="text-slate-300"> · </span>
          <span className="text-pink-300">PAPER</span>
          <span className="text-slate-300"> · </span>
          <span className="text-cyan-300">SCISSORS</span>
        </h1>

        <div className="flex items-center gap-3 sm:gap-5">
          <ScoreBox label="You" value={scores.player} accent="text-emerald-300" />
          <ScoreBox label="Round" value={round} accent="text-purple-300" />
          <ScoreBox label="CPU" value={scores.cpu} accent="text-rose-300" />
          <ScoreBox label="Draws" value={scores.draws} accent="text-amber-300" />
        </div>
      </header>

      <section className="w-full grid grid-cols-2 gap-4 sm:gap-10 items-end mt-2">
        <ChoiceCard choice={playerChoice} owner="You" shaking={isPlaying} />
        <ChoiceCard choice={cpuChoice} owner="CPU" shaking={isPlaying} />
      </section>

      <div className="h-16 flex items-center justify-center">
        {resultText && (
          <div
            key={round}
            className={`font-display text-2xl sm:text-3xl animate-pop ${resultStyle}`}
          >
            {resultText}
          </div>
        )}
      </div>

      <section className="w-full flex flex-col items-center gap-4">
        <p className="text-xs sm:text-sm text-slate-400 tracking-widest uppercase">
          Choose your weapon
        </p>
        <ChoiceButtons onPick={play} disabled={isPlaying} />

        <button
          onClick={reset}
          className="mt-8 px-6 py-2 rounded-xl text-xs sm:text-sm font-display tracking-widest uppercase
            bg-slate-800/60 border border-slate-600 text-slate-300
            hover:bg-rose-900/40 hover:border-rose-400 hover:text-rose-200
            transition-colors"
        >
          Reset
        </button>
      </section>

      <footer className="text-[10px] sm:text-xs text-slate-500 tracking-widest uppercase">
        Hotkeys: R · P · S — Esc to reset
      </footer>
    </div>
  )
}
