import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, CheckCircle, Clock, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react'
import { useOrders } from '../../../../hooks/useOrders'
import Swal from 'sweetalert2'

interface OrderWorkflowManagerProps {
  order: any
  onUpdate: () => void
}

const workflowStates = [
  { key: 'created', label: 'Created', description: 'Order has been created', icon: CheckCircle },
  { key: 'validated', label: 'Validated', description: 'Order has passed validation', icon: CheckCircle },
  { key: 'enriched', label: 'Enriched', description: 'Order has been enriched with data', icon: CheckCircle },
  { key: 'fno_submitted', label: 'FNO Submitted', description: 'Order submitted to FNO', icon: Clock },
  { key: 'fno_accepted', label: 'FNO Accepted', description: 'FNO has accepted the order', icon: CheckCircle },
  { key: 'fno_rejected', label: 'FNO Rejected', description: 'FNO has rejected the order', icon: AlertTriangle },
  { key: 'installation_scheduled', label: 'Installation Scheduled', description: 'Installation has been scheduled', icon: Clock },
  { key: 'in_progress', label: 'In Progress', description: 'Installation is in progress', icon: Play },
  { key: 'installed', label: 'Installed', description: 'Service has been installed', icon: CheckCircle },
  { key: 'activated', label: 'Activated', description: 'Service has been activated', icon: CheckCircle },
  { key: 'completed', label: 'Completed', description: 'Order has been completed', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled', icon: AlertTriangle }
]

export function OrderWorkflowManager({ order, onUpdate }: OrderWorkflowManagerProps) {
  const { getOrderWorkflowState, getOrderWorkflowHistory } = useOrders()
  const [workflowState, setWorkflowState] = useState<any>(null)
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentState = (order?.current_state || order?.currentState || order?.status || 'created') as string
  const currentStateIndex = workflowStates.findIndex(state => state.key === currentState)

  useEffect(() => {
    const loadWorkflowData = async () => {
      if (!order?.id) return

      setLoading(true)
      setError(null)

      try {
        const [state, history] = await Promise.all([
          getOrderWorkflowState(order.id),
          getOrderWorkflowHistory(order.id)
        ])
        
        // Normalize workflow state payload to component shape
        const normalizedState = state && typeof state === 'object' ? {
          state: state.state || currentState,
          description: state.description || '',
          validTransitions: (state.transitions || state.validTransitions || []).map((t: any) => ({
            toState: t.toState || t.to_state || t.to || 'unknown',
            name: t.name || t.transition_name || t.displayName || undefined
          }))
        } : null

        setWorkflowState(normalizedState)
        setWorkflowHistory(history || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow data')
      } finally {
        setLoading(false)
      }
    }

    loadWorkflowData()
  }, [order?.id, getOrderWorkflowState, getOrderWorkflowHistory])

  const getStateColor = (state: string) => {
    if (state === currentState) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (workflowStates.findIndex(s => s.key === state) < currentStateIndex) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const getStateIcon = (state: string) => {
    if (state === currentState) return <Play className="h-4 w-4" />
    if (workflowStates.findIndex(s => s.key === state) < currentStateIndex) return <CheckCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  const calculateProgress = () => {
    if (currentStateIndex === -1) return 0
    return Math.round((currentStateIndex / (workflowStates.length - 1)) * 100)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading workflow data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5" />
            <span>Workflow Progress</span>
          </CardTitle>
          <CardDescription>
            Current state: <Badge variant="outline">{currentState}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          {workflowState && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Workflow State Details</p>
              <p className="text-sm text-blue-600">
                {workflowState.description || 'No description available'}
              </p>
              {workflowState.validTransitions && workflowState.validTransitions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-blue-700">Available Transitions:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {workflowState.validTransitions.map((transition: any) => (
                      <Badge key={transition.toState} variant="secondary" className="text-xs">
                        {transition.name || transition.toState}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Workflow States Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow States</CardTitle>
          <CardDescription>Complete workflow progression timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowStates.map((state, index) => {
              const Icon = state.icon
              const isCompleted = index < currentStateIndex
              const isCurrent = state.key === currentState
              const isUpcoming = index > currentStateIndex

              return (
                <div key={state.key} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    isCompleted ? 'bg-green-100 border-green-300' :
                    isCurrent ? 'bg-blue-100 border-blue-300' :
                    'bg-gray-100 border-gray-300'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-medium ${
                        isCompleted ? 'text-green-800' :
                        isCurrent ? 'text-blue-800' :
                        'text-gray-600'
                      }`}>
                        {state.label}
                      </h4>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {state.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Workflow History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow History</CardTitle>
          <CardDescription>Latest workflow state changes</CardDescription>
        </CardHeader>
        <CardContent>
          {workflowHistory.length > 0 ? (
            <div className="space-y-3">
              {workflowHistory.slice(0, 5).map((entry, index) => (
                <div key={entry.id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {entry.toState?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.occurredAt ? new Date(entry.occurredAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.reason || entry.transitionName || 'No reason provided'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Actor: {entry.actorId || 'System'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No workflow history available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
