const NAME_KEY = 'rps:name'
const STATS_PREFIX = 'rps:stats:'

export function getName() {
  try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' }
}
export function setName(name) {
  try { localStorage.setItem(NAME_KEY, name) } catch {}
}

const DEFAULT_STATS = {
  wins: 0, losses: 0, draws: 0,
  matchWins: 0, matchLosses: 0,
  currentStreak: 0, bestStreak: 0,
}

export function getStats(mode) {
  try {
    const raw = localStorage.getItem(STATS_PREFIX + mode)
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

function save(mode, s) {
  try { localStorage.setItem(STATS_PREFIX + mode, JSON.stringify(s)) } catch {}
}

export function recordRound(mode, outcome) {
  const s = getStats(mode)
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
  const s = getStats(mode)
  if (outcome === 'win') s.matchWins += 1
  else if (outcome === 'lose') s.matchLosses += 1
  save(mode, s)
  return s
}
