import { useEffect, useState } from 'react'
import Menu from './game/Menu.jsx'
import FriendsLobby from './game/FriendsLobby.jsx'
import CpuGame from './game/CpuGame.jsx'
import FriendGame from './game/FriendGame.jsx'

function readInitialKey() {
  try {
    return new URLSearchParams(window.location.search).get('key') || ''
  } catch {
    return ''
  }
}

function clearQuery() {
  try {
    const url = new URL(window.location.href)
    url.search = ''
    window.history.replaceState({}, '', url.toString())
  } catch {}
}

export default function App() {
  const [initialKey, setInitialKey] = useState(readInitialKey)
  const [screen, setScreen] = useState(initialKey ? 'lobby' : 'menu')
  const [settings, setSettings] = useState({
    variantId: 'classic',
    matchLength: 5,
    name: 'Player',
  })
  const [friendSession, setFriendSession] = useState(null)

  useEffect(() => {
    if (initialKey) clearQuery()
  }, [initialKey])

  function pickMode(mode, opts) {
    setSettings(opts)
    if (mode === 'cpu') setScreen('cpu')
    else setScreen('lobby')
  }

  function onLobbyConnected(session) {
    setFriendSession(session)
    setInitialKey('')
    setScreen('friend')
  }

  function backToMenu() {
    setFriendSession(null)
    setInitialKey('')
    setScreen('menu')
  }

  return (
    <div className="starfield relative min-h-screen flex flex-col items-center justify-start px-4 py-6 sm:py-10">
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {screen === 'menu' && <Menu onPick={pickMode} />}
        {screen === 'lobby' && (
          <FriendsLobby
            settings={settings}
            initialKey={initialKey}
            onConnected={onLobbyConnected}
            onBack={backToMenu}
          />
        )}
        {screen === 'cpu' && <CpuGame settings={settings} onExit={backToMenu} />}
        {screen === 'friend' && friendSession && (
          <FriendGame session={friendSession} onExit={backToMenu} />
        )}
      </div>
    </div>
  )
}
