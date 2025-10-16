import api from './client';

export interface TrialCustomer {
  id: string;
  orderId: string;
  email: string;
  status: string;
  daysRemaining: number;
  engagementLevel?: string;
  engagementScore?: number;
  totalDataUsageGB?: number;
  loginCount?: number;
  trialStartDate?: string;
  trialEndDate?: string;
  metadata?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface TrialAnalytics {
  totalTrials: number;
  activeTrials: number;
  convertedTrials: number;
  expiredTrials: number;
  conversionRate: string;
}

export interface CampaignSummary {
  trialId: string;
  summary: {
    totalPlanned: number;
    sent: number;
    failed: number;
    pending: number;
    remaining: number;
    days: number[];
  };
}

export async function getTrialById(trialId: string) {
  const { data } = await api.get(`/trials/${trialId}`);
  return data?.data || data;
}

export async function getTrialWorkflow(trialId: string) {
  const { data } = await api.get(`/trials/${trialId}/workflow`);
  return data?.data || data;
}

// New dedicated trial workflow endpoint - cleaner and more maintainable
export async function getTrialWorkflowByOrder(orderId: string) {
  const { data } = await api.get(`/trials/workflow/${orderId}`);
  return data?.data || data;
}

export async function transitionTrialWorkflow(orderId: string, targetState: string) {
  const { data } = await api.post(`/orders/${orderId}/trials/workflow/transition`, {
    toState: targetState
  });
  return data?.data || data;
}

export async function transitionTrial(trialId: string, action: 'convert'|'cancel'|'expire', payload?: Record<string, unknown>) {
  const { data } = await api.post(`/trials/${trialId}/transition`, { action, ...(payload || {}) as Record<string, unknown> });
  return data?.data || data;
}

export async function sendWelcome(trialId: string) {
  const { data } = await api.post(`/trials/${trialId}/welcome`);
  return data?.data || data;
}

export async function getCampaignSummaryByOrder(orderId: string) {
  const { data } = await api.get(`/trials/order/${orderId}/campaigns/summary`);
  return data?.data || data;
}

export async function executeCampaignDay(day: number) {
  const { data } = await api.post(`/trials/campaigns/execute/${day}`);
  return data?.data || data;
}

// New: list active trials via analytics first (has correct service types and customer data)
export async function listActiveTrials() {
  try {
    // Try analytics first (has correct service types and customer data)
    const { data } = await api.get('/trials/analytics');
    
    if (data?.success && data?.data?.recentTrials) {
      console.log('📊 Using analytics data for trials');
      console.log('📊 Analytics data structure:', data.data);
      console.log('📊 Recent trials count:', data.data.recentTrials.length);
      
      return data.data.recentTrials.map((trial: Record<string, unknown>) => {
        const customer = trial.customer as Record<string, unknown> || {};
        const serviceType = trial.serviceType as string || 'Fiber';
        
        console.log(`📊 Processing trial ${trial.id}: serviceType=${serviceType}, customer=${customer.firstName} ${customer.lastName}`);
        
        return {
          id: trial.id as string,
          customerId: 'unknown', // Analytics doesn't have customer ID
          orderId: trial.id as string,
          email: customer.email as string || 'unknown@example.com',
          status: trial.status as string || 'ACTIVE',
          daysRemaining: 28, // Default value
          engagementLevel: 'WARM', // Default value
          engagementScore: 50, // Default value
          totalDataUsageGB: 0, // Default value
          loginCount: 0, // Default value
          trialStartDate: trial.createdAt as string || new Date().toISOString(),
          trialEndDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            name: ((customer.firstName as string || '') + ' ' + (customer.lastName as string || '')).trim(),
            firstName: customer.firstName as string,
            lastName: customer.lastName as string,
            serviceType: serviceType
          }
        };
      });
    }
  } catch (error) {
    console.warn('[trials] Analytics failed, trying microservice fallback:', error);
  }
  
