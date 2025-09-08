"use client"

import { useAuth } from "../../../../lib/auth"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Badge } from "../../../components/components/ui/badge"
import { Button } from "../../../components/components/ui/button"
import { Package, Users, AlertTriangle, Clock, Plus } from "lucide-react"
import { Link } from "react-router-dom"

// Mock data for dashboard
const dashboardStats = {
  totalOrders: 1247,
  activeOrders: 89,
  pendingEscalations: 12,
  trialCustomers: 34,
  todayOrders: 23,
  completionRate: 94.2,
}

const recentOrders = [
  {
    id: "1",
    orderNumber: "ORD-2025-001",
    customer: "John Smith",
    serviceType: "Fiber",
    status: "in_progress",
    priority: "high",
    createdAt: "2025-01-09T10:30:00Z",
  },
  {
    id: "2",
    orderNumber: "ORD-2025-002",
    customer: "Sarah Johnson",
    serviceType: "Wireless",
    status: "fno_submitted",
    priority: "normal",
    createdAt: "2025-01-09T09:15:00Z",
  },
  {
    id: "3",
    orderNumber: "ORD-2025-003",
    customer: "Mike Davis",
    serviceType: "Fiber",
    status: "installation_scheduled",
    priority: "urgent",
    createdAt: "2025-01-09T08:45:00Z",
  },
]

const pendingEscalations = [
  {
    id: "1",
    orderNumber: "ORD-2025-001",
    customer: "John Smith",
    reason: "Installation delayed beyond SLA",
    level: 2,
    agingHours: 6,
  },
  {
    id: "2",
    orderNumber: "ORD-2024-998",
    customer: "Emma Wilson",
    reason: "FNO not responding to queries",
    level: 1,
    agingHours: 3,
  },
]

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
    case "normal":
      return "bg-blue-100 text-blue-800"
    case "low":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.firstName}! Here's what's happening today.</p>
            </div>
            <Link href="/orders/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">+{dashboardStats.todayOrders} today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.activeOrders}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingEscalations}</div>
                <p className="text-xs text-muted-foreground">Pending resolution</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.trialCustomers}</div>
                <p className="text-xs text-muted-foreground">Active trials</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{order.orderNumber}</span>
                          <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.serviceType}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/orders">
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
                  {pendingEscalations.map((escalation) => (
                    <div key={escalation.id} className="p-3 border rounded-lg border-orange-200 bg-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{escalation.orderNumber}</span>
                        <Badge variant="destructive">Level {escalation.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{escalation.customer}</p>
                      <p className="text-sm">{escalation.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">Aging: {escalation.agingHours} hours</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/escalations">
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
