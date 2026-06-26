import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './authContext'
import { safeGet, safeSet, safeRemove } from '../utils/storage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(safeGet('token'))
  const [user, setUser] = useState<string | null>(safeGet('user'))
  const [isAdmin, setIsAdmin] = useState(safeGet('isAdmin') === 'true')

  const login = (newToken: string, newUser: string, admin: boolean) => {
    setToken(newToken)
    setUser(newUser)
    setIsAdmin(admin)
    safeSet('token', newToken)
    safeSet('user', newUser)
    safeSet('isAdmin', String(admin))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAdmin(false)
    safeRemove('token')
    safeRemove('user')
    safeRemove('isAdmin')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}
