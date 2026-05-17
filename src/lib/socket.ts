import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/video`, {
      autoConnect: false,
      withCredentials: true,
    })
  }
  return socket
}

export function connectSocket(accessToken: string) {
  const s = getSocket()
  s.auth = { token: accessToken }
  s.connect()
  return s
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
