import { create } from 'zustand'
import { Chat, Message } from '@/types'

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isLoadingChats: boolean
  isLoadingMessages: boolean
  isSendingMessage: boolean
  
  // Actions
  setChats: (chats: Chat[]) => void
  setCurrentChat: (chat: Chat | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setLoadingChats: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setSendingMessage: (sending: boolean) => void
  addChat: (chat: Chat) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoadingChats: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  
  setChats: (chats) => set({ chats }),
  setCurrentChat: (currentChat) => set({ currentChat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setLoadingChats: (isLoadingChats) => set({ isLoadingChats }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setSendingMessage: (isSendingMessage) => set({ isSendingMessage }),
  addChat: (chat) => set((state) => ({ 
    chats: [chat, ...state.chats] 
  })),
  clearChat: () => set({ 
    currentChat: null, 
    messages: [] 
  }),
}))