"use client"

// import { useAuth } from "../../../../lib/auth"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Badge } from "../../../components/components/ui/badge"
import { Button } from "../../../components/components/ui/button"
import { Package, Users, AlertTriangle, Clock, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { getDashboard, type DashboardEscalation, type DashboardOrder, type DashboardSummary } from "../../../../lib/api/dashboard"
import { listOrders, type OrderItem } from "../../../../lib/api/orders"

// Live state
const initialSummary: DashboardSummary = { totalOrders: 0, activeOrders: 0, escalations: 0, trialCustomers: 0, ordersToday: 0 }

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
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "normal":
      return "bg-blue-100 text-blue-800"
    case "low":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function DashboardPage() {
  // const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary)
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [escalations, setEscalations] = useState<DashboardEscalation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const combined = await getDashboard()
        if (!mounted) return
        setSummary(combined.summary)
        setEscalations(combined.pendingEscalations)
        setLastRefreshedAt(new Date())
      } catch (e: any) {
        if (!mounted) return
        // Avoid cascading 404s: only use the combined endpoint for now
        const status = e?.response?.status
        if (status === 404) {
          setError('Dashboard API is not available on the server (404).')
        } else {
          setError((e as Error)?.message || 'Failed to load dashboard')
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Live-refresh recent orders from GET /orders (top 5 by created_at desc) every 15s
  useEffect(() => {
    let mounted = true
    const refreshRecent = async () => {
      try {
        const all = await listOrders()
        const top5 = (all || []).sort((a: OrderItem, b: OrderItem) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).slice(0, 5)
        const latest: DashboardOrder[] = top5.map(o => ({
          id: o.id,
          orderNumber: String(o.order_number || ''),
          priority: (o.priority as any) || 'normal',
          customerName: o.customer ? `${o.customer.first_name || ''} ${o.customer.last_name || ''}`.trim() : undefined,
          serviceType: String(o.service_type || (o.service_details as any)?.serviceType || 'Unknown'),
          status: String(o.current_state || 'created'),
          createdAt: String(o.created_at || '')
        }))
        if (!mounted) return
        // Normalize defensive defaults
        const normalized = (latest || []).map(o => ({
          ...o,
          status: String(o.status || '').toLowerCase() || 'created',
          serviceType: o.serviceType || 'Unknown',
          priority: (o.priority as any) || 'normal'
        }))
        setOrders(normalized)
        setLastRefreshedAt(new Date())
      } catch (e) {
        // Ignore transient errors during background refresh
      }
    }
    const id = setInterval(refreshRecent, 15000)
    // Fire once on mount for quicker correction if cache was stale
    refreshRecent()
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const formatWhen = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const diff = Math.max(0, Date.now() - d.getTime())
    const mins = Math.round(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    const rem = mins % 60
    return rem ? `${hours}h ${rem}m ago` : `${hours}h ago`
  }
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />


      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 container mx-auto min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
            </div>
            <Link to="/orders/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-5 w-16 bg-muted rounded animate-pulse" />
                  ) : (
                    summary.totalOrders
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? (
                    <span className="inline-block h-3 w-20 bg-muted rounded animate-pulse align-middle" />
                  ) : (
                    <>+{summary.ordersToday} today</>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-5 w-12 bg-muted rounded animate-pulse" />
                  ) : (
                    summary.activeOrders
                  )}
                </div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-5 w-12 bg-muted rounded animate-pulse" />
                  ) : (
                    summary.escalations
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Pending resolution</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-5 w-12 bg-muted rounded animate-pulse" />
                  ) : (
                    summary.trialCustomers
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Active trials</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))] gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders in the system {lastRefreshedAt ? `· refreshed ${formatWhen(lastRefreshedAt.toISOString())}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-sm text-red-600 mb-3">{error}</div>
                )}
                <div className="space-y-4">
                  {isLoading && (
                    <>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={`sk-order-${i}`} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                          </div>
                          <span className="h-5 w-20 bg-muted rounded animate-pulse" />
                        </div>
                      ))}
                    </>
                  )}
                  {!isLoading && orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{order.orderNumber}</span>
                          <Badge className={getPriorityColor(String(order.priority))}>{String(order.priority)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName || (order as any).customer}</p>
                        <p className="text-xs text-muted-foreground">{order.serviceType} • {formatWhen(order.createdAt)}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{(order.status || '').replace(/_/g, " ") || 'created'}</Badge>
                    </div>
                  ))}
                  {!isLoading && orders.length === 0 && (
                    <div className="text-sm text-muted-foreground">No recent orders</div>
                  )}
                </div>
                <div className="mt-4">
                  <Link to="/orders">
                    <Button variant="outline" className="w-full bg-transparent">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Pending Escalations */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Escalations</CardTitle>
                <CardDescription>Orders requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading && (
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`sk-esc-${i}`} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <span className="h-5 w-16 bg-muted rounded animate-pulse" />
                          </div>
                          <div className="h-3 w-48 bg-muted rounded animate-pulse mb-2" />
                          <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                        </div>
                      ))}
                    </>
                  )}
                  {!isLoading && escalations.map((escalation) => (
                    <div key={escalation.id} className="p-3 border rounded-lg border-orange-200 bg-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{escalation.orderNumber}</span>
                        <Badge variant="destructive">Level {String(escalation.level)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{escalation.customerName || (escalation as any).customer}</p>
                      <p className="text-sm">{escalation.issue || (escalation as any).reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">Aging: {escalation.aging || `${escalation.agingHours ?? 0} hours`}</p>
                    </div>
                  ))}
                  {!isLoading && escalations.length === 0 && (
                    <div className="text-sm text-muted-foreground">No pending escalations</div>
                  )}
                </div>
                <div className="mt-4">
                  <Link to="/escalations">
                    <Button variant="outline" className="w-full bg-transparent">
                      View All Escalations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
