import { View, Pressable, Text, StyleSheet } from 'react-native'
import { REACTIONS } from '../game/constants.js'

export default function ReactionsBar({ onReact, disabled }) {
  return (
    <View style={styles.row}>
      {REACTIONS.map((r) => (
        <Pressable
          key={r}
          disabled={disabled}
          onPress={() => onReact(r)}
          style={({ pressed }) => [
            styles.btn,
            disabled && { opacity: 0.3 },
            pressed && !disabled && { transform: [{ scale: 0.92 }] },
          ]}
          accessibilityLabel={`React with ${r}`}
        >
          <Text style={styles.emoji}>{r}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
})
