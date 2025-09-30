"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { Button } from "../../../components/components/ui/button"
import { Input } from "../../../components/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Badge } from "../../../components/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/components/ui/tabs"
import { Progress } from "../../../components/components/ui/progress"
import { Plus, Search, Eye, UserCheck, TrendingUp } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useOnboarding } from "../../../../hooks/useOnboarding"
import { useOrders } from "../../../../hooks/useOrders"
import { initiateOnboarding } from "../../../../lib/api/onboarding"
import { useCustomers } from "../../../../hooks/useCustomers"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/components/ui/dialog"
import { SlaStatusBadge } from "../../../components/components/onboarding/SlaStatusBadge"
import { SlaMetricsCard } from "../../../components/components/onboarding/SlaMetricsCard"

// Stats are derived from live onboarding items

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

export default function OnboardingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const { items, loading, error, metrics, metricsLoading } = useOnboarding()
  const { items: orderItems } = useOrders()
  const navigate = useNavigate()
  const [initiating, setInitiating] = useState(false)
  const { customers, loading: loadingCustomers, error: customersError } = useCustomers()
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")

  const customerIdsWithOrders = useMemo(() => {
    const ids = new Set<string>()
    const list = Array.isArray(orderItems) ? orderItems : []
    for (const o of list) {
      const cid = (o as any)?.customer_id ?? (o as any)?.customerId
      if (cid) ids.add(String(cid))
    }
    return ids
  }, [orderItems])

  const sortedFilteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : []
    // Only customers who have at least one order
    const filtered = list
      .filter((c: any) => {
        // from orders API by cross-reference
        const hasOrders = customerIdsWithOrders.has(String(c.id))
        if (!hasOrders) return false

        const q = customerSearch.toLowerCase()
        return (
          `${c.first_name ?? ''} ${c.last_name ?? ''}`.toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q) ||
          (c.customer_number ?? '').toLowerCase().includes(q)
        )
      })

    return filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [customers, customerSearch, customerIdsWithOrders])

  async function initiateForCustomer(customerId: string) {
    try {
      setInitiating(true)
      const res = await initiateOnboarding(customerId, 'standard')
      const onboardingId = (res as any)?.onboardingId || (res as any)?.id
      if (onboardingId) {
        setIsInitiateDialogOpen(false)
        navigate(`/onboarding/${onboardingId}`)
      } else {
        alert('Onboarding initiated, but no onboardingId was returned.')
      }
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Failed to initiate onboarding')
    } finally {
      setInitiating(false)
    }
  }

  const filteredOnboarding = useMemo(() => {
    // Build quick lookup for customer details by id
    const customerById: Record<string, any> = {}
    if (Array.isArray(customers)) {
      for (const c of customers as any[]) {
        if (c?.id) customerById[c.id] = c
      }
    }
    
    // Build SLA status lookup by onboarding ID
    const slaByOnboardingId: Record<string, any> = {}
    if (metrics?.slaStatuses) {
      for (const sla of metrics.slaStatuses) {
        slaByOnboardingId[sla.onboardingId] = sla
      }
    }
    
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[OnboardingPage] raw items:', items)
    }
    function getWorkflowSequence(orderType: string): string[] {
      const t = String(orderType || 'new_install').toLowerCase()
      if (t === 'service_change') return ['created','validated','change_scheduled','in_progress','changed','activated','completed']
      if (t === 'disconnect') return ['created','validated','disconnect_scheduled','in_progress','disconnected','completed']
      return ['created','validated','enriched','fno_submitted','fno_accepted','installation_scheduled','in_progress','installed','activated','completed']
    }

    function resolveOrderForOnboarding(o: any): any | null {
      const list = Array.isArray(orderItems) ? orderItems : []
      const byId = list.find((ord: any) => String(ord?.id) === String(o?.order_id))
      if (byId) return byId
      const sameCustomer = list
        .filter((ord: any) => String(ord?.customer_id ?? ord?.customerId) === String(o?.customer_id))
        .sort((a: any, b: any) => new Date(b?.created_at ?? b?.createdAt ?? 0).getTime() - new Date(a?.created_at ?? a?.createdAt ?? 0).getTime())
      return sameCustomer[0] || null
    }

    const list = items.map((o) => {
      const c = o.customer_id ? customerById[o.customer_id] : undefined
      const firstName = c?.first_name || c?.firstName || ''
      const lastName = c?.last_name || c?.lastName || ''
      const email = c?.email || ''
      const customerNumber = c?.customer_number || c?.customerNumber || (o.customer_id || '').slice(0, 8)
      const slaStatus = slaByOnboardingId[o.id]
      const ord = resolveOrderForOnboarding(o)
      const orderType = (ord as any)?.order_type ?? (ord as any)?.orderType ?? 'new_install'
      const orderStatus = (ord as any)?.current_state ?? (ord as any)?.status ?? 'created'
      const seq = getWorkflowSequence(orderType)
      const idx = Math.max(0, seq.indexOf(String(orderStatus).toLowerCase()))
      const pct = Math.round((idx / Math.max(1, seq.length - 1)) * 100)

      return {
      id: o.id,
      customer: {
        id: o.customer_id || "",
        firstName,
        lastName,
        email,
        customerNumber,
      },
      onboardingType: orderType,
      orderType,
      currentStep: String(orderStatus),
      completionPercentage: pct,
      assignedTo: { firstName: "", lastName: "" },
      startedAt: o.started_at || "",
      estimatedCompletion: "",
      status: String(orderStatus) === 'completed' ? 'completed' : 'in_progress',
      slaStatus: slaStatus?.slaStatus || 'unknown',
      slaHours: slaStatus?.slaHours || 0,
      elapsedHours: slaStatus?.elapsedHours || 0,
      dueAt: slaStatus?.dueAt,
      slaAlertsCount: slaStatus?.slaAlertsCount || 0,
    }});
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[OnboardingPage] mapped items:', list)
    }

    return list.filter((item) => {
      const matchesSearch =
        `${item.customer.firstName} ${item.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesType = typeFilter === "all" || item.onboardingType === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [items, customers, metrics, searchTerm, statusFilter, typeFilter])

  const liveStats = useMemo(() => {
    const total = items.length
    const active = items.filter(o => (o.current_step && o.current_step !== 'completed')).length
    const completed = items.filter(o => o.current_step === 'completed').length

    // Approximate monthly completed based on started_at within current month and completed
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const completedThisMonth = items.filter(o => {
      const started = o.started_at ? new Date(o.started_at) : null
      return o.current_step === 'completed' && started && started >= startOfMonth
    }).length

    // No precise duration data; leave averageCompletionTime as 0 for now
    const averageCompletionTime = 0
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

    return {
      activeOnboarding: active,
      completedThisMonth,
      averageCompletionTime,
      completionRate,
      trialCustomers: 0,
      trialConversions: 0,
      conversionRate: 0,
    }
  }, [items])

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
            <div className="flex gap-2">
              <Link to="/customers/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Customer
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setIsInitiateDialogOpen(true)} disabled={initiating}>
                {initiating ? 'Initiating...' : 'Initiate for Existing'}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Onboarding</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveStats.activeOnboarding}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveStats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Customers</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveStats.trialCustomers}</div>
                <p className="text-xs text-muted-foreground">Active trials</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveStats.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">Trial to paid</p>
              </CardContent>
            </Card>
          </div>

          {/* SLA Metrics */}
          {metrics && (
            <div className="mb-6">
              {(() => {
                const totalVisible = liveStats.activeOnboarding;
                const m = metrics.summary;
                const summary = {
                  total: totalVisible,
                  warning: Math.min(m.warning, totalVisible),
                  breached: Math.min(m.breached, totalVisible),
                  reescalated: Math.min(m.reescalated, totalVisible),
                  avgTimeInState: Number.isFinite(m.avgTimeInState) ? m.avgTimeInState : 0,
                };
                return <SlaMetricsCard summary={summary} loading={metricsLoading} />;
              })()}
            </div>
          )}

          <Tabs defaultValue="onboarding" className="space-y-6">
            <TabsList>
              <TabsTrigger value="onboarding">Active Onboarding</TabsTrigger>
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
                  <CardTitle>Active Onboarding {loading ? '(loading...)' : `(${filteredOnboarding.length})`}</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Current Step</TableHead>
                        <TableHead>SLA Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Est. Completion</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(loading ? Array.from({ length: 5 }) : filteredOnboarding).map((item: any, idx: number) => (
                        <TableRow key={item?.id ?? idx}>
                          <TableCell>
                            {loading ? (
                              <div className="animate-pulse h-6 w-40 bg-muted rounded" />
                            ) : (
                              <div>
                                <div className="font-medium">
                                  {item.customer.firstName} {item.customer.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">{item.customer.customerNumber}</div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {loading ? <div className="animate-pulse h-5 w-24 bg-muted rounded" /> : <Badge variant="outline">{item.onboardingType.replace("_", " ")}</Badge>}
                          </TableCell>
                          <TableCell>
                            {loading ? (
                              <div className="space-y-2">
                                <div className="animate-pulse h-3 w-20 bg-muted rounded" />
                                <div className="animate-pulse h-3 w-10 bg-muted rounded" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Progress value={item.completionPercentage} className="w-20" />
                                <span className="text-sm text-muted-foreground">{item.completionPercentage}%</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {loading ? <div className="animate-pulse h-5 w-24 bg-muted rounded" /> : <Badge className={getStatusColor(item.status)}>{item.currentStep.replace("_", " ")}</Badge>}
                          </TableCell>
                          <TableCell>
                            {loading ? <div className="animate-pulse h-6 w-20 bg-muted rounded" /> : (
                              <SlaStatusBadge 
                                status={item.slaStatus} 
                                elapsedHours={item.elapsedHours}
                                slaHours={item.slaHours}
                                dueAt={item.dueAt}
                                showDetails={false}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {loading ? <div className="animate-pulse h-4 w-20 bg-muted rounded" /> : (
                              <div className="text-sm">
                                {item.assignedTo.firstName} {item.assignedTo.lastName}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{loading ? <div className="animate-pulse h-4 w-16 bg-muted rounded" /> : (item.estimatedCompletion ? new Date(item.estimatedCompletion).toLocaleDateString() : '-')}</TableCell>
                          <TableCell>
                            {loading ? (
                              <div className="animate-pulse h-8 w-20 bg-muted rounded" />
                            ) : (
                              <Link to={`/onboarding/${item.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                            )}
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
                      <span className="text-sm">{liveStats.averageCompletionTime} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm">{liveStats.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed This Month</span>
                      <span className="text-sm">{liveStats.completedThisMonth}</span>
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
                      <span className="text-sm">{liveStats.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversions This Month</span>
                      <span className="text-sm">{liveStats.trialConversions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Trials</span>
                      <span className="text-sm">{liveStats.trialCustomers}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isInitiateDialogOpen} onOpenChange={setIsInitiateDialogOpen}>
        <DialogContent className="w-fit max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Initiate Onboarding for Existing Customer</DialogTitle>
            <DialogDescription>Select a customer to start onboarding. Newest first.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {customersError && <div className="text-sm text-red-600">{customersError}</div>}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or number..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="border rounded-md max-h-96 overflow-auto">
              {loadingCustomers ? (
                <div className="p-4 text-sm text-muted-foreground">Loading customers...</div>
              ) : sortedFilteredCustomers.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No customers found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFilteredCustomers.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="font-medium">{c.first_name} {c.last_name}</div>
                          <div className="text-xs text-muted-foreground">{c.customer_number}</div>
                        </TableCell>
                        <TableCell className="text-sm">{c.email}</TableCell>
                        <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => initiateForCustomer(c.id)} disabled={initiating}>
                            {initiating ? 'Starting...' : 'Initiate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInitiateDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
