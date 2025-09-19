import { apiClient, unwrap } from './client'

export type NotificationItem = {
  _id: string
  type: string
  title: string
  message: string
  targets?: { roles?: string[]; userIds?: string[] }
  status?: 'pending' | 'delivered' | 'read'
  createdAt: string
  url?: string
}

export async function getMyNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get('/notifications/my')
  return unwrap<NotificationItem[]>(res)
}

export async function markNotificationsRead(notificationIds: string[]): Promise<{ updated: number }> {
  const res = await apiClient.post('/notifications/read', { notificationIds })
  return unwrap<{ updated: number }>(res)
}

export async function getAdminNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get('/notifications/admin')
  return unwrap<NotificationItem[]>(res)
}