import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  message = "Loading...", 
  className = "" 
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-background rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

interface PageLoadingProps {
  isLoading: boolean
  message?: string
}

export function PageLoading({ 
  isLoading, 
  message = "Loading..." 
}: PageLoadingProps) {
  if (!isLoading) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{message}</h3>
          <p className="text-sm text-muted-foreground">Please wait while we process your request...</p>
        </div>
      </div>
    </div>
  )
}

interface ButtonLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function ButtonLoading({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  className = ""
}: ButtonLoadingProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  )
}
