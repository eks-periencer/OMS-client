"use client"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Package, Clock } from "lucide-react"
import Link from "next/link"

// Mock customer data
const mockCustomer = {
  id: "1",
  customerNumber: "CUST-001",
  firstName: "John",
  lastName: "Smith",
  email: "john@example.com",
  phone: "+27123456789",
  customerType: "individual",
  isTrial: false,
  address: {
    street: "123 Main Street",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001",
  },
  createdAt: "2025-01-08T10:30:00Z",
  notes: "VIP customer, prefers morning installations",
  orders: [
    {
      id: "1",
      orderNumber: "ORD-2025-001",
      serviceType: "Fiber",
      servicePackage: "Premium 100Mbps",
      currentState: "active",
      createdAt: "2025-01-08T10:30:00Z",
      completedAt: "2025-01-10T14:20:00Z",
    },
    {
      id: "2",
      orderNumber: "ORD-2025-015",
      serviceType: "Fiber",
      servicePackage: "Business 200Mbps",
      currentState: "in_progress",
      createdAt: "2025-01-09T09:15:00Z",
      completedAt: null,
    },
  ],
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const customer = mockCustomer // In real app, fetch by params.id

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Customers
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {customer.firstName} {customer.lastName}
                </h1>
                <p className="text-muted-foreground">{customer.customerNumber}</p>
              </div>
            </div>
            <Link href={`/customers/${customer.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Customer
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge variant="outline">{customer.customerType}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {customer.isTrial && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trial Status</p>
                        <Badge className="bg-blue-100 text-blue-800">Active Trial</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">{customer.address.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.address.city}, {customer.address.province}
                      </p>
                      <p className="text-sm text-muted-foreground">{customer.address.postalCode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {customer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{customer.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Orders History */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>All orders for this customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.serviceType}</p>
                              <p className="text-sm text-muted-foreground">{order.servicePackage}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                order.currentState === "active"
                                  ? "bg-green-100 text-green-800"
                                  : order.currentState === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {order.currentState.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                View Order
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
