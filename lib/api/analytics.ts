import { apiClient, unwrap } from './client.js';

export interface KPIMetrics {
  orderProcessing: {
    averageProcessingTime: number;
    processingTimeReduction: number;
    ordersProcessedToday: number;
    ordersProcessedThisMonth: number;
    processingTimeByStatus: Array<{ status: string; avgTime: number; count: number }>;
    processingTimeTrend: Array<{ date: string; avgTime: number; count: number }>;
  };
  orderAccuracy: {
    accuracyRate: number;
    totalOrders: number;
    accurateOrders: number;
    inaccurateOrders: number;
    accuracyByOrderType: Array<{ type: string; accuracy: number; count: number }>;
    accuracyTrend: Array<{ date: string; accuracy: number; count: number }>;
  };
  customerSatisfaction: {
    averageSatisfactionScore: number;
    totalSurveys: number;
    satisfactionDistribution: Array<{ score: number; count: number; percentage: number }>;
    satisfactionTrend: Array<{ date: string; score: number; count: number }>;
    satisfactionByServiceType: Array<{ serviceType: string; score: number; count: number }>;
  };
  systemUptime: {
    uptimePercentage: number;
    totalUptime: number;
    totalDowntime: number;
    availabilityTrend: Array<{ date: string; uptime: number; downtime: number }>;
    incidentCount: number;
    averageResolutionTime: number;
  };
  userAdoption: {
    totalUsers: number;
    activeUsers: number;
    adoptionRate: number;
    usersByRole: Array<{ role: string; count: number; activeCount: number }>;
    adoptionTrend: Array<{ date: string; total: number; active: number }>;
    featureUsage: Array<{ feature: string; usage: number; users: number }>;
  };
  onboardingCompletion: {
    completionRate: number;
    totalOnboardings: number;
    completedOnboardings: number;
    averageCompletionTime: number;
    completionByType: Array<{ type: string; rate: number; avgTime: number; count: number }>;
    completionTrend: Array<{ date: string; rate: number; avgTime: number; count: number }>;
    stuckOnboardings: Array<{ id: string; customerName: string; currentStep: string; daysStuck: number }>;
  };
  trialConversion: {
    conversionRate: number;
    totalTrials: number;
    convertedTrials: number;
    averageConversionTime: number;
    conversionByCampaign: Array<{ campaign: string; rate: number; count: number }>;
    conversionTrend: Array<{ date: string; rate: number; count: number }>;
    expiringTrials: Array<{ id: string; customerName: string; daysRemaining: number; engagement: number }>;
  };
  customerTimeToValue: {
    averageTimeToValue: number;
    timeToValueReduction: number;
    timeToValueByServiceType: Array<{ serviceType: string; avgTime: number; count: number }>;
    timeToValueTrend: Array<{ date: string; avgTime: number; count: number }>;
    valueAchievementRate: number;
  };
  manualApplicationProcessing: {
    averageProcessingTime: number;
    processingTimeWithin4Hours: number;
    totalApplications: number;
    processedApplications: number;
    processingTimeByFNO: Array<{ fno: string; avgTime: number; count: number }>;
    processingTrend: Array<{ date: string; avgTime: number; within4Hours: number; count: number }>;
    backlogApplications: Array<{ id: string; fno: string; orderNumber: string; hoursAging: number }>;
  };
  escalationResolution: {
    resolutionRate: number;
    totalEscalations: number;
    resolvedEscalations: number;
    averageResolutionTime: number;
    resolutionByLevel: Array<{ level: number; rate: number; avgTime: number; count: number }>;
    resolutionTrend: Array<{ date: string; rate: number; avgTime: number; count: number }>;
    overdueEscalations: Array<{ id: string; orderNumber: string; level: number; hoursOverdue: number }>;
  };
  fnoReferenceTracking: {
    trackingAccuracy: number;
    totalApplications: number;
    trackedApplications: number;
    accuracyByFNO: Array<{ fno: string; accuracy: number; count: number }>;
    accuracyTrend: Array<{ date: string; accuracy: number; count: number }>;
    missingReferences: Array<{ id: string; fno: string; orderNumber: string; daysMissing: number }>;
  };
}

