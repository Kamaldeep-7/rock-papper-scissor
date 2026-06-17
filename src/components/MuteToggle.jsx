import { useState } from 'react'
import { isMuted, setMuted } from '../audio.js'

export default function MuteToggle() {
  const [muted, setMutedState] = useState(isMuted())
  function toggle() {
    const v = !muted
    setMuted(v)
    setMutedState(v)
  }
  return (
    <button
      onClick={toggle}
      className="text-base sm:text-lg w-9 h-9 rounded-full bg-slate-800/60 border border-slate-600
        hover:border-pink-400 transition-colors"
      title={muted ? 'Unmute' : 'Mute'}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
