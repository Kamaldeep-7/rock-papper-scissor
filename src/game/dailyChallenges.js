const CHALLENGES = [
  {
    id: 'win',
    title: 'Daily Win',
    desc: 'Win any match today',
    check: (ctx) => ctx.outcome === 'win',
  },
  {
    id: 'flawless',
    title: 'Flawless Streak',
    desc: 'Win a match without losing a round',
    check: (ctx) => ctx.outcome === 'win' && ctx.opponentScore === 0,
  },
  {
    id: 'hardCpu',
    title: 'Hard Mode',
    desc: 'Beat the CPU on Hard difficulty',
    check: (ctx) => ctx.outcome === 'win' && ctx.mode === 'cpu' && ctx.difficulty === 'hard',
  },
  {
    id: 'fiveChoices',
    title: 'Five Choices',
    desc: 'Win a match in Lizard·Spock variant',
    check: (ctx) => ctx.outcome === 'win' && ctx.variantId === 'lizardSpock',
  },
  {
    id: 'hotStreak',
    title: 'Hot Streak',
    desc: 'Win 3 rounds in a row during one match',
    check: (ctx) => ctx.outcome === 'win' && (ctx.bestStreakThisMatch || 0) >= 3,
  },
  {
    id: 'bringFriend',
    title: 'Bring a Friend',
    desc: 'Win a friend match today',
    check: (ctx) => ctx.outcome === 'win' && ctx.mode === 'friend',
  },
]

export function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function getTodaysChallenge() {
  const key = todayKey()
  const idx = hashStr(key) % CHALLENGES.length
  return { ...CHALLENGES[idx], date: key }
}
