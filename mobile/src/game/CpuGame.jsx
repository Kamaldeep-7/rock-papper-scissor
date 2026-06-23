import { useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
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
import { colors, font } from '../theme.js'

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

  const resultColor = useMemo(() => {
    if (result === 'win') return colors.green
    if (result === 'lose') return colors.red
    return colors.amber
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
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onExit} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backText}>← Menu</Text>
        </Pressable>
        <Text style={[styles.modeLabel, { color: colors.purple }]}>
          VS CPU · First to {settings.matchLength}
        </Text>
        <MuteToggle />
      </View>

      <Text style={styles.matchupTitle}>
        <Text style={{ color: colors.purple }}>{settings.name}</Text>
        <Text style={{ color: colors.textDim }}> · vs · </Text>
        <Text style={{ color: colors.pink }}>CPU</Text>
      </Text>

      <View style={styles.scoreRow}>
        <ScoreBox label={settings.name} value={scores.player} accent={colors.green} />
        <ScoreBox label="Round" value={round} accent={colors.purple} />
        <ScoreBox label="CPU" value={scores.cpu} accent={colors.red} />
        <ScoreBox label="Draws" value={scores.draws} accent={colors.amber} />
      </View>

      <View style={styles.cardsRow}>
        <ChoiceCard choice={playerChoice} variant={variant} owner={settings.name} />
        <ChoiceCard choice={cpuChoice} variant={variant} owner="CPU" />
      </View>

      <View style={styles.statusArea}>
        {phase === 'countdown' && <Countdown onDone={reveal} />}
        {phase === 'revealed' && resultText && (
          <Text style={[styles.resultText, { color: resultColor }]}>{resultText}</Text>
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
              disabled={phase !== 'picking'}
            />
          </>
        )}

        <Pressable
          onPress={newMatch}
          style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
        >
          <Text style={styles.resetBtnText}>Reset Match</Text>
        </Pressable>
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
  actionArea: { width: '100%', alignItems: 'center', gap: 18, marginTop: 4 },
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
  resetBtn: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  resetBtnText: {
    fontFamily: font.display,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
})