export interface AdvancedAnalytics {
  performance: {
    orderVolumeAnalysis: {
      peakHours: Array<{ hour: number; volume: number }>;
      peakDays: Array<{ day: string; volume: number }>;
      seasonalTrends: Array<{ month: string; volume: number; growth: number }>;
    };
    resourceUtilization: {
      userProductivity: Array<{ user: string; ordersProcessed: number; avgTime: number }>;
      systemLoad: Array<{ timestamp: string; cpu: number; memory: number; responseTime: number }>;
      databasePerformance: Array<{ query: string; avgTime: number; count: number }>;
    };
    qualityMetrics: {
      errorRates: Array<{ component: string; errorRate: number; count: number }>;
      slaCompliance: Array<{ sla: string; compliance: number; breaches: number }>;
      dataQuality: Array<{ metric: string; quality: number; issues: number }>;
    };
  };
  trends: {
    orderTrends: {
      volumeTrend: Array<{ date: string; volume: number; growth: number }>;
      statusDistribution: Array<{ status: string; count: number; percentage: number }>;
      serviceTypeTrends: Array<{ serviceType: string; trend: 'up' | 'down' | 'stable'; growth: number }>;
    };
    customerTrends: {
      acquisitionTrend: Array<{ date: string; newCustomers: number; growth: number }>;
      retentionTrend: Array<{ date: string; retentionRate: number; churnRate: number }>;
      satisfactionTrend: Array<{ date: string; satisfaction: number; trend: 'up' | 'down' | 'stable' }>;
    };
    operationalTrends: {
      efficiencyTrend: Array<{ date: string; efficiency: number; improvement: number }>;
      costTrend: Array<{ date: string; cost: number; change: number }>;
      qualityTrend: Array<{ date: string; quality: number; improvement: number }>;
    };
  };
  forecasting: {
    orderVolumeForecast: Array<{ date: string; forecast: number; confidence: number; actual?: number }>;
    resourceDemandForecast: Array<{ date: string; demand: number; capacity: number; utilization: number }>;
    revenueForecast: Array<{ date: string; forecast: number; confidence: number; actual?: number }>;
    capacityPlanning: {
      currentCapacity: number;
      projectedDemand: number;
      recommendedCapacity: number;
      timeline: string;
    };
  };
  insights: {
    topInsights: Array<{
      id: string;
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      category: string;
      confidence: number;
      actionable: boolean;
      recommendations: string[];
    }>;
    anomalies: Array<{
      id: string;
      type: string;
      description: string;
      severity: 'critical' | 'warning' | 'info';
      detectedAt: string;
      impact: string;
      recommendedAction: string;
    }>;
    opportunities: Array<{
      id: string;
      title: string;
      description: string;
      potentialImpact: string;
      effort: 'low' | 'medium' | 'high';
      priority: number;
      timeline: string;
    }>;
  };
}

export interface ReportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  orderTypes?: string[];
  serviceTypes?: string[];
  fnos?: string[];
  users?: string[];
  statuses?: string[];
  priorities?: string[];
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AvailableReport {
  id: string;
  name: string;
  description: string;
  category: string;
  format: string[];
  lastGenerated: string;
  nextScheduled: string;
}

export interface ExportResult {
  url: string;
  filename: string;
  expiresAt: string;
}

export interface ReportStatus {
  reportId: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  expiresAt?: string;
}

