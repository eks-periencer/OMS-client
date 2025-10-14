"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Database,
  Users,
  Package,
  Target,
  BarChart3,
  Bell,
  Cpu,
  HardDrive,
  Network,
  Server,
  Monitor,
  Gauge,
  LineChart,
  PieChart
} from 'lucide-react'

interface RealtimeMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: string
  status: 'normal' | 'warning' | 'critical'
  threshold?: {
    warning: number
    critical: number
  }
}

interface MetricAlert {
  id: string
  metricId: string
  metricName: string
  severity: 'warning' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical'
  uptime: number
  responseTime: number
  errorRate: number
  activeConnections: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  lastUpdated: string
}

interface RealtimeDashboardData {
  metrics: RealtimeMetric[]
  alerts: MetricAlert[]
  health: SystemHealth
  summary: {
    totalMetrics: number
    activeAlerts: number
    systemStatus: string
    lastUpdated: string
  }
}

export function RealtimeMetricsDashboard() {
  const [data, setData] = useState<RealtimeDashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { apiClient, unwrap } = await import('../../../../lib/api/client')
      const response = await apiClient.get('/realtime/dashboard')
      const result = unwrap<any>(response)
      setData(result)
      setLastUpdate(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to load real-time metrics')
      console.error('Error fetching real-time data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%'
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return `${(hours * 60).toFixed(0)}m`
    if (hours < 24) return `${hours.toFixed(1)}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours.toFixed(1)}h` : `${days}d`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'normal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'orders_today': return <Package className="h-4 w-4" />
      case 'active_orders': return <Activity className="h-4 w-4" />
      case 'open_escalations': return <AlertTriangle className="h-4 w-4" />
      case 'avg_processing_time': return <Clock className="h-4 w-4" />
      case 'db_connections': return <Database className="h-4 w-4" />
      case 'db_response_time': return <Database className="h-4 w-4" />
      case 'memory_usage': return <BarChart3 className="h-4 w-4" />
      case 'cpu_usage': return <BarChart3 className="h-4 w-4" />
      case 'error_rate': return <AlertTriangle className="h-4 w-4" />
      case 'throughput': return <TrendingUp className="h-4 w-4" />
      case 'active_users': return <Users className="h-4 w-4" />
      case 'user_adoption': return <Target className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Live System Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring and performance analytics
            {lastUpdate && (
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`${autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : ''} transition-all duration-200`}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600 animate-pulse' : ''}`} />
            {autoRefresh ? 'Live Monitoring' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="transition-all duration-200">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* System Health Status Banner */}
          <Card className={`border-l-4 ${data.health.status === 'healthy' ? 'border-l-green-500 bg-green-50' : 
                           data.health.status === 'degraded' ? 'border-l-yellow-500 bg-yellow-50' : 
                           'border-l-red-500 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${data.health.status === 'healthy' ? 'bg-green-100' : 
                                  data.health.status === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                    {data.health.status === 'healthy' ? 
                      <CheckCircle className="h-6 w-6 text-green-600" /> :
                      data.health.status === 'degraded' ?
                      <AlertTriangle className="h-6 w-6 text-yellow-600" /> :
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    }
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">System Status: {data.health.status.toUpperCase()}</h3>
                    <p className="text-sm text-muted-foreground">
                      Overall system health and performance indicators
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatPercentage(data.health.uptime)}</div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{data.health.responseTime}ms</div>
                <p className="text-xs text-muted-foreground mt-1">Average response time</p>
                <div className="mt-3 flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">-12% from yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{formatPercentage(data.health.errorRate)}</div>
                <p className="text-xs text-muted-foreground mt-1">24h average error rate</p>
                <div className="mt-3 flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">-0.1% from yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bell className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{data.summary.activeAlerts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.summary.activeAlerts === 0 ? 'All systems operational' : 'Requires attention'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">System stable</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gauge className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{data.summary.totalMetrics}</div>
                <p className="text-xs text-muted-foreground mt-1">Active monitoring points</p>
                <div className="mt-3 flex items-center gap-2">
                  <Activity className="h-3 w-3 text-purple-500 animate-pulse" />
                  <span className="text-xs text-purple-600">Real-time updates</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Resources with Enhanced Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Resources
                </CardTitle>
                <CardDescription>Real-time resource utilization and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          CPU Usage
                        </span>
                        <span className="text-sm font-bold">{formatPercentage(data.health.cpuUsage)}</span>
                      </div>
                      <Progress value={data.health.cpuUsage} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          Memory Usage
                        </span>
                        <span className="text-sm font-bold">{formatPercentage(data.health.memoryUsage)}</span>
                      </div>
                      <Progress value={data.health.memoryUsage} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          DB Connections
                        </span>
                        <span className="text-sm font-bold">{data.health.activeConnections}</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (data.health.activeConnections / 100) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.metrics.filter(m => ['orders_today', 'active_orders', 'throughput'].includes(m.id)).map((metric) => (
                      <div key={metric.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <div className="flex items-center gap-1">
                            {getMetricIcon(metric.id)}
                            <Badge className={getStatusColor(metric.status)}>
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {metric.unit === '%' ? formatPercentage(metric.value) :
                           metric.unit === 'hours' ? formatTime(metric.value) :
                           metric.unit === 'ms' ? `${metric.value}ms` :
                           formatNumber(metric.value)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(metric.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
                <CardDescription>Key performance indicators at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.metrics.filter(m => ['orders_today', 'active_users', 'error_rate', 'avg_processing_time'].includes(m.id)).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {getMetricIcon(metric.id)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {metric.unit === '%' ? formatPercentage(metric.value) :
                           metric.unit === 'hours' ? formatTime(metric.value) :
                           metric.unit === 'ms' ? `${metric.value}ms` :
                           formatNumber(metric.value)}
                        </p>
                        <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Alerts & Notifications
              </CardTitle>
              <CardDescription>Real-time alerts and system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {data.alerts.filter(alert => !alert.acknowledged).length > 0 ? (
                <div className="space-y-3">
                  {data.alerts.filter(alert => !alert.acknowledged).map((alert) => (
                    <Alert key={alert.id} className={`border-l-4 ${
                      alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                      'border-l-yellow-500 bg-yellow-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(alert.severity)}
                        <AlertDescription className="flex-1">
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Value: {alert.value} | Threshold: {alert.threshold} | 
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </AlertDescription>
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">All Clear!</h3>
                  <p className="text-green-600">No active alerts at this time. All systems are operating normally.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
                <CardDescription>Key performance indicators and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.metrics.filter(m => ['throughput', 'error_rate', 'db_response_time'].includes(m.id)).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border">
                          {getMetricIcon(metric.id)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {metric.unit === '%' ? formatPercentage(metric.value) :
                           metric.unit === 'hours' ? formatTime(metric.value) :
                           metric.unit === 'ms' ? `${metric.value}ms` :
                           formatNumber(metric.value)}
                        </p>
                        <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Summary
                </CardTitle>
                <CardDescription>Overall system health and capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Metrics Monitored</span>
                      <span className="text-2xl font-bold text-blue-600">{data.summary.totalMetrics}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Uptime</span>
                      <span className="text-2xl font-bold text-green-600">{formatPercentage(data.health.uptime)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Connections</span>
                      <span className="text-2xl font-bold text-purple-600">{data.health.activeConnections}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="text-sm font-medium text-orange-600">
                        {new Date(data.health.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
