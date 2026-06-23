import { View, Text, StyleSheet } from 'react-native'
import { colors, font } from '../theme.js'

export default function RoundHistory({ history, max = 10 }) {
  if (!history?.length) return null
  const trimmed = history.slice(-max)
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Recent</Text>
      {trimmed.map((r, i) => {
        const tone =
          r === 'win'
            ? { bg: 'rgba(16, 185, 129, 0.25)', border: colors.green, fg: '#a7f3d0' }
            : r === 'lose'
              ? { bg: 'rgba(244, 63, 94, 0.25)', border: colors.red, fg: '#fecdd3' }
              : { bg: 'rgba(245, 158, 11, 0.25)', border: colors.amber, fg: '#fde68a' }
        const letter = r === 'win' ? 'W' : r === 'lose' ? 'L' : 'D'
        return (
          <View
            key={i}
            style={[styles.cell, { backgroundColor: tone.bg, borderColor: tone.border }]}
          >
            <Text style={[styles.cellText, { color: tone.fg }]}>{letter}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textMute,
    fontFamily: font.display,
    marginRight: 4,
  },
  cell: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 10, fontFamily: font.display },
})
