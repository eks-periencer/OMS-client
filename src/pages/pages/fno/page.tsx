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
import { Plus, Search, Settings, Network, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Link } from "react-router-dom"

// Mock FNO data
const mockFNOs = [
  {
    id: "1",
    name: "Openserve",
    code: "OS",
    integrationType: "api",
    apiEndpoint: "https://api.openserve.co.za",
    portalUrl: "https://portal.openserve.co.za",
    coverageAreas: ["Western Cape", "Gauteng", "KwaZulu-Natal"],
    isActive: true,
    lastSync: "2025-01-09T14:30:00Z",
    status: "connected",
    ordersSubmitted: 145,
    successRate: 98.6,
  },
  {
    id: "2",
    name: "Vumatel",
    code: "VUM",
    integrationType: "manual",
    portalUrl: "https://portal.vumatel.co.za",
    coverageAreas: ["Western Cape", "Gauteng"],
    isActive: true,
    lastSync: null,
    status: "active",
    ordersSubmitted: 89,
    successRate: 95.5,
  },
  {
    id: "3",
    name: "Frogfoot Networks",
    code: "FF",
    integrationType: "manual",
    portalUrl: "https://portal.frogfoot.com",
    coverageAreas: ["Western Cape", "Eastern Cape"],
    isActive: true,
    lastSync: null,
    status: "active",
    ordersSubmitted: 67,
    successRate: 92.5,
  },
  {
    id: "4",
    name: "MetroFibre",
    code: "MF",
    integrationType: "api",
    apiEndpoint: "https://api.metrofibre.co.za",
    portalUrl: "https://portal.metrofibre.co.za",
    coverageAreas: ["Western Cape", "Gauteng", "KwaZulu-Natal"],
    isActive: false,
    lastSync: "2025-01-08T09:15:00Z",
    status: "error",
    ordersSubmitted: 23,
    successRate: 87.0,
  },
]

const mockIntegrationLogs = [
  {
    id: "1",
    fnoName: "Openserve",
    orderNumber: "ORD-2025-001",
    action: "submit",
    status: "success",
    responseTime: 1250,
    timestamp: "2025-01-09T14:30:00Z",
    details: "Order submitted successfully",
  },
  {
    id: "2",
    fnoName: "MetroFibre",
    orderNumber: "ORD-2025-002",
    action: "status_update",
    status: "error",
    responseTime: 5000,
    timestamp: "2025-01-09T14:25:00Z",
    details: "Connection timeout",
  },
  {
    id: "3",
    fnoName: "Vumatel",
    orderNumber: "ORD-2025-003",
    action: "manual_submit",
    status: "success",
    responseTime: null,
    timestamp: "2025-01-09T14:20:00Z",
    details: "Manual application completed",
  },
]

const fnoStats = {
  totalFNOs: 4,
  activeFNOs: 1,
  apiIntegrations: 2,
  manualIntegrations: 2,
  totalOrders: 324,
  averageSuccessRate: 93.4,
}

