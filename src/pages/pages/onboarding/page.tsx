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
import { Progress } from "../../../components/components/ui/progress"
import { Plus, Search, Eye, UserCheck, TrendingUp, Users, Calendar } from "lucide-react"
import { Link } from "react-router-dom"

// Mock onboarding data
const mockOnboardingCustomers = [
  {
    id: "1",
    customer: {
      id: "1",
      firstName: "Alice",
      lastName: "Cooper",
      email: "alice@example.com",
      customerNumber: "CUST-004",
    },
    onboardingType: "new_customer",
    currentStep: "equipment_delivery",
    completionPercentage: 60,
    assignedTo: { firstName: "Sarah", lastName: "Manager" },
    startedAt: "2025-01-08T10:00:00Z",
    estimatedCompletion: "2025-01-15T00:00:00Z",
    status: "in_progress",
  },
  {
    id: "2",
    customer: {
      id: "2",
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@example.com",
      customerNumber: "CUST-005",
    },
    onboardingType: "trial",
    currentStep: "activation",
    completionPercentage: 80,
    assignedTo: { firstName: "Mike", lastName: "Success" },
    startedAt: "2025-01-06T14:30:00Z",
    estimatedCompletion: "2025-01-12T00:00:00Z",
    status: "in_progress",
  },
]

const mockTrialCustomers = [
  {
    id: "1",
    customerNumber: "CUST-002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    trialStartDate: "2025-01-05T00:00:00Z",
    trialEndDate: "2025-02-04T00:00:00Z",
    daysRemaining: 26,
    engagementScore: 85,
    lastActivity: "2025-01-09T16:30:00Z",
    conversionCampaigns: 2,
    status: "active",
  },
  {
    id: "2",
    customerNumber: "CUST-006",
    firstName: "Emma",
    lastName: "Davis",
    email: "emma@example.com",
    trialStartDate: "2025-01-02T00:00:00Z",
    trialEndDate: "2025-02-01T00:00:00Z",
    daysRemaining: 23,
    engagementScore: 45,
    lastActivity: "2025-01-07T10:15:00Z",
    conversionCampaigns: 1,
    status: "at_risk",
  },
  {
    id: "3",
    customerNumber: "CUST-007",
    firstName: "Tom",
    lastName: "Brown",
    email: "tom@example.com",
    trialStartDate: "2024-12-28T00:00:00Z",
    trialEndDate: "2025-01-27T00:00:00Z",
    daysRemaining: 18,
    engagementScore: 92,
    lastActivity: "2025-01-09T18:45:00Z",
    conversionCampaigns: 3,
    status: "high_potential",
  },
]

const onboardingStats = {
  activeOnboarding: 15,
  completedThisMonth: 42,
  averageCompletionTime: 8.5,
  completionRate: 94.2,
  trialCustomers: 34,
  trialConversions: 23,
  conversionRate: 67.6,
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "at_risk":
      return "bg-orange-100 text-orange-800"
    case "overdue":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getTrialStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "high_potential":
      return "bg-blue-100 text-blue-800"
    case "at_risk":
      return "bg-orange-100 text-orange-800"
    case "expired":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function OnboardingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredOnboarding = mockOnboardingCustomers.filter((item) => {
    const matchesSearch =
      `${item.customer.firstName} ${item.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesType = typeFilter === "all" || item.onboardingType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const filteredTrials = mockTrialCustomers.filter((customer) => {
    const matchesSearch =
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Onboarding</h1>
              <p className="text-muted-foreground">Manage customer onboarding workflows and trial conversions</p>
            </div>
            <Link href="/onboarding/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Start Onboarding
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Onboarding</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.activeOnboarding}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.trialCustomers}</div>
                <p className="text-xs text-muted-foreground">Active trials</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">Trial to paid</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="onboarding" className="space-y-6">
            <TabsList>
              <TabsTrigger value="onboarding">Active Onboarding</TabsTrigger>
              <TabsTrigger value="trials">Trial Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Search and filter onboarding customers</CardDescription>
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="new_customer">New Customer</SelectItem>
                        <SelectItem value="trial">Trial Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Onboarding Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Onboarding ({filteredOnboarding.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Current Step</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Est. Completion</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOnboarding.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.customer.firstName} {item.customer.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{item.customer.customerNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.onboardingType.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Progress value={item.completionPercentage} className="w-20" />
                              <span className="text-sm text-muted-foreground">{item.completionPercentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>{item.currentStep.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {item.assignedTo.firstName} {item.assignedTo.lastName}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(item.estimatedCompletion).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Link href={`/onboarding/${item.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
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

            <TabsContent value="trials" className="space-y-6">
              {/* Trial Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {mockTrialCustomers.filter((c) => c.status === "active").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">High Potential</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {mockTrialCustomers.filter((c) => c.status === "high_potential").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {mockTrialCustomers.filter((c) => c.status === "at_risk").length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trial Customers Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Trial Customers ({filteredTrials.length})</CardTitle>
                  <CardDescription>Manage trial customers and conversion campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Trial Period</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Campaigns</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrials.map((customer) => (
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
                              <div className="text-sm font-medium">{customer.daysRemaining} days left</div>
                              <div className="text-xs text-muted-foreground">
                                Ends {new Date(customer.trialEndDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={customer.engagementScore} className="w-16" />
                              <span className="text-xs text-muted-foreground">{customer.engagementScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTrialStatusColor(customer.status)}>
                              {customer.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{customer.conversionCampaigns} sent</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(customer.lastActivity).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/onboarding/trials/${customer.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Manage
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

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Onboarding Performance</CardTitle>
                    <CardDescription>Key metrics and trends</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Completion Time</span>
                      <span className="text-sm">{onboardingStats.averageCompletionTime} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm">{onboardingStats.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed This Month</span>
                      <span className="text-sm">{onboardingStats.completedThisMonth}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trial Conversion</CardTitle>
                    <CardDescription>Trial to paid customer metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm">{onboardingStats.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversions This Month</span>
                      <span className="text-sm">{onboardingStats.trialConversions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Trials</span>
                      <span className="text-sm">{onboardingStats.trialCustomers}</span>
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
