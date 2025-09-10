"use client"

import { useState } from "react"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { Button } from "../../../components/components/ui/button"
import { Input } from "../../../components/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Badge } from "../../../components/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/components/ui/tabs"
import { Search, Inbox, Clock, AlertTriangle, CheckCircle, User, ExternalLink, Eye } from "lucide-react"
import { Link } from "react-router-dom"

// Mock application inbox data
const mockApplications = [
  {
    id: "1",
    order: {
      id: "1",
      orderNumber: "ORD-2025-001",
      customer: {
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        phone: "+27123456789",
      },
      serviceType: "Fiber",
      servicePackage: "Premium 100Mbps",
      installationAddress: {
        street: "123 Main Street",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "8001",
      },
    },
    fno: {
      id: "2",
      name: "Vumatel",
      code: "VUM",
      portalUrl: "https://portal.vumatel.co.za",
    },
    assignedTo: {
      id: "1",
      firstName: "Sarah",
      lastName: "Admin",
    },
    priority: "high",
    status: "pending",
    dueDate: "2025-01-10T17:00:00Z",
    createdAt: "2025-01-09T10:30:00Z",
    agingHours: 6,
    notes: "Customer requires installation between 9-11 AM",
  },
  {
    id: "2",
    order: {
      id: "2",
      orderNumber: "ORD-2025-002",
      customer: {
        firstName: "Emma",
        lastName: "Wilson",
        email: "emma@example.com",
        phone: "+27987654321",
      },
      serviceType: "Fiber",
      servicePackage: "Business 200Mbps",
      installationAddress: {
        street: "456 Business Ave",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2000",
      },
    },
    fno: {
      id: "3",
      name: "Frogfoot Networks",
      code: "FF",
      portalUrl: "https://portal.frogfoot.com",
    },
    assignedTo: {
      id: "2",
      firstName: "Mike",
      lastName: "Processor",
    },
    priority: "urgent",
    status: "in_progress",
    dueDate: "2025-01-09T17:00:00Z",
    createdAt: "2025-01-08T14:20:00Z",
    agingHours: 24,
    notes: "Business customer - priority processing required",
  },
  {
    id: "3",
    order: {
      id: "3",
      orderNumber: "ORD-2025-003",
      customer: {
        firstName: "David",
        lastName: "Brown",
        email: "david@example.com",
        phone: "+27555666777",
      },
      serviceType: "Wireless",
      servicePackage: "Standard 50Mbps",
      installationAddress: {
        street: "789 Oak Road",
        city: "Durban",
        province: "KwaZulu-Natal",
        postalCode: "4000",
      },
    },
    fno: {
      id: "2",
      name: "Vumatel",
      code: "VUM",
      portalUrl: "https://portal.vumatel.co.za",
    },
    assignedTo: null,
    priority: "normal",
    status: "pending",
    dueDate: "2025-01-11T17:00:00Z",
    createdAt: "2025-01-09T09:15:00Z",
    agingHours: 8,
    notes: null,
  },
]

const mockCompletedApplications = [
  {
    id: "4",
    order: {
      orderNumber: "ORD-2025-004",
      customer: { firstName: "Alice", lastName: "Cooper" },
    },
    fno: { name: "Vumatel", code: "VUM" },
    fnoReference: "VUM-REF-12345",
    completedBy: { firstName: "Sarah", lastName: "Admin" },
    completedAt: "2025-01-08T16:30:00Z",
    processingTime: "2h 15m",
  },
  {
    id: "5",
    order: {
      orderNumber: "ORD-2025-005",
      customer: { firstName: "Bob", lastName: "Johnson" },
    },
    fno: { name: "Frogfoot Networks", code: "FF" },
    fnoReference: "FF-APP-67890",
    completedBy: { firstName: "Mike", lastName: "Processor" },
    completedAt: "2025-01-08T14:45:00Z",
    processingTime: "1h 30m",
  },
]

const inboxStats = {
  totalPending: 15,
  assignedToMe: 8,
  overdue: 3,
  highPriority: 5,
  completedToday: 12,
  averageProcessingTime: "2h 45m",
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

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "overdue":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getAgingColor(hours: number) {
  if (hours >= 24) return "text-red-600"
  if (hours >= 12) return "text-orange-600"
  if (hours >= 6) return "text-yellow-600"
  return "text-green-600"
}

export default function ApplicationAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")

  const filteredApplications = mockApplications.filter((app) => {
    const matchesSearch =
      app.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.order.customer.firstName} ${app.order.customer.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.fno.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter
    const matchesAssignee =
      assigneeFilter === "all" ||
      (assigneeFilter === "me" && app.assignedTo?.id === "1") ||
      (assigneeFilter === "unassigned" && !app.assignedTo)

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Application Administrator Inbox</h1>
              <p className="text-muted-foreground">Manage manual FNO applications and processing tasks</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inboxStats.totalPending}</div>
                <p className="text-xs text-muted-foreground">{inboxStats.assignedToMe} assigned to me</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{inboxStats.overdue}</div>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{inboxStats.highPriority}</div>
                <p className="text-xs text-muted-foreground">Urgent processing needed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{inboxStats.completedToday}</div>
                <p className="text-xs text-muted-foreground">Avg: {inboxStats.averageProcessingTime}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Pending Applications</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Search and filter pending applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        <SelectItem value="me">Assigned to Me</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Applications Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Applications ({filteredApplications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>FNO</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Aging</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{app.order.orderNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {app.order.serviceType} - {app.order.servicePackage}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {app.order.customer.firstName} {app.order.customer.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{app.order.customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div>
                                <div className="font-medium">{app.fno.name}</div>
                                <div className="text-sm text-muted-foreground">{app.fno.code}</div>
                              </div>
                              <Link href={app.fno.portalUrl} target="_blank">
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(app.priority)}>{app.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>{app.status.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            {app.assignedTo ? (
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {app.assignedTo.firstName} {app.assignedTo.lastName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={`text-sm font-medium ${getAgingColor(app.agingHours)}`}>
                              {app.agingHours}h
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(app.dueDate).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/application-admin/${app.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Process
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Completed Applications</CardTitle>
                  <CardDescription>Applications processed in the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>FNO</TableHead>
                        <TableHead>FNO Reference</TableHead>
                        <TableHead>Completed By</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead>Completed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCompletedApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="font-medium">{app.order.orderNumber}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {app.order.customer.firstName} {app.order.customer.lastName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{app.fno.name}</div>
                              <div className="text-sm text-muted-foreground">{app.fno.code}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{app.fnoReference}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {app.completedBy.firstName} {app.completedBy.lastName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{app.processingTime}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(app.completedAt).toLocaleString()}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Performance</CardTitle>
                    <CardDescription>Application processing metrics and trends</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Processing Time</span>
                      <span className="text-sm">{inboxStats.averageProcessingTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Applications Completed Today</span>
                      <span className="text-sm">{inboxStats.completedToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Backlog</span>
                      <span className="text-sm">{inboxStats.totalPending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Overdue Applications</span>
                      <span className="text-sm text-red-600">{inboxStats.overdue}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>FNO Distribution</CardTitle>
                    <CardDescription>Applications by FNO provider</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Vumatel</span>
                      <span className="text-sm">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Frogfoot Networks</span>
                      <span className="text-sm">35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Other FNOs</span>
                      <span className="text-sm">20%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
