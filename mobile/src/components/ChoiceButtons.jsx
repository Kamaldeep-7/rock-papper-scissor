import { View, Pressable, Text, StyleSheet } from 'react-native'
import { colors, font } from '../theme.js'

export default function ChoiceButtons({ choices, onPick, disabled }) {
  return (
    <View style={styles.row}>
      {choices.map((c) => (
        <View key={c.id} style={styles.cell}>
          <Pressable
            onPress={() => onPick(c.id)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.btn,
              disabled && { opacity: 0.5 },
              pressed && !disabled && { transform: [{ scale: 0.93 }], opacity: 0.85 },
            ]}
            accessibilityLabel={c.label}
            hitSlop={6}
          >
            <Text style={styles.emoji}>{c.emoji}</Text>
          </Pressable>
          <Text style={styles.label}>{c.label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  cell: { alignItems: 'center', gap: 6 },
  btn: {
    width: 84,
    height: 84,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(126, 34, 206, 0.32)',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.65)',
  },
  emoji: { fontSize: 40 },
  label: {
    fontSize: 10,
    fontFamily: font.display,
    color: colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
