export const CHOICES = [
  { id: 'rock', label: 'Rock', emoji: '🪨' },
  { id: 'paper', label: 'Paper', emoji: '📄' },
  { id: 'scissors', label: 'Scissors', emoji: '✂️' },
]

export const CHOICE_MAP = Object.fromEntries(CHOICES.map((c) => [c.id, c]))

export const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }

export function decide(player, cpu) {
  if (player === cpu) return 'draw'
  return BEATS[player] === cpu ? 'win' : 'lose'
}
