"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CalendarIcon, Download, Filter, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Users, Package, Target, Zap, BarChart3, PieChart, LineChart, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../../../lib/utils'
import { 
  getKPIMetrics, 
  getAdvancedAnalytics, 
  getPerformanceAnalytics, 
  getTrendAnalytics, 
  getForecastingAnalytics, 
  getInsightsAnalytics,
  getAvailableReports,
  exportReport,
  type KPIMetrics,
  type AdvancedAnalytics,
  type ReportFilters
} from '../../../../lib/api/analytics'
import { RealtimeMetricsDashboard } from './RealtimeMetricsDashboard'

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('realtime')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kpiData, setKpiData] = useState<KPIMetrics | null>(null)
  const [advancedData, setAdvancedData] = useState<AdvancedAnalytics | null>(null)
  const [filters, setFilters] = useState<ReportFilters>({
    granularity: 'day'
  })
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const currentFilters: ReportFilters = {
        ...filters,
        dateRange: dateRange.from && dateRange.to ? {
          start: dateRange.from.toISOString(),
          end: dateRange.to.toISOString()
        } : undefined
      }

      const [kpi, advanced] = await Promise.all([
        getKPIMetrics(currentFilters),
        getAdvancedAnalytics(currentFilters)
      ])

      setKpiData(kpi)
      setAdvancedData(advanced)
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data')
      console.error('Error loading analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters, dateRange])

  const handleExport = async (reportType: string, format: 'csv' | 'pdf' | 'excel') => {
    try {
      const currentFilters: ReportFilters = {
        ...filters,
        dateRange: dateRange.from && dateRange.to ? {
          start: dateRange.from.toISOString(),
          end: dateRange.to.toISOString()
        } : undefined
      }

      const result = await exportReport(reportType, currentFilters, { format })
      
      if (result.url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = result.url
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err: any) {
      console.error('Export failed:', err)
    }
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return '0.0%'
    return num.toFixed(1) + '%'
  }

  const formatTime = (hours: number | undefined | null) => {
    if (hours === undefined || hours === null || isNaN(hours)) return '0.0h'
    if (hours < 24) return `${hours.toFixed(1)}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours.toFixed(1)}h` : `${days}d`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-gray-600" />
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
    }
  }

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'info': return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and KPI monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Granularity</Label>
              <Select value={filters.granularity} onValueChange={(value: any) => setFilters(prev => ({ ...prev, granularity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Hour</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order Types</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new_install">New Install</SelectItem>
                  <SelectItem value="service_change">Service Change</SelectItem>
                  <SelectItem value="disconnect">Disconnect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Service Types</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                  <SelectItem value="fixed">Fixed Line</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="kpi">KPI Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Real-Time Metrics */}
        <TabsContent value="realtime" className="space-y-4">
          <RealtimeMetricsDashboard />
        </TabsContent>

        {/* KPI Overview */}
        <TabsContent value="kpi" className="space-y-4">
          {kpiData && (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Order Processing Time</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatTime(kpiData.orderProcessing.averageProcessingTime)}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getTrendIcon(kpiData.orderProcessing.processingTimeReduction)}
                      <span>{formatPercentage(kpiData.orderProcessing.processingTimeReduction)} reduction</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Order Accuracy</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(kpiData.orderAccuracy.accuracyRate)}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{formatNumber(kpiData.orderAccuracy.accurateOrders)} of {formatNumber(kpiData.orderAccuracy.totalOrders)} orders</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpiData.customerSatisfaction.averageSatisfactionScore.toFixed(1)}/5</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{formatNumber(kpiData.customerSatisfaction.totalSurveys)} surveys</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(kpiData.systemUptime.uptimePercentage)}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>{kpiData.systemUptime.incidentCount} incidents</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Onboarding & Trial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Onboarding Completion</CardTitle>
                    <CardDescription>Customer onboarding success metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Completion Rate</span>
                        <Badge variant="outline">{formatPercentage(kpiData.onboardingCompletion.completionRate)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg Completion Time</span>
                        <span className="text-sm text-muted-foreground">{kpiData.onboardingCompletion.averageCompletionTime.toFixed(1)} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Onboardings</span>
                        <span className="text-sm text-muted-foreground">{kpiData.onboardingCompletion.totalOnboardings - kpiData.onboardingCompletion.completedOnboardings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trial Conversion</CardTitle>
                    <CardDescription>Trial customer conversion metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Conversion Rate</span>
                        <Badge variant="outline">{formatPercentage(kpiData.trialConversion.conversionRate)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg Conversion Time</span>
                        <span className="text-sm text-muted-foreground">{kpiData.trialConversion.averageConversionTime.toFixed(1)} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Expiring Trials</span>
                        <span className="text-sm text-muted-foreground">{kpiData.trialConversion.expiringTrials.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Operational Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Manual Application Processing</CardTitle>
                    <CardDescription>FNO manual application metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg Processing Time</span>
                        <span className="text-sm text-muted-foreground">{formatTime(kpiData.manualApplicationProcessing.averageProcessingTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Within 4 Hours</span>
                        <Badge variant="outline">{formatPercentage(kpiData.manualApplicationProcessing.processingTimeWithin4Hours)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Backlog</span>
                        <span className="text-sm text-muted-foreground">{kpiData.manualApplicationProcessing.backlogApplications.length} applications</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Escalation Resolution</CardTitle>
                    <CardDescription>Escalation management metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Resolution Rate</span>
                        <Badge variant="outline">{formatPercentage(kpiData.escalationResolution.resolutionRate)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg Resolution Time</span>
                        <span className="text-sm text-muted-foreground">{formatTime(kpiData.escalationResolution.averageResolutionTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overdue Escalations</span>
                        <span className="text-sm text-muted-foreground">{kpiData.escalationResolution.overdueEscalations.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          {advancedData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume Analysis</CardTitle>
                  <CardDescription>Peak hours and seasonal trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Peak Hours</h4>
                      <div className="space-y-2">
                        {advancedData.performance.orderVolumeAnalysis.peakHours.slice(0, 5).map((hour, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{hour.hour}:00</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600" 
                                  style={{ width: `${(hour.volume / Math.max(...advancedData.performance.orderVolumeAnalysis.peakHours.map(h => h.volume))) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{hour.volume}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>System and user productivity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">User Productivity</h4>
                      <div className="space-y-2">
                        {advancedData.performance.resourceUtilization.userProductivity.slice(0, 5).map((user, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{user.user}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{user.ordersProcessed} orders</span>
                              <span className="text-sm text-muted-foreground">({formatTime(user.avgTime)} avg)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          {advancedData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume Trend</CardTitle>
                  <CardDescription>Order volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advancedData.trends.orderTrends.volumeTrend.slice(0, 7).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(trend.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatNumber(trend.volume)}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(trend.growth)}
                            <span className="text-xs text-muted-foreground">{formatPercentage(trend.growth)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction Trend</CardTitle>
                  <CardDescription>Satisfaction scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advancedData.trends.customerTrends.satisfactionTrend.slice(0, 7).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(trend.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{trend.satisfaction.toFixed(1)}/5</span>
                          <Badge className={cn(
                            "text-xs",
                            trend.trend === 'up' && "bg-green-100 text-green-800",
                            trend.trend === 'down' && "bg-red-100 text-red-800",
                            trend.trend === 'stable' && "bg-gray-100 text-gray-800"
                          )}>
                            {trend.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Forecasting */}
        <TabsContent value="forecasting" className="space-y-4">
          {advancedData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume Forecast</CardTitle>
                  <CardDescription>Predicted order volume for the next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advancedData.forecasting.orderVolumeForecast.slice(0, 7).map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(forecast.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatNumber(forecast.forecast)}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatPercentage(forecast.confidence * 100)} confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capacity Planning</CardTitle>
                  <CardDescription>Current and projected capacity needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Capacity</span>
                      <span className="text-sm font-medium">{formatNumber(advancedData.forecasting.capacityPlanning.currentCapacity)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Projected Demand</span>
                      <span className="text-sm font-medium">{formatNumber(advancedData.forecasting.capacityPlanning.projectedDemand)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended Capacity</span>
                      <span className="text-sm font-medium">{formatNumber(advancedData.forecasting.capacityPlanning.recommendedCapacity)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Timeline</span>
                      <Badge variant="outline">{advancedData.forecasting.capacityPlanning.timeline}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          {advancedData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Insights</CardTitle>
                  <CardDescription>Key findings and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advancedData.insights.topInsights.map((insight) => (
                      <div key={insight.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                        {insight.actionable && insight.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Recommendations:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {insight.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anomalies & Alerts</CardTitle>
                  <CardDescription>System anomalies requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advancedData.insights.anomalies.map((anomaly) => (
                      <div key={anomaly.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{anomaly.description}</h4>
                          <Badge className={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{anomaly.impact}</p>
                        <p className="text-sm font-medium text-blue-600">{anomaly.recommendedAction}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generate and download comprehensive reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'kpi-summary', name: 'KPI Summary', description: 'Comprehensive KPI overview' },
                    { id: 'order-analytics', name: 'Order Analytics', description: 'Order processing analysis' },
                    { id: 'customer-insights', name: 'Customer Insights', description: 'Customer satisfaction metrics' },
                    { id: 'fno-performance', name: 'FNO Performance', description: 'FNO integration metrics' },
                    { id: 'escalation-analysis', name: 'Escalation Analysis', description: 'Escalation patterns and trends' },
                    { id: 'system-health', name: 'System Health', description: 'System performance metrics' }
                  ].map((report) => (
                    <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleExport(report.id, 'csv')}>
                            CSV
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleExport(report.id, 'pdf')}>
                            PDF
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleExport(report.id, 'excel')}>
                            Excel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
