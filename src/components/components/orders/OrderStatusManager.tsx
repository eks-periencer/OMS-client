import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { useOrders } from '../../../../hooks/useOrders'
import Swal from 'sweetalert2'

interface OrderStatusManagerProps {
  order: any
  onUpdate: () => void
}

const statusTransitions: Record<string, string[]> = {
  'created': ['validated', 'cancelled'],
  'validated': ['enriched', 'cancelled'],
  'enriched': ['fno_submitted', 'cancelled'],
  'fno_submitted': ['fno_accepted', 'fno_rejected', 'cancelled'],
  'fno_accepted': ['installation_scheduled', 'cancelled'],
  'fno_rejected': ['enriched', 'cancelled'],
  'installation_scheduled': ['in_progress', 'cancelled'],
  'in_progress': ['installed', 'cancelled'],
  'installed': ['activated', 'cancelled'],
  'activated': ['completed'],
  'completed': [],
  'cancelled': []
}

const statusLabels: Record<string, string> = {
  'created': 'Created',
  'validated': 'Validated',
  'enriched': 'Enriched',
  'fno_submitted': 'FNO Submitted',
  'fno_accepted': 'FNO Accepted',
  'fno_rejected': 'FNO Rejected',
  'installation_scheduled': 'Installation Scheduled',
  'in_progress': 'In Progress',
  'installed': 'Installed',
  'activated': 'Activated',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
}

const statusDescriptions: Record<string, string> = {
  'created': 'Order has been created and is pending validation',
  'validated': 'Order has passed basic validation checks',
  'enriched': 'Order has been enriched with additional data',
  'fno_submitted': 'Order has been submitted to the FNO',
  'fno_accepted': 'FNO has accepted the order',
  'fno_rejected': 'FNO has rejected the order',
  'installation_scheduled': 'Installation has been scheduled',
  'in_progress': 'Installation is currently in progress',
  'installed': 'Service has been installed',
  'activated': 'Service has been activated',
  'completed': 'Order has been completed',
  'cancelled': 'Order has been cancelled'
}

export function OrderStatusManager({ order, onUpdate }: OrderStatusManagerProps) {
  const { updateOrderStatus, getOrderWorkflowState } = useOrders()
  const [selectedStatus, setSelectedStatus] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [workflowState, setWorkflowState] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const currentState = (order?.current_state || order?.currentState || order?.status || 'created') as string
  const validTransitionsFromWorkflow = (workflowState?.transitions || []).map((t: any) => t.toState)
  const baseTransitions = (validTransitionsFromWorkflow.length > 0
    ? validTransitionsFromWorkflow
    : (statusTransitions[currentState] || []))
  // Business rule: prevent selecting 'enriched' here; enrichment must be done via Enrichment tab
  const validTransitions = baseTransitions.filter((s: string) => s !== 'enriched')

  useEffect(() => {
    const loadWorkflowState = async () => {
      try {
        const state = await getOrderWorkflowState(order.id)
        setWorkflowState(state)
      } catch (err) {
        console.error('Failed to load workflow state:', err)
      }
    }

    loadWorkflowState()
  }, [order.id, getOrderWorkflowState])

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return

    setLoading(true)
    setError(null)

    try {
      await updateOrderStatus(order.id, {
        status: selectedStatus,
        reason: reason || undefined
      })

      await Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `Order status has been updated to ${statusLabels[selectedStatus]}`,
        timer: 2000,
        showConfirmButton: false
      })

      onUpdate()
      setSelectedStatus('')
      setReason('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status'
      setError(errorMessage)
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'in_progress':
      case 'installation_scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (!order) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon(currentState)}
          <span>Order Status Management</span>
        </CardTitle>
        <CardDescription>
          Current status: <Badge variant="outline">{statusLabels[currentState] || currentState}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflowState && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Workflow State</p>
            <p className="text-sm text-blue-600">
              {workflowState.state} {workflowState.description ? `- ${workflowState.description}` : ''}
            </p>
            {Array.isArray(workflowState.transitions) && workflowState.transitions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-blue-700">Valid Transitions:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {workflowState.transitions.map((transition: any) => (
                    <Badge key={transition.toState} variant="secondary" className="text-xs">
                      {statusLabels[transition.toState] || transition.toState}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Update Status To</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {validTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span>{statusLabels[status]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStatus && (
              <p className="text-xs text-muted-foreground mt-1">
                {statusDescriptions[selectedStatus]}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Reason (Optional)</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md text-sm"
              placeholder="Enter reason for status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleStatusUpdate}
            disabled={!selectedStatus || loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </div>

        {validTransitions.length === 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              No status transitions available from current state.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
