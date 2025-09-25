import api from './client'

export type FNOItem = {
  id: string
  name: string
  code: string
  integration_type: 'api' | 'manual'
  portal_url?: string
}

export async function listFNOs(): Promise<FNOItem[]> {
  const { data } = await api.get('/fno', { params: { page: 1, limit: 100 } })
  const raw = (data?.data?.fnos || data?.data || data?.items || []) as any[]
  return raw.map((r: any) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    integration_type: r.integration_type,
    portal_url: r.portal_url
  }))
}

export async function submitOrderToFNO(fnoId: string, orderId: string, submissionType: 'api' | 'manual') {
  const { data } = await api.post(`/fno/${fnoId}/submit-order`, { orderId, submissionType })
  return data?.data || data
}

import { apiClient, unwrap } from './client'

// Types are minimal; extend as backend stabilizes
export type FnoStats = Record<string, unknown>
export interface Fno {
  id?: string
  _id?: string
  name?: string
  code?: string
  integration_type?: 'api' | 'manual'
  type?: 'api' | 'manual'
  status?: string
  api_endpoint?: string | null
  api_key_encrypted?: string | null
  portal_url?: string | null
  coverage_areas?: string[]
  coverageAreas?: string[]
  is_active?: boolean
  created_at?: string
  orders?: number | null
  successRate?: number | null
  lastSync?: string | null
}
export type IntegrationLog = Record<string, unknown>
export type MonitoringSummary = Record<string, unknown>

// Note: base URL is resolved in lib/api/client.ts; this constant is unused here

// GET /fno/stats - totals and KPI metrics only
export async function getFnoStats(): Promise<FnoStats> {
  const res = await apiClient.get('/fno/stats')
  const data = unwrap<{ totals: any; metrics: any }>(res)
  return data
}

// GET /fno - list FNOs
export async function getFNOs(): Promise<Fno[]> {
  const res = await apiClient.get('/fno')
  const data = unwrap<{ fnos: Fno[]; total: number }>(res)
  return data.fnos
}

// POST /fno - create a new FNO
export async function createFno(payload: Record<string, unknown>): Promise<Fno> {
  const res = await apiClient.post('/fno', payload)
  return unwrap<Fno>(res)
}


// POST /fno/:fnoId/submit-order
export async function submitOrder(fnoId: string, payload: Record<string, unknown>): Promise<{ id?: string } & Record<string, unknown>> {
  const res = await apiClient.post(`/fno/${encodeURIComponent(fnoId)}/submit-order`, payload)
  return unwrap(res)
}

// PUT /fno/manual-application/:applicationId
export async function updateManualApplication(applicationId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiClient.put(`/fno/manual-application/${encodeURIComponent(applicationId)}`, payload)
  return unwrap(res)
}

// GET /fno/fnoConfiguration - configuration dashboard data
export async function getFnoConfiguration(): Promise<Fno[]> {
  const res = await apiClient.get('/fno/fnoConfiguration')
  const data = unwrap<{ items?: Fno[] } | Fno[]>(res)
  if (Array.isArray(data)) return data
  return data.items ?? []
}

// GET /fno/integrationLogs - recent integration logs
export async function getIntegrationLogs(): Promise<IntegrationLog[]> {
  const res = await apiClient.get('/fno/integrationLogs')
  const data = unwrap<IntegrationLog[]>(res)
  return data
}

// GET /fno/monitoring - performance and manual processing summaries
export async function getMonitoring(): Promise<MonitoringSummary> {
  const res = await apiClient.get('/fno/monitoring')
  const data = unwrap<MonitoringSummary>(res)
  return data
}

export default {
  getFnoStats,
  getFNOs,
  createFno,
  submitOrder,
  updateManualApplication,
  getFnoConfiguration,
  getIntegrationLogs,
  getMonitoring,
}
