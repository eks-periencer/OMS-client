import { useEffect, useState, useCallback } from 'react';
import { listActiveOnboarding, getOnboarding, assignOnboarding, notifyOnboarding, type OnboardingItem } from '../lib/api/onboarding';

export function useOnboarding() {
  const [items, setItems] = useState<OnboardingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => { void refresh(); }, [refresh]);

  return { items, loading, error, refresh, getOnboarding, assignOnboarding, notifyOnboarding };
}


