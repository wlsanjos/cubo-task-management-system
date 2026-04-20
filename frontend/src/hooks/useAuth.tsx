"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getStoredToken, getStoredUser, type AuthResponse } from "@/services/auth.service"

interface AuthUser {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: AuthResponse) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = getStoredToken()
    const storedUser = getStoredUser()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = (data: AuthResponse) => {
    setToken(data.token)
    setUser(data.user)
  }

  const logout = async () => {
    const { logout } = await import("@/services/auth.service")
    await logout()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}