import api from './client';

export interface OrderItem {
  id: string;
  order_number?: string;
  customer_id?: string;
  order_type?: string;
  priority?: string;
  service_type?: string;
  service_package?: string;
  current_state?: string;
  fno_id?: string;
  fno_reference?: string;
  created_at?: string;
  updated_at?: string;
  estimated_completion?: string;
  service_address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  service_details?: {
    bandwidth?: string;
    installation_type?: string;
  };
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  fno?: {
    name?: string;
    code?: string;
  };
}

export interface CreateOrderRequest {
  customerId: string;
  orderType: string;
  priority: string;
  serviceAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  serviceDetails: {
    serviceType: string;
    bandwidth: string;
    installationType: string;
  };
}

export interface UpdateOrderStatusRequest {
  status: string;
  reason?: string;
  fnoId?: string;
  fnoReference?: string;
}

export async function listOrders(): Promise<OrderItem[]> {
  const { data: payload } = await api.get('/orders');
  // Unwrap common shapes: { success, data: [...] }, raw array, or { items: [...] }
  const rawList: any[] = Array.isArray((payload as any)?.data)
    ? (payload as any).data
    : Array.isArray(payload)
    ? (payload as any)
    : (payload as any)?.items || [];

  const normalized: OrderItem[] = rawList.map((it: any) => ({
    id: it.id,
    order_number: it.order_number ?? it.orderNumber ?? '',
    customer_id: it.customer_id ?? it.customerId ?? '',
    order_type: it.order_type ?? it.orderType ?? 'new_install',
    priority: it.priority ?? 'normal',
    service_type: it.service_type ?? it.serviceType ?? '',
    service_package: it.service_package ?? it.servicePackage ?? '',
    current_state: it.current_state ?? it.currentState ?? it.status ?? 'created',
    fno_id: it.fno_id ?? it.fnoId ?? '',
    fno_reference: it.fno_reference ?? it.fnoReference ?? '',
    created_at: it.created_at ?? it.createdAt ?? '',
    updated_at: it.updated_at ?? it.updatedAt ?? '',
    estimated_completion: it.estimated_completion ?? it.estimatedCompletion ?? '',
    service_address: it.service_address ?? it.serviceAddress ?? {},
    service_details: it.service_details ?? it.serviceDetails ?? {},
    customer: it.customer ?? {},
    fno: it.fno ?? {}
  }));

  if (typeof window !== 'undefined') {
    // Debug: log raw and normalized
    // eslint-disable-next-line no-console
    console.log('[orders] GET /orders payload:', payload);
    // eslint-disable-next-line no-console
    console.log('[orders] normalized list:', normalized);
  }

  return normalized;
}

export async function getOrder(id: string): Promise<OrderItem> {
  const { data } = await api.get(`/orders/${id}`);
  const rawOrder = (data?.data || data?.order || data);
  
  // Normalize the order data to match the expected structure
  return {
    id: rawOrder.id,
    order_number: rawOrder.order_number ?? rawOrder.orderNumber ?? '',
    customer_id: rawOrder.customer_id ?? rawOrder.customerId ?? '',
    order_type: rawOrder.order_type ?? rawOrder.orderType ?? 'new_install',
    priority: rawOrder.priority ?? 'normal',
    current_state: rawOrder.current_state ?? rawOrder.currentState ?? rawOrder.status ?? 'created',
    fno_id: rawOrder.fno_id ?? rawOrder.fnoId ?? '',
    fno_reference: rawOrder.fno_reference ?? rawOrder.fnoReference ?? '',
    created_at: rawOrder.created_at ?? rawOrder.createdAt ?? '',
    updated_at: rawOrder.updated_at ?? rawOrder.updatedAt ?? '',
    estimated_completion: rawOrder.estimated_completion ?? rawOrder.estimatedCompletion ?? '',
    service_address: rawOrder.service_address ?? rawOrder.serviceAddress ?? {},
    service_details: rawOrder.service_details ?? rawOrder.serviceDetails ?? {},
    customer: rawOrder.customer ?? {},
    fno: rawOrder.fno ?? {}
  };
}

export async function createOrder(orderData: CreateOrderRequest): Promise<OrderItem> {
  const { data } = await api.post('/orders', orderData);
  return data?.data || data;
}

export async function updateOrderStatus(id: string, statusData: UpdateOrderStatusRequest): Promise<void> {
  await api.patch(`/orders/${id}/status`, statusData);
}

export async function updateOrder(id: string, orderData: Partial<CreateOrderRequest>): Promise<OrderItem> {
  const { data } = await api.put(`/orders/${id}`, orderData);
  return data?.data || data;
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}

export async function getOrderWorkflowState(id: string): Promise<{ state: string; transitions: Array<{ toState: string; name?: string }> }> {
  const { data } = await api.get(`/orders/${id}/workflow/state`);
  return {
    state: data?.state || data?.data?.state || 'created',
    transitions: data?.transitions || data?.data?.transitions || []
  };
}

export async function getOrderWorkflowHistory(id: string): Promise<any[]> {
  const { data } = await api.get(`/orders/${id}/history`);
  const raw = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.workflowHistory)
        ? data.workflowHistory
        : Array.isArray(data?.data?.workflowHistory)
          ? data.data.workflowHistory
          : Array.isArray(data?.history)
            ? data.history
            : [];

  return raw.map((h: any) => ({
    toState: h.to_state_name ?? h.toStateName ?? h.to_state ?? h.toState ?? h.state ?? h.to ?? 'unknown',
    fromState: h.from_state_name ?? h.fromStateName ?? h.from_state ?? h.fromState ?? null,
    transitionName: h.transition_name ?? h.transitionName ?? undefined,
    occurredAt: h.executed_at ?? h.occurred_at ?? h.occurredAt ?? h.timestamp ?? null,
    actorId: h.executed_by ?? h.actor_id ?? h.actorId ?? null,
    actorName: (h.actor_first_name || h.actorFirstName || '') || (h.actor_last_name || h.actorLastName || '')
      ? `${(h.actor_first_name || h.actorFirstName || '').toString().trim()} ${(h.actor_last_name || h.actorLastName || '').toString().trim()}`.trim()
      : null,
    reason: h.execution_reason ?? h.reason ?? undefined,
  }));
}
