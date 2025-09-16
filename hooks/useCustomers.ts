import { useEffect, useMemo, useState } from 'react';
import type { Customer, CreateCustomerInput } from '../lib/api/customers';
import { listCustomers, getTrialCustomers, getCustomerStats, createCustomer, convertTrialToCustomer } from '../lib/api/customers';

export function useCustomers() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<{ total: number; trial: number; individual: number; business: number } | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, s] = await Promise.all([listCustomers(), getCustomerStats()]);
      setCustomers(list);
      setStats(s);
    } catch (e: any) {
      setError(e?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const trial = useMemo(() => customers.filter(c => c.is_trial), [customers]);

  const create = async (input: CreateCustomerInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createCustomer(input);
      await refresh();
      return created;
    } catch (e: any) {
      setError(e?.message || 'Failed to create customer');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const convertTrial = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await convertTrialToCustomer(id);
      await refresh();
      return updated;
    } catch (e: any) {
      setError(e?.message || 'Failed to convert trial');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loadTrial = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getTrialCustomers();
      return list;
    } catch (e: any) {
      setError(e?.message || 'Failed to load trial customers');
      return [] as Customer[];
    } finally {
      setLoading(false);
    }
  };

  return { customers, stats, trial, loading, error, refresh, create, convertTrial, loadTrial };
}


