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
  Bell
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Metrics</h2>
          <p className="text-muted-foreground">
            Live system monitoring and performance metrics
            {lastUpdate && (
              <span className="ml-2 text-sm">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600 animate-pulse' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(data.health.status)}>
                    {data.health.status}
                  </Badge>
                  <span className="text-2xl font-bold">{formatPercentage(data.health.uptime)}</span>
                </div>
                <p className="text-xs text-muted-foreground">uptime</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.health.responseTime}ms</div>
                <p className="text-xs text-muted-foreground">average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(data.health.errorRate)}</div>
                <p className="text-xs text-muted-foreground">24h average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.activeAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.activeAlerts === 0 ? 'All clear' : 'requires attention'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.metrics.slice(0, 8).map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {getMetricIcon(metric.id)}
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(metric.status)}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.unit === '%' ? formatPercentage(metric.value) :
                     metric.unit === 'hours' ? formatTime(metric.value) :
                     metric.unit === 'ms' ? `${metric.value}ms` :
                     formatNumber(metric.value)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </p>
                  {metric.threshold && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Warning: {metric.threshold.warning}</span>
                        <span>Critical: {metric.threshold.critical}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (metric.value / metric.threshold.critical) * 100)} 
                        className="h-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>System memory utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{formatPercentage(data.health.memoryUsage)}</span>
                    <Badge className={getStatusColor(data.health.memoryUsage > 90 ? 'critical' : data.health.memoryUsage > 80 ? 'warning' : 'normal')}>
                      {data.health.memoryUsage > 90 ? 'Critical' : data.health.memoryUsage > 80 ? 'Warning' : 'Normal'}
                    </Badge>
                  </div>
                  <Progress value={data.health.memoryUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
                <CardDescription>Processor utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{formatPercentage(data.health.cpuUsage)}</span>
                    <Badge className={getStatusColor(data.health.cpuUsage > 90 ? 'critical' : data.health.cpuUsage > 80 ? 'warning' : 'normal')}>
                      {data.health.cpuUsage > 90 ? 'Critical' : data.health.cpuUsage > 80 ? 'Warning' : 'Normal'}
                    </Badge>
                  </div>
                  <Progress value={data.health.cpuUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
                <CardDescription>Storage utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{formatPercentage(data.health.diskUsage)}</span>
                    <Badge className={getStatusColor(data.health.diskUsage > 90 ? 'critical' : data.health.diskUsage > 80 ? 'warning' : 'normal')}>
                      {data.health.diskUsage > 90 ? 'Critical' : data.health.diskUsage > 80 ? 'Warning' : 'Normal'}
                    </Badge>
                  </div>
                  <Progress value={data.health.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          {data.alerts.filter(alert => !alert.acknowledged).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Alerts
                </CardTitle>
                <CardDescription>System alerts requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.alerts.filter(alert => !alert.acknowledged).map((alert) => (
                    <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <AlertDescription className={alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'}>
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-sm mt-1">
                              Value: {alert.value} | Threshold: {alert.threshold} | 
                              Time: {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </AlertDescription>
                        </div>
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
