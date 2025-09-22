"use client"

import { useAuth } from "../../../../lib/auth"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Badge } from "../../../components/components/ui/badge"
import { Button } from "../../../components/components/ui/button"
import { Package, Users, AlertTriangle, Clock, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { getDashboard, getDashboardSummary, getPendingEscalations, getRecentOrders, type DashboardEscalation, type DashboardOrder, type DashboardSummary } from "../../../../lib/api/dashboard"

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
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary)
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [escalations, setEscalations] = useState<DashboardEscalation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const combined = await getDashboard()
        if (!mounted) return
        setSummary(combined.summary)
        setOrders(combined.recentOrders)
        setEscalations(combined.pendingEscalations)
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
                <div className="text-2xl font-bold">{isLoading ? '—' : summary.totalOrders}</div>
                <p className="text-xs text-muted-foreground">+{isLoading ? '—' : summary.ordersToday} today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '—' : summary.activeOrders}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '—' : summary.escalations}</div>
                <p className="text-xs text-muted-foreground">Pending resolution</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '—' : summary.trialCustomers}</div>
                <p className="text-xs text-muted-foreground">Active trials</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))] gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-sm text-red-600 mb-3">{error}</div>
                )}
                <div className="space-y-4">
                  {(isLoading ? [] : orders).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{order.orderNumber}</span>
                          <Badge className={getPriorityColor(String(order.priority))}>{String(order.priority)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName || (order as any).customer}</p>
                        <p className="text-xs text-muted-foreground">{order.serviceType}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{order.status.replace(/_/g, " ")}</Badge>
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
                  {(isLoading ? [] : escalations).map((escalation) => (
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
