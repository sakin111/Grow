'use client'

import { useState } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useVideoStore } from '@/stores/videoStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Hand } from 'lucide-react'
import { format } from 'date-fns'

export function ChatPanel({ bookingId }: { bookingId: string }) {
  const [input, setInput] = useState('')
  const { sendMessage } = useSocket(bookingId)
  const messages = useVideoStore(state => state.messages)
  const participants = useVideoStore(state => state.participants)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  return (
    <div className="w-80 border-l bg-card flex flex-col h-full">
      <div className="p-4 border-b font-semibold">Chat</div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm">{msg.senderName}</span>
                <span className="text-xs text-muted-foreground">{format(msg.timestamp, 'HH:mm')}</span>
              </div>
              <p className="text-sm bg-muted p-2 rounded-md mt-1 w-fit max-w-[90%]">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-b">
        <h4 className="text-sm font-semibold mb-2">Participants ({participants.length})</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {participants.map(p => (
            <div key={p.userId} className="flex items-center justify-between text-sm">
              <span>{p.userName} {p.role === 'MENTOR' && '(Mentor)'}</span>
              {p.handRaised && <Hand className="h-4 w-4 text-amber-500" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSend} className="p-4 flex gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Type a message..." 
          className="flex-1"
        />
        <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  )
}
