import { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import Menu from './src/game/Menu.jsx'
import FriendsLobby from './src/game/FriendsLobby.jsx'
import CpuGame from './src/game/CpuGame.jsx'
import FriendGame from './src/game/FriendGame.jsx'
import { hydrate as hydrateStorage } from './src/storage.js'
import { hydrateMuted } from './src/audio.js'
import { colors } from './src/theme.js'

export default function App() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [hydrated, setHydrated] = useState(false)
  const [screen, setScreen] = useState('menu')
  const [settings, setSettings] = useState({
    variantId: 'classic',
    matchLength: 5,
    name: 'Player',
    difficulty: 'medium',
  })
  const [friendSession, setFriendSession] = useState(null)

  useEffect(() => {
    Promise.all([hydrateStorage(), hydrateMuted()]).then(() => setHydrated(true))
  }, [])

  function pickMode(mode, opts) {
    setSettings(opts)
    if (mode === 'cpu') setScreen('cpu')
    else setScreen('lobby')
  }

  function onLobbyConnected(session) {
    setFriendSession(session)
    setScreen('friend')
  }

  function backToMenu() {
    setFriendSession(null)
    setScreen('menu')
  }

  const ready = fontsLoaded && hydrated

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          {!ready ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.purple} size="large" />
            </View>
          ) : (
            <View style={styles.body}>
              {screen === 'menu' && <Menu onPick={pickMode} />}
              {screen === 'lobby' && (
                <FriendsLobby
                  settings={settings}
                  onConnected={onLobbyConnected}
                  onBack={backToMenu}
                />
              )}
              {screen === 'cpu' && <CpuGame settings={settings} onExit={backToMenu} />}
              {screen === 'friend' && friendSession && (
                <FriendGame session={friendSession} onExit={backToMenu} />
              )}
            </View>
          )}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
})
