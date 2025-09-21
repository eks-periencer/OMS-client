import { useEffect, useState, useCallback } from 'react';
import { listOrders, getOrder, createOrder, updateOrderStatus, updateOrder, deleteOrder, getOrderWorkflowState, getOrderWorkflowHistory, type OrderItem, type CreateOrderRequest, type UpdateOrderStatusRequest } from '../lib/api/orders';

export function useOrders() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders();
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log('[useOrders] items from API:', data);
      }
      setItems(data);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Failed to load orders');
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('[useOrders] error:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    void refresh(); 
  }, [refresh]);

  const createNewOrder = useCallback(async (orderData: CreateOrderRequest): Promise<OrderItem> => {
    try {
      const newOrder = await createOrder(orderData);
      await refresh(); // Refresh the list
      return newOrder;
    } catch (e: any) {
      throw new Error(e?.response?.data?.error?.message || e?.message || 'Failed to create order');
    }
  }, [refresh]);

  const updateOrderStatusById = useCallback(async (id: string, statusData: UpdateOrderStatusRequest): Promise<void> => {
    try {
      await updateOrderStatus(id, statusData);
      await refresh(); // Refresh the list
    } catch (e: any) {
      throw new Error(e?.response?.data?.error?.message || e?.message || 'Failed to update order status');
    }
  }, [refresh]);

  const updateOrderById = useCallback(async (id: string, orderData: Partial<CreateOrderRequest>): Promise<OrderItem> => {
    try {
      const updatedOrder = await updateOrder(id, orderData);
      await refresh(); // Refresh the list
      return updatedOrder;
    } catch (e: any) {
      throw new Error(e?.response?.data?.error?.message || e?.message || 'Failed to update order');
    }
  }, [refresh]);

  const deleteOrderById = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteOrder(id);
      await refresh(); // Refresh the list
    } catch (e: any) {
      throw new Error(e?.response?.data?.error?.message || e?.message || 'Failed to delete order');
    }
  }, [refresh]);

  return { 
    items, 
    loading, 
    error, 
    refresh,
    createOrder: createNewOrder,
    updateOrderStatus: updateOrderStatusById,
    updateOrder: updateOrderById,
    deleteOrder: deleteOrderById,
    getOrder,
    getOrderWorkflowState,
    getOrderWorkflowHistory
  };
}
