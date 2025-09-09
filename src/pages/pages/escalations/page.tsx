"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Button } from "../../../components/components/ui/button"
import { Badge } from "../../../components/components/ui/badge"
import { Input } from "../../../components/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/components/ui/dialog"
import { Label } from "../../../components/components/ui/label"
import { Textarea } from "../../../components/components/ui/textarea"
import { AlertTriangle, Clock, User, ArrowUp, CheckCircle, Plus, Search } from "lucide-react"
import { mockEscalations, mockUsers, mockOrders } from "../../../../lib/mock-data"
import { Sidebar } from "../../../components/components/layout/sidebar"
// Derive the escalation item type from mock data to avoid path alias issues
type EscalationItem = (typeof mockEscalations)[number]

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalationItem[]>(mockEscalations)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  

  // Filter escalations
  const filteredEscalations = escalations.filter((escalation) => {
    const matchesSearch =
      escalation.escalationReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escalation.order?.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escalation.escalatedFrom.firstName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || escalation.status === statusFilter
    const matchesLevel = levelFilter === "all" || escalation.escalationLevel.toString() === levelFilter

    return matchesSearch && matchesStatus && matchesLevel
  })

  // Group escalations by status
  const openEscalations = filteredEscalations.filter((e) => e.status === "open")
  const inProgressEscalations = filteredEscalations.filter((e) => e.status === "in_progress")
  const resolvedEscalations = filteredEscalations.filter((e) => e.status === "resolved")

  const calculateAgingHours = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
  }

  const handleResolveEscalation = (escalationId: string, resolutionNotes: string) => {
    const next: EscalationItem[] = escalations.map((escalation) =>
      escalation.id === escalationId
        ? {
            ...escalation,
            status: "resolved",
            resolvedAt: new Date().toISOString(),
            resolutionNotes,
          }
        : escalation,
    )
    setEscalations(next)
    
  }

  const handleEscalateToNextLevel = (escalationId: string) => {
    const next: EscalationItem[] = escalations.map((escalation) =>
      escalation.id === escalationId
        ? {
            ...escalation,
            escalationLevel: escalation.escalationLevel + 1,
            escalatedTo: mockUsers.find((u) => u.role.name === "Operations Manager") || escalation.escalatedTo,
          }
        : escalation,
    )
    setEscalations(next)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 container mx-auto min-w-0">
          <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalation Management</h1>
          <p className="text-muted-foreground">Monitor and resolve escalated tasks and orders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Escalation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Manual Escalation</DialogTitle>
              <DialogDescription>Escalate an order or task that requires immediate attention.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="order">Order</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order to escalate" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOrders.slice(0, 5).map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNumber} - {order.customer.firstName} {order.customer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="escalateTo">Escalate To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select escalation recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers
                      .filter((u) => u.role.name.includes("Manager"))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} - {user.role.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Escalation Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe why this needs to be escalated..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Create Escalation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openEscalations.length}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressEscalations.length}</div>
            <p className="text-xs text-muted-foreground">Being actively worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                resolvedEscalations.filter(
                  (e) => e.resolvedAt && new Date(e.resolvedAt).toDateString() === new Date().toDateString(),
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <ArrowUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {openEscalations.filter((e) => calculateAgingHours(e.createdAt) > 24).length}
            </div>
            <p className="text-xs text-muted-foreground">Over 24 hours old</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Escalations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search escalations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Escalations Tabs */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open ({openEscalations.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressEscalations.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedEscalations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {openEscalations.map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
            />
          ))}
          {openEscalations.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No open escalations found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressEscalations.map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
            />
          ))}
          {inProgressEscalations.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No escalations in progress.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedEscalations.map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
            />
          ))}
          {resolvedEscalations.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No resolved escalations found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function EscalationCard({
  escalation,
  onResolve,
  onEscalate,
}: {
  escalation: EscalationItem
  onResolve: (id: string, notes: string) => void
  onEscalate: (id: string) => void
}) {
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState("")

  const getEscalationPriorityColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case 3:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const calculateAgingHours = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
  }

  const agingHours = calculateAgingHours(escalation.createdAt)

  return (
    <Card className={`${agingHours > 24 ? "border-red-200 bg-red-50" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getEscalationPriorityColor(escalation.escalationLevel)}>
                Level {escalation.escalationLevel}
              </Badge>
              <Badge className={getStatusColor(escalation.status)}>{escalation.status.replace("_", " ")}</Badge>
              {agingHours > 24 && <Badge variant="destructive">Overdue ({agingHours}h)</Badge>}
            </div>
            <CardTitle className="text-lg">
              {escalation.order ? `Order ${escalation.order.orderNumber}` : "Task Escalation"}
            </CardTitle>
            <CardDescription>{escalation.escalationReason}</CardDescription>
          </div>
          <div className="flex gap-2">
            {escalation.status !== "resolved" && (
              <>
                <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Resolve Escalation</DialogTitle>
                      <DialogDescription>Provide resolution notes for this escalation.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="resolution">Resolution Notes</Label>
                        <Textarea
                          id="resolution"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Describe how this escalation was resolved..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          onResolve(escalation.id, resolutionNotes)
                          setIsResolveDialogOpen(false)
                          setResolutionNotes("")
                        }}
                        disabled={!resolutionNotes.trim()}
                      >
                        Resolve Escalation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {escalation.escalationLevel < 3 && (
                  <Button variant="outline" size="sm" onClick={() => onEscalate(escalation.id)}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Escalate Further
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Escalated by:</strong> {escalation.escalatedFrom.firstName} {escalation.escalatedFrom.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Assigned to:</strong> {escalation.escalatedTo.firstName} {escalation.escalatedTo.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Created:</strong> {new Date(escalation.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          {escalation.order && (
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Customer:</strong> {escalation.order.customer.firstName} {escalation.order.customer.lastName}
              </div>
              <div className="text-sm">
                <strong>Service:</strong> {escalation.order.serviceType} - {escalation.order.servicePackage}
              </div>
              <div className="text-sm">
                <strong>Order Status:</strong> {escalation.order.currentState}
              </div>
            </div>
          )}
        </div>
        {escalation.resolutionNotes && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm font-medium text-green-800 mb-1">Resolution Notes:</div>
            <div className="text-sm text-green-700">{escalation.resolutionNotes}</div>
            {escalation.resolvedAt && (
              <div className="text-xs text-green-600 mt-1">
                Resolved on {new Date(escalation.resolvedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
