'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthTestPage() {
  const { signIn, signUp, signOut, user, isAuthenticated, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLocalLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLocalLoading(true)
    
    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLocalLoading(true)
    
    try {
      await signUp(email, password, { name })
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err: any) {
      console.error('Sign out error:', err)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">MongoDB Auth Test</h1>
      
      {isAuthenticated ? (
        <div>
          <h2 className="text-xl mb-4">Welcome!</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Active:</strong> {user?.isActive ? 'Yes' : 'No'}</p>
            <p><strong>Created:</strong> {user?.createdAt}</p>
            <p><strong>Last Login:</strong> {user?.lastLoginAt || 'Never'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignIn} className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Sign In</h2>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <form onSubmit={handleSignUp}>
            <h2 className="text-lg font-semibold mb-4">Sign Up</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}