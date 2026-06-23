import { View, Text, StyleSheet } from 'react-native'
import { colors, font } from '../theme.js'

export default function ScoreBox({ label, value, accent }) {
  return (
    <View style={styles.box}>
      <Text style={[styles.label, { color: accent || colors.textDim }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 78,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: font.display,
    maxWidth: 90,
  },
  value: { fontSize: 24, fontFamily: font.display, marginTop: 4, color: '#f1f5f9' },
})
