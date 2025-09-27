import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi, messageApi } from '@/lib/api/chat'
import { useChatStore } from '@/store/chat'
import { Chat, Message, CreateChatDto, SendMessageDto } from '@/types'

export const useChats = () => {
  const { setChats, setLoadingChats } = useChatStore()

  return useQuery({
    queryKey: ['chats'],
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
  })
}

export const useChat = (chatId: string) => {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatApi.getChat(chatId),
    enabled: !!chatId,
  })
}

export const useMessages = (chatId: string) => {
  const { setMessages, setLoadingMessages } = useChatStore()

  return useQuery({
    queryKey: ['messages', chatId],
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
    enabled: !!chatId,
  })
}

export const useCreateChat = () => {
  const queryClient = useQueryClient()
  const { addChat } = useChatStore()

  return useMutation({
    mutationFn: (data: CreateChatDto) => chatApi.createChat(data),
    onSuccess: (newChat) => {
      addChat(newChat)
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}

export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient()
  const { addMessage, setSendingMessage } = useChatStore()

  return useMutation({
    mutationFn: async (data: SendMessageDto) => {
      setSendingMessage(true)
      
      // Add user message immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId,
        content: data.content,
        role: 'user',
        createdAt: new Date(),
      }
      addMessage(userMessage)

      try {
        // Send message to backend (this will trigger AI response)
        const response = await messageApi.sendMessage(chatId, data)
        return response
      } finally {
        setSendingMessage(false)
      }
    },
    onSuccess: (response) => {
      // Add AI response message
      addMessage(response)
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (error) => {
      setSendingMessage(false)
      console.error('Failed to send message:', error)
    },
  })
}

export const useDeleteChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatId: string) => chatApi.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}