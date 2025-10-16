import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Badge } from "../../../../components/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/components/ui/tabs"
import { ArrowLeft, Edit, Clock, MapPin, User, Package, Network, AlertTriangle, Loader2, ArrowRight, CheckCircle, XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { useOrders } from "../../../../../hooks/useOrders"
import { getCustomer } from "../../../../../lib/api/customers"
import { OrderStatusManager } from "../../../../components/components/orders/OrderStatusManager"
import { OrderWorkflowManager } from "../../../../components/components/orders/OrderWorkflowManager"
import { OrderSlaMonitor } from "../../../../components/components/orders/OrderSlaMonitor"
import { OrderEnrichmentForm } from "../../../../components/components/orders/OrderEnrichmentForm"
import { OrderFnoSubmissionForm } from "../../../../components/components/orders/OrderFnoSubmissionForm"
import { backfillTrial, getOrderWorkflowState } from "../../../../../lib/api/orders"
import { OrderScheduleForm } from "../../../../components/components/orders/OrderScheduleForm"
import { transitionTrialWorkflow } from "../../../../../lib/api/trials"
import TrialConversionButton from "../../../../components/components/trials/TrialConversionButton"
import Swal from "sweetalert2"

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "fno_submitted":
      return "bg-yellow-100 text-yellow-800"
    case "installation_scheduled":
      return "bg-purple-100 text-purple-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "created":
      return "bg-gray-100 text-gray-800"
    case "validated":
      return "bg-blue-100 text-blue-800"
    case "enriched":
      return "bg-indigo-100 text-indigo-800"
    case "fno_accepted":
      return "bg-green-100 text-green-800"
    case "fno_rejected":
      return "bg-red-100 text-red-800"
    case "installed":
      return "bg-green-100 text-green-800"
    case "activated":
      return "bg-green-100 text-green-800"
    // Trial statuses
    case "trial_order_created":
      return "bg-blue-100 text-blue-800"
    case "trial_fno_provisioning":
      return "bg-yellow-100 text-yellow-800"
    case "trial_installation_pending":
      return "bg-orange-100 text-orange-800"
    case "trial_installation_scheduled":
      return "bg-purple-100 text-purple-800"
    case "trial_device_shipping":
      return "bg-indigo-100 text-indigo-800"
    case "trial_device_delivered":
      return "bg-cyan-100 text-cyan-800"
    case "trial_self_install":
      return "bg-teal-100 text-teal-800"
    case "trial_active":
      return "bg-green-100 text-green-800"
    case "trial_engaged":
      return "bg-emerald-100 text-emerald-800"
    case "trial_expiring":
      return "bg-amber-100 text-amber-800"
    case "trial_converted":
      return "bg-green-100 text-green-800"
    case "trial_expired":
      return "bg-red-100 text-red-800"
    case "trial_cancelled":
      return "bg-red-100 text-red-800"
    case "paid_service_installation_pending":
      return "bg-orange-100 text-orange-800"
    case "paid_service_installation_scheduled":
      return "bg-purple-100 text-purple-800"
    case "paid_service_device_shipping":
      return "bg-indigo-100 text-indigo-800"
    case "paid_service_device_delivered":
      return "bg-cyan-100 text-cyan-800"
    case "paid_service_self_install":
      return "bg-teal-100 text-teal-800"
    case "paid_service_active":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "normal":
      return "bg-blue-100 text-blue-800"
    case "low":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Trial workflow progress calculation
function getTrialWorkflowProgress(currentState: string): number {
  const workflowSteps = [
    'trial_order_created',
    'trial_fno_provisioning',
    'trial_installation_pending',
    'trial_installation_scheduled',
    'trial_active',
    'trial_engaged',
    'trial_expiring',
    'trial_converted'
  ];

  const currentIndex = workflowSteps.indexOf(currentState);
  if (currentIndex === -1) return 0;

  // Calculate percentage (8 steps total)
  return Math.round(((currentIndex + 1) / workflowSteps.length) * 100);
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getOrder, getOrderWorkflowHistory, getOrderWorkflowState } = useOrders()
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [workflowHistory, setWorkflowHistory] = useState<Array<Record<string, unknown>>>([])
  const [validTransitions, setValidTransitions] = useState<Array<{ toState: string; name?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Trial workflow state
  const [trialWorkflow, setTrialWorkflow] = useState<Record<string, unknown> | null>(null)
  const [nextStates, setNextStates] = useState<string[]>([])
  const [trialLoading, setTrialLoading] = useState(false)
  

  const refreshOrder = async () => {
    if (!id) return
    
    try {
      const [orderDataRaw, historyData, wfState] = await Promise.all([
        getOrder(id),
        getOrderWorkflowHistory(id),
        getOrderWorkflowState(id)
      ])
      
      let orderData = orderDataRaw
      const hasName = !!(orderData?.customer?.first_name || orderData?.customer?.last_name)
      if ((!orderData?.customer || !hasName) && orderData?.customer_id) {
        try {
          const customer = await getCustomer(orderData.customer_id)
          orderData = { ...orderData, customer }
        } catch {
          // ignore; leave customer unknown
        }
      }
      setOrder(orderData as any)
      setWorkflowHistory(historyData || [])
      setValidTransitions(Array.isArray(wfState?.transitions) ? wfState.transitions.map((t: any) => ({ toState: t.toState, name: t.name })) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order")
    }
  }

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        await refreshOrder()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order")
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load order details'
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  // Trial workflow functions
  const loadTrialWorkflow = useCallback(async () => {
    if (!id || (!(order as any)?.service_details?.isTrial && (order as any)?.service_type !== 'Trial')) return
    
    try {
      setTrialLoading(true)
      // Use the regular workflow endpoint that handles trial orders
      const workflow = await getOrderWorkflowState(id)
      setTrialWorkflow(workflow as any)
      setNextStates(workflow?.transitions?.map((t: any) => t.toState) || [])
    } catch (error) {
      console.error('Failed to load trial workflow:', error)
    } finally {
      setTrialLoading(false)
    }
  }, [id, order?.service_details?.isTrial, order?.service_type])

  const handleTrialWorkflowTransition = async (targetState: string) => {
    if (!id) return
    
    try {
      setTrialLoading(true)
      await transitionTrialWorkflow(id, targetState)
      
      // Refresh both order and trial workflow data
      await Promise.all([refreshOrder(), loadTrialWorkflow()])
      
      await Swal.fire({
        title: 'Success!',
        text: `Trial workflow transitioned to ${targetState}`,
        icon: 'success',
        timer: 2000
      })
    } catch (error) {
      console.error('Trial workflow transition failed:', error)
      await Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to transition trial workflow',
        icon: 'error'
      })
    } finally {
      setTrialLoading(false)
    }
  }

  // Load trial workflow when order changes
  useEffect(() => {
    if ((order as any)?.service_details?.isTrial || (order as any)?.service_type === 'Trial') {
      loadTrialWorkflow()
    }
  }, [loadTrialWorkflow])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading order details...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error || "Order not found"}</p>
            <Button onClick={() => navigate("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/orders">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{order.order_number}</h1>
                <p className="text-muted-foreground">Order details and tracking information</p>
              </div>
            </div>
            <Link to={`/orders/${id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </Button>
            </Link>
          
          </div>

          {/* Status Overview */}
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge className={`mt-2 ${getStatusColor(order.current_state)}`}>
                  {order.current_state?.replace("_", " ") || "Unknown"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Priority</span>
                </div>
                <Badge className={`mt-2 ${getPriorityColor(order.priority)}`}>
                  {order.priority || "normal"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <p className="mt-2 text-sm">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Updated</span>
                </div>
                <p className="mt-2 text-sm">
                  {order.updated_at ? new Date(order.updated_at).toLocaleDateString() : "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="history">State History</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              {validTransitions.some(t => String(t.toState).toLowerCase() === 'enriched') && (
                <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
              )}
              {validTransitions.some(t => String(t.toState).toLowerCase() === 'fno_submitted') && (
                <TabsTrigger value="fno">FNO Submission</TabsTrigger>
              )}
              {validTransitions.some(t => ['installation_scheduled','change_scheduled','disconnection_scheduled'].includes(String(t.toState).toLowerCase())) && (
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Customer Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="text-sm">
                        {order?.customer && (order as any).customer?.first_name
                          ? `${(order as any).customer.first_name}${(order as any).customer.last_name ? ` ${(order as any).customer.last_name}` : ''}`.trim()
                          : 'Unknown Customer'}
                      </p>
                      {order.customer_id && (
                        <p className="text-xs text-muted-foreground mt-1">ID: {order.customer_id}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Order Type</p>
                      <p className="text-sm">
                        {order.order_type === 'new_install' ? 'New Installation'
                          : order.order_type === 'service_change' ? 'Service Change'
                          : order.order_type === 'disconnect' ? 'Disconnect'
                          : (order.order_type || 'N/A')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Service Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                      <p className="text-sm">{order.service_details?.serviceType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bandwidth</p>
                      <p className="text-sm">{order.service_details?.bandwidth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Installation Type</p>
                      <p className="text-sm">{order.service_details?.installationType || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Installation Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Installation Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {order.service_address ? (
                    <div className="space-y-1">
                        <p className="text-sm">{order.service_address.street}</p>
                        <p className="text-sm">{order.service_address.city}</p>
                        <p className="text-sm">{order.service_address.province}</p>
                        <p className="text-sm">{order.service_address.postalCode}</p>
                    </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No address provided</p>
                    )}
                  </CardContent>
                </Card>

                {/* FNO Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Network className="h-5 w-5" />
                      <span>FNO Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">FNO ID</p>
                      <p className="text-sm">{order.fno_id || "Not assigned"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">FNO Reference</p>
                      <p className="text-sm">{order.fno_reference || "Not assigned"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Order State History</CardTitle>
                  <CardDescription>Complete timeline of order state changes</CardDescription>
                </CardHeader>
                <CardContent>
                  {workflowHistory.length > 0 ? (
                  <div className="space-y-4">
                      {workflowHistory.map((entry, index) => (
                        <div key={entry.id || index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(entry.toState)}>
                                {entry.toState?.replace("_", " ") || "Unknown"}
                              </Badge>
                            <span className="text-sm text-muted-foreground">
                                {entry.occurredAt ? new Date(entry.occurredAt).toLocaleString() : "N/A"}
                            </span>
                          </div>
                            <p className="text-sm mt-1">{entry.reason || entry.transitionName || "No reason provided"}</p>
                          <p className="text-xs text-muted-foreground">
                              Actor: {entry.actorName || entry.actor || entry.actorId || "System"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No state history available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow">
              <div className="space-y-6">
                {/* Regular Order Workflow - Only for non-trial orders */}
                {!(order?.service_details?.isTrial || order?.service_type === 'Trial') && (
                  <>
                    <OrderSlaMonitor order={order} />
                    <OrderStatusManager order={order} onUpdate={refreshOrder} />
                    <OrderWorkflowManager order={order} onUpdate={refreshOrder} />
                  </>
                )}
                
                {/* Fallback message for orders without workflow data */}
                {!order?.service_type && !order?.service_details?.isTrial && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No workflow data available for this order type.</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Trial Workflow Section - Only for trial orders */}
                {(order?.service_details?.isTrial || order?.service_type === 'Trial') && (
                      <Card>
                        <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Trial Workflow
                      </CardTitle>
                      <CardDescription>
                        Manage trial customer workflow transitions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {trialLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading trial workflow...</span>
                        </div>
                      ) : trialWorkflow ? (
                        <div className="space-y-6">
                          {/* Enhanced Trial Workflow Card Header */}
                          <div className="rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* <div className="bg-white/20 p-2 rounded-lg">
                                  <Package className="h-5 w-5" />
                                </div> */}
                              <div>
                                  {/* <h3 className="text-lg font-semibold">Trial Workflow Management</h3> */}
                                  {/* <p className="text-sm">Manage trial customer workflow transitions</p> */}
                            </div>
                              </div>
                              <div className="text-right">
                                {/* <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                                  {String(trialWorkflow.daysRemaining || '28')} days left
                                </div> */}
                                {/* <div className="text-xs mt-1">
                                    Engagement: {String(trialWorkflow.engagement || 'COLD')}
                              </div> */}
                              </div>
                          </div>
                          
                            {/* Action Controls - Enhanced Design */}
                            <div className="rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <ArrowRight className="h-4 w-4 text-gray-600" />
                                <label className="text-sm font-semibold">Quick Actions</label>
                              </div>

                              <div className="" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                              }}>
                                {/* Dropdown for state transitions */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">State Transition</label>
                                <select 
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleTrialWorkflowTransition(e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  disabled={trialLoading}
                                >
                                  <option value="">Select next state...</option>
                                  {nextStates.map((state) => (
                                    <option key={state} value={state}>
                                      {state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                  ))}
                                </select>
                              </div>

                                {/* FNO Provisioning Button */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Network Actions</label>
                                <Button 
                                  variant="default" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                                  disabled={trialLoading}
                                >
                                  <Network className="h-4 w-4 mr-2" />
                                  Start FNO Provisioning
                                </Button>
                                </div>

                                {/* Convert to Paid Button */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Conversion</label>
                                <Button 
                                  variant="default" 
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                                  disabled={trialLoading}
                                >
                                  <Package className="h-4 w-4 mr-2" />
                                  Convert to Paid
                                </Button>
                                </div>
                              </div>
                              </div>
                            </div>

                            {/* Trial Workflow Progress - Enhanced Design */}
                            
                            {/* Enhanced Progress Visualization */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                              {/* Current State Highlight */}
                              <div className="flex items-center justify-center mb-6">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                  📍 {String(trialWorkflow.state || trialWorkflow.currentState || 'ORDER CREATED').replace(/_/g, ' ').toUpperCase()}
                                </div>
                              </div>

                              {/* Interactive Progress Steps */}
                              <div className="relative">
                                {/* Progress Line */}
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>

                                {/* Progress Steps */}
                                <div className="relative flex justify-between items-center">
                                  {[
                                    { key: 'trial_order_created', label: 'Order Created', desc: 'Trial initiated' },
                                    { key: 'trial_fno_provisioning', label: 'FNO Provisioning', desc: 'Network setup' },
                                    { key: 'trial_installation_pending', label: 'Installation Pending', desc: 'Scheduling' },
                                    { key: 'trial_installation_scheduled', label: 'Installation Scheduled', desc: 'Confirmed date' },
                                    { key: 'trial_active', label: 'Active', desc: 'Live service' },
                                    { key: 'trial_engaged', label: 'Engaged', desc: 'Customer using' },
                                    { key: 'trial_expiring', label: 'Expiring', desc: 'Trial ending' },
                                    { key: 'trial_converted', label: 'Converted', desc: 'Paid service' }
                                  ].map((step, index) => {
                                    const isActive = trialWorkflow.state === step.key || trialWorkflow.currentState === step.key;
                                    const isCompleted = getTrialWorkflowProgress(String(trialWorkflow.state || trialWorkflow.currentState || 'trial_order_created')) > (index / 8) * 100;
                                    const isCurrent = Math.round(getTrialWorkflowProgress(String(trialWorkflow.state || trialWorkflow.currentState || 'trial_order_created'))) === Math.round(((index + 1) / 8) * 100);

                                    return (
                                      <div key={step.key} className="flex flex-col items-center relative z-10">
                                        {/* Step Circle */}
                                        <div className={`
                                          w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                                          ${isCompleted
                                            ? 'bg-green-500 text-white shadow-md'
                                            : isCurrent
                                              ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200'
                                              : 'bg-gray-200 text-gray-500'
                                          }
                                        `}>
                                          {isCompleted ? '✓' : isCurrent ? '●' : index + 1}
                                        </div>

                                        {/* Step Label */}
                                        <div className="mt-2 text-center">
                                          <div className={`text-xs font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-600'}`}>
                                            {step.label}
                                          </div>
                                          <div className={`text-xs ${isCurrent ? 'text-blue-500' : 'text-gray-400'}`}>
                                            {step.desc}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Progress Fill */}
                                <div
                                  className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 rounded"
                                  style={{ width: `${getTrialWorkflowProgress(String(trialWorkflow.state || trialWorkflow.currentState || 'trial_order_created'))}%` }}
                                ></div>
                                </div>

                              {/* Progress Summary */}
                              <div className="mt-6 pt-4 border-t border-blue-100">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    Progress: {Math.round(getTrialWorkflowProgress(String(trialWorkflow.state || trialWorkflow.currentState || 'trial_order_created')))}% Complete
                                  </span>
                                  <span className={`font-medium ${getTrialWorkflowProgress(String(trialWorkflow.state || trialWorkflow.currentState || 'trial_order_created')) === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                    {getTrialWorkflowProgress(String(trialWorkflow.state || trialWorkflow.currentState || 'trial_order_created')) === 100 ? '🎉 Complete!' : 'In Progress'}
                                  </span>
                                    </div>
                                  </div>
                            </div>
                            
                            {/* Available Transitions - Enhanced Design */}
                          {nextStates.length > 0 && (
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                  <ArrowRight className="h-5 w-5 text-blue-600" />
                                  <label className="text-base font-semibold text-gray-800">
                                    Available Actions
                              </label>
                                </div>
                                <div className="" style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                }}>
                                  {nextStates.map((state) => {
                                    const isConversion = state === 'trial_converted';
                                    const isCancellation = state === 'trial_cancelled';
                                    return (
                                  <Button
                                    key={state}
                                        variant={isConversion ? "default" : isCancellation ? "destructive" : "outline"}
                                    size="sm"
                                    onClick={() => handleTrialWorkflowTransition(state)}
                                    disabled={trialLoading}
                                        className={`
                                         justify-start text-left font-medium transition-all duration-200 h-auto py-3 px-4
                                          ${isConversion
                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg border-green-600'
                                            : isCancellation
                                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg border-red-600'
                                              : 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-blue-50/50'
                                          }
                                        `}
                                      >
                                        <div className="flex items-center gap-2">
                                          {isConversion && <CheckCircle className="h-4 w-4" />}
                                          {isCancellation && <XCircle className="h-4 w-4" />}
                                          {!isConversion && !isCancellation && <ArrowRight className="h-4 w-4" />}
                                          <span className="capitalize">
                                    {state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                          </span>
                                        </div>
                                  </Button>
                                    );
                                  })}
                                </div>
                                {trialLoading && (
                                  <div className="flex items-center justify-center mt-4 p-3 bg-blue-50 rounded-lg">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                                    <span className="text-sm text-blue-600 font-medium">Processing transition...</span>
                                  </div>
                                )}
                              </div>
                            )}
                          
                          {/* Trial Conversion Section */}
                          <div className="border-t pt-4">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">
                              Trial Conversion
                            </label>
                            <TrialConversionButton
                              trialId={id || ''}
                              trialData={{
                                customerName: `${String(order.customer?.first_name || '')} ${String(order.customer?.last_name || '')}`.trim() || 'Unknown Customer',
                                customerEmail: String(order.customer?.email || 'unknown@example.com'),
                                daysRemaining: 28, // Default value
                                engagementLevel: 'WARM', // Default value
                                customerFirstName: String(order.customer?.first_name || ''),
                                customerLastName: String(order.customer?.last_name || ''),
                                customerPhone: String(order.customer?.phone || ''),
                                serviceAddress: {
                                  street: String(order.service_address?.street || ''),
                                  city: String(order.service_address?.city || ''),
                                  province: String(order.service_address?.province || ''),
                                  postalCode: String(order.service_address?.postal_code || '')
                                },
                                trialStartDate: String(order.created_at || ''),
                                trialEndDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
                                orderCreatedAt: String(order.created_at || '')
                              }}
                              onConversionSuccess={() => {
                                refreshOrder()
                                loadTrialWorkflow()
                              }}
                              showDetails={true}
                            />
                          </div>
                          </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No trial workflow data available</p>
                        </div>
                          )}
                        </CardContent>
                      </Card>
                  )}
                </div>
            </TabsContent>

            {validTransitions.some(t => String(t.toState).toLowerCase() === 'enriched') && (
              <TabsContent value="enrichment">
                <OrderEnrichmentForm order={order} onUpdate={refreshOrder} />
              </TabsContent>
            )}

            {validTransitions.some(t => String(t.toState).toLowerCase() === 'fno_submitted') && (
              <TabsContent value="fno">
                <OrderFnoSubmissionForm order={order} onUpdate={refreshOrder} />
              </TabsContent>
            )}

            {validTransitions.some(t => ['installation_scheduled','change_scheduled','disconnection_scheduled'].includes(String(t.toState).toLowerCase())) && (
              <TabsContent value="schedule">
                <OrderScheduleForm order={order} onUpdate={refreshOrder} />
            </TabsContent>
            )}

            
          </Tabs>
        </div>
      </main>
    </div>
  )
}
