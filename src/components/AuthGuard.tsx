import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import type { RootState } from '../toolkit/store'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, accessToken, user } = useSelector((state: RootState) => state.authentication)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !accessToken) {
      // Store the attempted route to redirect back after login
      const currentPath = location.pathname + location.search
      navigate('/login', { 
        state: { 
          from: currentPath,
          message: 'Please log in to access this page'
        }
      })
      return
    }

    // Optional: Check if token is expired (you can add token expiry logic here)
    // For now, we'll rely on the backend to handle token validation
  }, [isAuthenticated, accessToken, navigate, location])

  // Show loading while checking authentication
  if (!isAuthenticated || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Checking Authentication</h3>
            <p className="text-muted-foreground">Please wait while we verify your access...</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for easier usage
export const withAuthGuard = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <AuthGuard>
      <Component {...props} />
    </AuthGuard>
  )
}
