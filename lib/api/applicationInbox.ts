import { apiClient, unwrap } from './client'

export async function getInbox(params: any = {}) {
  const res = await apiClient.get('/application-admin/inbox', { params })
  return unwrap(res)
}

export async function assignApplication(id: string, assignedTo: string) {
  const res = await apiClient.put(`/application-admin/inbox/${encodeURIComponent(id)}/assign`, { assignedTo })
  return unwrap(res)
}

export async function completeApplication(id: string, payload: { fnoReference?: string; notes?: string }) {
  const res = await apiClient.put(`/application-admin/inbox/${encodeURIComponent(id)}/complete`, payload)
  return unwrap(res)
}


