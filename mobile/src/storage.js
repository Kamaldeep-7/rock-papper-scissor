import AsyncStorage from '@react-native-async-storage/async-storage'

const NAME_KEY = 'rps:name'
const STATS_PREFIX = 'rps:stats:'

const DEFAULT_STATS = {
  wins: 0, losses: 0, draws: 0,
  matchWins: 0, matchLosses: 0,
  currentStreak: 0, bestStreak: 0,
}

// In-memory cache so screens can read synchronously after first load.
const cache = { name: '', stats: {} }
let hydrated = false

export async function hydrate() {
  if (hydrated) return
  try {
    cache.name = (await AsyncStorage.getItem(NAME_KEY)) || ''
    for (const mode of ['cpu', 'friend']) {
      const raw = await AsyncStorage.getItem(STATS_PREFIX + mode)
      cache.stats[mode] = raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS }
    }
  } catch {
    cache.stats.cpu = { ...DEFAULT_STATS }
    cache.stats.friend = { ...DEFAULT_STATS }
  }
  hydrated = true
}

export function getName() {
  return cache.name || ''
}

export function setName(name) {
  cache.name = name
  AsyncStorage.setItem(NAME_KEY, name).catch(() => {})
}

export function getStats(mode) {
  return cache.stats[mode] || { ...DEFAULT_STATS }
}

function save(mode, s) {
  cache.stats[mode] = s
  AsyncStorage.setItem(STATS_PREFIX + mode, JSON.stringify(s)).catch(() => {})
}

export function recordRound(mode, outcome) {
  const s = { ...getStats(mode) }
  if (outcome === 'win') {
    s.wins += 1
    s.currentStreak += 1
    if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak
  } else if (outcome === 'lose') {
    s.losses += 1
    s.currentStreak = 0
  } else {
    s.draws += 1
  }
  save(mode, s)
  return s
}

export function recordMatch(mode, outcome) {
  const s = { ...getStats(mode) }
  if (outcome === 'win') s.matchWins += 1
  else if (outcome === 'lose') s.matchLosses += 1
  save(mode, s)
  return s
}
