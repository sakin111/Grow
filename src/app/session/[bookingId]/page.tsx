'use client'

import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { useVideoStore } from '@/stores/videoStore'
import { useParams, useRouter } from 'next/navigation'
import { ChatPanel } from '@/components/video/ChatPanel'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Hand, Loader2 } from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'
import { useState } from 'react'
import { isAxiosError } from 'axios'
import { apiService } from '@/lib/apiService'
import { toast } from 'sonner'

export default function SessionPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { token, serverUrl } = useVideoStore()
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const { raiseHand, endSession, sendMessage } = useSocket(bookingId)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)

  const handleEndSession = async () => {
    setIsEndingSession(true)
    try {
      await apiService.session.endSession(bookingId)
      endSession()
      useVideoStore.getState().reset()
      router.push(`/sessions/${bookingId}`)
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message || 'Failed to end session')
      setIsEndingSession(false)
    }
  }

  if (!token || !serverUrl) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Connecting to session...</p>
        <Button variant="outline" onClick={() => router.push(`/sessions/${bookingId}`)}>
          Go Back
        </Button>
      </div>
    )
  }

  const handleToggleHand = () => {
    const newState = !isHandRaised
    setIsHandRaised(newState)
    raiseHand(newState)
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col relative bg-zinc-950">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-foreground">
          <span className="font-bold">🌱 Grow Room</span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-semibold">LIVE</span>
          </div>
        </div>

        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          onDisconnected={() => {
            useVideoStore.getState().reset()
            router.push(`/sessions/${bookingId}`)
          }}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>

        {/* Custom Overlay Controls */}
        <div className="absolute bottom-4 left-4 z-10 flex gap-2">
          <Button 
            variant={isHandRaised ? "default" : "secondary"} 
            size="sm" 
            onClick={handleToggleHand}
            className="rounded-full shadow-lg"
          >
            <Hand className="h-4 w-4 mr-2" />
            {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          </Button>

          {user?.role === 'MENTOR' && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleEndSession}
              disabled={isEndingSession}
              className="rounded-full shadow-lg"
            >
              {isEndingSession ? 'Ending Session...' : 'End Session For All'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Sidebar Chat */}
      <ChatPanel onSendMessage={sendMessage} />
    </div>
  )
}
