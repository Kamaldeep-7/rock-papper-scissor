import { View, Text, StyleSheet } from 'react-native'
import { getTodaysChallenge } from '../game/dailyChallenges.js'
import { getDailyDoneDate } from '../storage.js'
import { colors, font } from '../theme.js'

export default function DailyChallengeCard() {
  const challenge = getTodaysChallenge()
  const done = getDailyDoneDate() === challenge.date
  return (
    <View style={[styles.card, done ? styles.cardDone : styles.cardActive]}>
      <View style={styles.row}>
        <View style={styles.body}>
          <Text style={[styles.label, { color: done ? colors.green : colors.amber }]}>
            {done ? "Today's Challenge ✓ Done" : "Today's Challenge"}
          </Text>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{challenge.desc}</Text>
        </View>
        <Text style={styles.icon}>{done ? '✅' : '🎯'}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    borderWidth: 2,
    padding: 14,
    marginTop: 16,
  },
  cardActive: {
    backgroundColor: 'rgba(126, 34, 206, 0.25)',
    borderColor: 'rgba(168, 85, 247, 0.7)',
  },
  cardDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(52, 211, 153, 0.7)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  body: { flex: 1 },
  label: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: font.display,
  },
  title: { fontFamily: font.display, fontSize: 14, color: colors.white, marginTop: 6 },
  desc: { fontSize: 12, color: '#cbd5e1', marginTop: 4 },
  icon: { fontSize: 32 },
})
