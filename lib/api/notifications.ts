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
  console.log("🌐 Calling /notifications/my...")
  const res = await apiClient.get('/notifications/my')
  console.log("📡 API Response:", res.status, res.data)
  const unwrapped = unwrap<NotificationItem[]>(res)
  console.log("📦 Unwrapped notifications:", unwrapped.length, unwrapped)
  return unwrapped
}

export async function markNotificationsRead(notificationIds: string[]): Promise<{ updated: number }> {
  const res = await apiClient.post('/notifications/read', { notificationIds })
  return unwrap<{ updated: number }>(res)
}

export async function deleteNotifications(notificationIds: string[]): Promise<{ deleted: number }> {
  console.log("🗑️ Deleting notifications:", notificationIds)
  // Try POST instead of DELETE for better data handling
  const res = await apiClient.post('/notifications/delete', { notificationIds })
  console.log("🗑️ Delete response:", res.status, res.data)
  const result = unwrap<{ deleted: number }>(res)
  console.log("🗑️ Delete result:", result)
  return result
}

export async function deleteAllNotifications(): Promise<{ deleted: number; message: string }> {
  console.log("🗑️ Deleting ALL notifications (System Admin only)...")
  const res = await apiClient.delete('/notifications/delete-all')
  console.log("🗑️ Delete all response:", res.status, res.data)
  const result = unwrap<{ deleted: number; message: string }>(res)
  console.log("🗑️ Delete all result:", result)
  return result
}

export async function getAdminNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get('/notifications/admin')
  return unwrap<NotificationItem[]>(res)
}