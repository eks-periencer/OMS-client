"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { Button } from "../../../components/components/ui/button"
import { Input } from "../../../components/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Badge } from "../../../components/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/components/ui/table"
import { Plus, Search, Eye, Edit, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { useOrders } from "../../../../hooks/useOrders"
// import { toast } from "sonner"
import { Switch } from "../../../components/components/ui/switch"

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

export default function OrdersPage() {
  const { items: orders, loading, error, refresh } = useOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [hideCancelled, setHideCancelled] = useState(false)

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch =
      (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.current_state === statusFilter
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter
    const isCancelled = (order.current_state || '').toLowerCase() === 'cancelled' || (order.current_state || '').toLowerCase() === 'canceled'

    return matchesSearch && matchesStatus && matchesPriority && (!hideCancelled || !isCancelled)
  }), [orders, searchTerm, statusFilter, priorityFilter, hideCancelled])

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={refresh}>Retry</Button>
                </div>
              </CardContent>
            </Card>
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">Orders</h1>
              <p className="text-muted-foreground">Manage and track customer orders</p>
            </div>
            <Link to="/orders/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search orders, customers, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={hideCancelled} onCheckedChange={setHideCancelled} />
                  <span className="text-sm text-muted-foreground">Hide cancelled</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="fno_submitted">FNO Submitted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="installation_scheduled">Installation Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && filteredOrders.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sk-order-${i}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-6 gap-4 w-full">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>FNO</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number || 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.customer?.first_name || ''} {order.customer?.last_name || ''}
                            </div>
                            <div className="text-sm text-muted-foreground">{order.customer?.email || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.service_type || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{order.service_package || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.fno?.name || 'N/A'}</div>
                            {order.fno_reference && (
                              <div className="text-sm text-muted-foreground">{order.fno_reference}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.current_state || 'created')}>
                            {(order.current_state || 'created').replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(order.priority || 'normal')}>{order.priority || 'normal'}</Badge>
                        </TableCell>
                        <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/orders/${order.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/orders/${order.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Order
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
