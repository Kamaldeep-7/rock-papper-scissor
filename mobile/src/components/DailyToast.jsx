import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { colors, font } from '../theme.js'

export default function DailyToast({ challenge, onClear }) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!challenge) return
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start()
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => onClear?.())
    }, 3500)
    return () => clearTimeout(t)
  }, [challenge, opacity, onClear])

  if (!challenge) return null

  return (
    <Animated.View pointerEvents="none" style={[styles.layer, { opacity }]}>
      <View style={styles.toast}>
        <Text style={styles.icon}>✅</Text>
        <View style={styles.body}>
          <Text style={styles.hint}>Daily Challenge Complete</Text>
          <Text style={styles.title}>{challenge.title}</Text>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 99,
    alignItems: 'center',
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
    borderColor: colors.green,
    maxWidth: 320,
  },
  icon: { fontSize: 28 },
  body: { flexShrink: 1 },
  hint: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.green,
    fontFamily: font.display,
  },
  title: { fontFamily: font.display, fontSize: 13, color: colors.white, marginTop: 2 },
})
