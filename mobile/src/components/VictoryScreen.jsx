import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors, font } from '../theme.js'

export default function VictoryScreen({
  outcome,
  scores,
  playerLabel,
  opponentLabel,
  onPlayAgain,
  onExit,
  playAgainLabel = 'Play Again',
  waitingForOpponent = false,
}) {
  const win = outcome === 'win'
  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>Match {win ? 'won' : 'over'}</Text>
      <Text style={[styles.heading, { color: win ? colors.green : colors.red }]}>
        {win ? 'VICTORY' : 'DEFEAT'}
      </Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel} numberOfLines={1}>{playerLabel}</Text>
          <Text style={[styles.scoreNum, { color: colors.green }]}>{scores.player}</Text>
        </View>
        <Text style={styles.dash}>—</Text>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreLabel} numberOfLines={1}>{opponentLabel}</Text>
          <Text style={[styles.scoreNum, { color: colors.red }]}>{scores.opponent}</Text>
        </View>
      </View>

      <View style={styles.btnCol}>
        <Pressable
          onPress={onPlayAgain}
          disabled={waitingForOpponent}
          style={({ pressed }) => [
            styles.playAgain,
            waitingForOpponent && { opacity: 0.55 },
            pressed && !waitingForOpponent && styles.pressed,
          ]}
        >
          <Text style={styles.playAgainText}>
            {waitingForOpponent ? 'Waiting for opponent…' : playAgainLabel}
          </Text>
        </Pressable>
        <Pressable onPress={onExit} style={styles.menuBtn}>
          <Text style={styles.menuText}>← Menu</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 22, marginTop: 30, paddingHorizontal: 16 },
  hint: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  heading: { fontFamily: font.display, fontSize: 44, letterSpacing: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  scoreCol: { alignItems: 'center' },
  scoreLabel: {
    fontSize: 10,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
    maxWidth: 110,
    fontFamily: font.display,
  },
  scoreNum: { fontFamily: font.display, fontSize: 32 },
  dash: { color: '#475569', fontSize: 28 },
  btnCol: { alignItems: 'center', gap: 12, marginTop: 10 },
  playAgain: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(126, 34, 206, 0.6)',
    borderWidth: 1,
    borderColor: colors.purple,
  },
  playAgainText: {
    fontFamily: font.display,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.white,
  },
  menuBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  menuText: {
    fontSize: 11,
    fontFamily: font.display,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
})
