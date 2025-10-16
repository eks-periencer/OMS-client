import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/components/ui/card';
import { Button } from '../../../components/components/ui/button';
import { Badge } from '../../../components/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/components/ui/select';
import { 
  Calendar,
  Wifi,
  WifiOff,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { listActiveTrials, getTrialAnalytics } from '../../../../lib/api/trials';
import TrialConversionButton from '../../../components/components/trials/TrialConversionButton';  
import { Sidebar } from '../../../components/components/layout/sidebar';
import { PageLoading } from '../../../components/components/ui/loading-overlay';

interface TrialCustomer {
  id: string;
  email: string;
  status: string;
  daysRemaining: number;
  engagementLevel: string;
  engagementScore: number;
  totalDataUsageGB: number;
  loginCount: number;
  trialStartDate: string;
  trialEndDate: string;
  serviceType?: 'Fiber' | 'Wireless';
  currentState?: string;
  metadata?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    serviceType?: string;
  };
}



interface TrialAnalytics {
  totalTrials: number;
  activeTrials: number;
  convertedTrials: number;
  expiredTrials: number;
  conversionRate: string;
  serviceBreakdown?: {
    fiber: {
      total: number;
      active: number;
      converted: number;
      conversionRate: string;
    };
    wireless: {
      total: number;
      active: number;
      converted: number;
      conversionRate: string;
    };
  };
  recentTrials?: Array<{
    id: string;
    status: string;
    currentState: string;
    serviceType: string;
    createdAt: string;
    updatedAt: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export default function TrialAnalyticsPage() {
  const [trials, setTrials] = useState<TrialCustomer[]>([]);
  const [analytics, setAnalytics] = useState<TrialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'Fiber' | 'Wireless'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'converted' | 'expired'>('all');
  const [engagementFilter, setEngagementFilter] = useState<'all' | 'HOT' | 'WARM' | 'COLD'>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading trial data...');
      
      // Load both analytics and trials data
      const [analyticsData, trialsData] = await Promise.all([
        getTrialAnalytics(),
        listActiveTrials()
      ]);
      
      console.log('📊 Analytics data:', analyticsData);
      console.log('📊 Trials data:', trialsData);
      
      // Set analytics data
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
      
      // Process trials data to include service type detection
      const processedTrials = (trialsData || []).map((trial: Record<string, unknown>) => {
        // Get service type from multiple possible locations
        const metadata = trial.metadata as Record<string, unknown> || {};
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
        // Check trial.serviceType (if it exists)
        else if (trial.serviceType) {
          const trialServiceType = String(trial.serviceType).toLowerCase();
          if (trialServiceType === 'wireless') serviceType = 'Wireless';
          else if (trialServiceType === 'fiber') serviceType = 'Fiber';
        }
        
        console.log(`🔍 Trial ${trial.id}: metadata.serviceType=${metadata.serviceType}, orderData.serviceType=${orderData.serviceType}, final=${serviceType}`);
        
        return {
          ...trial,
          serviceType,
          currentState: trial.currentState || trial.status
        };
      });
      
      setTrials(processedTrials);
    } catch (error) {
      console.error('❌ Failed to load trial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter trials based on selected filters
  const filteredTrials = trials.filter(trial => {
    const serviceMatch = serviceFilter === 'all' || trial.serviceType === serviceFilter;
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && ['ACTIVE', 'trial_active', 'trial_engaged'].includes(trial.status)) ||
      (statusFilter === 'converted' && trial.status === 'CONVERTED') ||
      (statusFilter === 'expired' && trial.status === 'EXPIRED');
    const engagementMatch = engagementFilter === 'all' || trial.engagementLevel === engagementFilter;
    
    return serviceMatch && statusMatch && engagementMatch;
  });

  // Calculate service-specific metrics
  const fiberTrials = trials.filter(t => t.serviceType === 'Fiber');
  const wirelessTrials = trials.filter(t => t.serviceType === 'Wireless');
  
  const calculateServiceMetrics = (serviceTrials: TrialCustomer[]) => {
    const total = serviceTrials.length;
    const active = serviceTrials.filter(t => ['ACTIVE', 'trial_active', 'trial_engaged'].includes(t.status)).length;
    const converted = serviceTrials.filter(t => t.status === 'CONVERTED').length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) + '%' : '0%';
    const avgEngagement = total > 0 ? serviceTrials.reduce((sum, t) => sum + (t.engagementScore || 0), 0) / total : 0;
    const avgDataUsage = total > 0 ? serviceTrials.reduce((sum, t) => sum + (t.totalDataUsageGB || 0), 0) / total : 0;
    
    return { total, active, converted, conversionRate, avgEngagement, avgDataUsage };
  };


  useEffect(() => {
    loadData();
  }, []);


  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'HOT': return 'bg-green-500';
      case 'WARM': return 'bg-yellow-500';
      case 'COLD': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-500';
      case 'CONVERTED': return 'bg-green-500';
      case 'EXPIRED': return 'bg-red-500';
      case 'CANCELLED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyLevel = (daysRemaining: number) => {
    if (daysRemaining <= 3) return { level: 'HIGH', color: 'text-red-600' };
    if (daysRemaining <= 7) return { level: 'MEDIUM', color: 'text-yellow-600' };
    return { level: 'LOW', color: 'text-green-600' };
  };

