export const VARIANTS = {
  classic: {
    id: 'classic',
    name: 'Classic',
    choices: [
      { id: 'rock', label: 'Rock', emoji: '🪨', hotkey: 'r' },
      { id: 'paper', label: 'Paper', emoji: '📄', hotkey: 'p' },
      { id: 'scissors', label: 'Scissors', emoji: '✂️', hotkey: 's' },
    ],
    beats: {
      rock: ['scissors'],
      paper: ['rock'],
      scissors: ['paper'],
    },
  },
  lizardSpock: {
    id: 'lizardSpock',
    name: 'Lizard · Spock',
    choices: [
      { id: 'rock', label: 'Rock', emoji: '🪨', hotkey: 'r' },
      { id: 'paper', label: 'Paper', emoji: '📄', hotkey: 'p' },
      { id: 'scissors', label: 'Scissors', emoji: '✂️', hotkey: 's' },
      { id: 'lizard', label: 'Lizard', emoji: '🦎', hotkey: 'l' },
      { id: 'spock', label: 'Spock', emoji: '🖖', hotkey: 'k' },
    ],
    beats: {
      rock: ['scissors', 'lizard'],
      paper: ['rock', 'spock'],
      scissors: ['paper', 'lizard'],
      lizard: ['paper', 'spock'],
      spock: ['scissors', 'rock'],
    },
  },
}

export function getVariant(id) {
  return VARIANTS[id] || VARIANTS.classic
}

export function getChoiceMap(variant) {
  return Object.fromEntries(variant.choices.map((c) => [c.id, c]))
}

export function decide(variant, a, b) {
  if (a === b) return 'draw'
  return variant.beats[a]?.includes(b) ? 'win' : 'lose'
}

export const REACTIONS = ['😂', '😱', '😤', '🔥', '💀', '🤝']