function getStatusColor(status: string) {
  switch (status) {
    case "connected":
      return "bg-green-100 text-green-800"
    case "active":
      return "bg-blue-100 text-blue-800"
    case "error":
      return "bg-red-100 text-red-800"
    case "disconnected":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "connected":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "active":
      return <CheckCircle className="h-4 w-4 text-blue-600" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case "disconnected":
      return <Clock className="h-4 w-4 text-gray-400" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getLogStatusColor(status: string) {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800"
    case "error":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function FNOPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredFNOs = mockFNOs.filter((fno) => {
    const matchesSearch =
      fno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fno.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || fno.integrationType === typeFilter
    const matchesStatus = statusFilter === "all" || fno.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const handleTestConnection = (fnoId: string) => {
    console.log("[v0] Testing connection for FNO:", fnoId)
    // Implementation would test the FNO connection
  }

  const handleSyncStatus = (fnoId: string) => {
    console.log("[v0] Syncing status for FNO:", fnoId)
    // Implementation would sync order statuses
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FNO Management</h1>
              <p className="text-gray-600">Manage Fiber Network Operator integrations and configurations</p>
            </div>
            <Link to="/fno/create">
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="mr-2 h-4 w-4" />
                Add FNO
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total FNOs</CardTitle>
                <Network className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{fnoStats.totalFNOs}</div>
                <p className="text-xs text-gray-500">{fnoStats.activeFNOs} active</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">API Integrations</CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{fnoStats.apiIntegrations}</div>
                <p className="text-xs text-gray-500">{fnoStats.manualIntegrations} manual</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Orders Processed</CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{fnoStats.totalOrders}</div>
                <p className="text-xs text-gray-500">this month</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Success Rate</CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{fnoStats.averageSuccessRate}%</div>
                <p className="text-xs text-gray-500">average</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="fnos" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="fnos" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">FNO Configuration</TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">Integration Logs</TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="fnos" className="space-y-6">
              {/* Filters */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-800">Filters</CardTitle>
                  <CardDescription className="text-gray-500">Search and filter FNO configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search FNOs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white border-gray-200 text-gray-700 placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-48 bg-white border-gray-200 text-gray-700">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="api">API Integration</SelectItem>
                        <SelectItem value="manual">Manual Integration</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48 bg-white border-gray-200 text-gray-700">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="connected">Connected</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="disconnected">Disconnected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* FNO Table */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-800">FNO Configurations ({filteredFNOs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 font-medium">FNO</TableHead>
                        <TableHead className="text-gray-700 font-medium">Type</TableHead>
                        <TableHead className="text-gray-700 font-medium">Status</TableHead>
                        <TableHead className="text-gray-700 font-medium">Coverage Areas</TableHead>
                        <TableHead className="text-gray-700 font-medium">Orders</TableHead>
                        <TableHead className="text-gray-700 font-medium">Success Rate</TableHead>
                        <TableHead className="text-gray-700 font-medium">Last Sync</TableHead>
                        <TableHead className="text-gray-700 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFNOs.map((fno) => (
                        <TableRow key={fno.id} className="border-gray-200">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(fno.status)}
                              <div>
                                <div className="font-bold text-gray-900">{fno.name}</div>
                                <div className="text-sm text-gray-500">{fno.code}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize border-gray-200 text-gray-700 bg-gray-50">
                              {fno.integrationType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(fno.status)}>{fno.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-800">
                              {fno.coverageAreas.slice(0, 2).join(", ")}
                              {fno.coverageAreas.length > 2 && ` + ${fno.coverageAreas.length - 2} more`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">{fno.ordersSubmitted}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-800">{fno.successRate}%</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-800">
                              {fno.lastSync ? new Date(fno.lastSync).toLocaleDateString() : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link to={`/fno/${fno.id}`}>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </Link>
                              {fno.integrationType === "api" && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleTestConnection(fno.id)} className="text-gray-800 hover:text-gray-900">
                                    Test
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleSyncStatus(fno.id)} className="text-gray-800 hover:text-gray-900">
                                    Sync
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Logs</CardTitle>
                  <CardDescription>Recent FNO integration activity and API calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>FNO</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockIntegrationLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">{new Date(log.timestamp).toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{log.fnoName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{log.orderNumber}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getLogStatusColor(log.status)}>{log.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{log.responseTime ? `${log.responseTime}ms` : "N/A"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">{log.details}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Performance</CardTitle>
                    <CardDescription>Response times and success rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFNOs
                      .filter((fno) => fno.integrationType === "api")
                      .map((fno) => (
                        <div key={fno.id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{fno.name}</span>
                            <div className="text-sm text-muted-foreground">{fno.status}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{fno.successRate}%</div>
                            <div className="text-sm text-muted-foreground">{fno.ordersSubmitted} orders</div>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Manual Processing</CardTitle>
                    <CardDescription>Manual integration statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFNOs
                      .filter((fno) => fno.integrationType === "manual")
                      .map((fno) => (
                        <div key={fno.id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{fno.name}</span>
                            <div className="text-sm text-muted-foreground">{fno.status}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{fno.successRate}%</div>
                            <div className="text-sm text-muted-foreground">{fno.ordersSubmitted} orders</div>
                          </div>
                        </div>
                      ))}
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