// API Functions
export async function getKPIMetrics(filters?: ReportFilters): Promise<KPIMetrics> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.orderTypes) {
    filters.orderTypes.forEach(type => params.append('orderTypes', type));
  }
  
  if (filters?.serviceTypes) {
    filters.serviceTypes.forEach(type => params.append('serviceTypes', type));
  }
  
  if (filters?.fnos) {
    filters.fnos.forEach(fno => params.append('fnos', fno));
  }
  
  if (filters?.users) {
    filters.users.forEach(user => params.append('users', user));
  }
  
  if (filters?.statuses) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }
  
  if (filters?.priorities) {
    filters.priorities.forEach(priority => params.append('priorities', priority));
  }
  
  if (filters?.granularity) {
    params.append('granularity', filters.granularity);
  }

  try {
    const response = await apiClient.get(`/analytics/kpi?${params.toString()}`);
    return unwrap(response.data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Fallback to overall endpoint shape if compatibility routes are unavailable
      const overallResp = await apiClient.get(`/analytics/overall?${params.toString()}`);
      const overall = unwrap<any>(overallResp.data);
      // Minimal mapping from overall -> KPI structure where possible
      const kpi: KPIMetrics = {
        orderProcessing: {
          averageProcessingTime: overall?.kpis?.avgProcessingTime ?? 0,
          processingTimeReduction: 0,
          ordersProcessedToday: overall?.kpis?.ordersToday ?? 0,
          ordersProcessedThisMonth: 0,
          processingTimeByStatus: [],
          processingTimeTrend: [],
        },
        orderAccuracy: {
          accuracyRate: overall?.kpis?.orderCompletionRate ?? 0,
          totalOrders: overall?.kpis?.totalOrders ?? 0,
          accurateOrders: overall?.kpis?.completedOrders ?? 0,
          inaccurateOrders: (overall?.kpis?.totalOrders ?? 0) - (overall?.kpis?.completedOrders ?? 0),
          accuracyByOrderType: [],
          accuracyTrend: [],
        },
        customerSatisfaction: {
          averageSatisfactionScore: 0,
          totalSurveys: 0,
          satisfactionDistribution: [],
          satisfactionTrend: [],
          satisfactionByServiceType: [],
        },
        systemUptime: {
          uptimePercentage: 0,
          totalUptime: 0,
          totalDowntime: 0,
          availabilityTrend: [],
          incidentCount: 0,
          averageResolutionTime: overall?.kpis?.avgEscalationResolutionTime ?? 0,
        },
        userAdoption: {
          totalUsers: 0,
          activeUsers: 0,
          adoptionRate: 0,
          usersByRole: [],
          adoptionTrend: [],
          featureUsage: [],
        },
        onboardingCompletion: {
          completionRate: 0,
          totalOnboardings: 0,
          completedOnboardings: 0,
          averageCompletionTime: 0,
          completionByType: [],
          completionTrend: [],
          stuckOnboardings: [],
        },
        trialConversion: {
          conversionRate: 0,
          totalTrials: 0,
          convertedTrials: 0,
          averageConversionTime: 0,
          conversionByCampaign: [],
          conversionTrend: [],
          expiringTrials: [],
        },
        customerTimeToValue: {
          averageTimeToValue: 0,
          timeToValueReduction: 0,
          timeToValueByServiceType: [],
          timeToValueTrend: [],
          valueAchievementRate: 0,
        },
        manualApplicationProcessing: {
          averageProcessingTime: overall?.kpis?.avgProcessingTime ?? 0,
          processingTimeWithin4Hours: 0,
          totalApplications: overall?.kpis?.totalOrders ?? 0,
          processedApplications: overall?.kpis?.completedOrders ?? 0,
          processingTimeByFNO: [],
          processingTrend: [],
          backlogApplications: [],
        },
        escalationResolution: {
          resolutionRate: 0,
          totalEscalations: overall?.kpis?.escalations ?? 0,
          resolvedEscalations: (overall?.kpis?.escalations ?? 0) - (overall?.kpis?.openEscalations ?? 0),
          averageResolutionTime: overall?.kpis?.avgEscalationResolutionTime ?? 0,
          resolutionByLevel: [],
          resolutionTrend: [],
          overdueEscalations: [],
        },
        fnoReferenceTracking: {
          trackingAccuracy: 0,
          totalApplications: overall?.kpis?.totalOrders ?? 0,
          trackedApplications: overall?.kpis?.completedOrders ?? 0,
          accuracyByFNO: [],
          accuracyTrend: [],
          missingReferences: [],
        },
      };
      return kpi;
    }
    throw err;
  }
}

