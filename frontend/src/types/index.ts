export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
  lastMessageAt?: Date
}

export interface Message {
  id: string
  chatId: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  updatedAt?: string
}

export interface CreateChatDto {
  title: string
}

export interface SendMessageDto {
  content: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isLoadingChats: boolean
  isLoadingMessages: boolean
  isSendingMessage: boolean
}