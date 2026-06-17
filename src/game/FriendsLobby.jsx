import { useEffect, useState } from 'react'
import { getSocket } from '../socket.js'

export default function FriendsLobby({ onConnected, onBack }) {
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
    function onReady({ players }) {
      onConnected({ key: roomKey, you: socket.id, players })
    }
    socket.on('room-ready', onReady)
    return () => socket.off('room-ready', onReady)
  }, [roomKey, onConnected])

  function createRoom() {
    if (busy) return
    setBusy(true)
    setError('')
    const socket = getSocket()
    socket.emit('create-room', (res) => {
      setBusy(false)
      if (!res?.ok) return setError(res?.error || 'Could not create room')
      setRoomKey(res.key)
      setView('hosting')
      setStatus('Waiting for opponent…')
    })
  }

  function joinRoom() {
    if (busy) return
    const key = inputKey.toUpperCase().trim()
    if (key.length < 4) return setError('Enter a valid key')
    setBusy(true)
    setError('')
    const socket = getSocket()
    socket.emit('join-room', { key }, (res) => {
      setBusy(false)
      if (!res?.ok) return setError(res?.error || 'Could not join room')
      setRoomKey(res.key)
      // room-ready will fire and onConnected will run
    })
  }

  function cancel() {
    const socket = getSocket()
    socket.emit('leave-room')
    setRoomKey('')
    setInputKey('')
    setError('')
    setStatus('')
    setView('choose')
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(roomKey)
      setStatus('Key copied! Waiting for opponent…')
    } catch {
      setStatus('Copy failed — share the key manually')
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 mt-6 w-full max-w-md">
      <h2 className="font-display text-xl sm:text-2xl text-center neon-text">
        <span className="text-cyan-300">FRIEND</span>
        <span className="text-slate-300"> · </span>
        <span className="text-pink-300">LOBBY</span>
      </h2>

      <div className="flex items-center gap-2 text-[10px] sm:text-xs tracking-widest uppercase">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        <span className="text-slate-400">{connected ? 'Connected to server' : 'Connecting…'}</span>
      </div>

      {view === 'choose' && (
        <div className="flex flex-col w-full gap-4">
          <LobbyButton
            label="Create Room"
            sub="Generate a key for a friend"
            onClick={createRoom}
            disabled={!connected || busy}
          />
          <LobbyButton
            label="Join Room"
            sub="Enter a friend's key"
            onClick={() => setView('joining')}
            disabled={!connected || busy}
          />
          <button
            onClick={onBack}
            className="mt-3 text-xs sm:text-sm font-display tracking-widest uppercase text-slate-400 hover:text-slate-200"
          >
            ← Back
          </button>
        </div>
      )}

      {view === 'hosting' && (
        <div className="flex flex-col w-full items-center gap-5">
          <span className="text-xs sm:text-sm tracking-widest uppercase text-slate-400">
            Share this key
          </span>
          <div className="flex items-center gap-3">
            <div className="px-6 py-4 rounded-2xl bg-slate-900/70 border-2 border-cyan-400/60 font-display text-2xl sm:text-3xl tracking-[0.4em] text-cyan-200">
              {roomKey}
            </div>
            <button
              onClick={copyKey}
              className="px-4 py-4 rounded-2xl bg-slate-800/80 border border-slate-600 text-xs font-display tracking-widest uppercase text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
            >
              Copy
            </button>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
            {status}
          </div>
          <button
            onClick={cancel}
            className="mt-2 text-xs sm:text-sm font-display tracking-widest uppercase text-slate-400 hover:text-rose-300"
          >
            Cancel
          </button>
        </div>
      )}

      {view === 'joining' && (
        <div className="flex flex-col w-full items-center gap-4">
          <span className="text-xs sm:text-sm tracking-widest uppercase text-slate-400">
            Enter room key
          </span>
          <input
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') joinRoom()
            }}
            maxLength={8}
            placeholder="ABC123"
            className="w-56 px-5 py-4 rounded-2xl bg-slate-900/70 border-2 border-cyan-400/60
              font-display text-2xl tracking-[0.4em] text-center text-cyan-200 outline-none
              focus:border-pink-400"
          />
          <div className="flex gap-3 mt-2">
            <button
              onClick={joinRoom}
              disabled={busy}
              className="px-6 py-2 rounded-xl font-display text-xs tracking-widest uppercase
                bg-gradient-to-br from-cyan-600/50 to-emerald-600/50 border border-cyan-400 text-white
                hover:scale-105 disabled:opacity-50"
            >
              Join
            </button>
            <button
              onClick={() => {
                setView('choose')
                setError('')
              }}
              className="px-6 py-2 rounded-xl font-display text-xs tracking-widest uppercase
                bg-slate-800/60 border border-slate-600 text-slate-300 hover:border-rose-400 hover:text-rose-200"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-rose-300 text-sm font-display tracking-wider">{error}</div>
      )}
    </div>
  )
}

function LobbyButton({ label, sub, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-5 rounded-2xl text-left
        bg-gradient-to-br from-purple-600/30 to-cyan-600/30
        border-2 border-purple-400/50 hover:border-cyan-300
        hover:scale-[1.02] active:scale-[0.98] transition-all
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <div className="font-display text-base text-white">{label}</div>
      <div className="text-xs text-slate-300/80 mt-1 tracking-wider uppercase">{sub}</div>
    </button>
  )
}
