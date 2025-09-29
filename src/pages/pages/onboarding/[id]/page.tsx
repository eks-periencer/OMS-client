"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Badge } from "../../../../components/components/ui/badge"
import { Progress } from "../../../../components/components/ui/progress"
import { Textarea } from "../../../../components/components/ui/textarea"
import { Label } from "../../../../components/components/ui/label"
import { ArrowLeft, CheckCircle, Clock, User, MessageSquare, Play } from "lucide-react"
import { Link } from "react-router-dom"
import { getOnboarding } from "../../../../../lib/api/onboarding"
import { getOrder } from "../../../../../lib/api/orders"
import { getCustomer } from "../../../../../lib/api/customers"
import { useOrders } from "../../../../../hooks/useOrders"
// import { toast } from "sonner"

function getStepStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-gray-100 text-gray-800"
    case "skipped":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStepIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "in_progress":
      return <Play className="h-4 w-4 text-blue-600" />
    case "pending":
      return <Clock className="h-4 w-4 text-gray-400" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

export default function OnboardingDetailsPage() {
  const params = useParams()
  const onboardingId = params.id as string
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState<boolean>(true)
  const [, setError] = useState<string | null>(null)
  const [data, setData] = useState<any | null>(null)
  const [steps, setSteps] = useState<any[]>([])
  // Manual transitions disabled; retain minimal state if needed later
  const { items: orderItems } = useOrders()
  const [customerDetails, setCustomerDetails] = useState<any | null>(null)
  // Progress-only view, terminal detection not used

  function mapOrderStatusToOnboardingStep(orderType: string, orderStatus: string): string | undefined {
    const t = String(orderType || 'new_install').toLowerCase()
    const s = String(orderStatus || '').toLowerCase()
    if (t === 'service_change') {
      switch (s) {
        case 'validated': return 'initiated'
        case 'change_scheduled': return 'service_configuration'
        case 'in_progress': return 'provisioning_in_flight'
        case 'changed': return 'service_activated'
        case 'activated': return 'service_activated'
        case 'completed': return 'completed'
        case 'cancelled': return 'completed'
        default: return undefined
      }
    }
    if (t === 'disconnect') {
      switch (s) {
        case 'validated': return 'initiated'
        case 'disconnect_scheduled': return 'disconnect_scheduled'
        case 'in_progress': return 'service_disconnected'
        case 'disconnected': return 'service_disconnected'
        case 'completed': return 'completed'
        case 'cancelled': return 'completed'
        default: return undefined
      }
    }
    // new_install
    switch (s) {
      case 'validated': return 'welcome_sent'
      case 'enriched': return 'service_setup'
      case 'fno_submitted': return 'equipment_ordered'
      case 'fno_accepted': return 'equipment_shipped'
      case 'installation_scheduled': return 'installation_scheduled'
      case 'installed': return 'installation_completed'
      case 'activated': return 'service_activated'
      case 'completed': return 'completed'
      case 'cancelled': return 'completed'
      default: return undefined
    }
  }

  function computeProgressFromSteps(list: any[]): number {
    if (!Array.isArray(list) || list.length === 0) return 0
    const total = list.length
    const lastIndex = total - 1
    // If final step is completed, 100%
    if (String(list[lastIndex]?.status) === 'completed') return 100
    // Determine current index
    const inProgressIdx = list.findIndex((s: any) => s.status === 'in_progress')
    let completedIdx = -1
    for (let i = 0; i < total; i++) {
      if (list[i]?.status === 'completed') completedIdx = i
      else break
    }
    const currentIdx = inProgressIdx >= 0 ? inProgressIdx : Math.max(0, completedIdx)
    // Map index to percentage along the steps (0 at first, 100 at last)
    return Math.max(0, Math.min(100, Math.round((currentIdx / lastIndex) * 100)))
  }

  function buildStepsFromWorkflow(orderType: string, currentStatus: string): any[] {
    const type = String(orderType || 'new_install').toLowerCase()
    const status = String(currentStatus || 'created').toLowerCase()

    const sequences: Record<string, string[]> = {
      new_install: [
        'created','validated','enriched','fno_submitted','fno_accepted','installation_scheduled','in_progress','installed','activated','completed'
      ],
      service_change: [
        'created','validated','change_scheduled','in_progress','changed','activated','completed'
      ],
      disconnect: [
        'created','validated','disconnect_scheduled','in_progress','disconnected','completed'
      ]
    }

    const labels: Record<string, string> = {
      created: 'Created',
      validated: 'Validated',
      enriched: 'Enriched',
      fno_submitted: 'FNO Submitted',
      fno_accepted: 'FNO Accepted',
      installation_scheduled: 'Installation Scheduled',
      in_progress: 'In Progress',
      installed: 'Installed',
      activated: 'Activated',
      completed: 'Completed',
      change_scheduled: 'Change Scheduled',
      changed: 'Change Applied',
      disconnect_scheduled: 'Disconnect Scheduled',
      disconnected: 'Disconnected',
      cancelled: 'Cancelled'
    }

    const flow = sequences[type] || sequences.new_install
    const currentIdx = Math.max(0, flow.indexOf(status))
    return flow.map((id, idx) => ({
      id,
      name: labels[id] || id,
      description: '',
      status: idx < currentIdx ? 'completed' : idx === currentIdx ? 'in_progress' : 'pending'
    }))
  }

  function normalizeSteps(_: any[], rawCurrent: string | undefined, orderTypeArg?: string): any[] {
    const orderType = (orderTypeArg || 'new_install').toString()
    const currentValue = (rawCurrent || 'initiated').toString().toLowerCase()

    const flows: Record<string, { id: string; name: string; description?: string }[]> = {
      new_install: [
        { id: 'initiated', name: 'Onboarding Initiated' },
        { id: 'welcome_sent', name: 'Welcome Email Sent' },
        { id: 'service_setup', name: 'Service Configuration' },
        { id: 'equipment_ordered', name: 'Equipment Ordered' },
        { id: 'equipment_shipped', name: 'Equipment Shipped' },
        { id: 'installation_scheduled', name: 'Installation Scheduled' },
        { id: 'installation_completed', name: 'Installation Completed' },
        { id: 'service_activated', name: 'Service Activated' },
        { id: 'follow_up', name: 'Follow-up & Support' },
        { id: 'completed', name: 'Onboarding Completed' }
      ],
      service_change: [
        { id: 'initiated', name: 'Onboarding Initiated' },
        { id: 'service_configuration', name: 'Service Configuration' },
        { id: 'provisioning_in_flight', name: 'Provisioning In-Flight' },
        { id: 'service_activated', name: 'Service Activated' },
        { id: 'completed', name: 'Onboarding Completed' }
      ],
      disconnect: [
        { id: 'initiated', name: 'Onboarding Initiated' },
        { id: 'disconnect_scheduled', name: 'Disconnect Scheduled' },
        { id: 'service_disconnected', name: 'Service Disconnected' },
        { id: 'completed', name: 'Onboarding Completed' }
      ]
    }

    const stepsToUse = flows[orderType] || flows.new_install
    const ids = stepsToUse.map(s => s.id)

    const alias: Record<string, string> = {
      activated: 'service_activated',
      activation: 'service_activated',
      requirements_confirmed: 'service_configuration',
      provisioning_requested: 'provisioning_in_flight',
      installation_complete: 'installation_completed'
    }

    let currentIndex = ids.indexOf(currentValue)
    if (currentIndex === -1) {
      const alt = alias[currentValue]
      if (alt) currentIndex = ids.indexOf(alt)
    }
    if (currentIndex === -1) currentIndex = 0

    return stepsToUse.map((s, idx) => ({
      ...s,
      status: idx < currentIndex ? 'completed' : idx === currentIndex ? 'in_progress' : 'pending'
    }))
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const d = await getOnboarding(onboardingId)
        setData(d)
        // Fetch authoritative customer details using customerId from onboarding
        try {
          const custId = (d as any)?.customer_id || (d as any)?.customerId || (d as any)?.customer?.id
          if (custId) {
            const cust = await getCustomer(String(custId))
            setCustomerDetails(cust)
          }
        } catch {}
        try {
        // Resolve order type from current orders cache (by linked order id or same customer)
        let resolvedOrderType = 'new_install'
        let resolvedOrderStatus = ''
        try {
          const linkedOrderId = (d as any)?.order_id || (d as any)?.orderId || (d as any)?.order?.id || null
          let ord: any = null
          if (linkedOrderId && Array.isArray(orderItems)) {
            ord = orderItems.find((o: any) => String(o?.id) === String(linkedOrderId)) || null
          }
          // Fallback: fetch order directly if not in cache yet
          if (!ord && linkedOrderId) {
            try { ord = await getOrder(String(linkedOrderId)) } catch {}
          }
          if (!ord && Array.isArray(orderItems)) {
            const onboardingCustomerId = (d as any)?.customer_id || (d as any)?.customerId || (d as any)?.customer?.id
            ord = orderItems.find((o: any) => String(o?.customer_id ?? o?.customerId) === String(onboardingCustomerId)) || null
          }
          const ot = (ord as any)?.order_type || (ord as any)?.orderType
          if (ot) resolvedOrderType = String(ot)
          resolvedOrderStatus = (ord as any)?.current_state || (ord as any)?.status || (ord as any)?.currentState || ''
        } catch {}

        // Render per order type strictly and align current step to order status, with strong fallbacks
        // Mirror workflow states directly as onboarding steps
        setSteps(buildStepsFromWorkflow(resolvedOrderType, resolvedOrderStatus || 'created'))
        } catch {}
      } catch (e: any) {
        setError(e?.response?.data?.error?.message || e?.message || 'Failed to load onboarding')
      } finally {
        setLoading(false)
      }
    }
    if (onboardingId) void run()
  }, [onboardingId])

  // Manual step progression removed; steps are derived from backend + order sync

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log("[v0] Adding note:", newNote)
      setNewNote("")
      // Implementation would add the note
    }
  }

  const onboardingCustomerId = (data as any)?.customer_id || (data as any)?.customerId || (data as any)?.customer?.id || null
  // Prefer onboarding-linked order; else fall back to latest order for the onboarding's customer
  let relatedOrderId = (data as any)?.order_id || (data as any)?.orderId || (data as any)?.order?.id || null
  if (!relatedOrderId && onboardingCustomerId && Array.isArray(orderItems)) {
    const candidates = orderItems.filter((o: any) => {
      const cid = o?.customer_id ?? o?.customerId
      return cid && String(cid) === String(onboardingCustomerId)
    })
    if (candidates.length > 0) {
      candidates.sort((a: any, b: any) => new Date(b?.created_at ?? b?.createdAt ?? 0).getTime() - new Date(a?.created_at ?? a?.createdAt ?? 0).getTime())
      relatedOrderId = candidates[0]?.id || null
    }
  }
  // Resolve the related order object from orders list if possible (for accurate order number)
  const relatedOrderObj = Array.isArray(orderItems) && relatedOrderId
    ? orderItems.find((o: any) => String(o?.id) === String(relatedOrderId))
    : null
  const relatedOrderNumber = (relatedOrderObj as any)?.order_number
    || (relatedOrderObj as any)?.orderNumber
    || (data as any)?.order_number
    || (data as any)?.orderNumber
    || (data as any)?.order?.order_number
    || (data as any)?.order?.orderNumber
    || '-'
  const customerFirst = (customerDetails as any)?.first_name || (data as any)?.customer?.first_name || (data as any)?.customer_first_name || ''
  const customerLast = (customerDetails as any)?.last_name || (data as any)?.customer?.last_name || (data as any)?.customer_last_name || ''
  const customerEmail = (customerDetails as any)?.email || (data as any)?.customer?.email || (data as any)?.customer_email || ''
  const customerPhone = (customerDetails as any)?.phone || (data as any)?.customer?.phone || (data as any)?.customer_phone || ''
  const customerNumber = (customerDetails as any)?.customer_number || (data as any)?.customer?.customer_number || (data as any)?.customer_number || ''

  // Try to resolve related order details for display
  let relatedOrderServiceType: string | undefined
  let relatedOrderBandwidth: string | undefined
  if (relatedOrderObj) {
    const sd = (relatedOrderObj as any)?.service_details || (relatedOrderObj as any)?.serviceDetails || {}
    relatedOrderServiceType = sd?.serviceType || sd?.service_type
    relatedOrderBandwidth = sd?.bandwidth
  }

  // Assignment details from onboarding row
  const assignedToId = (data as any)?.assigned_to || (data as any)?.assignedTo || (data as any)?.assignee_id || null
  const assignedToName = ((data as any)?.assigned_user && `${(data as any)?.assigned_user?.first_name ?? ''} ${(data as any)?.assigned_user?.last_name ?? ''}`.trim())
    || (data as any)?.assigned_to_name
    || null
  const onboardingType = (data as any)?.onboarding_type || (data as any)?.onboardingType || 'standard'

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/onboarding">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Onboarding
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {loading ? 'Loading...' : (data?.customer?.first_name || '') + ' ' + (data?.customer?.last_name || '')}
                </h1>
                <p className="text-muted-foreground">Onboarding Progress</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Progress</CardTitle>
                  <CardDescription>{loading ? '' : `${computeProgressFromSteps(steps)}% complete`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={loading ? 0 : computeProgressFromSteps(steps)} className="mb-4" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Started: {loading ? '' : (data?.started_at ? new Date(data.started_at).toLocaleDateString() : '-')}</span>
                    <span>
                      Est. Completion: -
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Onboarding Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Steps</CardTitle>
                  <CardDescription>Track progress through each onboarding phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(steps && steps.length > 0 ? steps : []).map((step: any) => (
                      <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{step.name}</h4>
                            <Badge className={getStepStatusColor(step.status)}>{step.status.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                          {step.completedAt && (
                            <div className="text-xs text-muted-foreground mb-2">
                              Completed on {new Date(step.completedAt).toLocaleDateString()} by{" "}
                              {step.completedBy?.firstName} {step.completedBy?.lastName}
                            </div>
                          )}
                          {step.notes && (
                            <div className="text-sm bg-muted p-2 rounded">
                              <strong>Notes:</strong> {step.notes}
                            </div>
                          )}
                          {/* Progress tracker only; manual step updates disabled */}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Note</CardTitle>
                  <CardDescription>Add progress notes or updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note">Note</Label>
                      <Textarea
                        id="note"
                        placeholder="Add a note about the onboarding progress..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Customer Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{loading ? '' : `${customerFirst} ${customerLast}`}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Number</p>
                    <p className="text-sm">{loading ? '' : customerNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{loading ? '' : customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm">{loading ? '' : customerPhone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                    <p className="text-sm">{loading ? '' : relatedOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                    <p className="text-sm">{loading ? '' : (relatedOrderServiceType || '-')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Package</p>
                    <p className="text-sm">{loading ? '' : (relatedOrderBandwidth || '-')}</p>
                  </div>
                  {relatedOrderId ? (
                    <Link to={`/orders/${relatedOrderId}`}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Order Details
                    </Button>
                  </Link>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>
                      Order not linked
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="text-sm">
                      {loading ? '' : (assignedToName || (assignedToId ? `User ${assignedToId}` : 'Unassigned'))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge variant="outline">{String(onboardingType).replace("_", " ")}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
