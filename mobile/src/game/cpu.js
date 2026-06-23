import { getVariant } from './constants.js'

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Random picks · for beginners' },
  { id: 'medium', label: 'Medium', desc: 'Light pattern reading' },
  { id: 'hard', label: 'Hard', desc: 'Full smart brain' },
]

export function createCpuBrain(variantId = 'classic', difficulty = 'hard') {
  const variant = getVariant(variantId)
  const history = []
  const transitions = new Map()
  const freqs = new Map()

  function random() {
    return variant.choices[Math.floor(Math.random() * variant.choices.length)].id
  }

  function counterOf(prediction) {
    const counters = variant.choices
      .filter((c) => variant.beats[c.id].includes(prediction))
      .map((c) => c.id)
    if (!counters.length) return random()
    return counters[Math.floor(Math.random() * counters.length)]
  }

  function topPick(map) {
    let best = -1
    let pick = null
    for (const [k, v] of map) {
      if (v > best) { best = v; pick = k }
    }
    return pick
  }

  function smartGuess() {
    if (history.length < 3) return random()
    const last = history[history.length - 1]
    const trans = transitions.get(last)
    const predicted = (trans && trans.size && topPick(trans)) || topPick(freqs)
    if (!predicted) return random()
    return counterOf(predicted)
  }

  function predict() {
    if (difficulty === 'easy') return random()
    if (difficulty === 'medium') {
      return Math.random() < 0.45 ? smartGuess() : random()
    }
    return Math.random() < 0.7 ? smartGuess() : random()
  }

  function record(playerPick) {
    if (difficulty === 'easy') return
    if (history.length > 0) {
      const last = history[history.length - 1]
      if (!transitions.has(last)) transitions.set(last, new Map())
      const m = transitions.get(last)
      m.set(playerPick, (m.get(playerPick) || 0) + 1)
    }
    freqs.set(playerPick, (freqs.get(playerPick) || 0) + 1)
    history.push(playerPick)
  }

  return { predict, record }
}
