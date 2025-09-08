// Authentication utilities and context
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, LoginRequest } from "./types"

interface AuthContextType {
  user: User | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem("accessToken")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      if (credentials.password !== "google123") {
        throw new Error("Invalid password. Use 'google123' as the Google placeholder password.")
      }

      // Mock authentication for now - replace with actual API call
      const mockUser: User = {
        id: "1",
        email: credentials.email,
        firstName: "John",
        lastName: "Doe",
        role: {
          id: "1",
          name: "Operations Manager",
          permissions: [
            "orders:*",
            "escalations:*",
            "customers:read",
            "app_admin:*",
            "onboarding:*",
            "fno:*",
            "admin:*",
          ],
          createdAt: new Date().toISOString(),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const mockToken = "mock-jwt-token"

      localStorage.setItem("accessToken", mockToken)
      localStorage.setItem("user", JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Permission checking utilities
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false

  // Super admin has all permissions
  if (user.role.permissions.includes("*")) return true

  // Check for exact permission match
  if (user.role.permissions.includes(permission)) return true

  // Check for wildcard permissions (e.g., "orders:*" matches "orders:create")
  const [resource, action] = permission.split(":")
  const wildcardPermission = `${resource}:*`

  return user.role.permissions.includes(wildcardPermission)
}

export function requirePermission(user: User | null, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`)
  }
}
