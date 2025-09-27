import { apiClient } from './client'
import { Chat, Message, CreateChatDto, SendMessageDto, ApiResponse } from '@/types'

export const chatApi = {
  // Get all chats for the current user
  getChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<ApiResponse<Chat[]>>('/chats')
    return response.data.data || []
  },

  // Create a new chat
  createChat: async (data: CreateChatDto): Promise<Chat> => {
    const response = await apiClient.post<ApiResponse<Chat>>('/chats', data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create chat')
    }
    return response.data.data
  },

  // Get a specific chat by ID
  getChat: async (chatId: string): Promise<Chat> => {
    const response = await apiClient.get<ApiResponse<Chat>>(`/chats/${chatId}`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Chat not found')
    }
    return response.data.data
  },

  // Update chat title
  updateChat: async (chatId: string, data: Partial<CreateChatDto>): Promise<Chat> => {
    const response = await apiClient.put<ApiResponse<Chat>>(`/chats/${chatId}`, data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update chat')
    }
    return response.data.data
  },

  // Delete a chat
  deleteChat: async (chatId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/chats/${chatId}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete chat')
    }
  },
}

export const messageApi = {
  // Get messages for a specific chat
  getMessages: async (chatId: string): Promise<Message[]> => {
    const response = await apiClient.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages`)
    return response.data.data || []
  },

  // Send a message and get AI response
  sendMessage: async (chatId: string, data: SendMessageDto): Promise<Message> => {
    const response = await apiClient.post<ApiResponse<Message>>(`/chats/${chatId}/messages`, data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to send message')
    }
    return response.data.data
  },

  // Update a message
  updateMessage: async (messageId: string, data: Partial<SendMessageDto>): Promise<Message> => {
    const response = await apiClient.put<ApiResponse<Message>>(`/messages/${messageId}`, data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update message')
    }
    return response.data.data
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/messages/${messageId}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete message')
    }
  },
}