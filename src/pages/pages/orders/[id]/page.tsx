import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Badge } from "../../../../components/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/components/ui/tabs"
import { ArrowLeft, Edit, Clock, MapPin, User, Package, Network, AlertTriangle, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useOrders } from "../../../../../hooks/useOrders"
import { OrderStatusManager } from "../../../../components/components/orders/OrderStatusManager"
import { OrderWorkflowManager } from "../../../../components/components/orders/OrderWorkflowManager"
import { OrderSlaMonitor } from "../../../../components/components/orders/OrderSlaMonitor"
import { OrderEnrichmentForm } from "../../../../components/components/orders/OrderEnrichmentForm"
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

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getOrder, getOrderWorkflowHistory } = useOrders()
  const [order, setOrder] = useState<any>(null)
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshOrder = async () => {
    if (!id) return
    
    try {
      const [orderData, historyData] = await Promise.all([
        getOrder(id),
        getOrderWorkflowHistory(id)
      ])
      
      setOrder(orderData)
      setWorkflowHistory(historyData || [])
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
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
                      <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                      <p className="text-sm">{order.customer_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Order Type</p>
                      <p className="text-sm">{order.order_type || "N/A"}</p>
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
                              Actor: {entry.actorId || "System"}
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
                <OrderSlaMonitor order={order} />
                <OrderStatusManager order={order} onUpdate={refreshOrder} />
                <OrderWorkflowManager order={order} onUpdate={refreshOrder} />
              </div>
            </TabsContent>

            <TabsContent value="enrichment">
              <OrderEnrichmentForm order={order} onUpdate={refreshOrder} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}