'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuth'
import { useChats, useStartNewChat, useDeleteChat } from '@/hooks/useChat'
import { useChatStore } from '@/store/chat'
import { MessageSquare, Plus, User, LogOut, Settings, Send, Trash2 } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { data: chats, isLoading: isLoadingChats } = useChats()
  const startNewChatMutation = useStartNewChat()
  const deleteChatMutation = useDeleteChat()
  const { currentChat, setCurrentChat, clearChat, isSendingMessage } = useChatStore()
  const router = useRouter()
  const [newMessage, setNewMessage] = useState('')
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)

  const handleStartNewChat = async () => {
    if (!newMessage.trim() || isSendingMessage) return

    const message = newMessage.trim()
    setNewMessage('')

    try {
      const result = await startNewChatMutation.mutateAsync({
        content: message,
      })
      
      // The mutation already adds to store, just navigate
      if (result?.chat) {
        setCurrentChat(result.chat)
        router.push(`/chat/${result.chat.id}`)
      }
    } catch (error) {
      console.error('Failed to start new chat:', error)
      setNewMessage(message) // Restore message on error
    }
  }

  const handleChatSelect = (chatId: string) => {
    const selectedChat = chats?.find(chat => chat.id === chatId)
    if (selectedChat) {
      setCurrentChat(selectedChat)
      router.push(`/chat/${chatId}`)
    }
  }

  const handleNewChat = () => {
    clearChat()
    setNewMessage('')
    router.push('/dashboard')
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChatMutation.mutateAsync(chatId)
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      clearChat()
      router.push('/auth/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">ChatGPT Clone</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-600 text-white font-medium">
                        {user?.user_metadata?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* New Chat */}
          <div className="p-4">
            <Button 
              onClick={handleNewChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1">
              {isLoadingChats ? (
                <div className="text-center text-gray-500 mt-4">
                  Loading chats...
                </div>
              ) : chats?.length === 0 ? (
                <div className="text-center text-gray-500 mt-4 text-sm">
                  No chats yet. Create your first chat!
                </div>
              ) : (
                chats?.map((chat) => (
                  <div
                    key={chat.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-left p-3 h-auto text-gray-700 hover:bg-gray-100 cursor-pointer ${
                        currentChat?.id === chat.id 
                          ? 'bg-gray-100 border-r-2 border-blue-600' 
                          : ''
                      }`}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <MessageSquare className="mr-3 h-4 w-4 text-gray-500" />
                      <div className="truncate text-sm pr-8">
                        {chat.title}
                      </div>
                    </Button>
                    {hoveredChatId === chat.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChat(chat.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Logout Button at Bottom */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to ChatGPT Clone
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Start a conversation and explore the power of AI. Select an existing chat from the sidebar or create a new one to begin.
            </p>
            <div className="space-y-4">
              <form onSubmit={(e) => {
                e.preventDefault()
                handleStartNewChat()
              }}>
                <div className="flex gap-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Start a new conversation..."
                    disabled={isSendingMessage}
                    className="flex-1 text-lg py-6"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-6"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
              <p className="text-sm text-gray-500 text-center">
                Type your message and press Send to start a new conversation
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}