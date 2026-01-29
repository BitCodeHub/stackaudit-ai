import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check for stored auth token and validate it
    const validateToken = async () => {
      const token = localStorage.getItem('stackaudit_token')
      const storedUser = localStorage.getItem('stackaudit_user')
      
      if (token && storedUser) {
        try {
          // Optionally verify token with backend
          // const data = await api.me()
          // setUser(data.user)
          setUser(JSON.parse(storedUser))
        } catch (err) {
          // Token invalid, clear storage
          localStorage.removeItem('stackaudit_token')
          localStorage.removeItem('stackaudit_user')
        }
      }
      setLoading(false)
    }
    validateToken()
  }, [])

  const login = async (email, password) => {
    setError(null)
    try {
      const data = await api.login(email, password)
      localStorage.setItem('stackaudit_token', data.token)
      localStorage.setItem('stackaudit_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError(err.message || 'Login failed')
      throw err
    }
  }

  const signup = async (name, email, password, organizationName) => {
    setError(null)
    try {
      const data = await api.signup({ name, email, password, organizationName })
      localStorage.setItem('stackaudit_token', data.token)
      localStorage.setItem('stackaudit_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError(err.message || 'Signup failed')
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('stackaudit_token')
    localStorage.removeItem('stackaudit_user')
    setUser(null)
  }

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    localStorage.setItem('stackaudit_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
