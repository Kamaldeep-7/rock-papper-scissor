import { useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { sounds } from '../audio.js'
import { colors, font } from '../theme.js'

export default function Countdown({ onDone, startAt = 3 }) {
  const [n, setN] = useState(startAt)

  useEffect(() => {
    if (n > 0) {
      sounds.tick()
      const t = setTimeout(() => setN((v) => v - 1), 550)
      return () => clearTimeout(t)
    }
    sounds.shoot()
    const t = setTimeout(() => onDone?.(), 350)
    return () => clearTimeout(t)
  }, [n, onDone])

  return (
    <Text style={styles.text}>{n > 0 ? String(n) : 'SHOOT!'}</Text>
  )
}

const styles = StyleSheet.create({
  text: { fontFamily: font.display, fontSize: 40, color: colors.pink },
})
