import { io } from 'socket.io-client'

const EXPLICIT_URL = import.meta.env.VITE_SERVER_URL
const DEV_URL = 'http://localhost:3001'

let socket = null

export function getSocket() {
  if (!socket) {
    const url = EXPLICIT_URL || (import.meta.env.DEV ? DEV_URL : undefined)
    const opts = { autoConnect: true, transports: ['websocket', 'polling'] }
    socket = url ? io(url, opts) : io(opts)
  }
  return socket
}
