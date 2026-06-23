import { View, Text, StyleSheet } from 'react-native'
import { ACHIEVEMENTS } from '../game/achievements.js'
import { getUnlocked } from '../storage.js'
import { colors, font } from '../theme.js'

export default function AchievementsRow() {
  const unlocked = new Set(getUnlocked().map((a) => a.id))
  const count = unlocked.size
  const pct = Math.round((count / ACHIEVEMENTS.length) * 100)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.sub}>{count} of {ACHIEVEMENTS.length} unlocked</Text>
        </View>
        <Text style={styles.pct}>{pct}%</Text>
      </View>

      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>

      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id)
          return (
            <View
              key={a.id}
              style={[styles.badge, on ? styles.badgeOn : styles.badgeOff]}
            >
              <Text style={[styles.badgeEmoji, !on && { opacity: 0.35 }]}>{a.emoji}</Text>
              <Text
                style={[styles.badgeName, on ? styles.nameOn : styles.nameOff]}
                numberOfLines={2}
              >
                {a.name}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const BADGE_WIDTH = 72

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 420,
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.pink,
    fontFamily: font.display,
  },
  sub: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textMute,
    fontFamily: font.display,
    marginTop: 2,
  },
  pct: { fontFamily: font.display, fontSize: 22, color: colors.white },
  barBg: {
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 14,
  },
  barFill: { height: '100%', backgroundColor: colors.pink },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  badge: {
    width: BADGE_WIDTH,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  badgeOn: {
    backgroundColor: 'rgba(126, 34, 206, 0.45)',
    borderColor: colors.pink,
  },
  badgeOff: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderColor: '#334155',
  },
  badgeEmoji: { fontSize: 24 },
  badgeName: {
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: font.display,
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 10,
  },
  nameOn: { color: '#fbcfe8' },
  nameOff: { color: '#475569' },
})
