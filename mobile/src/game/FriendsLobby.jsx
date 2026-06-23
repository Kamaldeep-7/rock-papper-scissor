import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, Share, StyleSheet } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { getSocket } from '../socket.js'
import { sounds } from '../audio.js'
import { colors, font } from '../theme.js'

export default function FriendsLobby({ settings, onConnected, onBack }) {
  const [view, setView] = useState('choose')
  const [roomKey, setRoomKey] = useState('')
  const [inputKey, setInputKey] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const socket = getSocket()
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    setConnected(socket.connected)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  useEffect(() => {
    const socket = getSocket()
    function onReady({ players, names, variantId, matchLength }) {
      onConnected({ key: roomKey, you: socket.id, players, names, variantId, matchLength })
    }
    socket.on('room-ready', onReady)
    return () => socket.off('room-ready', onReady)
  }, [roomKey, onConnected])

  function createRoom() {
    if (busy) return
    setBusy(true)
    setError('')
    sounds.click()
    const socket = getSocket()
    socket.emit(
      'create-room',
      { name: settings.name, variantId: settings.variantId, matchLength: settings.matchLength },
      (res) => {
        setBusy(false)
        if (!res?.ok) return setError(res?.error || 'Could not create room')
        setRoomKey(res.key)
        setView('hosting')
        setStatus('Waiting for opponent…')
      }
    )
  }

  function joinRoom() {
    if (busy) return
    const key = inputKey.toUpperCase().trim()
    if (key.length < 4) return setError('Enter a valid key')
    setBusy(true)
    setError('')
    sounds.click()
    const socket = getSocket()
    socket.emit('join-room', { key, name: settings.name }, (res) => {
      setBusy(false)
      if (!res?.ok) return setError(res?.error || 'Could not join room')
      setRoomKey(res.key)
    })
  }

  function cancel() {
    getSocket().emit('leave-room')
    setRoomKey('')
    setInputKey('')
    setError('')
    setStatus('')
    setView('choose')
  }

  async function copyKey() {
    try {
      await Clipboard.setStringAsync(roomKey)
      setStatus('Key copied! Waiting for opponent…')
    } catch {
      setStatus('Copy failed — share the key manually')
    }
  }

  async function shareKey() {
    try {
      await Share.share({
        message: `Join my RPS game! Room key: ${roomKey}\nhttps://rps-hastagfuggi.onrender.com/?key=${roomKey}`,
      })
    } catch {}
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        <Text style={{ color: colors.cyan }}>FRIEND </Text>
        <Text style={{ color: colors.textDim }}>· </Text>
        <Text style={{ color: colors.pink }}>LOBBY</Text>
      </Text>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: connected ? colors.green : colors.red },
          ]}
        />
        <Text style={styles.statusText}>
          {connected ? `Hi, ${settings.name} — connected` : 'Connecting…'}
        </Text>
      </View>

      {view === 'choose' && (
        <View style={styles.column}>
          <LobbyButton
            label="Create Room"
            sub={`${variantLabel(settings.variantId)} · First to ${settings.matchLength}`}
            onPress={createRoom}
            disabled={!connected || busy}
          />
          <LobbyButton
            label="Join Room"
            sub="Enter a friend's key"
            onPress={() => setView('joining')}
            disabled={!connected || busy}
          />
          <Pressable onPress={onBack} style={styles.linkBtn}>
            <Text style={styles.linkText}>← Back</Text>
          </Pressable>
        </View>
      )}

      {view === 'hosting' && (
        <View style={styles.column}>
          <Text style={styles.hint}>Share this key with your friend</Text>
          <View style={styles.keyBox}>
            <Text style={styles.keyText}>{roomKey}</Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable
              onPress={copyKey}
              style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
            >
              <Text style={styles.smallBtnText}>Copy Key</Text>
            </Pressable>
            <Pressable
              onPress={shareKey}
              style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
            >
              <Text style={styles.smallBtnText}>Share</Text>
            </Pressable>
          </View>
          {status ? (
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: colors.cyan }]} />
              <Text style={styles.statusGrey}>{status}</Text>
            </View>
          ) : null}
          <Pressable onPress={cancel} style={styles.linkBtn}>
            <Text style={styles.linkText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {view === 'joining' && (
        <View style={styles.column}>
          <Text style={styles.hint}>Enter room key</Text>
          <TextInput
            value={inputKey}
            onChangeText={(v) => setInputKey(v.toUpperCase())}
            maxLength={8}
            placeholder="ABC123"
            placeholderTextColor="#475569"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.keyInput}
          />
          <View style={styles.actionRow}>
            <Pressable
              onPress={joinRoom}
              disabled={busy}
              style={({ pressed }) => [
                styles.primaryBtn,
                busy && { opacity: 0.5 },
                pressed && !busy && styles.pressed,
              ]}
            >
              <Text style={styles.primaryBtnText}>Join</Text>
            </Pressable>
            <Pressable
              onPress={() => { setView('choose'); setError('') }}
              style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
            >
              <Text style={styles.smallBtnText}>← Back</Text>
            </Pressable>
          </View>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

function variantLabel(id) {
  if (id === 'lizardSpock') return 'Lizard · Spock'
  return 'Classic'
}

function LobbyButton({ label, sub, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.lobbyBtn,
        disabled && { opacity: 0.5 },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.lobbyBtnTitle}>{label}</Text>
      <Text style={styles.lobbyBtnSub}>{sub}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 24,
    marginTop: 28,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 4,
  },
  title: { fontFamily: font.display, fontSize: 18, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  statusGrey: { color: '#cbd5e1', fontSize: 13 },
  column: { width: '100%', alignItems: 'center', gap: 16 },
  lobbyBtn: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(126, 34, 206, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.55)',
  },
  lobbyBtnTitle: { fontFamily: font.display, fontSize: 15, color: colors.white },
  lobbyBtnSub: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  keyBox: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.6)',
  },
  keyText: {
    fontFamily: font.display,
    fontSize: 26,
    color: '#a5f3fc',
    letterSpacing: 8,
  },
  keyInput: {
    width: 240,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.6)',
    fontFamily: font.display,
    fontSize: 22,
    textAlign: 'center',
    color: '#a5f3fc',
    letterSpacing: 8,
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  smallBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  smallBtnText: {
    fontFamily: font.display,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#e2e8f0',
  },
  primaryBtn: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.cyanDeep,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  primaryBtnText: {
    fontFamily: font.display,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.white,
  },
  linkBtn: { marginTop: 6, paddingVertical: 8 },
  linkText: {
    fontSize: 11,
    fontFamily: font.display,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  errorText: { color: '#fda4af', fontSize: 13, fontFamily: font.display },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
})
