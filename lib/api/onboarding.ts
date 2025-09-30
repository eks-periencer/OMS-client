import api from './client';
import { onbClient } from './onboardingClient';

export interface OnboardingItem {
  id: string;
  customer_id?: string;
  order_id?: string;
  onboarding_type?: string;
  current_step?: string;
  completion_percentage?: number;
  assigned_to?: string | null;
  started_at?: string;
}

export async function listActiveOnboarding(): Promise<OnboardingItem[]> {
  const { data: payload } = await onbClient.get('/active');
  // Unwrap common shapes: { success, data: [...] }, raw array, or { items: [...] }
  const rawList: any[] = Array.isArray((payload as any)?.data)
    ? (payload as any).data
    : Array.isArray(payload)
    ? (payload as any)
    : (payload as any)?.items || [];

  const normalized: OnboardingItem[] = rawList.map((it: any) => ({
    id: it.id,
    customer_id: it.customer_id ?? it.customerId ?? '',
    order_id: it.order_id ?? it.orderId ?? '',
    onboarding_type: it.onboarding_type ?? it.onboardingType ?? 'standard',
    current_step: it.current_step ?? it.currentStep ?? 'initiated',
    completion_percentage: it.completion_percentage ?? it.completionPercentage ?? 0,
    assigned_to: it.assigned_to ?? it.assignedTo ?? null,
    started_at: it.started_at ?? it.startedAt ?? ''
  }));

  if (typeof window !== 'undefined') {
    // Debug: log raw and normalized
    // eslint-disable-next-line no-console
    console.log('[onboarding] GET /onboarding/active payload:', payload);
    // eslint-disable-next-line no-console
    console.log('[onboarding] normalized list:', normalized);
  }

  return normalized;
}

export async function getOnboarding(id: string): Promise<OnboardingItem> {
  const { data } = await onbClient.get(`/${id}`);
  // Normalize common shapes and ensure current_step is present
  const raw = data?.data || data;
  return {
    id: raw.id,
    customer_id: raw.customer_id ?? raw.customerId,
    order_id: raw.order_id ?? raw.orderId,
    onboarding_type: raw.onboarding_type ?? raw.onboardingType,
    current_step: raw.current_step ?? raw.currentStep,
    completion_percentage: raw.completion_percentage ?? raw.completionPercentage,
    assigned_to: raw.assigned_to ?? raw.assignedTo,
    started_at: raw.started_at ?? raw.startedAt
  } as OnboardingItem;
}

export async function assignOnboarding(id: string, assignedTo: string): Promise<void> {
  await onbClient.patch(`/${id}/assign`, { assignedTo });
}

export async function notifyOnboarding(
  id: string,
  payload: { type: 'welcome' | 'reminder' | 'completion' | 'trial-expiry'; email?: string; variables?: Record<string, any> }
): Promise<void> {
  await onbClient.post(`/${id}/notify`, payload);
}

export async function initiateOnboarding(customerId: string, onboardingType: string = 'standard'): Promise<{ onboardingId: string }> {
  const { data } = await onbClient.post('/initiate', { customerId, onboardingType });
  return data?.data || data;
}

export async function updateOnboardingStep(id: string, stepId: string, body: { notes?: string; metadata?: Record<string, any> } = {}): Promise<void> {
  await onbClient.put(`/${id}/step/${stepId}`, body);
}

export async function getOnboardingSteps(id: string): Promise<any[]> {
  const { data } = await onbClient.get(`/${id}/steps`);
  return Array.isArray(data) ? data : (data?.data || []);
}

export async function getOnboardingTransitions(id: string): Promise<Array<{ fromState: string; toState: string; name?: string }>> {
  const { data } = await onbClient.get(`/${id}/workflow/transitions`);
  const payload = data?.data?.transitions || data?.transitions || [];
  return payload as Array<{ fromState: string; toState: string; name?: string }>;
}

export async function getOnboardingState(id: string): Promise<string> {
  const { data } = await onbClient.get(`/${id}/workflow/state`);
  return (data?.state || data?.data?.state || 'initiated') as string;
}

export interface OnboardingMetrics {
  summary: {
    total: number;
    warning: number;
    breached: number;
    reescalated: number;
    avgTimeInState: number;
  };
  slaStatuses: Array<{
    onboardingId: string;
    currentState: string;
    slaHours: number;
    elapsedHours: number;
    slaPercentage: number;
    dueAt: string;
    slaStatus: 'ok' | 'warning' | 'breached' | 'reescalated' | 'unknown';
    assigneeName: string;
    assigneeEmail: string;
    slaAlertsCount: number;
  }>;
}

export async function getOnboardingMetrics(): Promise<OnboardingMetrics> {
  const { data } = await onbClient.get('/analytics/overview');
  const payload = data?.data || data || {};
  // Normalize to expected shape with summary
  const summary = {
    total: Number(payload.totalOnboardings ?? 0),
    warning: Number(payload.warning ?? 0),
    breached: Number(payload.breached ?? 0),
    reescalated: Number(payload.reescalated ?? 0),
    avgTimeInState: Number(payload.averageCompletionTime ?? payload.avgTimeInState ?? 0),
  };
  return { summary, slaStatuses: Array.isArray(payload.slaStatuses) ? payload.slaStatuses : [] } as OnboardingMetrics;
}


