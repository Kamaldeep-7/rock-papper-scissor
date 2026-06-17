import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { customAlphabet } from 'nanoid'

const PORT = process.env.PORT || 3001
const KEY_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const generateKey = customAlphabet(KEY_ALPHABET, 6)

const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
const VALID_CHOICES = new Set(Object.keys(BEATS))

const app = express()
app.use(cors())
app.get('/health', (_req, res) => res.json({ ok: true }))

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

const rooms = new Map()

function newRoom() {
  return { players: [], choices: {}, scores: {} }
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

  socket.on('create-room', (cb) => {
    let key = generateKey()
    while (rooms.has(key)) key = generateKey()
    const room = newRoom()
    room.players.push(socket.id)
    room.scores[socket.id] = 0
    rooms.set(key, room)
    socket.join(key)
    currentRoomKey = key
    cb?.({ ok: true, key })
  })

  socket.on('join-room', ({ key }, cb) => {
    const normalized = String(key || '').toUpperCase().trim()
    const room = rooms.get(normalized)
    if (!room) return cb?.({ ok: false, error: 'Room not found' })
    if (room.players.length >= 2) return cb?.({ ok: false, error: 'Room is full' })
    room.players.push(socket.id)
    room.scores[socket.id] = 0
    socket.join(normalized)
    currentRoomKey = normalized
    cb?.({ ok: true, key: normalized, you: socket.id, players: [...room.players] })
    io.to(normalized).emit('room-ready', { players: [...room.players] })
  })

  socket.on('make-choice', ({ choice }) => {
    if (!currentRoomKey) return
    const room = rooms.get(currentRoomKey)
    if (!room || room.players.length < 2) return
    if (!VALID_CHOICES.has(choice)) return
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
        winner = BEATS[c1] === c2 ? p1 : p2
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
