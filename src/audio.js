let ctx = null
let muted = false

function getCtx() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function beep({ freq = 440, dur = 0.15, type = 'sine', vol = 0.15, attack = 0.005, delay = 0 }) {
  if (muted) return
  const c = getCtx()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(c.destination)
    const now = c.currentTime + delay
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(vol, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    osc.start(now)
    osc.stop(now + dur + 0.05)
  } catch {
    // ignore
  }
}

export function setMuted(m) {
  muted = m
  try { localStorage.setItem('rps:muted', m ? '1' : '0') } catch {}
}
export function isMuted() { return muted }
try {
  muted = localStorage.getItem('rps:muted') === '1'
} catch {}

export const sounds = {
  click() {
    beep({ freq: 600, dur: 0.04, type: 'square', vol: 0.08 })
  },
  tick() {
    beep({ freq: 440, dur: 0.08, type: 'sine', vol: 0.12 })
  },
  shoot() {
    beep({ freq: 880, dur: 0.18, type: 'sawtooth', vol: 0.18 })
  },
  win() {
    beep({ freq: 660, dur: 0.14, vol: 0.18 })
    beep({ freq: 990, dur: 0.18, vol: 0.18, delay: 0.13 })
  },
  lose() {
    beep({ freq: 220, dur: 0.28, type: 'sawtooth', vol: 0.16 })
  },
  draw() {
    beep({ freq: 330, dur: 0.18, type: 'triangle', vol: 0.13 })
  },
  victory() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => beep({ freq: f, dur: 0.16, vol: 0.22, delay: i * 0.1 }))
  },
  defeat() {
    const notes = [392, 349, 311, 262]
    notes.forEach((f, i) => beep({ freq: f, dur: 0.22, type: 'sawtooth', vol: 0.18, delay: i * 0.13 }))
  },
}
