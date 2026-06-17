import { useEffect, useMemo, useState } from 'react'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ScoreBox from '../components/ScoreBox.jsx'
import ChoiceButtons from '../components/ChoiceButtons.jsx'
import { getSocket } from '../socket.js'

export default function FriendGame({ session, onExit }) {
  const { key: roomKey, you, players } = session
  const opponentId = players.find((id) => id !== you)

  const [myChoice, setMyChoice] = useState(null)
  const [oppPicked, setOppPicked] = useState(false)
  const [reveal, setReveal] = useState(null)
  const [scores, setScores] = useState({ [you]: 0, [opponentId]: 0 })
  const [round, setRound] = useState(1)
  const [opponentLeft, setOpponentLeft] = useState(false)

  const isWaiting = !!myChoice && !reveal

  useEffect(() => {
    const socket = getSocket()

    function onOpponentPicked() {
      setOppPicked(true)
    }
    function onReveal({ choices, winner, scores: newScores }) {
      setReveal({
        mine: choices[you],
        opp: choices[opponentId],
        outcome: winner == null ? 'draw' : winner === you ? 'win' : 'lose',
      })
      setScores(newScores)
    }
    function onOpponentLeft() {
      setOpponentLeft(true)
    }

    socket.on('opponent-picked', onOpponentPicked)
    socket.on('reveal', onReveal)
    socket.on('opponent-left', onOpponentLeft)
    return () => {
      socket.off('opponent-picked', onOpponentPicked)
      socket.off('reveal', onReveal)
      socket.off('opponent-left', onOpponentLeft)
    }
  }, [you, opponentId])

  function play(choiceId) {
    if (myChoice || reveal || opponentLeft) return
    setMyChoice(choiceId)
    getSocket().emit('make-choice', { choice: choiceId })
  }

  function nextRound() {
    setMyChoice(null)
    setOppPicked(false)
    setReveal(null)
    setRound((r) => r + 1)
  }

  function quit() {
    getSocket().emit('leave-room')
    onExit()
  }

  const resultText = useMemo(() => {
    if (!reveal) return null
    if (reveal.outcome === 'win') return 'YOU WIN!'
    if (reveal.outcome === 'lose') return 'FRIEND WINS!'
    return "IT'S A DRAW"
  }, [reveal])

  const resultStyle = useMemo(() => {
    if (!reveal) return ''
    if (reveal.outcome === 'win') return 'text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.7)]'
    if (reveal.outcome === 'lose') return 'text-rose-300 drop-shadow-[0_0_18px_rgba(244,114,128,0.7)]'
    return 'text-amber-200 drop-shadow-[0_0_18px_rgba(252,211,77,0.7)]'
  }, [reveal])

  if (opponentLeft) {
    return (
      <div className="flex flex-col items-center gap-6 mt-10">
        <h2 className="font-display text-xl sm:text-2xl text-rose-300 neon-text">
          OPPONENT LEFT
        </h2>
        <p className="text-sm text-slate-300 max-w-sm text-center">
          Your friend disconnected. Head back to the menu to start a new game.
        </p>
        <button
          onClick={onExit}
          className="px-6 py-2 rounded-xl font-display text-xs tracking-widest uppercase
            bg-gradient-to-br from-purple-600/50 to-pink-600/50 border border-purple-400 text-white
            hover:scale-105"
        >
          ← Back to Menu
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6">
      <header className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={quit}
            className="text-xs sm:text-sm font-display tracking-widest uppercase text-slate-400 hover:text-rose-300"
          >
            ← Quit
          </button>
          <span className="text-xs sm:text-sm font-display tracking-widest uppercase text-cyan-300">
            ROOM {roomKey}
          </span>
          <span className="w-12" />
        </div>

        <h1 className="font-display text-2xl sm:text-4xl text-center neon-text">
          <span className="text-purple-300">YOU</span>
          <span className="text-slate-300"> · vs · </span>
          <span className="text-cyan-300">FRIEND</span>
        </h1>

        <div className="flex items-center gap-3 sm:gap-5">
          <ScoreBox label="You" value={scores[you] || 0} accent="text-emerald-300" />
          <ScoreBox label="Round" value={round} accent="text-purple-300" />
          <ScoreBox label="Friend" value={scores[opponentId] || 0} accent="text-rose-300" />
        </div>
      </header>

      <section className="w-full grid grid-cols-2 gap-4 sm:gap-10 items-end mt-2">
        <ChoiceCard
          choice={reveal ? reveal.mine : myChoice}
          owner="You"
          shaking={isWaiting}
        />
        <ChoiceCard
          choice={reveal ? reveal.opp : oppPicked ? 'locked' : null}
          owner="Friend"
          hidden={!reveal && oppPicked}
          shaking={isWaiting}
        />
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
        {!resultText && myChoice && (
          <div className="text-sm sm:text-base text-slate-300 font-display tracking-widest uppercase">
            Waiting for friend…
          </div>
        )}
      </div>

      <section className="w-full flex flex-col items-center gap-4">
        {!reveal && (
          <>
            <p className="text-xs sm:text-sm text-slate-400 tracking-widest uppercase">
              Choose your weapon
            </p>
            <ChoiceButtons onPick={play} disabled={!!myChoice} />
          </>
        )}
        {reveal && (
          <button
            onClick={nextRound}
            className="px-6 py-3 rounded-xl font-display text-xs sm:text-sm tracking-widest uppercase
              bg-gradient-to-br from-purple-600/50 to-pink-600/50 border border-purple-400 text-white
              hover:scale-105"
          >
            Next Round →
          </button>
        )}
      </section>
    </div>
  )
}
