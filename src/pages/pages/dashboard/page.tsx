import { useAuth } from "../../../../lib/auth";
import { Sidebar } from "../../../components/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card";
import { Badge } from "../../../components/components/ui/badge";
import { Button } from "../../../components/components/ui/button";
import { Package, Users, AlertTriangle, Clock, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// Mock data for dashboard
const dashboardStats = {
  totalOrders: 1247,
  activeOrders: 89,
  pendingEscalations: 12,
  trialCustomers: 34,
  todayOrders: 23,
  completionRate: 94.2,
};

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
];

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
];


function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
      case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "fno_submitted":
      return "bg-yellow-100 text-yellow-800";
    case "installation_scheduled":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "normal":
      return "bg-blue-100 text-blue-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between h-16 px-6 lg:px-8">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Welcome back, {user?.firstName}! Here's what's happening today.
              </p>
            </div>
            <Link to="/orders/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Order</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 lg:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Total Orders
                </CardTitle>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.totalOrders.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  +{dashboardStats.todayOrders} today
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Active Orders
                </CardTitle>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.activeOrders}
                </div>
                <p className="text-sm text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Escalations
                </CardTitle>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.pendingEscalations}
                </div>
                <p className="text-sm text-muted-foreground">Pending resolution</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Trial Customers
                </CardTitle>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.trialCustomers}
                </div>
                <p className="text-sm text-muted-foreground">Active trials</p>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Orders */}
            <Card className="flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                <CardDescription>Latest orders in the system</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-sm truncate">
                            {order.orderNumber}
                          </span>
                          <Badge
                            className={`${getPriorityColor(order.priority)} text-xs`}
                          >
                            {order.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.serviceType}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(order.status)} ml-3 whitespace-nowrap text-xs`}
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <Link to="/orders" className="block">
                    <Button variant="outline" className="w-full">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Pending Escalations */}
            <Card className="flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg font-semibold">Pending Escalations</CardTitle>
                <CardDescription>Orders requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-3">
                  {pendingEscalations.map((escalation) => (
                    <div
                      key={escalation.id}
                      className="p-4 border border-orange-200 rounded-lg bg-orange-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {escalation.orderNumber}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          Level {escalation.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {escalation.customer}
                      </p>
                      <p className="text-sm text-gray-800">{escalation.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        Aging: {escalation.agingHours} hours
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <Link to="/escalations" className="block">
                    <Button variant="outline" className="w-full">
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
  );
}