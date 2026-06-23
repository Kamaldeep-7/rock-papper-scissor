import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { customAlphabet } from 'nanoid'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const KEY_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const generateKey = customAlphabet(KEY_ALPHABET, 6)

const VARIANTS = {
  classic: {
    rock: ['scissors'],
    paper: ['rock'],
    scissors: ['paper'],
  },
  lizardSpock: {
    rock: ['scissors', 'lizard'],
    paper: ['rock', 'spock'],
    scissors: ['paper', 'lizard'],
    lizard: ['paper', 'spock'],
    spock: ['scissors', 'rock'],
  },
}

const REACTION_ALLOW = new Set(['😂', '😱', '😤', '🔥', '💀', '🤝'])

function sanitizeName(input) {
  const trimmed = String(input || '').trim().slice(0, 16)
  return trimmed || 'Player'
}

function clampMatchLength(n) {
  const v = Math.floor(Number(n) || 5)
  if (v < 1) return 1
  if (v > 20) return 20
  return v
}

const app = express()
app.use(cors())
app.get('/health', (_req, res) => res.json({ ok: true }))

const distPath = path.join(__dirname, '..', 'dist')
const publicPath = path.join(__dirname, '..', 'public')
app.use('/downloads', express.static(publicPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive')
      res.setHeader('Content-Disposition', 'attachment; filename="rps.apk"')
    }
  },
}))
app.use(express.static(distPath))
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

const rooms = new Map()

function newRoom({ variantId, matchLength }) {
  return {
    players: [],
    names: {},
    choices: {},
    scores: {},
    variantId: VARIANTS[variantId] ? variantId : 'classic',
    matchLength: clampMatchLength(matchLength),
    rematch: new Set(),
  }
}

function emitOpponentLeft(roomKey, exceptId) {
  const room = rooms.get(roomKey)
  if (!room) return
  for (const id of room.players) {
    if (id !== exceptId) io.to(id).emit('opponent-left')
  }
}

io.on('connection', (socket) => {
  let currentRoomKey = null

  socket.on('create-room', (payload = {}, cb) => {
    const { name, variantId, matchLength } = payload
    let key = generateKey()
    while (rooms.has(key)) key = generateKey()
    const room = newRoom({ variantId, matchLength })
    room.players.push(socket.id)
    room.names[socket.id] = sanitizeName(name)
    room.scores[socket.id] = 0
    rooms.set(key, room)
    socket.join(key)
    currentRoomKey = key
    cb?.({ ok: true, key, variantId: room.variantId, matchLength: room.matchLength })
  })

  socket.on('join-room', ({ key, name } = {}, cb) => {
    const normalized = String(key || '').toUpperCase().trim()
    const room = rooms.get(normalized)
    if (!room) return cb?.({ ok: false, error: 'Room not found' })
    if (room.players.length >= 2) return cb?.({ ok: false, error: 'Room is full' })
    room.players.push(socket.id)
    room.names[socket.id] = sanitizeName(name)
    room.scores[socket.id] = 0
    socket.join(normalized)
    currentRoomKey = normalized
    const payload = {
      ok: true,
      key: normalized,
      you: socket.id,
      players: [...room.players],
      names: { ...room.names },
      variantId: room.variantId,
      matchLength: room.matchLength,
    }
    cb?.(payload)
    io.to(normalized).emit('room-ready', {
      players: [...room.players],
      names: { ...room.names },
      variantId: room.variantId,
      matchLength: room.matchLength,
    })
  })

  socket.on('make-choice', ({ choice } = {}) => {
    if (!currentRoomKey) return
    const room = rooms.get(currentRoomKey)
    if (!room || room.players.length < 2) return
    const beats = VARIANTS[room.variantId]
    if (!beats || !beats[choice]) return
    if (room.choices[socket.id]) return
    room.choices[socket.id] = choice

    for (const id of room.players) {
      if (id !== socket.id) io.to(id).emit('opponent-picked')
    }

    if (Object.keys(room.choices).length === 2) {
      const [p1, p2] = room.players
      const c1 = room.choices[p1]
      const c2 = room.choices[p2]
      let winner = null
      if (c1 !== c2) {
        winner = beats[c1].includes(c2) ? p1 : p2
        room.scores[winner] = (room.scores[winner] || 0) + 1
      }
      io.to(currentRoomKey).emit('reveal', {
        choices: { [p1]: c1, [p2]: c2 },
        winner,
        scores: { ...room.scores },
      })
      room.choices = {}
    }
  })

  socket.on('reaction', ({ emoji } = {}) => {
    if (!currentRoomKey) return
    if (!REACTION_ALLOW.has(emoji)) return
    socket.to(currentRoomKey).emit('reaction', { emoji })
  })

  socket.on('rematch-request', () => {
    if (!currentRoomKey) return
    const room = rooms.get(currentRoomKey)
    if (!room) return
    room.rematch.add(socket.id)
    io.to(currentRoomKey).emit('rematch-update', {
      requesters: [...room.rematch],
    })
    if (room.rematch.size === room.players.length && room.players.length === 2) {
      room.scores = Object.fromEntries(room.players.map((p) => [p, 0]))
      room.choices = {}
      room.rematch.clear()
      io.to(currentRoomKey).emit('match-reset', { scores: { ...room.scores } })
    }
  })

  socket.on('leave-room', () => {
    if (!currentRoomKey) return
    const key = currentRoomKey
    currentRoomKey = null
    socket.leave(key)
    emitOpponentLeft(key, socket.id)
    rooms.delete(key)
  })

  socket.on('disconnect', () => {
    if (!currentRoomKey) return
    emitOpponentLeft(currentRoomKey, socket.id)
    rooms.delete(currentRoomKey)
    currentRoomKey = null
  })
})

httpServer.listen(PORT, () => {
  console.log(`[rps-server] listening on http://localhost:${PORT}`)
})
