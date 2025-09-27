import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth'
import { AuthUser } from '@/types'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()
  const router = useRouter()

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
          setUser(response.data.user as AuthUser)
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid tokens
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
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
        throw new Error('Sign in failed')
      }

      const { session, user } = response.data
      if (session && user) {
        // Store tokens
        localStorage.setItem('access_token', session.access_token)
        localStorage.setItem('refresh_token', session.refresh_token)
        
        // Update auth state
        setUser(user as AuthUser)
        
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
        throw new Error('Sign up failed')
      }

      const { session, user } = response.data
      if (session && user) {
        // Store tokens - user is now automatically logged in
        localStorage.setItem('access_token', session.access_token)
        localStorage.setItem('refresh_token', session.refresh_token)
        
        // Update auth state
        setUser(user as AuthUser)
        
        // Navigate to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 100)
      }

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
      logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
      // Still logout locally even if API call fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
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