import { io } from 'socket.io-client'

const SERVER_URL = 'https://rps-hastagfuggi.onrender.com'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: true,
      transports: ['websocket'],
    })
  }
  return socket
}
