import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { ACHIEVEMENTS } from '../game/achievements.js'
import { colors, font } from '../theme.js'

export default function AchievementToast({ ids, onClear }) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!ids?.length) return
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start()
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => onClear?.())
    }, 3500)
    return () => clearTimeout(t)
  }, [ids, opacity, onClear])

  if (!ids?.length) return null
  const items = ids
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean)

  return (
    <Animated.View pointerEvents="none" style={[styles.layer, { opacity }]}>
      {items.map((a) => (
        <View key={a.id} style={styles.toast}>
          <Text style={styles.emoji}>{a.emoji}</Text>
          <View style={styles.body}>
            <Text style={styles.hint}>Achievement Unlocked</Text>
            <Text style={styles.name}>{a.name}</Text>
            <Text style={styles.desc} numberOfLines={2}>{a.desc}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 12,
    right: 12,
    left: 12,
    zIndex: 99,
    gap: 8,
    alignItems: 'flex-end',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderWidth: 2,
    borderColor: colors.pink,
    maxWidth: 320,
  },
  emoji: { fontSize: 30 },
  body: { flexShrink: 1 },
  hint: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.pink,
    fontFamily: font.display,
  },
  name: { fontFamily: font.display, fontSize: 13, color: colors.white, marginTop: 2 },
  desc: { fontSize: 10, color: colors.textDim, marginTop: 2 },
})
