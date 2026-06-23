import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native'
import { VARIANTS } from './constants.js'
import { DIFFICULTIES } from './cpu.js'
import { getName, setName as saveName, getStats } from '../storage.js'
import MuteToggle from '../components/MuteToggle.jsx'
import AchievementsRow from '../components/AchievementsRow.jsx'
import DailyChallengeCard from '../components/DailyChallengeCard.jsx'
import { sounds } from '../audio.js'
import { colors, font } from '../theme.js'

const MATCH_LENGTHS = [3, 5, 7]

export default function Menu({ onPick }) {
  const [name, setName] = useState(getName() || 'Player')
  const [variantId, setVariantId] = useState('classic')
  const [matchLength, setMatchLength] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')

  function start(mode) {
    sounds.click()
    const trimmed = (name || '').trim() || 'Player'
    saveName(trimmed)
    onPick(mode, { variantId, matchLength, name: trimmed, difficulty })
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <MuteToggle />
      </View>

      <Text style={styles.title}>
        <Text style={{ color: colors.purple }}>ROCK </Text>
        <Text style={{ color: colors.textDim }}>· </Text>
        <Text style={{ color: colors.pink }}>PAPER </Text>
        <Text style={{ color: colors.textDim }}>· </Text>
        <Text style={{ color: colors.cyan }}>SCISSORS</Text>
      </Text>
      <Text style={styles.subtitle}>Set up your match</Text>

      <View style={styles.form}>
        <Field label="Your name">
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={16}
            placeholder="Player"
            placeholderTextColor={colors.textMute}
            style={styles.input}
          />
        </Field>

        <Field label="Variant">
          <Pills
            options={Object.values(VARIANTS).map((v) => ({ id: v.id, label: v.name }))}
            value={variantId}
            onChange={(id) => { sounds.click(); setVariantId(id) }}
          />
        </Field>

        <Field label="Match length">
          <Pills
            options={MATCH_LENGTHS.map((n) => ({ id: n, label: `First to ${n}` }))}
            value={matchLength}
            onChange={(n) => { sounds.click(); setMatchLength(n) }}
          />
        </Field>

        <Field label="CPU difficulty">
          <Pills
            options={DIFFICULTIES.map((d) => ({ id: d.id, label: d.label }))}
            value={difficulty}
            onChange={(id) => { sounds.click(); setDifficulty(id) }}
          />
        </Field>
      </View>

      <Text style={[styles.subtitle, { marginTop: 26 }]}>Choose your battle</Text>
      <View style={styles.modes}>
        <ModeButton
          title="Play vs CPU"
          subtitle="Smart AI · Solo"
          accent={colors.purple}
          bg="rgba(126, 34, 206, 0.35)"
          onPress={() => start('cpu')}
        />
        <ModeButton
          title="Play with Friend"
          subtitle="Share a room key"
          accent={colors.cyan}
          bg="rgba(14, 116, 144, 0.4)"
          onPress={() => start('friend')}
        />
      </View>

      <DailyChallengeCard />
      <StatsRow />
      <AchievementsRow />
    </ScrollView>
  )
}

function Field({ label, children }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  )
}

function Pills({ options, value, onChange }) {
  return (
    <View style={styles.pillsRow}>
      {options.map((o) => {
        const selected = o.id === value
        return (
          <Pressable
            key={String(o.id)}
            onPress={() => onChange(o.id)}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
              {o.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function ModeButton({ title, subtitle, accent, bg, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeBtn,
        { backgroundColor: bg, borderColor: accent },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
      ]}
    >
      <Text style={styles.modeTitle}>{title}</Text>
      <Text style={styles.modeSub}>{subtitle}</Text>
    </Pressable>
  )
}

function StatsRow() {
  const cpu = getStats('cpu')
  const friend = getStats('friend')
  return (
    <View style={styles.stats}>
      <StatsCard title="vs CPU" stats={cpu} accent={colors.purple} />
      <StatsCard title="vs Friend" stats={friend} accent={colors.cyan} />
    </View>
  )
}

function StatsCard({ title, stats, accent }) {
  return (
    <View style={styles.statsCard}>
      <Text style={[styles.statsTitle, { color: accent }]}>{title}</Text>
      <View style={styles.statsRow}>
        <Stat label="Matches" value={stats.matchWins} />
        <Stat label="Rounds" value={stats.wins} />
        <Stat label="Streak" value={stats.bestStreak} />
      </View>
    </View>
  )
}

function Stat({ label, value }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: 60, paddingTop: 4 },
  topBar: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end' },
  title: {
    fontFamily: font.display,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
    marginTop: 12,
  },
  form: { width: '100%', maxWidth: 420, marginTop: 22, gap: 18 },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    fontFamily: font.display,
    fontSize: 14,
    color: '#cffafe',
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
  },
  pillSelected: {
    borderColor: colors.pink,
    backgroundColor: colors.purpleDeep,
  },
  pillText: {
    fontFamily: font.display,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  pillTextSelected: { color: colors.white },
  modes: { width: '100%', alignItems: 'center', gap: 14, marginTop: 16 },
  modeBtn: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 22,
    borderWidth: 2,
  },
  modeTitle: { fontFamily: font.display, fontSize: 15, color: colors.white },
  modeSub: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  stats: { width: '100%', maxWidth: 420, marginTop: 26, flexDirection: 'row', gap: 10 },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 14,
  },
  statsTitle: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: font.display,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statValue: { fontFamily: font.display, fontSize: 18, color: '#f1f5f9' },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textMute,
    marginTop: 4,
  },
})
