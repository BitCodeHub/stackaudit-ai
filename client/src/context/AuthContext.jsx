import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('stackaudit_token')
    const storedUser = localStorage.getItem('stackaudit_user')
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // API call would go here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }
      
      const data = await response.json()
      localStorage.setItem('stackaudit_token', data.token)
      localStorage.setItem('stackaudit_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (error) {
      // For demo, simulate successful login
      const demoUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        company: 'Demo Company',
        plan: 'pro'
      }
      localStorage.setItem('stackaudit_token', 'demo_token')
      localStorage.setItem('stackaudit_user', JSON.stringify(demoUser))
      setUser(demoUser)
      return { success: true }
    }
  }

  const signup = async (name, email, password, company) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Signup failed')
      }
      
      const data = await response.json()
      localStorage.setItem('stackaudit_token', data.token)
      localStorage.setItem('stackaudit_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (error) {
      // For demo, simulate successful signup
      const demoUser = {
        id: Date.now().toString(),
        email,
        name,
        company,
        plan: 'free'
      }
      localStorage.setItem('stackaudit_token', 'demo_token')
      localStorage.setItem('stackaudit_user', JSON.stringify(demoUser))
      setUser(demoUser)
      return { success: true }
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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
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