  // Fallback: Try microservice
  try {
    const { data } = await api.get('/trials/status/active');
    const raw = Array.isArray(data?.data?.trials) ? data.data.trials : [];
    
    if (raw.length > 0) {
      console.log('📊 Using microservice data for trials');
      return raw.map((t: Record<string, unknown>) => {
        // Enhanced service type detection
        const metadata = t.metadata as Record<string, unknown> || {};
        const orderData = metadata.orderData as Record<string, unknown> || {};
        
        let serviceType = 'Fiber'; // Default to Fiber
        
        // Check metadata.serviceType first
        if (metadata.serviceType) {
          const metaServiceType = String(metadata.serviceType).toLowerCase();
          if (metaServiceType === 'wireless') serviceType = 'Wireless';
          else if (metaServiceType === 'fiber') serviceType = 'Fiber';
        }
        // Check orderData.serviceType
        else if (orderData.serviceType) {
          const orderServiceType = String(orderData.serviceType).toLowerCase();
          if (orderServiceType === 'wireless') serviceType = 'Wireless';
          else if (orderServiceType === 'fiber') serviceType = 'Fiber';
        }
        
        console.log(`🔍 Trial ${t.id}: metadata.serviceType=${metadata.serviceType}, orderData.serviceType=${orderData.serviceType}, final=${serviceType}`);
        
        return {
          id: t.id as string,
          customerId: (t.customerId || t.customer_id) as string,
          orderId: (t.orderId || t.order_id) as string,
          email: t.email as string,
          status: t.status as string,
          daysRemaining: (t.days_remaining ?? t.daysRemaining) as number,
          engagementLevel: t.engagementLevel as string,
          engagementScore: t.engagementScore as number,
          totalDataUsageGB: t.totalDataUsageGB as number,
          loginCount: t.loginCount as number,
          trialStartDate: t.trialStartDate as string,
          trialEndDate: t.trialEndDate as string,
          metadata: {
            ...metadata,
            serviceType: serviceType
          }
        };
      });
    }
  } catch (error) {
    console.warn('[trials] Microservice failed, trying OMS fallback:', error);
  }
  
  // Fallback: Try OMS database directly
  try {
    const { data } = await api.get('/orders/trials');
    const raw = data?.data || [];
    
    if (raw.length > 0) {
      return raw.map((t: Record<string, unknown>) => ({
        id: t.id as string,
        customerId: t.customer_id as string,
        orderId: t.id as string,
        email: (t.customer as Record<string, unknown>)?.email as string || 'unknown@example.com',
        status: t.current_state as string || 'ACTIVE',
        daysRemaining: 28,
        engagementLevel: 'WARM',
        engagementScore: 50,
        totalDataUsageGB: 0,
        loginCount: 0,
        trialStartDate: t.created_at as string,
        trialEndDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          name: ((t.customer as Record<string, unknown>)?.first_name as string || '') + ' ' + ((t.customer as Record<string, unknown>)?.last_name as string || ''),
          firstName: (t.customer as Record<string, unknown>)?.first_name as string,
          lastName: (t.customer as Record<string, unknown>)?.last_name as string,
          serviceType: (t.service_details as Record<string, unknown>)?.serviceType as string || 'Fiber'
        }
      }));
    }
  } catch (error) {
    console.error('[trials] Both microservice and OMS fallback failed:', error);
    return [];
  }
  
  return [];
}

export const getTrialAnalytics = async (): Promise<TrialAnalytics | null> => {
  try {
    const { data } = await api.get('/trials/analytics');
    return data?.data || data || null;
  } catch (error) {
    console.error('Error fetching trial analytics:', error);
    return null;
  }
};

export const getCampaignSummaryByTrial = async (trialId: string): Promise<CampaignSummary | null> => {
  try {
    const { data } = await api.get(`/trials/${trialId}/campaigns/summary`);
    return data?.data || data || null;
  } catch (error) {
    console.error('Error fetching campaign summary:', error);
    return null;
  }
};


