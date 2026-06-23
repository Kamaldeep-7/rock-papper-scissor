import { useEffect, useMemo, useRef, useState } from 'react'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ScoreBox from '../components/ScoreBox.jsx'
import ChoiceButtons from '../components/ChoiceButtons.jsx'
import Countdown from '../components/Countdown.jsx'
import VictoryScreen from '../components/VictoryScreen.jsx'
import ReactionsBar from '../components/ReactionsBar.jsx'
import MuteToggle from '../components/MuteToggle.jsx'
import AchievementToast from '../components/AchievementToast.jsx'
import DailyToast from '../components/DailyToast.jsx'
import RoundHistory from '../components/RoundHistory.jsx'
import { getVariant } from './constants.js'
import { sounds } from '../audio.js'
import { recordRound, recordMatch, getSnapshot, recordUnlocks, getDailyDoneDate, markDailyDone } from '../storage.js'
import { evaluate as evaluateAchievements } from './achievements.js'
import { getTodaysChallenge } from './dailyChallenges.js'
import { getSocket } from '../socket.js'

export default function FriendGame({ session, onExit }) {
  const { key: roomKey, you, players, names, variantId, matchLength } = session
  const variant = useMemo(() => getVariant(variantId), [variantId])
  const opponentId = players.find((id) => id !== you)

  const myName = names[you] || 'You'
  const oppName = names[opponentId] || 'Friend'

  const [phase, setPhase] = useState('picking')
  const [myChoice, setMyChoice] = useState(null)
  const [oppPicked, setOppPicked] = useState(false)
  const [reveal, setReveal] = useState(null)
  const [scores, setScores] = useState({ [you]: 0, [opponentId]: 0 })
  const [round, setRound] = useState(1)
  const [opponentLeft, setOpponentLeft] = useState(false)
  const [matchOutcome, setMatchOutcome] = useState(null)
  const [rematch, setRematch] = useState({ me: false, opp: false })
  const [myReaction, setMyReaction] = useState(null)
  const [oppReaction, setOppReaction] = useState(null)
  const [unlockedToast, setUnlockedToast] = useState([])
  const [dailyToast, setDailyToast] = useState(null)
  const [history, setHistory] = useState([])
  const matchStreakRef = useRef({ current: 0, best: 0 })

  function checkUnlocks() {
    const newly = recordUnlocks(evaluateAchievements(getSnapshot()))
    if (newly.length) setUnlockedToast(newly)
  }

  function checkDailyChallenge(ctx) {
    const challenge = getTodaysChallenge()
    if (getDailyDoneDate() === challenge.date) return
    if (challenge.check(ctx)) {
      markDailyDone(challenge.date)
      setDailyToast(challenge)
    }
  }

  const pendingRevealRef = useRef(null)

  useEffect(() => {
    const socket = getSocket()

    function onOpponentPicked() {
      setOppPicked(true)
    }
    function onReveal({ choices, winner, scores: newScores }) {
      const data = {
        mine: choices[you],
        opp: choices[opponentId],
        outcome: winner == null ? 'draw' : winner === you ? 'win' : 'lose',
        scores: newScores,
      }
      pendingRevealRef.current = data
      setPhase('countdown')
    }
    function onOpponentLeft() {
      setOpponentLeft(true)
    }
    function onReaction({ emoji }) {
      const r = { id: Date.now() + Math.random(), emoji }
      setOppReaction(r)
      setTimeout(() => setOppReaction((cur) => (cur && cur.id === r.id ? null : cur)), 2000)
    }
    function onMatchReset({ scores: newScores }) {
      setScores(newScores)
      setMatchOutcome(null)
      setRematch({ me: false, opp: false })
      setReveal(null)
      setMyChoice(null)
      setOppPicked(false)
      setPhase('picking')
      setRound(1)
    }
    function onRematchUpdate({ requesters }) {
      setRematch({
        me: requesters.includes(you),
        opp: requesters.includes(opponentId),
      })
    }

    socket.on('opponent-picked', onOpponentPicked)
    socket.on('reveal', onReveal)
    socket.on('opponent-left', onOpponentLeft)
    socket.on('reaction', onReaction)
    socket.on('match-reset', onMatchReset)
    socket.on('rematch-update', onRematchUpdate)
    return () => {
      socket.off('opponent-picked', onOpponentPicked)
      socket.off('reveal', onReveal)
      socket.off('opponent-left', onOpponentLeft)
      socket.off('reaction', onReaction)
      socket.off('match-reset', onMatchReset)
      socket.off('rematch-update', onRematchUpdate)
    }
  }, [you, opponentId])

  function finishReveal() {
    const data = pendingRevealRef.current
    if (!data) return
    setReveal({ mine: data.mine, opp: data.opp, outcome: data.outcome })
    setScores(data.scores)
    if (data.outcome === 'win') sounds.win()
    else if (data.outcome === 'lose') sounds.lose()
    else sounds.draw()
    recordRound('friend', data.outcome, { choice: data.mine })
    setHistory((h) => [...h, data.outcome])
    const ms = matchStreakRef.current
    if (data.outcome === 'win') {
      ms.current += 1
      if (ms.current > ms.best) ms.best = ms.current
    } else if (data.outcome === 'lose') {
      ms.current = 0
    }

    const myScore = data.scores[you] || 0
    const oppScore = data.scores[opponentId] || 0
    if (myScore >= matchLength) {
      setMatchOutcome('win')
      recordMatch('friend', 'win', { variantId, flawless: oppScore === 0 })
      setTimeout(() => sounds.victory(), 300)
      checkDailyChallenge({
        outcome: 'win', mode: 'friend', variantId,
        playerScore: myScore, opponentScore: oppScore,
        bestStreakThisMatch: ms.best,
      })
    } else if (oppScore >= matchLength) {
      setMatchOutcome('lose')
      recordMatch('friend', 'lose', { variantId })
      setTimeout(() => sounds.defeat(), 300)
    }
    checkUnlocks()
    setPhase('revealed')
    pendingRevealRef.current = null
  }

  function play(choiceId) {
    if (phase !== 'picking' || myChoice || matchOutcome || opponentLeft) return
    sounds.click()
    setMyChoice(choiceId)
    getSocket().emit('make-choice', { choice: choiceId })
  }

  function nextRound() {
    if (matchOutcome) return
    setMyChoice(null)
    setOppPicked(false)
    setReveal(null)
    setRound((r) => r + 1)
    setPhase('picking')
  }

  function requestRematch() {
    setRematch((r) => ({ ...r, me: true }))
    getSocket().emit('rematch-request')
  }

  function quit() {
    getSocket().emit('leave-room')
    onExit()
  }

  function react(emoji) {
    if (opponentLeft) return
    sounds.click()
    const r = { id: Date.now() + Math.random(), emoji }
    setMyReaction(r)
    setTimeout(() => setMyReaction((cur) => (cur && cur.id === r.id ? null : cur)), 2000)
    getSocket().emit('reaction', { emoji })
  }

  const resultText = useMemo(() => {
    if (!reveal) return null
    if (reveal.outcome === 'win') return 'YOU WIN!'
    if (reveal.outcome === 'lose') return `${oppName.toUpperCase()} WINS!`
    return "IT'S A DRAW"
  }, [reveal, oppName])

  const resultStyle = useMemo(() => {
    if (!reveal) return ''
    if (reveal.outcome === 'win') return 'text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.7)]'
    if (reveal.outcome === 'lose') return 'text-rose-300 drop-shadow-[0_0_18px_rgba(244,114,128,0.7)]'
    return 'text-amber-200 drop-shadow-[0_0_18px_rgba(252,211,77,0.7)]'
  }, [reveal])

  if (opponentLeft) {
    return (
      <>
        <AchievementToast ids={unlockedToast} onClear={() => setUnlockedToast([])} />
        <DailyToast challenge={dailyToast} onClear={() => setDailyToast(null)} />
      <div className="flex flex-col items-center gap-6 mt-10">
        <h2 className="font-display text-xl sm:text-2xl text-rose-300 neon-text">
          {oppName.toUpperCase()} LEFT
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
      </>
    )
  }

  if (matchOutcome) {
    return (
      <>
        <AchievementToast ids={unlockedToast} onClear={() => setUnlockedToast([])} />
        <DailyToast challenge={dailyToast} onClear={() => setDailyToast(null)} />
      <VictoryScreen
        outcome={matchOutcome}
        scores={{ player: scores[you] || 0, opponent: scores[opponentId] || 0 }}
        playerLabel={myName}
        opponentLabel={oppName}
        playAgainLabel={rematch.me ? 'Rematch requested' : 'Rematch'}
        waitingForOpponent={rematch.me && !rematch.opp}
        onPlayAgain={requestRematch}
        onExit={quit}
      />
      </>
    )
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6">
      <AchievementToast ids={unlockedToast} onClear={() => setUnlockedToast([])} />
      <DailyToast challenge={dailyToast} onClear={() => setDailyToast(null)} />
      <header className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={quit}
            className="text-xs sm:text-sm font-display tracking-widest uppercase text-slate-400 hover:text-rose-300"
          >
            ← Quit
          </button>
          <span className="text-xs sm:text-sm font-display tracking-widest uppercase text-cyan-300">
            ROOM {roomKey} · First to {matchLength}
          </span>
          <MuteToggle />
        </div>

        <h1 className="font-display text-xl sm:text-3xl text-center neon-text">
          <span className="text-purple-300">{myName}</span>
          <span className="text-slate-300"> · vs · </span>
          <span className="text-cyan-300">{oppName}</span>
        </h1>

        <div className="flex items-center gap-3 sm:gap-5">
          <ScoreBox label={myName} value={scores[you] || 0} accent="text-emerald-300" />
          <ScoreBox label="Round" value={round} accent="text-purple-300" />
          <ScoreBox label={oppName} value={scores[opponentId] || 0} accent="text-rose-300" />
        </div>

        <RoundHistory history={history} />
      </header>

      <section className="w-full grid grid-cols-2 gap-4 sm:gap-10 items-end mt-2">
        <ChoiceCard
          choice={reveal ? reveal.mine : myChoice}
          variant={variant}
          owner={myName}
          shaking={phase === 'countdown'}
          reaction={myReaction}
        />
        <ChoiceCard
          choice={reveal ? reveal.opp : oppPicked ? 'locked' : null}
          variant={variant}
          owner={oppName}
          hidden={!reveal && oppPicked}
          shaking={phase === 'countdown'}
          reaction={oppReaction}
        />
      </section>

      <div className="h-16 flex items-center justify-center">
        {phase === 'countdown' && <Countdown onDone={finishReveal} />}
        {phase === 'revealed' && resultText && (
          <div
            key={round}
            className={`font-display text-2xl sm:text-3xl animate-pop ${resultStyle}`}
          >
            {resultText}
          </div>
        )}
        {phase === 'picking' && myChoice && (
          <div className="text-sm sm:text-base text-slate-300 font-display tracking-widest uppercase">
            Waiting for {oppName}…
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
              disabled={phase !== 'picking' || !!myChoice}
            />
          </>
        )}

        <ReactionsBar onReact={react} disabled={opponentLeft} />
      </section>
    </div>
  )
}
