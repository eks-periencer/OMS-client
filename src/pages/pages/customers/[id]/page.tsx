"use client"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Badge } from "../../../../components/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/components/ui/table"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Package, Clock } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getCustomer, type Customer } from "../../../../../lib/api/customers"

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

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        if (id) {
          const data = await getCustomer(id)
          if (mounted) setCustomer(data)
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load customer')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void run()
    return () => { mounted = false }
  }, [id])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {loading && (
            <div className="space-y-4">
              <div className="h-8 w-64 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="h-40 bg-muted rounded animate-pulse" />
                  <div className="h-40 bg-muted rounded animate-pulse" />
                </div>
                <div className="lg:col-span-2 h-72 bg-muted rounded animate-pulse" />
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="text-sm text-red-600 mb-4">{error}</div>
          )}
          {!loading && !customer && (
            <div className="space-y-4">
              <div className="text-xl font-semibold">Customer not found</div>
              <Link to="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Customers
                </Button>
              </Link>
            </div>
          )}
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Customers
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block h-7 w-48 bg-muted rounded animate-pulse" />
                  ) : (
                    <>
                      {customer?.first_name} {customer?.last_name}
                    </>
                  )}
                </h1>
                <p className="text-muted-foreground">
                  {loading ? (
                    <span className="inline-block h-4 w-32 bg-muted rounded animate-pulse" />
                  ) : (
                    customer?.customer_number
                  )}
                </p>
              </div>
            </div>
            <Link to={`/customers/${id}/edit`}>
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
                      <p className="font-medium">{customer?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{customer?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge variant="outline">{customer?.customer_type}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{customer ? new Date(customer.created_at).toLocaleDateString() : ''}</p>
                    </div>
                  </div>

                  {customer?.is_trial && (
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
                      <p className="font-medium">{customer?.address?.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer?.address?.city}, {customer?.address?.state}
                      </p>
                      <p className="text-sm text-muted-foreground">{customer?.address?.postal_code}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {customer?.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{(customer as any).notes}</p>
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
                  {Array.isArray((customer as any)?.orders) && (customer as any).orders.length > 0 ? (
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
                        {(customer as any).orders.map((order: any) => (
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
                                {order.currentState?.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                              {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>
                              <Link to={`/orders/${order.id}`}>
                                <Button variant="ghost" size="sm">
                                  View Order
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-muted-foreground">No orders found for this customer.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