export async function getAdvancedAnalytics(filters?: ReportFilters): Promise<AdvancedAnalytics> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.orderTypes) {
    filters.orderTypes.forEach(type => params.append('orderTypes', type));
  }
  
  if (filters?.serviceTypes) {
    filters.serviceTypes.forEach(type => params.append('serviceTypes', type));
  }
  
  if (filters?.fnos) {
    filters.fnos.forEach(fno => params.append('fnos', fno));
  }
  
  if (filters?.users) {
    filters.users.forEach(user => params.append('users', user));
  }
  
  if (filters?.statuses) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }
  
  if (filters?.priorities) {
    filters.priorities.forEach(priority => params.append('priorities', priority));
  }
  
  if (filters?.granularity) {
    params.append('granularity', filters.granularity);
  }

  try {
    const response = await apiClient.get(`/analytics/advanced?${params.toString()}`);
    return unwrap(response.data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Compose from available endpoints as fallback
      const [trendsResp, fnoResp] = await Promise.all([
        apiClient.get(`/analytics/order-trends?${params.toString()}`),
        apiClient.get(`/analytics/fno-performance?${params.toString()}`),
      ]);
      const orderTrends = unwrap<any[]>(trendsResp.data);
      const fnoPerformance = unwrap<any[]>(fnoResp.data);
      const advanced: AdvancedAnalytics = {
        performance: {
          orderVolumeAnalysis: { peakHours: [], peakDays: [], seasonalTrends: [] },
          resourceUtilization: { userProductivity: [], systemLoad: [], databasePerformance: [] },
          qualityMetrics: { errorRates: [], slaCompliance: [], dataQuality: [] },
        },
        trends: {
          orderTrends: {
            volumeTrend: orderTrends.map(t => ({ date: t.date, volume: t.totalOrders, growth: 0 })),
            statusDistribution: [
              { status: 'completed', count: orderTrends.reduce((a, b) => a + (b.completedOrders || 0), 0), percentage: 0 },
              { status: 'cancelled', count: orderTrends.reduce((a, b) => a + (b.cancelledOrders || 0), 0), percentage: 0 },
            ],
            serviceTypeTrends: [],
          },
          customerTrends: {
            acquisitionTrend: [],
            retentionTrend: [],
            satisfactionTrend: [],
          },
          operationalTrends: {
            efficiencyTrend: [],
            costTrend: [],
            qualityTrend: [],
          },
        },
        forecasting: {
          orderVolumeForecast: [],
          resourceDemandForecast: [],
          revenueForecast: [],
          capacityPlanning: { currentCapacity: 0, projectedDemand: 0, recommendedCapacity: 0, timeline: 'N/A' },
        },
        insights: { topInsights: [], anomalies: [], opportunities: [] },
      };
      return advanced;
    }
    throw err;
  }
}

export async function getPerformanceAnalytics(filters?: ReportFilters): Promise<AdvancedAnalytics['performance']> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.orderTypes) {
    filters.orderTypes.forEach(type => params.append('orderTypes', type));
  }
  
  if (filters?.serviceTypes) {
    filters.serviceTypes.forEach(type => params.append('serviceTypes', type));
  }
  
  if (filters?.fnos) {
    filters.fnos.forEach(fno => params.append('fnos', fno));
  }
  
  if (filters?.users) {
    filters.users.forEach(user => params.append('users', user));
  }
  
  if (filters?.statuses) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }
  
  if (filters?.priorities) {
    filters.priorities.forEach(priority => params.append('priorities', priority));
  }
  
  if (filters?.granularity) {
    params.append('granularity', filters.granularity);
  }

  const response = await apiClient.get(`/analytics/performance?${params.toString()}`);
  return unwrap(response.data);
}

export async function getTrendAnalytics(filters?: ReportFilters): Promise<AdvancedAnalytics['trends']> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.orderTypes) {
    filters.orderTypes.forEach(type => params.append('orderTypes', type));
  }
  
  if (filters?.serviceTypes) {
    filters.serviceTypes.forEach(type => params.append('serviceTypes', type));
  }
  
  if (filters?.fnos) {
    filters.fnos.forEach(fno => params.append('fnos', fno));
  }
  
  if (filters?.users) {
    filters.users.forEach(user => params.append('users', user));
  }
  
  if (filters?.statuses) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }
  
  if (filters?.priorities) {
    filters.priorities.forEach(priority => params.append('priorities', priority));
  }
  
  if (filters?.granularity) {
    params.append('granularity', filters.granularity);
  }

  const response = await apiClient.get(`/analytics/trends?${params.toString()}`);
  return unwrap(response.data);
}

