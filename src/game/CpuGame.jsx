import { useEffect, useMemo, useRef, useState } from 'react'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ScoreBox from '../components/ScoreBox.jsx'
import ChoiceButtons from '../components/ChoiceButtons.jsx'
import Countdown from '../components/Countdown.jsx'
import VictoryScreen from '../components/VictoryScreen.jsx'
import MuteToggle from '../components/MuteToggle.jsx'
import { getVariant, decide } from './constants.js'
import { createCpuBrain } from './cpu.js'
import { sounds } from '../audio.js'
import { recordRound, recordMatch } from '../storage.js'

export default function CpuGame({ settings, onExit }) {
  const variant = useMemo(() => getVariant(settings.variantId), [settings.variantId])
  const brainRef = useRef(null)
  if (!brainRef.current) brainRef.current = createCpuBrain(variant.id)

  const [phase, setPhase] = useState('picking')
  const [playerChoice, setPlayerChoice] = useState(null)
  const [cpuChoice, setCpuChoice] = useState(null)
  const [pendingCpu, setPendingCpu] = useState(null)
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState({ player: 0, cpu: 0, draws: 0 })
  const [round, setRound] = useState(1)
  const [matchOutcome, setMatchOutcome] = useState(null)

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
    if (phase !== 'picking' || matchOutcome) return
    sounds.click()
    const cpu = brainRef.current.predict()
    brainRef.current.record(choiceId)
    setPlayerChoice(choiceId)
    setPendingCpu(cpu)
    setCpuChoice(null)
    setResult(null)
    setPhase('countdown')
  }

  function reveal() {
    const cpu = pendingCpu
    const outcome = decide(variant, playerChoice, cpu)
    setCpuChoice(cpu)
    setResult(outcome)
    if (outcome === 'win') sounds.win()
    else if (outcome === 'lose') sounds.lose()
    else sounds.draw()
    recordRound('cpu', outcome)
    setScores((s) => {
      const next = {
        player: s.player + (outcome === 'win' ? 1 : 0),
        cpu: s.cpu + (outcome === 'lose' ? 1 : 0),
        draws: s.draws + (outcome === 'draw' ? 1 : 0),
      }
      if (next.player >= settings.matchLength) {
        setMatchOutcome('win')
        recordMatch('cpu', 'win')
        setTimeout(() => sounds.victory(), 300)
      } else if (next.cpu >= settings.matchLength) {
        setMatchOutcome('lose')
        recordMatch('cpu', 'lose')
        setTimeout(() => sounds.defeat(), 300)
      }
      return next
    })
    setPhase('revealed')
  }

  function nextRound() {
    if (matchOutcome) return
    setPlayerChoice(null)
    setCpuChoice(null)
    setPendingCpu(null)
    setResult(null)
    setRound((r) => r + 1)
    setPhase('picking')
  }

  function newMatch() {
    setPlayerChoice(null)
    setCpuChoice(null)
    setPendingCpu(null)
    setResult(null)
    setScores({ player: 0, cpu: 0, draws: 0 })
    setRound(1)
    setMatchOutcome(null)
    setPhase('picking')
    brainRef.current = createCpuBrain(variant.id)
  }

  useEffect(() => {
    function onKey(e) {
      if (matchOutcome) return
      const key = e.key.toLowerCase()
      if (key === 'escape') return newMatch()
      if (phase !== 'picking') {
        if (key === 'enter' && phase === 'revealed') nextRound()
        return
      }
      const choice = variant.choices.find((c) => c.hotkey === key)
      if (choice) play(choice.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (matchOutcome) {
    return (
      <VictoryScreen
        outcome={matchOutcome}
        scores={{ player: scores.player, opponent: scores.cpu }}
        playerLabel={settings.name}
        opponentLabel="CPU"
        playAgainLabel="New Match"
        onPlayAgain={newMatch}
        onExit={onExit}
      />
    )
  }

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
            VS CPU · First to {settings.matchLength}
          </span>
          <MuteToggle />
        </div>

        <h1 className="font-display text-xl sm:text-3xl text-center neon-text">
          <span className="text-purple-300">{settings.name}</span>
          <span className="text-slate-300"> · vs · </span>
          <span className="text-pink-300">CPU</span>
        </h1>

        <div className="flex items-center gap-3 sm:gap-5">
          <ScoreBox label={settings.name} value={scores.player} accent="text-emerald-300" />
          <ScoreBox label="Round" value={round} accent="text-purple-300" />
          <ScoreBox label="CPU" value={scores.cpu} accent="text-rose-300" />
          <ScoreBox label="Draws" value={scores.draws} accent="text-amber-300" />
        </div>
      </header>

      <section className="w-full grid grid-cols-2 gap-4 sm:gap-10 items-end mt-2">
        <ChoiceCard
          choice={playerChoice}
          variant={variant}
          owner={settings.name}
          shaking={phase === 'countdown'}
        />
        <ChoiceCard
          choice={cpuChoice}
          variant={variant}
          owner="CPU"
          shaking={phase === 'countdown'}
        />
      </section>

      <div className="h-16 flex items-center justify-center">
        {phase === 'countdown' && <Countdown onDone={reveal} />}
        {phase === 'revealed' && resultText && (
          <div
            key={round}
            className={`font-display text-2xl sm:text-3xl animate-pop ${resultStyle}`}
          >
            {resultText}
          </div>
        )}
      </div>

      <section className="w-full flex flex-col items-center gap-4">
        {phase === 'revealed' ? (
          <button
            onClick={nextRound}
            className="px-6 py-3 rounded-xl font-display text-xs sm:text-sm tracking-widest uppercase
              bg-gradient-to-br from-purple-600/50 to-pink-600/50 border border-purple-400 text-white
              hover:scale-105"
          >
            Next Round →
          </button>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-slate-400 tracking-widest uppercase">
              Choose your weapon
            </p>
            <ChoiceButtons
              choices={variant.choices}
              onPick={play}
              disabled={phase !== 'picking'}
            />
          </>
        )}

        <button
          onClick={newMatch}
          className="mt-8 px-6 py-2 rounded-xl text-xs sm:text-sm font-display tracking-widest uppercase
            bg-slate-800/60 border border-slate-600 text-slate-300
            hover:bg-rose-900/40 hover:border-rose-400 hover:text-rose-200
            transition-colors"
        >
          Reset Match
        </button>
      </section>

      <footer className="text-[10px] sm:text-xs text-slate-500 tracking-widest uppercase">
        Hotkeys: {variant.choices.map((c) => `${c.hotkey.toUpperCase()}=${c.label}`).join(' · ')} — Esc resets
      </footer>
    </div>
  )
}
