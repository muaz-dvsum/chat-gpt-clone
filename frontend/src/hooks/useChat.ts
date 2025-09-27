import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi, messageApi } from '@/lib/api/chat'
import { useChatStore } from '@/store/chat'
import { useAuth } from '@/hooks/useAuth'
import { Chat, Message, CreateChatDto, SendMessageDto } from '@/types'

export const useChats = () => {
  const { setChats, setLoadingChats } = useChatStore()
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      setLoadingChats(true)
      try {
        const chats = await chatApi.getChats()
        setChats(chats)
        return chats
      } finally {
        setLoadingChats(false)
      }
    },
    enabled: isAuthenticated && !!user?.id,
  })
}

export const useChat = (chatId: string) => {
  const { user, isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: ['chat', chatId, user?.id],
    queryFn: () => chatApi.getChat(chatId),
    enabled: !!chatId && isAuthenticated && !!user?.id,
  })
}

export const useMessages = (chatId: string) => {
  const { setMessages, setLoadingMessages } = useChatStore()
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['messages', chatId, user?.id],
    queryFn: async () => {
      setLoadingMessages(true)
      try {
        const messages = await messageApi.getMessages(chatId)
        setMessages(messages)
        return messages
      } finally {
        setLoadingMessages(false)
      }
    },
    enabled: !!chatId && isAuthenticated && !!user?.id,
  })
}

export const useCreateChat = () => {
  const queryClient = useQueryClient()
  const { addChat } = useChatStore()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: CreateChatDto) => chatApi.createChat(data),
    onSuccess: (newChat) => {
      addChat(newChat)
      queryClient.invalidateQueries({ queryKey: ['chats', user?.id] })
    },
  })
}

export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient()
  const { addMessage, replaceMessage, setSendingMessage } = useChatStore()

  return useMutation({
    mutationFn: async (data: SendMessageDto) => {
      setSendingMessage(true)
      
      // Add user message immediately for real-time feel
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        chatId,
        content: data.content,
        role: 'user',
        createdAt: new Date(),
      }
      addMessage(userMessage)
      
      // Add pending assistant message with typing indicator
      const pendingId = `temp-assistant-${Date.now()}`
      const pendingAssistantMessage: Message = {
        id: pendingId,
        chatId,
        content: 'AI is thinking...',
        role: 'assistant',
        createdAt: new Date(),
      }
      addMessage(pendingAssistantMessage)

      try {
        // Send message to backend and get assistant response
        const assistantMessage = await messageApi.sendMessage(chatId, data)
        
        // Replace the temporary user message with the real one from backend
        replaceMessage(userMessage.id, assistantMessage.chatId ? { 
          id: `user-${Date.now()}`,
          chatId,
          content: data.content,
          role: 'user' as const,
          createdAt: new Date(),
        } : userMessage)
        
        return { assistantMessage, pendingId }
      } catch (error) {
        // Remove pending message on error
        replaceMessage(pendingId, {
          id: pendingId,
          chatId,
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
          createdAt: new Date(),
        })
        throw error
      } finally {
        setSendingMessage(false)
      }
    },
    onSuccess: (result) => {
      // Replace pending assistant message with actual response
      const { assistantMessage, pendingId } = result
      replaceMessage(pendingId, assistantMessage)
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (error) => {
      setSendingMessage(false)
      console.error('Failed to send message:', error)
    },
  })
}

export const useStartNewChat = () => {
  const queryClient = useQueryClient()
  const { addChat, addMessage, setSendingMessage, clearMessages } = useChatStore()

  return useMutation({
    mutationFn: async (data: SendMessageDto) => {
      setSendingMessage(true)
      clearMessages() // Clear existing messages first
      
      try {
        // Start new chat with first message
        const response = await messageApi.startNewChat(data)
        
        // Add the new chat and messages to store immediately
        if (response.chat) {
          addChat(response.chat)
        }
        if (response.userMessage) {
          addMessage(response.userMessage)
        }
        if (response.assistantMessage) {
          addMessage(response.assistantMessage)
        }
        
        return response
      } catch (error) {
        console.error('Failed to start new chat:', error)
        throw error
      } finally {
        setSendingMessage(false)
      }
    },
    onSuccess: (response) => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (error) => {
      setSendingMessage(false)
      console.error('Failed to start new chat:', error)
    },
  })
}

export const useDeleteChat = () => {
  const queryClient = useQueryClient()
  const { clearChat, currentChat } = useChatStore()

  return useMutation({
    mutationFn: (chatId: string) => chatApi.deleteChat(chatId),
    onSuccess: (_, chatId) => {
      // Clear current chat if it was deleted
      if (currentChat?.id === chatId) {
        clearChat()
      }
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}