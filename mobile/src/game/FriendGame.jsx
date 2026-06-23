import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ScoreBox from '../components/ScoreBox.jsx'
import ChoiceButtons from '../components/ChoiceButtons.jsx'
import Countdown from '../components/Countdown.jsx'
import VictoryScreen from '../components/VictoryScreen.jsx'
import ReactionsBar from '../components/ReactionsBar.jsx'
import MuteToggle from '../components/MuteToggle.jsx'
import AchievementToast from '../components/AchievementToast.jsx'
import { getVariant } from './constants.js'
import { sounds } from '../audio.js'
import { recordRound, recordMatch, getSnapshot, recordUnlocks } from '../storage.js'
import { evaluate as evaluateAchievements } from './achievements.js'
import { getSocket } from '../socket.js'
import { colors, font } from '../theme.js'

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

  function checkUnlocks() {
    const newly = recordUnlocks(evaluateAchievements(getSnapshot()))
    if (newly.length) setUnlockedToast(newly)
  }

  const pendingRevealRef = useRef(null)

  useEffect(() => {
    const socket = getSocket()

    function onOpponentPicked() { setOppPicked(true) }
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
    function onOpponentLeft() { setOpponentLeft(true) }
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

    const myScore = data.scores[you] || 0
    const oppScore = data.scores[opponentId] || 0
    if (myScore >= matchLength) {
      setMatchOutcome('win')
      recordMatch('friend', 'win', { variantId, flawless: oppScore === 0 })
      setTimeout(() => sounds.victory(), 300)
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

  const resultColor = useMemo(() => {
    if (!reveal) return colors.text
    if (reveal.outcome === 'win') return colors.green
    if (reveal.outcome === 'lose') return colors.red
    return colors.amber
  }, [reveal])

  if (opponentLeft) {
    return (
      <>
        <AchievementToast ids={unlockedToast} onClear={() => setUnlockedToast([])} />
      <View style={styles.leftWrap}>
        <Text style={styles.leftTitle}>{oppName.toUpperCase()} LEFT</Text>
        <Text style={styles.leftBody}>
          Your friend disconnected. Head back to the menu to start a new game.
        </Text>
        <Pressable
          onPress={onExit}
          style={({ pressed }) => [styles.backToMenu, pressed && styles.pressed]}
        >
          <Text style={styles.backToMenuText}>← Back to Menu</Text>
        </Pressable>
      </View>
      </>
    )
  }

  if (matchOutcome) {
    return (
      <>
        <AchievementToast ids={unlockedToast} onClear={() => setUnlockedToast([])} />
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
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <AchievementToast ids={unlockedToast} onClear={() => setUnlockedToast([])} />
      <View style={styles.topBar}>
        <Pressable onPress={quit} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backText}>← Quit</Text>
        </Pressable>
        <Text style={[styles.modeLabel, { color: colors.cyan }]}>
          ROOM {roomKey} · First to {matchLength}
        </Text>
        <MuteToggle />
      </View>

      <Text style={styles.matchupTitle}>
        <Text style={{ color: colors.purple }}>{myName}</Text>
        <Text style={{ color: colors.textDim }}> · vs · </Text>
        <Text style={{ color: colors.cyan }}>{oppName}</Text>
      </Text>

      <View style={styles.scoreRow}>
        <ScoreBox label={myName} value={scores[you] || 0} accent={colors.green} />
        <ScoreBox label="Round" value={round} accent={colors.purple} />
        <ScoreBox label={oppName} value={scores[opponentId] || 0} accent={colors.red} />
      </View>

      <View style={styles.cardsRow}>
        <ChoiceCard
          choice={reveal ? reveal.mine : myChoice}
          variant={variant}
          owner={myName}
          reaction={myReaction}
        />
        <ChoiceCard
          choice={reveal ? reveal.opp : oppPicked ? 'locked' : null}
          variant={variant}
          owner={oppName}
          hidden={!reveal && oppPicked}
          reaction={oppReaction}
        />
      </View>

      <View style={styles.statusArea}>
        {phase === 'countdown' && <Countdown onDone={finishReveal} />}
        {phase === 'revealed' && resultText && (
          <Text style={[styles.resultText, { color: resultColor }]}>{resultText}</Text>
        )}
        {phase === 'picking' && myChoice && (
          <Text style={styles.waitingText}>Waiting for {oppName}…</Text>
        )}
      </View>

      <View style={styles.actionArea}>
        {phase === 'revealed' ? (
          <Pressable
            onPress={nextRound}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
          >
            <Text style={styles.nextBtnText}>Next Round →</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.hint}>Choose your weapon</Text>
            <ChoiceButtons
              choices={variant.choices}
              onPick={play}
              disabled={phase !== 'picking' || !!myChoice}
            />
          </>
        )}

        <ReactionsBar onReact={react} disabled={opponentLeft} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: 50 },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  backText: {
    fontSize: 11,
    fontFamily: font.display,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  modeLabel: {
    fontSize: 10,
    fontFamily: font.display,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    flexShrink: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  matchupTitle: {
    fontFamily: font.display,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 22,
    paddingHorizontal: 8,
  },
  statusArea: { height: 64, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  resultText: { fontFamily: font.display, fontSize: 22 },
  waitingText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontFamily: font.display,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actionArea: { width: '100%', alignItems: 'center', gap: 16, marginTop: 4 },
  nextBtn: {
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.purpleDeep,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  nextBtnText: {
    fontFamily: font.display,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.white,
  },
  hint: {
    fontSize: 11,
    color: colors.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  leftWrap: { alignItems: 'center', gap: 22, marginTop: 50, paddingHorizontal: 16 },
  leftTitle: { fontFamily: font.display, fontSize: 18, color: colors.red },
  leftBody: { fontSize: 13, color: '#cbd5e1', maxWidth: 320, textAlign: 'center' },
  backToMenu: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.purpleDeep,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  backToMenuText: {
    fontFamily: font.display,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.white,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
})