  if (loading) {
      return (
        <PageLoading isLoading={loading} />
      );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
              <div>
              <h1 className="text-2xl font-bold text-gray-900">Trial Analytics</h1>
              <p className="text-gray-600">Monitor and manage trial customers</p>
            </div>
            <Button onClick={loadData} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trials</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalTrials || trials.length}</p>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
          </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fiber Trials</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics?.serviceBreakdown?.fiber?.total || calculateServiceMetrics(fiberTrials).total}</p>
                  <p className="text-xs text-gray-500">{analytics?.serviceBreakdown?.fiber?.conversionRate || calculateServiceMetrics(fiberTrials).conversionRate} converted</p>
                </div>
                <Wifi className="h-8 w-8 text-blue-500" />
              </div>
          </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wireless Trials</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics?.serviceBreakdown?.wireless?.total || calculateServiceMetrics(wirelessTrials).total}</p>
                  <p className="text-xs text-gray-500">{analytics?.serviceBreakdown?.wireless?.conversionRate || calculateServiceMetrics(wirelessTrials).conversionRate} converted</p>
                </div>
                <WifiOff className="h-8 w-8 text-purple-500" />
              </div>
          </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Better Performer</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(() => {
                      const fiberRate = analytics?.serviceBreakdown?.fiber?.conversionRate || calculateServiceMetrics(fiberTrials).conversionRate;
                      const wirelessRate = analytics?.serviceBreakdown?.wireless?.conversionRate || calculateServiceMetrics(wirelessTrials).conversionRate;
                      return parseFloat(fiberRate) > parseFloat(wirelessRate) ? 'Fiber' : 'Wireless';
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(() => {
                      const fiberRate = analytics?.serviceBreakdown?.fiber?.conversionRate || calculateServiceMetrics(fiberTrials).conversionRate;
                      const wirelessRate = analytics?.serviceBreakdown?.wireless?.conversionRate || calculateServiceMetrics(wirelessTrials).conversionRate;
                      return Math.max(parseFloat(fiberRate), parseFloat(wirelessRate)).toFixed(1) + '% rate';
                    })()}
                  </p>
                </div>
                {(() => {
                  const fiberRate = analytics?.serviceBreakdown?.fiber?.conversionRate || calculateServiceMetrics(fiberTrials).conversionRate;
                  const wirelessRate = analytics?.serviceBreakdown?.wireless?.conversionRate || calculateServiceMetrics(wirelessTrials).conversionRate;
                  return parseFloat(fiberRate) > parseFloat(wirelessRate) ? (
                    <ArrowUpRight className="h-8 w-8 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-8 w-8 text-green-500" />
                  );
                })()}
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <Select value={serviceFilter} onValueChange={(value: 'all' | 'Fiber' | 'Wireless') => setServiceFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Fiber">Fiber Only</SelectItem>
                    <SelectItem value="Wireless">Wireless Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'converted' | 'expired') => setStatusFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={engagementFilter} onValueChange={(value: 'all' | 'HOT' | 'WARM' | 'COLD') => setEngagementFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Engagement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Engagement</SelectItem>
                    <SelectItem value="HOT">Hot</SelectItem>
                    <SelectItem value="WARM">Warm</SelectItem>
                    <SelectItem value="COLD">Cold</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="ml-auto text-sm text-gray-600">
                  Showing {filteredTrials.length} of {trials.length} trials
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Main Content */}
          <Tabs defaultValue="trials" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trials">Trial Orders</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

            {/* Trial Orders Tab */}
        <TabsContent value="trials" className="space-y-4">
          <Card>
            <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Trial Orders</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        {filteredTrials.filter(t => t.serviceType === 'Fiber').length} Fiber
                      </Badge>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700">
                        {filteredTrials.filter(t => t.serviceType === 'Wireless').length} Wireless
                      </Badge>
                    </div>
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  {filteredTrials.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-lg">No trials found matching your filters</p>
                      <p className="text-sm">Try adjusting your filter criteria</p>
                  </div>
                ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Service</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Engagement</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Days Left</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Usage</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTrials.map((trial) => {
                    const urgency = getUrgencyLevel(trial.daysRemaining);
                    const customerName = trial.metadata?.name || 
                      `${trial.metadata?.firstName || ''} ${trial.metadata?.lastName || ''}`.trim() || 
                      'Unknown Customer';

                    return (
                              <tr 
                        key={trial.id}
                                className={`border-b hover:bg-gray-50 cursor-pointer ${
                                  selectedTrial === trial.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedTrial(trial.id)}
                      >
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="font-medium text-gray-900">{customerName}</div>
                                    <div className="text-sm text-gray-500">{trial.email}</div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge 
                                    className={trial.serviceType === 'Fiber' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
                                  >
                                    {trial.serviceType === 'Fiber' ? (
                                      <><Wifi className="h-3 w-3 mr-1" /> Fiber</>
                                    ) : (
                                      <><WifiOff className="h-3 w-3 mr-1" /> Wireless</>
                                    )}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                              <Badge className={getStatusColor(trial.status)}>
                                {trial.status}
                              </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                              <Badge className={getEngagementColor(trial.engagementLevel)}>
                                {trial.engagementLevel}
                              </Badge>
                                    <span className="text-sm text-gray-500">{trial.engagementScore}/100</span>
                            </div>
                                </td>
                                <td className="py-3 px-4">
                              <span className={urgency.color}>
                                    {trial.daysRemaining} days
                              </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm">
                                    <div>{trial.totalDataUsageGB}GB</div>
                                    <div className="text-gray-500">{trial.loginCount} logins</div>
                            </div>
                                </td>
                                <td className="py-3 px-4">
                            <TrialConversionButton
                              trialId={trial.id}
                              trialData={{
                                customerName: customerName,
                                customerEmail: trial.email,
                                daysRemaining: trial.daysRemaining,
                                engagementLevel: trial.engagementLevel
                              }}
                                    onConversionSuccess={() => loadData()}
                              variant="outline"
                              size="sm"
                            />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Management Tab */}
            <TabsContent value="campaigns" className="space-y-6">
              {/* Campaign Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">{trials.length * 5}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                      </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sent Today</p>
                      <p className="text-2xl font-bold text-green-600">{Math.floor(trials.length * 0.3)}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                      </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{Math.floor(trials.length * 0.05)}</p>
                    </div>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                  <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{Math.floor(trials.length * 0.15)}</p>
                        </div>
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">⏳</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Campaign Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Schedule</CardTitle>
                  <p className="text-sm text-gray-600">Upcoming and available campaigns by day</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 3, 7, 14, 21, 28].map((day) => (
                      <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">D{day}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Day {day} Campaign</h4>
                            <p className="text-sm text-gray-600">
                              {day === 1 && 'Welcome & Setup Guide'}
                              {day === 3 && 'Feature Introduction'}
                              {day === 7 && 'Usage Tips & Best Practices'}
                              {day === 14 && 'Mid-trial Check-in'}
                              {day === 21 && 'Conversion Reminder'}
                              {day === 28 && 'Final Conversion Push'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-100 text-green-700">
                            {Math.floor(trials.length * (0.8 - (day * 0.1)))} eligible
                          </Badge>
                          <Button size="sm" variant="outline">
                            Send Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Failed Campaigns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Failed Campaigns</span>
                    <Badge variant="destructive" className="ml-2">
                      {Math.floor(trials.length * 0.05)} Failed
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Campaigns that failed to send - requires manual intervention</p>
                </CardHeader>
                <CardContent>
                  {Math.floor(trials.length * 0.05) > 0 ? (
                    <div className="space-y-3">
                      {Array.from({ length: Math.floor(trials.length * 0.05) }, (_, i) => {
                        const trial = trials[i % trials.length];
                        const customerName = trial.metadata?.name || 
                          `${trial.metadata?.firstName || ''} ${trial.metadata?.lastName || ''}`.trim() || 
                          'Unknown Customer';
                        
                        return (
                          <div key={i} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 text-sm">✗</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{customerName}</div>
                                <div className="text-sm text-gray-600">{trial.email}</div>
                                <div className="text-xs text-red-600">Day 7 Campaign - Email delivery failed</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                Retry
                              </Button>
                              <Button size="sm" variant="destructive">
                                Skip
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">✅</div>
                      <p className="text-lg">No failed campaigns</p>
                      <p className="text-sm">All campaigns are sending successfully</p>
                </div>
              )}
            </CardContent>
          </Card>

              {/* Manual Campaign Sending */}
              <Card>
                <CardHeader>
                  <CardTitle>Manual Campaign Sending</CardTitle>
                  <p className="text-sm text-gray-600">Send specific campaigns to selected trial customers</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Select Campaign</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose campaign type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="welcome">Welcome Email (Day 1)</SelectItem>
                            <SelectItem value="features">Feature Introduction (Day 3)</SelectItem>
                            <SelectItem value="tips">Usage Tips (Day 7)</SelectItem>
                            <SelectItem value="checkin">Mid-trial Check-in (Day 14)</SelectItem>
                            <SelectItem value="reminder">Conversion Reminder (Day 21)</SelectItem>
                            <SelectItem value="final">Final Push (Day 28)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Target Audience</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Active Trials</SelectItem>
                            <SelectItem value="fiber">Fiber Trials Only</SelectItem>
                            <SelectItem value="wireless">Wireless Trials Only</SelectItem>
                            <SelectItem value="hot">Hot Engagement Only</SelectItem>
                            <SelectItem value="cold">Cold Engagement Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Send Campaign
                      </Button>
                      <Button variant="outline">
                        Preview Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Service Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wifi className="h-5 w-5 text-blue-600" />
                      <span>Fiber Performance</span>
                    </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{calculateServiceMetrics(fiberTrials).conversionRate}</div>
                        <div className="text-sm text-gray-600">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{calculateServiceMetrics(fiberTrials).avgEngagement.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Avg Engagement</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Hot Customers</span>
                        <span>{fiberTrials.filter(t => t.engagementLevel === 'HOT').length}</span>
                      </div>
                        <div className="flex justify-between text-sm">
                        <span>Warm Customers</span>
                        <span>{fiberTrials.filter(t => t.engagementLevel === 'WARM').length}</span>
                        </div>
                      <div className="flex justify-between text-sm">
                        <span>Cold Customers</span>
                        <span>{fiberTrials.filter(t => t.engagementLevel === 'COLD').length}</span>
                      </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <WifiOff className="h-5 w-5 text-purple-600" />
                      <span>Wireless Performance</span>
                    </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{calculateServiceMetrics(wirelessTrials).conversionRate}</div>
                        <div className="text-sm text-gray-600">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{calculateServiceMetrics(wirelessTrials).avgEngagement.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Avg Engagement</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Hot Customers</span>
                        <span>{wirelessTrials.filter(t => t.engagementLevel === 'HOT').length}</span>
                      </div>
                        <div className="flex justify-between text-sm">
                        <span>Warm Customers</span>
                        <span>{wirelessTrials.filter(t => t.engagementLevel === 'WARM').length}</span>
                        </div>
                      <div className="flex justify-between text-sm">
                        <span>Cold Customers</span>
                        <span>{wirelessTrials.filter(t => t.engagementLevel === 'COLD').length}</span>
                      </div>
                </div>
              </CardContent>
            </Card>
          </div>

              {/* Usage Summary */}
          <Card>
            <CardHeader>
                  <CardTitle>Usage Summary</CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {trials.reduce((sum, t) => sum + (t.totalDataUsageGB || 0), 0).toFixed(1)}GB
                  </div>
                  <div className="text-sm text-gray-600">Total Data Used</div>
                </div>
                <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {trials.reduce((sum, t) => sum + (t.loginCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Logins</div>
                </div>
                <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {trials.length > 0 ? (trials.reduce((sum, t) => sum + (t.engagementScore || 0), 0) / trials.length).toFixed(1) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Avg Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {trials.filter(t => ['ACTIVE', 'trial_active', 'trial_engaged'].includes(t.status)).length}
                      </div>
                      <div className="text-sm text-gray-600">Active Trials</div>
                    </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}
