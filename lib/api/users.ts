import apiClient, { type Paginated } from './client';

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export async function getUserActivities(userId: string, params?: { limit?: number; offset?: number; action?: string; resourceType?: string }): Promise<Paginated<UserActivity>> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.offset != null) q.set('offset', String(params.offset));
  if (params?.action) q.set('action', params.action);
  if (params?.resourceType) q.set('resourceType', params.resourceType);
  const url = `/user-management/${encodeURIComponent(userId)}/activities${q.toString() ? `?${q.toString()}` : ''}`;
  console.log('👣 getUserActivities → URL:', url);
  const res = await apiClient.get(url);
  console.log('📡 getUserActivities → Status:', res.status);
  console.log('📦 getUserActivities → Raw payload:', res.data);
  const payload = res?.data ?? {};
  const data = Array.isArray(payload?.data) ? payload.data as UserActivity[] : [];
  const meta = payload?.meta ?? { total: data.length, limit: Number(new URL(url, 'http://x').searchParams.get('limit') || 50), offset: Number(new URL(url, 'http://x').searchParams.get('offset') || 0) };
  const result: Paginated<UserActivity> = { data, meta };
  console.log('✅ getUserActivities → Parsed:', { items: result.data.length, meta: result.meta });
  return result;
}


