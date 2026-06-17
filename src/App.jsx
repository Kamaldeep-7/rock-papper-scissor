import { useState } from 'react'
import Menu from './game/Menu.jsx'
import FriendsLobby from './game/FriendsLobby.jsx'
import CpuGame from './game/CpuGame.jsx'
import FriendGame from './game/FriendGame.jsx'

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [friendSession, setFriendSession] = useState(null)

  function pickMode(mode) {
    if (mode === 'cpu') setScreen('cpu')
    else if (mode === 'friend') setScreen('lobby')
  }

  function onLobbyConnected(session) {
    setFriendSession(session)
    setScreen('friend')
  }

  function backToMenu() {
    setFriendSession(null)
    setScreen('menu')
  }

  return (
    <div className="starfield relative min-h-screen flex flex-col items-center justify-start px-4 py-6 sm:py-10">
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {screen === 'menu' && <Menu onPick={pickMode} />}
        {screen === 'lobby' && (
          <FriendsLobby onConnected={onLobbyConnected} onBack={backToMenu} />
        )}
        {screen === 'cpu' && <CpuGame onExit={backToMenu} />}
        {screen === 'friend' && friendSession && (
          <FriendGame session={friendSession} onExit={backToMenu} />
        )}
      </div>
    </div>
  )
}
