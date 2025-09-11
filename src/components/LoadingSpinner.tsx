import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-background'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
}

// Specialized loading components for different contexts
export function PageLoadingSpinner() {
  return <LoadingSpinner size="lg" text="Loading page..." fullScreen />;
}

export function AuthLoadingSpinner() {
  return <LoadingSpinner size="xl" text="Authenticating..." fullScreen />;
}

export function DataLoadingSpinner() {
  return <LoadingSpinner size="md" text="Loading data..." />;
}

export function ButtonLoadingSpinner() {
  return <LoadingSpinner size="sm" text="" />;
}
