import { apiClient, unwrap } from './client';

export type CustomerType = 'individual' | 'business';

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Customer {
  id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: Address;
  customer_type: CustomerType;
  is_trial: boolean;
  trial_start_date?: string | null;
  trial_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
  // Allow camelCase from forms; server normalizes
  firstName?: string;
  lastName?: string;
  customerType?: CustomerType;
  isTrial?: boolean;

  // Snake_case also supported
  first_name?: string;
  last_name?: string;
  customer_type?: CustomerType;
  is_trial?: boolean;

  email: string;
  phone?: string;
  address: Address;
}

export async function listCustomers(): Promise<Customer[]> {
  const resp = await apiClient.get('/customers');
  return unwrap<Customer[]>(resp);
}

export async function getCustomer(id: string): Promise<Customer> {
  const resp = await apiClient.get(`/customers/${id}`);
  return unwrap<Customer>(resp);
}

export async function getTrialCustomers(): Promise<Customer[]> {
  const resp = await apiClient.get('/customers/trial');
  return unwrap<Customer[]>(resp);
}

export async function getCustomerStats(): Promise<{ total: number; trial: number; individual: number; business: number }>{
  const resp = await apiClient.get('/customers/stats');
  return unwrap(resp);
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const resp = await apiClient.get(`/customers/email/${encodeURIComponent(email)}`);
  return unwrap<Customer | null>(resp);
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const resp = await apiClient.post('/customers', input);
  return unwrap<Customer>(resp);
}

export async function updateCustomer(id: string, input: Partial<CreateCustomerInput>): Promise<Customer> {
  const resp = await apiClient.put(`/customers/${id}`, input);
  return unwrap<Customer>(resp);
}

export async function convertTrialToCustomer(id: string): Promise<Customer> {
  const resp = await apiClient.post(`/customers/${id}/convert-trial`);
  return unwrap<Customer>(resp);
}


