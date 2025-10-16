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

// Per-order-type transition maps (fallback to new_install)
const statusTransitionsByType: Record<string, Record<string, string[]>> = {
  new_install: {
    created: ['validated', 'cancelled'],
    validated: ['enriched', 'cancelled'],
    enriched: ['fno_submitted', 'cancelled'],
    fno_submitted: ['fno_accepted', 'cancelled'],
    fno_accepted: ['installation_scheduled', 'cancelled'],
    installation_scheduled: ['in_progress', 'cancelled'],
    in_progress: ['installed', 'cancelled'],
    installed: ['activated', 'cancelled'],
    activated: ['completed'],
    completed: [],
    cancelled: []
  },
  service_change: {
    created: ['validated', 'cancelled'],
    validated: ['change_scheduled', 'cancelled'],
    change_scheduled: ['in_progress', 'cancelled'],
    in_progress: ['changed', 'cancelled'],
    changed: ['activated', 'cancelled'],
    activated: ['completed'],
    completed: [],
    cancelled: []
  },
  disconnect: {
    created: ['validated', 'cancelled'],
    validated: ['disconnection_scheduled', 'cancelled'],
    disconnection_scheduled: ['in_progress', 'cancelled'],
    in_progress: ['disconnected', 'cancelled'],
    disconnected: ['completed'],
    completed: [],
    cancelled: []
  },
  trial: {
    created: ['trial_order_created', 'cancelled'],
    trial_order_created: ['trial_fno_provisioning', 'trial_cancelled'],
    trial_fno_provisioning: ['trial_installation_pending', 'trial_cancelled'],
    trial_installation_pending: ['trial_installation_scheduled', 'trial_cancelled'],
    trial_installation_scheduled: ['trial_active', 'trial_cancelled'],
    trial_device_shipping: ['trial_device_delivered', 'trial_cancelled'],
    trial_device_delivered: ['trial_self_install', 'trial_cancelled'],
    trial_self_install: ['trial_active', 'trial_cancelled'],
    trial_active: ['trial_engaged', 'trial_expiring', 'trial_cancelled'],
    trial_engaged: ['trial_expiring', 'trial_converted', 'trial_cancelled'],
    trial_expiring: ['trial_converted', 'trial_expired', 'trial_cancelled'],
    trial_converted: ['paid_service_installation_pending'],
    trial_expired: [],
    trial_cancelled: [],
    paid_service_installation_pending: ['paid_service_installation_scheduled', 'cancelled'],
    paid_service_installation_scheduled: ['paid_service_device_shipping', 'cancelled'],
    paid_service_device_shipping: ['paid_service_device_delivered', 'cancelled'],
    paid_service_device_delivered: ['paid_service_self_install', 'cancelled'],
    paid_service_self_install: ['paid_service_active', 'cancelled'],
    paid_service_active: ['completed'],
    completed: [],
    cancelled: []
  }
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
  'cancelled': 'Cancelled',
  // service_change
  'change_scheduled': 'Change Scheduled',
  'changed': 'Change Applied',
  // disconnect
  'disconnection_scheduled': 'Disconnection Scheduled',
  'disconnected': 'Disconnected',
  // trial statuses
  'trial_order_created': 'Trial Order Created',
  'trial_fno_provisioning': 'Trial FNO Provisioning',
  'trial_installation_pending': 'Trial Installation Pending',
  'trial_installation_scheduled': 'Trial Installation Scheduled',
  'trial_device_shipping': 'Trial Device Shipping',
  'trial_device_delivered': 'Trial Device Delivered',
  'trial_self_install': 'Trial Self Install',
  'trial_active': 'Trial Active',
  'trial_engaged': 'Trial Engaged',
  'trial_expiring': 'Trial Expiring',
  'trial_converted': 'Trial Converted',
  'trial_expired': 'Trial Expired',
  'trial_cancelled': 'Trial Cancelled',
  'paid_service_installation_pending': 'Paid Service Installation Pending',
  'paid_service_installation_scheduled': 'Paid Service Installation Scheduled',
  'paid_service_device_shipping': 'Paid Service Device Shipping',
  'paid_service_device_delivered': 'Paid Service Device Delivered',
  'paid_service_self_install': 'Paid Service Self Install',
  'paid_service_active': 'Paid Service Active'
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
  'cancelled': 'Order has been cancelled',
  // service_change
  'change_scheduled': 'Service change has been scheduled',
  'changed': 'Service change applied successfully',
  // disconnect
  'disconnection_scheduled': 'Service disconnection has been scheduled',
  'disconnected': 'Service has been disconnected',
  // trial statuses
  'trial_order_created': 'Trial order has been created and is ready for provisioning',
  'trial_fno_provisioning': 'Trial order is being provisioned with the FNO',
  'trial_installation_pending': 'Trial installation is pending scheduling',
  'trial_installation_scheduled': 'Trial installation has been scheduled',
  'trial_device_shipping': 'Trial device is being shipped to customer',
  'trial_device_delivered': 'Trial device has been delivered to customer',
  'trial_self_install': 'Customer is performing self-installation of trial device',
  'trial_active': 'Trial service is active and customer can use it',
  'trial_engaged': 'Customer is actively using the trial service',
  'trial_expiring': 'Trial period is expiring soon',
  'trial_converted': 'Trial has been converted to a paid service',
  'trial_expired': 'Trial period has expired',
  'trial_cancelled': 'Trial has been cancelled',
  'paid_service_installation_pending': 'Paid service installation is pending',
  'paid_service_installation_scheduled': 'Paid service installation has been scheduled',
  'paid_service_device_shipping': 'Paid service device is being shipped',
  'paid_service_device_delivered': 'Paid service device has been delivered',
  'paid_service_self_install': 'Customer is performing self-installation of paid service',
  'paid_service_active': 'Paid service is active and operational'
}

export function OrderStatusManager({ order, onUpdate }: OrderStatusManagerProps) {
  const { updateOrderStatus, getOrderWorkflowState } = useOrders()
  const [selectedStatus, setSelectedStatus] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [workflowState, setWorkflowState] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const currentState = (order?.current_state || order?.currentState || order?.status || 'created') as string
  const orderType = (order?.order_type || order?.orderType || 'new_install') as string
  
  // Check if this is a trial order based on service details or current state
  const isTrialOrder = order?.service_details?.serviceType?.toLowerCase() === 'trial' ||
                      order?.service_details?.service_type?.toLowerCase() === 'trial' ||
                      order?.serviceType?.toLowerCase() === 'trial' ||
                      currentState.startsWith('trial_') ||
                      currentState.startsWith('paid_service_')
  
  const effectiveOrderType = isTrialOrder ? 'trial' : orderType
  const mapForType = statusTransitionsByType[effectiveOrderType] || statusTransitionsByType['new_install']
  const validTransitionsFromWorkflow = (workflowState?.transitions || []).map((t: any) => t.toState)
  const baseTransitions = (validTransitionsFromWorkflow.length > 0
    ? validTransitionsFromWorkflow
    : (mapForType[currentState] || []))
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
      case 'change_scheduled':
      case 'disconnection_scheduled':
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
          Current status: <Badge variant="outline">{statusLabels[currentState] || currentState.replace(/_/g, ' ')}</Badge>
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
                  {workflowState.transitions.filter((t: any) => !!t?.toState).map((transition: any) => (
                    <Badge key={transition.toState} variant="secondary" className="text-xs">
                      {statusLabels[transition.toState] || String(transition.toState || '').replace(/_/g, ' ')}
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
