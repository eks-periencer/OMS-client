"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Badge } from "../../../../components/components/ui/badge"
import { Progress } from "../../../../components/components/ui/progress"
import { Textarea } from "../../../../components/components/ui/textarea"
import { Label } from "../../../../components/components/ui/label"
import { ArrowLeft, CheckCircle, Clock, User, MessageSquare, Play } from "lucide-react"
import {Link} from "react-router-dom"

// Mock onboarding details
const mockOnboardingDetails = {
  id: "1",
  customer: {
    id: "1",
    firstName: "Alice",
    lastName: "Cooper",
    email: "alice@example.com",
    phone: "+27123456789",
    customerNumber: "CUST-004",
  },
  order: {
    id: "1",
    orderNumber: "ORD-2025-005",
    serviceType: "Fiber",
    servicePackage: "Premium 100Mbps",
  },
  onboardingType: "new_customer",
  currentStep: "equipment_delivery",
  completionPercentage: 60,
  assignedTo: {
    id: "1",
    firstName: "Sarah",
    lastName: "Manager",
    email: "sarah@ispoms.com",
  },
  startedAt: "2025-01-08T10:00:00Z",
  estimatedCompletion: "2025-01-15T00:00:00Z",
  notes: "Customer prefers morning delivery between 9-11 AM",
  steps: [
    {
      id: "welcome",
      name: "Welcome & Introduction",
      description: "Send welcome email and introduction materials",
      status: "completed",
      completedAt: "2025-01-08T10:30:00Z",
      completedBy: { firstName: "Sarah", lastName: "Manager" },
      notes: "Welcome email sent successfully",
    },
    {
      id: "service_setup",
      name: "Service Configuration",
      description: "Configure service parameters and account setup",
      status: "completed",
      completedAt: "2025-01-08T14:20:00Z",
      completedBy: { firstName: "Sarah", lastName: "Manager" },
      notes: "Account configured with premium package",
    },
    {
      id: "equipment_delivery",
      name: "Equipment Delivery",
      description: "Schedule and coordinate equipment delivery",
      status: "in_progress",
      completedAt: null,
      completedBy: null,
      notes: "Delivery scheduled for Jan 12, 2025",
    },
    {
      id: "installation",
      name: "Installation & Setup",
      description: "On-site installation and configuration",
      status: "pending",
      completedAt: null,
      completedBy: null,
      notes: null,
    },
    {
      id: "activation",
      name: "Service Activation",
      description: "Activate service and test connectivity",
      status: "pending",
      completedAt: null,
      completedBy: null,
      notes: null,
    },
    {
      id: "follow_up",
      name: "Follow-up & Support",
      description: "Post-activation follow-up and support setup",
      status: "pending",
      completedAt: null,
      completedBy: null,
      notes: null,
    },
  ],
}

function getStepStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-gray-100 text-gray-800"
    case "skipped":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStepIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "in_progress":
      return <Play className="h-4 w-4 text-blue-600" />
    case "pending":
      return <Clock className="h-4 w-4 text-gray-400" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

export default function OnboardingDetailsPage() {
  const params = useParams()
  const onboardingId = params.id as string
  const [newNote, setNewNote] = useState("")

  const handleCompleteStep = (stepId: string) => {
    console.log("[v0] Completing step:", stepId)
    // Implementation would update the step status
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log("[v0] Adding note:", newNote)
      setNewNote("")
      // Implementation would add the note
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/onboarding">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Onboarding
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {mockOnboardingDetails.customer.firstName} {mockOnboardingDetails.customer.lastName}
                </h1>
                <p className="text-muted-foreground">
                  Onboarding Progress - {mockOnboardingDetails.customer.customerNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Progress</CardTitle>
                  <CardDescription>{mockOnboardingDetails.completionPercentage}% complete</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={mockOnboardingDetails.completionPercentage} className="mb-4" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Started: {new Date(mockOnboardingDetails.startedAt).toLocaleDateString()}</span>
                    <span>
                      Est. Completion: {new Date(mockOnboardingDetails.estimatedCompletion).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Onboarding Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Steps</CardTitle>
                  <CardDescription>Track progress through each onboarding phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOnboardingDetails.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{step.name}</h4>
                            <Badge className={getStepStatusColor(step.status)}>{step.status.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                          {step.completedAt && (
                            <div className="text-xs text-muted-foreground mb-2">
                              Completed on {new Date(step.completedAt).toLocaleDateString()} by{" "}
                              {step.completedBy?.firstName} {step.completedBy?.lastName}
                            </div>
                          )}
                          {step.notes && (
                            <div className="text-sm bg-muted p-2 rounded">
                              <strong>Notes:</strong> {step.notes}
                            </div>
                          )}
                          {step.status === "in_progress" && (
                            <div className="mt-3">
                              <Button size="sm" onClick={() => handleCompleteStep(step.id)}>
                                Mark Complete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Note</CardTitle>
                  <CardDescription>Add progress notes or updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note">Note</Label>
                      <Textarea
                        id="note"
                        placeholder="Add a note about the onboarding progress..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Customer Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">
                      {mockOnboardingDetails.customer.firstName} {mockOnboardingDetails.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Number</p>
                    <p className="text-sm">{mockOnboardingDetails.customer.customerNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{mockOnboardingDetails.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm">{mockOnboardingDetails.customer.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                    <p className="text-sm">{mockOnboardingDetails.order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                    <p className="text-sm">{mockOnboardingDetails.order.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Package</p>
                    <p className="text-sm">{mockOnboardingDetails.order.servicePackage}</p>
                  </div>
                    <Link to={`/orders/${mockOnboardingDetails.order.id}`}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Order Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="text-sm">
                      {mockOnboardingDetails.assignedTo.firstName} {mockOnboardingDetails.assignedTo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge variant="outline">{mockOnboardingDetails.onboardingType.replace("_", " ")}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
