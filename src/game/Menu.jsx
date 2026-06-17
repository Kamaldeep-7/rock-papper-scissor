import { useState } from 'react'
import { VARIANTS } from './constants.js'
import { getName, setName as saveName, getStats } from '../storage.js'
import MuteToggle from '../components/MuteToggle.jsx'
import { sounds } from '../audio.js'

const MATCH_LENGTHS = [3, 5, 7]

export default function Menu({ onPick }) {
  const [name, setName] = useState(getName() || 'Player')
  const [variantId, setVariantId] = useState('classic')
  const [matchLength, setMatchLength] = useState(5)

  function start(mode) {
    sounds.click()
    const trimmed = name.trim() || 'Player'
    saveName(trimmed)
    onPick(mode, { variantId, matchLength, name: trimmed })
  }

  return (
    <div className="flex flex-col items-center gap-7 mt-6 w-full">
      <div className="w-full max-w-3xl flex justify-end px-2">
        <MuteToggle />
      </div>

      <h1 className="font-display text-2xl sm:text-4xl text-center neon-text">
        <span className="text-purple-300">ROCK</span>
        <span className="text-slate-300"> · </span>
        <span className="text-pink-300">PAPER</span>
        <span className="text-slate-300"> · </span>
        <span className="text-cyan-300">SCISSORS</span>
      </h1>
      <p className="text-xs sm:text-sm tracking-widest uppercase text-slate-400">
        Set up your match
      </p>

      <div className="w-full max-w-md flex flex-col gap-5 px-4">
        <Field label="Your name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            placeholder="Player"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border-2 border-slate-700
              focus:border-cyan-400 outline-none font-display text-base text-cyan-100"
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
      </div>

      <p className="text-xs sm:text-sm tracking-widest uppercase text-slate-400">
        Choose your battle
      </p>
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
        <ModeButton
          title="Play vs CPU"
          subtitle="Smart AI · Solo"
          accent="from-purple-600/40 to-fuchsia-600/40 hover:border-pink-400"
          onClick={() => start('cpu')}
        />
        <ModeButton
          title="Play with Friend"
          subtitle="Share a room key"
          accent="from-cyan-600/40 to-emerald-600/40 hover:border-cyan-300"
          onClick={() => start('friend')}
        />
      </div>

      <StatsRow />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] sm:text-xs tracking-widest uppercase text-slate-400">
        {label}
      </span>
      {children}
    </label>
  )
}

function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = o.id === value
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-display tracking-widest uppercase border-2 transition-colors
              ${selected
                ? 'bg-gradient-to-br from-purple-600/50 to-pink-600/50 border-pink-400 text-white'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-purple-400'}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function ModeButton({ title, subtitle, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-64 sm:w-72 px-6 py-7 rounded-3xl bg-gradient-to-br ${accent}
        border-2 border-purple-400/50 transition-all duration-200
        hover:scale-105 active:scale-95 animate-glow text-left`}
    >
      <div className="font-display text-base sm:text-lg text-white">{title}</div>
      <div className="text-xs sm:text-sm text-slate-200/80 mt-2 tracking-wider uppercase">
        {subtitle}
      </div>
    </button>
  )
}

function StatsRow() {
  const cpu = getStats('cpu')
  const friend = getStats('friend')
  return (
    <div className="w-full max-w-3xl mt-2 grid grid-cols-2 gap-3 sm:gap-6 px-4">
      <StatsCard title="vs CPU" stats={cpu} accent="text-purple-300" />
      <StatsCard title="vs Friend" stats={friend} accent="text-cyan-300" />
    </div>
  )
}

function StatsCard({ title, stats, accent }) {
  return (
    <div className="rounded-2xl bg-slate-900/40 border border-slate-700/70 p-4">
      <div className={`text-xs tracking-widest uppercase ${accent} font-display`}>{title}</div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <Stat label="Matches" value={stats.matchWins} />
        <Stat label="Rounds" value={stats.wins} />
        <Stat label="Streak" value={stats.bestStreak} />
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="font-display text-xl sm:text-2xl text-slate-100">{value}</div>
      <div className="text-[10px] tracking-widest uppercase text-slate-500">{label}</div>
    </div>
  )
}
