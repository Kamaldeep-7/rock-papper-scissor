export const ACHIEVEMENTS = [
  { id: 'firstWin', emoji: '🏆', name: 'First Win', desc: 'Win your first match' },
  { id: 'streak3', emoji: '🔥', name: '3 in a Row', desc: 'Win 3 rounds in a row' },
  { id: 'flawless', emoji: '💀', name: 'Flawless Victory', desc: 'Win a match without losing a round' },
  { id: 'rockLord', emoji: '🪨', name: 'Rock Lord', desc: 'Win 25 rounds with Rock' },
  { id: 'spockMaster', emoji: '🖖', name: 'Spock Master', desc: 'Win 10 matches in Lizard·Spock' },
  { id: 'bestFriend', emoji: '🤝', name: 'Best Friend', desc: 'Play 10 friend matches' },
  { id: 'veteran', emoji: '⚔️', name: 'Veteran', desc: 'Play 50 matches total' },
]

export function evaluate(snapshot) {
  const earned = []
  if (snapshot.totalMatchWins >= 1) earned.push('firstWin')
  if (snapshot.bestStreak >= 3) earned.push('streak3')
  if (snapshot.flawlessWins >= 1) earned.push('flawless')
  if ((snapshot.winsByChoice.rock || 0) >= 25) earned.push('rockLord')
  if ((snapshot.variantMatchWins.lizardSpock || 0) >= 10) earned.push('spockMaster')
  if (snapshot.friendMatches >= 10) earned.push('bestFriend')
  if (snapshot.totalMatches >= 50) earned.push('veteran')
  return earned
}
