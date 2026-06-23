// Audio is stubbed on mobile. The web build generates tones with the Web Audio API;
// React Native has no equivalent for synthesising oscillator tones, so these are no-ops.
// To add sounds, ship .mp3 files under assets/ and play them with expo-av.

import AsyncStorage from '@react-native-async-storage/async-storage'

const MUTED_KEY = 'rps:muted'

let muted = false

export async function hydrateMuted() {
  try {
    muted = (await AsyncStorage.getItem(MUTED_KEY)) === '1'
  } catch {}
}

export function setMuted(m) {
  muted = m
  AsyncStorage.setItem(MUTED_KEY, m ? '1' : '0').catch(() => {})
}

export function isMuted() { return muted }

const noop = () => {}

export const sounds = {
  click: noop,
  tick: noop,
  shoot: noop,
  win: noop,
  lose: noop,
  draw: noop,
  victory: noop,
  defeat: noop,
}