export async function getForecastingAnalytics(filters?: ReportFilters): Promise<AdvancedAnalytics['forecasting']> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.orderTypes) {
    filters.orderTypes.forEach(type => params.append('orderTypes', type));
  }
  
  if (filters?.serviceTypes) {
    filters.serviceTypes.forEach(type => params.append('serviceTypes', type));
  }
  
  if (filters?.fnos) {
    filters.fnos.forEach(fno => params.append('fnos', fno));
  }
  
  if (filters?.users) {
    filters.users.forEach(user => params.append('users', user));
  }
  
  if (filters?.statuses) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }
  
  if (filters?.priorities) {
    filters.priorities.forEach(priority => params.append('priorities', priority));
  }
  
  if (filters?.granularity) {
    params.append('granularity', filters.granularity);
  }

  const response = await apiClient.get(`/analytics/forecasting?${params.toString()}`);
  return unwrap(response.data);
}

export async function getInsightsAnalytics(filters?: ReportFilters): Promise<AdvancedAnalytics['insights']> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.orderTypes) {
    filters.orderTypes.forEach(type => params.append('orderTypes', type));
  }
  
  if (filters?.serviceTypes) {
    filters.serviceTypes.forEach(type => params.append('serviceTypes', type));
  }
  
  if (filters?.fnos) {
    filters.fnos.forEach(fno => params.append('fnos', fno));
  }
  
  if (filters?.users) {
    filters.users.forEach(user => params.append('users', user));
  }
  
  if (filters?.statuses) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }
  
  if (filters?.priorities) {
    filters.priorities.forEach(priority => params.append('priorities', priority));
  }
  
  if (filters?.granularity) {
    params.append('granularity', filters.granularity);
  }

  const response = await apiClient.get(`/analytics/insights?${params.toString()}`);
  return unwrap(response.data);
}

export async function getAvailableReports(): Promise<AvailableReport[]> {
  const response = await apiClient.get('/analytics/reports');
  return unwrap(response.data);
}

export async function exportReport(
  reportType: string,
  filters?: ReportFilters,
  options?: {
    format?: 'csv' | 'pdf' | 'excel' | 'json';
    includeCharts?: boolean;
    includeRawData?: boolean;
    customFields?: string[];
  }
): Promise<ExportResult> {
  const params = new URLSearchParams();
  
  if (options?.format) {
    params.append('format', options.format);
  }
  
  if (options?.includeCharts) {
    params.append('includeCharts', 'true');
  }
  
  if (options?.includeRawData) {
    params.append('includeRawData', 'true');
  }
  
  if (options?.customFields) {
    params.append('customFields', options.customFields.join(','));
  }
  
  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.orderTypes) {
    filters.orderTypes.forEach(type => params.append('orderTypes', type));
  }
  
  if (filters?.serviceTypes) {
    filters.serviceTypes.forEach(type => params.append('serviceTypes', type));
  }
  
  if (filters?.fnos) {
    filters.fnos.forEach(fno => params.append('fnos', fno));
  }
  
  if (filters?.users) {
    filters.users.forEach(user => params.append('users', user));
  }
  
  if (filters?.statuses) {
    filters.statuses.forEach(status => params.append('statuses', status));
  }
  
  if (filters?.priorities) {
    filters.priorities.forEach(priority => params.append('priorities', priority));
  }
  
  if (filters?.granularity) {
    params.append('granularity', filters.granularity);
  }

  const response = await apiClient.post(`/analytics/reports/${reportType}/export?${params.toString()}`);
  return unwrap(response.data);
}

export async function getReportStatus(reportId: string): Promise<ReportStatus> {
  const response = await apiClient.get(`/analytics/reports/${reportId}/status`);
  return unwrap(response.data);
}

export async function downloadReport(filename: string): Promise<{ url: string; filename: string; size: string; format: string }> {
  const response = await apiClient.get(`/analytics/reports/download/${filename}`);
  return unwrap(response.data);
}
