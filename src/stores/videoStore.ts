import { create } from 'zustand'
import { ChatMessage, ParticipantInfo } from '@/types'

interface VideoStore {
  // LiveKit config
  token: string | null
  serverUrl: string | null
  roomName: string | null
  setLiveKitConfig: (config: { token: string; serverUrl: string; roomName: string }) => void
  clearLiveKitConfig: () => void

  // Session state
  participants: ParticipantInfo[]
  messages: ChatMessage[]
  sessionStartedAt: Date | null

  // Actions
  addMessage: (msg: ChatMessage) => void
  setParticipants: (participants: ParticipantInfo[]) => void
  addParticipant: (p: ParticipantInfo) => void
  removeParticipant: (userId: string) => void
  toggleHandRaise: (userId: string, raised: boolean) => void
  reset: () => void
}

export const useVideoStore = create<VideoStore>((set) => ({
  token: null,
  serverUrl: null,
  roomName: null,
  setLiveKitConfig: (config) => set(config),
  clearLiveKitConfig: () => set({ token: null, serverUrl: null, roomName: null }),

  participants: [],
  messages: [],
  sessionStartedAt: null,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (p) => set((state) => ({ 
    participants: state.participants.find(existing => existing.userId === p.userId) 
      ? state.participants 
      : [...state.participants, p] 
  })),
  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter((p) => p.userId !== userId),
  })),
  toggleHandRaise: (userId, raised) => set((state) => ({
    participants: state.participants.map((p) =>
      p.userId === userId ? { ...p, handRaised: raised } : p
    ),
  })),
  reset: () => set({
    token: null,
    serverUrl: null,
    roomName: null,
    participants: [],
    messages: [],
    sessionStartedAt: null,
  }),
}))
