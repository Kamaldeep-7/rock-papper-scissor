import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { ACHIEVEMENTS } from '../game/achievements.js'
import { getUnlocked } from '../storage.js'
import { colors, font } from '../theme.js'

export default function AchievementsRow() {
  const unlocked = new Set(getUnlocked().map((a) => a.id))
  const count = unlocked.size

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.count}>{count} / {ACHIEVEMENTS.length}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id)
          return (
            <View
              key={a.id}
              style={[styles.badge, on ? styles.badgeOn : styles.badgeOff]}
            >
              <Text style={[styles.badgeEmoji, !on && { opacity: 0.4 }]}>{a.emoji}</Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, marginTop: 18 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
    fontFamily: font.display,
  },
  count: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMute,
    fontFamily: font.display,
  },
  row: { gap: 10, paddingHorizontal: 4, paddingBottom: 4 },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeOn: {
    backgroundColor: 'rgba(126, 34, 206, 0.4)',
    borderColor: colors.pink,
  },
  badgeOff: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderColor: '#334155',
  },
  badgeEmoji: { fontSize: 26 },
})
