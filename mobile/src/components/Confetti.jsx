import { useEffect, useMemo, useRef } from 'react'
import { View, Animated, Dimensions, StyleSheet } from 'react-native'

const COLORS = ['#a855f7', '#f472b6', '#22d3ee', '#fcd34d', '#34d399', '#fb7185', '#ffffff']

export default function Confetti({ count = 70 }) {
  const { width, height } = useMemo(() => Dimensions.get('window'), [])
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        delay: Math.random() * 1400,
        duration: 2800 + Math.random() * 2400,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
        size: 6 + Math.random() * 8,
      })),
    [count, width]
  )

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.layer]}>
      {pieces.map((p) => (
        <Piece key={p.id} piece={p} maxY={height + 60} />
      ))}
    </View>
  )
}

function Piece({ piece, maxY }) {
  const ty = useRef(new Animated.Value(-40)).current
  useEffect(() => {
    Animated.timing(ty, {
      toValue: maxY,
      duration: piece.duration,
      delay: piece.delay,
      useNativeDriver: true,
    }).start()
  }, [maxY, ty, piece.delay, piece.duration])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: piece.x,
        width: piece.size,
        height: piece.size * 0.45,
        borderRadius: 2,
        backgroundColor: piece.color,
        transform: [{ translateY: ty }, { rotate: `${piece.rotate}deg` }],
      }}
    />
  )
}

const styles = StyleSheet.create({
  layer: { overflow: 'hidden' },
})
