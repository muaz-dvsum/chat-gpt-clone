import { apiClient } from './client'

export interface AuthResponse {
  success: boolean
  data: {
    user?: any
    session?: any
    access_token?: string
    refresh_token?: string
  }
}

export const authApi = {
  signUp: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/dev-auth/signup', {
      email,
      password,
      name,
    })
    return response.data
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/dev-auth/signin', {
      email,
      password,
    })
    return response.data
  },

  signInWithGoogle: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google')
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  signOut: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
}