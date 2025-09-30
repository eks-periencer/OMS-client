import { useState, useCallback } from 'react'

interface LoadingState {
  [key: string]: boolean
}

export function useLoading() {
  const [loading, setLoading] = useState<LoadingState>({})

  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      [key]: isLoading
    }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loading[key] || false
  }, [loading])

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoadingState(key, true)
    try {
      const result = await asyncFn()
      return result
    } finally {
      setLoadingState(key, false)
    }
  }, [setLoadingState])

  return {
    loading,
    setLoadingState,
    isLoading,
    withLoading
  }
}
