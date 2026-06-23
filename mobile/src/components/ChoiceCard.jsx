import { View, Text, StyleSheet } from 'react-native'
import { getChoiceMap } from '../game/constants.js'
import { colors, font } from '../theme.js'

export default function ChoiceCard({ choice, variant, owner, hidden, reaction }) {
  const map = getChoiceMap(variant)
  const display = choice && map[choice]
  const emoji = hidden ? '❔' : display ? display.emoji : '❔'
  const label = hidden ? 'Locked in' : display ? display.label : 'Waiting…'
  return (
    <View style={styles.wrap}>
      <Text style={styles.owner} numberOfLines={1}>{owner}</Text>
      <View style={styles.card}>
        <Text style={styles.emoji}>{emoji}</Text>
        {reaction && (
          <View style={styles.reaction}>
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, flex: 1 },
  owner: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(216, 180, 254, 0.85)',
    fontFamily: font.display,
    maxWidth: 130,
  },
  card: {
    width: 124,
    height: 124,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    position: 'relative',
  },
  emoji: { fontSize: 56 },
  reaction: {
    position: 'absolute',
    top: -10,
    right: -8,
    backgroundColor: 'rgba(15, 7, 41, 0.9)',
    borderRadius: 100,
    padding: 4,
  },
  reactionEmoji: { fontSize: 32 },
  label: { fontSize: 12, color: '#cbd5e1', fontFamily: font.display },
})
