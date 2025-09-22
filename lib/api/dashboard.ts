import { apiClient, unwrap } from './client'

export type DashboardSummary = {
  totalOrders: number
  activeOrders: number
  escalations: number
  trialCustomers: number
  ordersToday: number
}

export type DashboardOrder = {
  id: string
  orderNumber: string
  priority: 'urgent' | 'high' | 'medium' | 'normal' | 'low'
  customerName?: string
  customer?: string
  serviceType: string
  status: string
  createdAt: string
}

export type DashboardEscalation = {
  id: string
  orderId?: string
  orderNumber: string
  customerName?: string
  customer?: string
  issue?: string
  reason?: string
  aging?: string
  agingHours?: number
  level: string | number
  createdAt?: string
}

export type DashboardPayload = {
  summary: DashboardSummary
  recentOrders: DashboardOrder[]
  pendingEscalations: DashboardEscalation[]
}

export async function getDashboard(): Promise<DashboardPayload> {
  const res = await apiClient.get('/dashboard')
  return unwrap<DashboardPayload>(res)
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await apiClient.get('/dashboard/summary')
  return unwrap<DashboardSummary>(res)
}

export async function getRecentOrders(): Promise<DashboardOrder[]> {
  const res = await apiClient.get('/dashboard/recent-orders')
  return unwrap<DashboardOrder[]>(res)
}

export async function getPendingEscalations(): Promise<DashboardEscalation[]> {
  const res = await apiClient.get('/dashboard/pending-escalations')
  return unwrap<DashboardEscalation[]>(res)
}

export default {
  getDashboard,
  getDashboardSummary,
  getRecentOrders,
  getPendingEscalations,
}


