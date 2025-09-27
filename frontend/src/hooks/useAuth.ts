import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { useQueryClient } from '@tanstack/react-query'
import { AuthUser } from '@/types'

export const useAuth = () => {
  const { user, setUser, setLoading, logout } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isAuthenticated = !!user
  const isLoading = useAuthStore(state => state.isLoading)

  const clearChatData = () => {
    // Clear chat store
    useChatStore.getState().clearAll()
    // Clear React Query cache for chat-related queries
    queryClient.removeQueries({ queryKey: ['chats'] })
    queryClient.removeQueries({ queryKey: ['chat'] })
    queryClient.removeQueries({ queryKey: ['messages'] })
  }

  useEffect(() => {
    // Get initial session/profile
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setUser(null)
          setLoading(false)
          return
        }

        // Try to get user profile with the stored token
        const response = await authApi.getProfile()
        if (response.success && response.data.user) {
          const user = response.data.user
          setUser({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
          })
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
          // Clear any stale chat data
          clearChatData()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid tokens
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        // Clear any stale chat data
        clearChatData()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [setUser, setLoading])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn(email, password)
      
      if (!response.success) {
        throw new Error(response.message || 'Sign in failed')
      }

      const { session, user } = response.data
      if (session && user) {
        // Clear any existing chat data from previous user
        clearChatData()
        
        // Store tokens
        localStorage.setItem('access_token', session.access_token)
        localStorage.setItem('refresh_token', session.refresh_token)
        
        // Update auth state with properly typed user
        setUser({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        })
        
        // Navigate to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 100)
      }

      return response.data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const response = await authApi.signUp(email, password, metadata?.name)
      
      if (!response.success) {
        throw new Error(response.message || 'Sign up failed')
      }

      // Don't auto-login, just redirect to signin page
      setTimeout(() => {
        router.push('/auth/login')
      }, 100)

      return response.data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const response = await authApi.signInWithGoogle()
      
      if (!response.success) {
        throw new Error('Google sign in failed')
      }

      // Handle Google OAuth redirect
      return response.data
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authApi.signOut()
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      // Clear chat store data
      clearChatData()
      
      logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
      // Still logout locally even if API call fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      // Clear chat store data
      clearChatData()
      
      logout()
      router.push('/auth/login')
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
}