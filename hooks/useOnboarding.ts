import { useEffect, useState, useCallback } from 'react';
import { listActiveOnboarding, getOnboarding, assignOnboarding, notifyOnboarding, getOnboardingMetrics, type OnboardingItem, type OnboardingMetrics } from '../lib/api/onboarding';

export function useOnboarding() {
  const [items, setItems] = useState<OnboardingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listActiveOnboarding();
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log('[useOnboarding] items from API:', data);
      }
      setItems(data);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Failed to load onboarding');
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('[useOnboarding] error:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const data = await getOnboardingMetrics();
      setMetrics(data);
    } catch (e: any) {
      setMetricsError(e?.response?.data?.error?.message || e?.message || 'Failed to load metrics');
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('[useOnboarding] metrics error:', e);
      }
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => { 
    void refresh(); 
    void refreshMetrics();
  }, [refresh, refreshMetrics]);

  return { 
    items, 
    loading, 
    error, 
    refresh, 
    metrics, 
    metricsLoading, 
    metricsError, 
    refreshMetrics,
    getOnboarding, 
    assignOnboarding, 
    notifyOnboarding 
  };
}


