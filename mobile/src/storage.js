import AsyncStorage from '@react-native-async-storage/async-storage'

const NAME_KEY = 'rps:name'
const STATS_PREFIX = 'rps:stats:'
const ACH_KEY = 'rps:achievements'
const DAILY_KEY = 'rps:dailyDone'

const DEFAULT_STATS = {
  wins: 0, losses: 0, draws: 0,
  matchWins: 0, matchLosses: 0,
  currentStreak: 0, bestStreak: 0,
  flawlessWins: 0,
  winsByChoice: {},
  variantMatchWins: {},
}

function migrate(s) {
  if (!s.winsByChoice) s.winsByChoice = {}
  if (!s.variantMatchWins) s.variantMatchWins = {}
  if (s.flawlessWins == null) s.flawlessWins = 0
  return s
}

const cache = { name: '', stats: {}, achievements: [], dailyDone: '' }
let hydrated = false

export async function hydrate() {
  if (hydrated) return
  try {
    cache.name = (await AsyncStorage.getItem(NAME_KEY)) || ''
    for (const mode of ['cpu', 'friend']) {
      const raw = await AsyncStorage.getItem(STATS_PREFIX + mode)
      cache.stats[mode] = migrate(
        raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS }
      )
    }
    const achRaw = await AsyncStorage.getItem(ACH_KEY)
    cache.achievements = achRaw ? JSON.parse(achRaw) : []
    cache.dailyDone = (await AsyncStorage.getItem(DAILY_KEY)) || ''
  } catch {
    cache.stats.cpu = { ...DEFAULT_STATS }
    cache.stats.friend = { ...DEFAULT_STATS }
    cache.achievements = []
    cache.dailyDone = ''
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

export function recordRound(mode, outcome, opts = {}) {
  const s = { ...getStats(mode) }
  if (outcome === 'win') {
    s.wins += 1
    s.currentStreak += 1
    if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak
    if (opts.choice) {
      s.winsByChoice = { ...s.winsByChoice, [opts.choice]: (s.winsByChoice[opts.choice] || 0) + 1 }
    }
  } else if (outcome === 'lose') {
    s.losses += 1
    s.currentStreak = 0
  } else {
    s.draws += 1
  }
  save(mode, s)
  return s
}

export function recordMatch(mode, outcome, opts = {}) {
  const s = { ...getStats(mode) }
  if (outcome === 'win') {
    s.matchWins += 1
    if (opts.variantId) {
      s.variantMatchWins = {
        ...s.variantMatchWins,
        [opts.variantId]: (s.variantMatchWins[opts.variantId] || 0) + 1,
      }
    }
    if (opts.flawless) s.flawlessWins += 1
  } else if (outcome === 'lose') s.matchLosses += 1
  save(mode, s)
  return s
}

export function getSnapshot() {
  const cpu = getStats('cpu')
  const friend = getStats('friend')
  const sumChoice = (c) => (cpu.winsByChoice[c] || 0) + (friend.winsByChoice[c] || 0)
  const sumVariant = (v) => (cpu.variantMatchWins[v] || 0) + (friend.variantMatchWins[v] || 0)
  return {
    totalMatchWins: cpu.matchWins + friend.matchWins,
    totalMatches: cpu.matchWins + cpu.matchLosses + friend.matchWins + friend.matchLosses,
    bestStreak: Math.max(cpu.bestStreak, friend.bestStreak),
    flawlessWins: cpu.flawlessWins + friend.flawlessWins,
    winsByChoice: {
      rock: sumChoice('rock'),
      paper: sumChoice('paper'),
      scissors: sumChoice('scissors'),
      lizard: sumChoice('lizard'),
      spock: sumChoice('spock'),
    },
    variantMatchWins: {
      classic: sumVariant('classic'),
      lizardSpock: sumVariant('lizardSpock'),
    },
    friendMatches: friend.matchWins + friend.matchLosses,
  }
}

export function getUnlocked() {
  return cache.achievements || []
}

export function recordUnlocks(ids) {
  if (!ids?.length) return []
  const cur = getUnlocked()
  const seen = new Set(cur.map((a) => a.id))
  const newOnes = ids.filter((id) => !seen.has(id))
  if (!newOnes.length) return []
  const next = [...cur, ...newOnes.map((id) => ({ id, time: Date.now() }))]
  cache.achievements = next
  AsyncStorage.setItem(ACH_KEY, JSON.stringify(next)).catch(() => {})
  return newOnes
}

export function getDailyDoneDate() {
  return cache.dailyDone || ''
}

export function markDailyDone(dateKey) {
  cache.dailyDone = dateKey
  AsyncStorage.setItem(DAILY_KEY, dateKey).catch(() => {})
}
