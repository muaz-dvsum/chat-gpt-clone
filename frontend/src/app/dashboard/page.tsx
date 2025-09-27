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
import { useChats, useCreateChat } from '@/hooks/useChat'
import { useChatStore } from '@/store/chat'
import { MessageSquare, Plus, User, LogOut, Settings } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { data: chats, isLoading: isLoadingChats } = useChats()
  const createChatMutation = useCreateChat()
  const { currentChat, setCurrentChat, clearChat } = useChatStore()
  const router = useRouter()
  const [newChatTitle, setNewChatTitle] = useState('')

  const handleCreateChat = async () => {
    if (!newChatTitle.trim()) return

    try {
      const newChat = await createChatMutation.mutateAsync({
        title: newChatTitle.trim(),
      })
      setNewChatTitle('')
      setCurrentChat(newChat)
      router.push(`/chat/${newChat.id}`)
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const handleChatSelect = (chatId: string) => {
    const selectedChat = chats?.find(chat => chat.id === chatId)
    if (selectedChat) {
      setCurrentChat(selectedChat)
      router.push(`/chat/${chatId}`)
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
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">ChatGPT Clone</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* New Chat */}
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="New chat title..."
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateChat()}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button 
                onClick={handleCreateChat}
                disabled={!newChatTitle.trim() || createChatMutation.isPending}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {isLoadingChats ? (
                <div className="text-center text-gray-400 mt-4">
                  Loading chats...
                </div>
              ) : chats?.length === 0 ? (
                <div className="text-center text-gray-400 mt-4">
                  No chats yet. Create your first chat!
                </div>
              ) : (
                chats?.map((chat) => (
                  <Button
                    key={chat.id}
                    variant={currentChat?.id === chat.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left p-3 h-auto text-white hover:bg-gray-700"
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <div className="truncate">
                      {chat.title}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome to ChatGPT Clone
            </h2>
            <p className="text-gray-500 mb-6">
              Select a chat from the sidebar or create a new one to get started.
            </p>
            <Button 
              onClick={() => setNewChatTitle('New Chat')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Start New Chat
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}