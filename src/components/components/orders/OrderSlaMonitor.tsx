import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Clock, AlertTriangle, CheckCircle, XCircle, Timer } from 'lucide-react'

interface OrderSlaMonitorProps {
  order: any
}

const slaThresholds = {
  'created': { warning: 1, breach: 2 }, // hours
  'validated': { warning: 2, breach: 4 },
  'enriched': { warning: 4, breach: 8 },
  'fno_submitted': { warning: 8, breach: 24 },
  'fno_accepted': { warning: 2, breach: 4 },
  'fno_rejected': { warning: 1, breach: 2 },
  'installation_scheduled': { warning: 4, breach: 8 },
  'in_progress': { warning: 24, breach: 48 },
  'installed': { warning: 2, breach: 4 },
  'activated': { warning: 1, breach: 2 },
  'completed': { warning: 0, breach: 0 },
  'cancelled': { warning: 0, breach: 0 }
}

export function OrderSlaMonitor({ order }: OrderSlaMonitorProps) {
  const [slaStatus, setSlaStatus] = useState<'ok' | 'warning' | 'breached' | 'unknown'>('unknown')
  const [timeInState, setTimeInState] = useState(0)
  const [slaProgress, setSlaProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  const rawState = (order.current_state || order.status || order.currentState || '').toString()
  const currentState = rawState.toLowerCase().trim().replace(/\s+/g, '_')
  const stateChangedAt = order.updated_at || order.updatedAt || order.created_at || order.createdAt

  useEffect(() => {
    const calculateSlaStatus = () => {
      if (!stateChangedAt || !currentState) {
        setSlaStatus('unknown')
        return
      }

      const now = new Date()
      const changedAt = new Date(stateChangedAt)
      const hoursInStateRaw = (now.getTime() - changedAt.getTime()) / (1000 * 60 * 60)
      const hoursInState = Math.max(0, hoursInStateRaw)

      setTimeInState(hoursInState)

      const isTerminal = currentState === 'completed' || currentState === 'cancelled'
      const defaultThreshold = isTerminal ? { warning: 0, breach: 0 } : { warning: 4, breach: 8 }
      const threshold = slaThresholds[currentState as keyof typeof slaThresholds] || defaultThreshold

      if (hoursInState >= threshold.breach) {
        setSlaStatus('breached')
        setSlaProgress(100)
      } else if (hoursInState >= threshold.warning) {
        setSlaStatus('warning')
        setSlaProgress((hoursInState / threshold.breach) * 100)
      } else {
        setSlaStatus('ok')
        const denom = threshold.warning > 0 ? threshold.warning : (threshold.breach > 0 ? threshold.breach : 1)
        setSlaProgress((hoursInState / denom) * 100)
      }
    }

    calculateSlaStatus()
    
    // Update every minute
    const interval = setInterval(calculateSlaStatus, 60000)
    return () => clearInterval(interval)
  }, [currentState, stateChangedAt])

  const getSlaIcon = () => {
    switch (slaStatus) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'breached':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getSlaColor = () => {
    switch (slaStatus) {
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'breached':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSlaMessage = () => {
    const isTerminal = currentState === 'completed' || currentState === 'cancelled'
    const defaultThreshold = isTerminal ? { warning: 0, breach: 0 } : { warning: 4, breach: 8 }
    const threshold = slaThresholds[currentState as keyof typeof slaThresholds] || defaultThreshold

    switch (slaStatus) {
      case 'ok': {
        if (threshold.warning <= 0) return 'Within SLA'
        const remaining = Math.max(0, threshold.warning - timeInState)
        return `Within SLA. ${formatTime(remaining)} until warning`
      }
      case 'warning':
        {
          const remaining = Math.max(0, threshold.breach - timeInState)
          return `SLA Warning. ${formatTime(remaining)} until breach`
        }
      case 'breached':
        return `SLA Breached by ${(timeInState - threshold.breach).toFixed(1)} hours`
      default:
        return 'SLA status unknown'
    }
  }

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`
    } else if (hours < 24) {
      return `${hours.toFixed(1)} hours`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}d ${remainingHours.toFixed(1)}h`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getSlaIcon()}
          <span>SLA Monitoring</span>
        </CardTitle>
        <CardDescription>
          Service Level Agreement status for current state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SLA Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={getSlaColor()}>
            {slaStatus.toUpperCase()}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {formatTime(timeInState)} in current state
          </div>
        </div>

        {/* SLA Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>SLA Progress</span>
            <span>{slaProgress.toFixed(0)}%</span>
          </div>
          <Progress 
            value={slaProgress} 
            className={`h-2 ${
              slaStatus === 'breached' ? 'bg-red-200' :
              slaStatus === 'warning' ? 'bg-yellow-200' :
              'bg-green-200'
            }`}
          />
        </div>

        {/* SLA Message */}
        <Alert className={slaStatus === 'breached' ? 'border-red-200 bg-red-50' : 
                          slaStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                          'border-green-200 bg-green-50'}>
          <AlertDescription className={slaStatus === 'breached' ? 'text-red-800' : 
                                      slaStatus === 'warning' ? 'text-yellow-800' : 
                                      'text-green-800'}>
            {getSlaMessage()}
          </AlertDescription>
        </Alert>

        {/* SLA Thresholds */}
        {slaThresholds[currentState as keyof typeof slaThresholds] && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800 mb-2">SLA Thresholds for {currentState}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Warning:</span>
                <span className="ml-2 font-medium">
                  {slaThresholds[currentState as keyof typeof slaThresholds].warning}h
                </span>
              </div>
              <div>
                <span className="text-gray-600">Breach:</span>
                <span className="ml-2 font-medium">
                  {slaThresholds[currentState as keyof typeof slaThresholds].breach}h
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Next Actions */}
        {slaStatus === 'warning' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-1">Recommended Actions:</p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Review order status and escalate if needed</li>
              <li>• Contact assigned team member</li>
              <li>• Update customer on progress</li>
            </ul>
          </div>
        )}

        {slaStatus === 'breached' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Immediate Actions Required:</p>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Escalate to management immediately</li>
              <li>• Contact customer with update</li>
              <li>• Review and update workflow process</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
