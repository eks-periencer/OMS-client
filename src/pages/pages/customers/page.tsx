"use client"

import { useState } from "react"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { Button } from "../../../components/components/ui/button"
import { Input } from "../../../components/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Badge } from "../../../components/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/components/ui/table"
import { Plus, Search, Eye, Edit, MoreHorizontal, Users, UserCheck, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/components/ui/dropdown-menu"
import {Link} from "react-router-dom"

// Mock customers data
const mockCustomers = [
  {
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
    activeOrders: 2,
    totalOrders: 5,
  },
  {
    id: "2",
    customerNumber: "CUST-002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    phone: "+27987654321",
    customerType: "business",
    isTrial: true,
    trialStartDate: "2025-01-05T00:00:00Z",
    trialEndDate: "2025-02-04T00:00:00Z",
    address: {
      street: "456 Business Ave",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2000",
    },
    createdAt: "2025-01-05T14:20:00Z",
    activeOrders: 1,
    totalOrders: 1,
  },
  {
    id: "3",
    customerNumber: "CUST-003",
    firstName: "Mike",
    lastName: "Davis",
    email: "mike@example.com",
    phone: "+27555666777",
    customerType: "individual",
    isTrial: false,
    address: {
      street: "789 Oak Road",
      city: "Durban",
      province: "KwaZulu-Natal",
      postalCode: "4000",
    },
    createdAt: "2025-01-07T09:15:00Z",
    activeOrders: 0,
    totalOrders: 3,
  },
]

function getTrialStatus(customer: any) {
  if (!customer.isTrial) return null

  const now = new Date()
  const endDate = new Date(customer.trialEndDate)
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining <= 0) return { status: "expired", daysRemaining: 0 }
  if (daysRemaining <= 7) return { status: "expiring", daysRemaining }
  return { status: "active", daysRemaining }
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [trialFilter, setTrialFilter] = useState("all")

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || customer.customerType === typeFilter
    const matchesTrial =
      trialFilter === "all" ||
      (trialFilter === "trial" && customer.isTrial) ||
      (trialFilter === "regular" && !customer.isTrial)

    return matchesSearch && matchesType && matchesTrial
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customers</h1>
              <p className="text-muted-foreground">Manage customer accounts and information</p>
            </div>
            <Link href="/customers/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCustomers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Customers</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCustomers.filter((c) => c.isTrial).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCustomers.reduce((sum, c) => sum + c.activeOrders, 0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={trialFilter} onValueChange={setTrialFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by trial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="trial">Trial Customers</SelectItem>
                    <SelectItem value="regular">Regular Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Trial Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const trialStatus = getTrialStatus(customer)
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{customer.customerNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{customer.email}</div>
                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.customerType}</Badge>
                        </TableCell>
                        <TableCell>
                          {customer.isTrial ? (
                            <div>
                              <Badge
                                className={
                                  trialStatus?.status === "expired"
                                    ? "bg-red-100 text-red-800"
                                    : trialStatus?.status === "expiring"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-blue-100 text-blue-800"
                                }
                              >
                                {trialStatus?.status === "expired"
                                  ? "Expired"
                                  : trialStatus?.status === "expiring"
                                    ? "Expiring Soon"
                                    : "Active Trial"}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {trialStatus?.daysRemaining} days remaining
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">Regular</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{customer.activeOrders} active</div>
                            <div className="text-xs text-muted-foreground">{customer.totalOrders} total</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Customer
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
