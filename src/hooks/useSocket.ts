import { useEffect, useState } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { useVideoStore } from '@/stores/videoStore'
import { apiService } from '@/lib/apiService'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useSocket(bookingId: string) {
  const [connected, setConnected] = useState(false)
  const router = useRouter()
  const addParticipant = useVideoStore(state => state.addParticipant)
  const removeParticipant = useVideoStore(state => state.removeParticipant)
  const addMessage = useVideoStore(state => state.addMessage)
  const toggleHandRaise = useVideoStore(state => state.toggleHandRaise)

  useEffect(() => {
    let disposed = false
    let socket: ReturnType<typeof connectSocket> | null = null

    const initializeSocket = async () => {
      try {
        const response = await apiService.auth.refreshToken()
        const token = response.data.data?.accessToken
        if (!token) throw new Error('Socket access token was not returned')
        if (disposed) return

        socket = connectSocket(token)
        socket.on('connect', () => {
          setConnected(true)
          socket?.emit('join-room', { bookingId })
        })
        socket.on('disconnect', () => setConnected(false))
        socket.on('participant-joined', (participant: { userId: string; userName?: string; role?: string; handRaised?: boolean }) => {
          addParticipant({
            userId: participant.userId,
            userName: participant.userName || 'Participant',
            role: participant.role || 'OWNER',
            handRaised: participant.handRaised || false,
            joinedAt: Date.now(),
          })
        })
        socket.on('participant-left', ({ userId }: { userId: string }) => removeParticipant(userId))
        socket.on('chat-message', message => addMessage(message))
        socket.on('hand-raised', ({ userId, raised }: { userId: string; raised: boolean }) => {
          toggleHandRaise(userId, raised)
        })
        socket.on('session-ended', () => {
          toast.info('Session has ended')
          router.push(`/sessions/${bookingId}`)
        })
        socket.on('connect_error', () => {
          setConnected(false)
          toast.error('Could not connect to the session chat')
        })
      } catch {
        if (!disposed) toast.error('Could not authenticate session chat')
      }
    }

    void initializeSocket()

    return () => {
      disposed = true
      setConnected(false)
      disconnectSocket()
    }
  }, [addMessage, addParticipant, bookingId, removeParticipant, router, toggleHandRaise])

  const sendMessage = (message: string) => {
    const socket = getSocket()
    if (!socket.connected) {
      toast.error('Session chat is not connected yet')
      return
    }
    socket.emit('chat-message', { bookingId, message })
  }

  const raiseHand = (raised: boolean) => {
    const socket = getSocket()
    if (socket.connected) socket.emit('raise-hand', { bookingId, raised })
  }

  const endSession = () => {
    const socket = getSocket()
    if (socket.connected) socket.emit('session-ended', { bookingId })
  }

  return { connected, sendMessage, raiseHand, endSession }
}
