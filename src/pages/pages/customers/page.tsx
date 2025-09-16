"use client"

import { useMemo, useState } from "react"
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
import { useCustomers } from "../../../../hooks/useCustomers"

// Utilities to work with trial in API shape

function getTrialStatus(customer: any) {
  if (!customer.is_trial) return null

  const now = new Date()
  const endDate = new Date(customer.trial_end_date || Date.now())
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining <= 0) return { status: "expired", daysRemaining: 0 }
  if (daysRemaining <= 7) return { status: "expiring", daysRemaining }
  return { status: "active", daysRemaining }
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [trialFilter, setTrialFilter] = useState("all")
  const { customers, stats, loading, error } = useCustomers()

  const filteredCustomers = useMemo(() => (customers || []).filter((customer) => {
    const matchesSearch =
      (customer.customer_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || customer.customer_type === typeFilter
    const matchesTrial =
      trialFilter === "all" ||
      (trialFilter === "trial" && customer.is_trial) ||
      (trialFilter === "regular" && !customer.is_trial)

    return matchesSearch && matchesType && matchesTrial
  }), [customers, searchTerm, typeFilter, trialFilter])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Top loading indicator removed per request */}
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customers</h1>
              <p className="text-muted-foreground">Manage customer accounts and information</p>
            </div>
            <Link to="/customers/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <span className="inline-block h-5 w-16 bg-muted rounded animate-pulse" />
                  ) : (
                    stats?.total ?? 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Customers</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <span className="inline-block h-5 w-16 bg-muted rounded animate-pulse" />
                  ) : (
                    stats?.trial ?? 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
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
                  {loading && (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`skeleton-${idx}`} className="animate-pulse">
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 w-40 bg-muted rounded" />
                            <div className="h-3 w-24 bg-muted rounded" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-3 w-40 bg-muted rounded" />
                            <div className="h-3 w-28 bg-muted rounded" />
                          </div>
                        </TableCell>
                        <TableCell><div className="h-5 w-20 bg-muted rounded-full" /></TableCell>
                        <TableCell><div className="h-5 w-24 bg-muted rounded" /></TableCell>
                        <TableCell><div className="h-3 w-16 bg-muted rounded" /></TableCell>
                        <TableCell><div className="h-3 w-20 bg-muted rounded" /></TableCell>
                        <TableCell>
                          <div className="h-8 w-8 bg-muted rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {!loading && filteredCustomers.map((customer: any) => {
                    const trialStatus = getTrialStatus(customer)
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">{customer.customer_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{customer.email}</div>
                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.customer_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {customer.is_trial ? (
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
                          <div className="text-sm text-muted-foreground">—</div>
                        </TableCell>
                        <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/customers/${customer.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/customers/${customer.id}/edit`}>
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
