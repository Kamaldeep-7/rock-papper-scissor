import { useState } from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import { isMuted, setMuted } from '../audio.js'

export default function MuteToggle() {
  const [muted, setMutedState] = useState(isMuted())
  function toggle() {
    const v = !muted
    setMuted(v)
    setMutedState(v)
  }
  return (
    <Pressable
      onPress={toggle}
      hitSlop={10}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
      accessibilityLabel={muted ? 'Unmute' : 'Mute'}
    >
      <Text style={styles.icon}>{muted ? '🔇' : '🔊'}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
})
