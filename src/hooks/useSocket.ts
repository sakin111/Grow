import { useEffect, useState } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { useVideoStore } from '@/stores/videoStore'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useSocket(bookingId: string) {
  const [connected, setConnected] = useState(false)
  const router = useRouter()
  const store = useVideoStore()

  useEffect(() => {
    // We assume the cookie is handled by the browser automatically due to withCredentials
    // We can just connect. The backend uses the cookie.
    const socket = connectSocket('cookie-auth') // The token is in cookie

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join-room', { bookingId })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('room-state', ({ participants }) => {
      store.setParticipants(participants)
    })

    socket.on('participant-joined', (participant) => {
      store.addParticipant(participant)
    })

    socket.on('participant-left', ({ userId }) => {
      store.removeParticipant(userId)
    })

    socket.on('chat-message', (msg) => {
      store.addMessage(msg)
    })

    socket.on('hand-raised', ({ userId, raised }) => {
      store.toggleHandRaise(userId, raised)
    })

    socket.on('session-ended', () => {
      toast.info('Session has ended')
      router.push(`/sessions/${bookingId}`)
    })

    socket.on('error', ({ message }) => {
      toast.error(message || 'Socket error')
    })

    return () => {
      disconnectSocket()
    }
  }, [bookingId, router, store])

  const sendMessage = (message: string) => {
    getSocket().emit('chat-message', { message })
  }

  const raiseHand = (raised: boolean) => {
    getSocket().emit('raise-hand', { raised })
  }

  const endSession = () => {
    getSocket().emit('session-ended', {})
  }

  return { connected, sendMessage, raiseHand, endSession }
}
