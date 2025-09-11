"use client"
import { useParams } from "react-router-dom"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Badge } from "../../../../components/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/components/ui/tabs"
import { ArrowLeft, Edit, Clock, MapPin, User, Package, Network, AlertTriangle } from "lucide-react"
import {Link} from "react-router-dom"

// Mock order data
const mockOrder = {
  id: "1",
  orderNumber: "ORD-2025-001",
  customer: {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    phone: "+27123456789",
    customerNumber: "CUST-001",
  },
  serviceType: "Fiber",
  servicePackage: "Premium 100Mbps",
  installationAddress: {
    street: "123 Main Street",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001",
  },
  currentState: "in_progress",
  priority: "high",
  fno: {
    id: "1",
    name: "Openserve",
    code: "OS",
    integrationType: "api",
  },
  fnoReference: "OS-REF-12345",
  createdBy: {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@ispoms.com",
  },
  assignedTo: {
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike@ispoms.com",
  },
  estimatedCompletion: "2025-01-15T00:00:00Z",
  createdAt: "2025-01-09T10:30:00Z",
  updatedAt: "2025-01-09T14:20:00Z",
  notes: "Customer requested installation between 9 AM and 5 PM on weekdays only.",
}

const stateHistory = [
  {
    id: "1",
    fromState: null,
    toState: "created",
    changedBy: { firstName: "Jane", lastName: "Doe" },
    changeReason: "Order created",
    createdAt: "2025-01-09T10:30:00Z",
  },
  {
    id: "2",
    fromState: "created",
    toState: "validated",
    changedBy: { firstName: "System", lastName: "Auto" },
    changeReason: "Automatic validation passed",
    createdAt: "2025-01-09T10:32:00Z",
  },
  {
    id: "3",
    fromState: "validated",
    toState: "fno_submitted",
    changedBy: { firstName: "System", lastName: "Auto" },
    changeReason: "Submitted to Openserve via API",
    createdAt: "2025-01-09T10:35:00Z",
  },
  {
    id: "4",
    fromState: "fno_submitted",
    toState: "in_progress",
    changedBy: { firstName: "Mike", lastName: "Johnson" },
    changeReason: "FNO accepted order and started processing",
    createdAt: "2025-01-09T14:20:00Z",
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

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string

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
                <h1 className="text-3xl font-bold text-foreground">{mockOrder.orderNumber}</h1>
                <p className="text-muted-foreground">Order details and tracking information</p>
              </div>
            </div>
            <Link to={`/orders/${orderId}/edit`}>
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
                <Badge className={`mt-2 ${getStatusColor(mockOrder.currentState)}`}>
                  {mockOrder.currentState.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Priority</span>
                </div>
                <Badge className={`mt-2 ${getPriorityColor(mockOrder.priority)}`}>{mockOrder.priority}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <p className="mt-2 text-sm">{new Date(mockOrder.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Est. Completion</span>
                </div>
                <p className="mt-2 text-sm">{new Date(mockOrder.estimatedCompletion).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="history">State History</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
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
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-sm">
                        {mockOrder.customer.firstName} {mockOrder.customer.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer Number</p>
                      <p className="text-sm">{mockOrder.customer.customerNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{mockOrder.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-sm">{mockOrder.customer.phone}</p>
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
                      <p className="text-sm">{mockOrder.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Package</p>
                      <p className="text-sm">{mockOrder.servicePackage}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created By</p>
                      <p className="text-sm">
                        {mockOrder.createdBy.firstName} {mockOrder.createdBy.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                      <p className="text-sm">
                        {mockOrder.assignedTo.firstName} {mockOrder.assignedTo.lastName}
                      </p>
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
                    <div className="space-y-1">
                      <p className="text-sm">{mockOrder.installationAddress.street}</p>
                      <p className="text-sm">{mockOrder.installationAddress.city}</p>
                      <p className="text-sm">{mockOrder.installationAddress.province}</p>
                      <p className="text-sm">{mockOrder.installationAddress.postalCode}</p>
                    </div>
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
                      <p className="text-sm font-medium text-muted-foreground">FNO</p>
                      <p className="text-sm">
                        {mockOrder.fno.name} ({mockOrder.fno.code})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Integration Type</p>
                      <p className="text-sm capitalize">{mockOrder.fno.integrationType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">FNO Reference</p>
                      <p className="text-sm">{mockOrder.fnoReference || "Not assigned"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {mockOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{mockOrder.notes}</p>
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
                  <div className="space-y-4">
                    {stateHistory.map((entry, index) => (
                      <div key={entry.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(entry.toState)}>{entry.toState.replace("_", " ")}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{entry.changeReason}</p>
                          <p className="text-xs text-muted-foreground">
                            Changed by: {entry.changedBy.firstName} {entry.changedBy.lastName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communications">
              <Card>
                <CardHeader>
                  <CardTitle>Communications</CardTitle>
                  <CardDescription>All communications related to this order</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No communications recorded yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
