import { useEffect, useState, useCallback } from 'react'
import { getInbox, assignApplication, completeApplication } from '../lib/api/applicationInbox'

export function useApplicationInbox() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async (params?: any) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getInbox(params)
      const list = Array.isArray((data as any)?.applications) ? (data as any).applications : (Array.isArray(data) ? data : [])
      setItems(list)
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Failed to load inbox')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refetch(); }, [refetch])

  return {
    items,
    loading,
    error,
    refetch,
    assign: assignApplication,
    complete: completeApplication,
  }
}


