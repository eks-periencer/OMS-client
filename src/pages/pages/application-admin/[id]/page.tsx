"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  ExternalLink,
  Save,
  CheckCircle,
  User,
  MapPin,
  Package,
  Network,
  Clock,
  AlertCircle,
  Play,
  Loader2,
} from "lucide-react"
import Link from "next/link"

// Mock application details
const mockApplicationDetails = {
  id: "1",
  order: {
    id: "1",
    orderNumber: "ORD-2025-001",
    customer: {
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
    createdAt: "2025-01-09T10:30:00Z",
  },
  fno: {
    id: "2",
    name: "Vumatel",
    code: "VUM",
    portalUrl: "https://portal.vumatel.co.za",
    integrationType: "manual",
  },
  assignedTo: {
    id: "1",
    firstName: "Sarah",
    lastName: "Admin",
    email: "sarah@ispoms.com",
  },
  priority: "high",
  status: "pending",
  dueDate: "2025-01-10T17:00:00Z",
  createdAt: "2025-01-09T10:30:00Z",
  agingHours: 6,
  notes: "Customer requires installation between 9-11 AM. Business address with security access required.",
}

const processingSteps = [
  {
    id: "review",
    name: "Review Application",
    description: "Review order details and customer requirements",
    completed: true,
  },
  {
    id: "portal_access",
    name: "Access FNO Portal",
    description: "Log into the FNO portal and navigate to application section",
    completed: false,
  },
  {
    id: "submit_application",
    name: "Submit Application",
    description: "Complete and submit the application form on FNO portal",
    completed: false,
  },
  {
    id: "capture_reference",
    name: "Capture Reference",
    description: "Record the FNO application reference number",
    completed: false,
  },
  {
    id: "update_status",
    name: "Update Status",
    description: "Update order status and notify relevant parties",
    completed: false,
  },
]

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

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ProcessApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  const [status, setStatus] = useState(mockApplicationDetails.status)
  const [fnoReference, setFnoReference] = useState("")
  const [processingNotes, setProcessingNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([0])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAssigned, setIsAssigned] = useState(!!mockApplicationDetails.assignedTo)

  const handleTakeOwnership = () => {
    console.log("[v0] Taking ownership of application:", applicationId)
    setIsAssigned(true)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const handleStartProcessing = () => {
    setStatus("in_progress")
    setCurrentStep(1)
    setCompletedSteps([0, 1])
    console.log("[v0] Starting application processing")
  }

  const handleCompleteStep = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex])
      if (stepIndex < processingSteps.length - 1) {
        setCurrentStep(stepIndex + 1)
      }
    }
  }

  const handleCompleteApplication = async () => {
    if (!fnoReference.trim()) {
      alert("Please enter the FNO reference number")
      return
    }

    setIsLoading(true)
    try {
      console.log("[v0] Completing application:", {
        applicationId,
        fnoReference,
        processingNotes,
      })

      setCompletedSteps([0, 1, 2, 3, 4])
      setStatus("completed")

      await new Promise((resolve) => setTimeout(resolve, 2000))

      setShowSuccessMessage(true)
      setTimeout(() => {
        router.push("/application-admin")
      }, 2000)
    } catch (error) {
      console.error("Failed to complete application:", error)
      alert("Failed to complete application. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {showSuccessMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">
                {isAssigned && status === "pending"
                  ? "Application assigned successfully!"
                  : "Application completed successfully!"}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/application-admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Inbox
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{mockApplicationDetails.order.orderNumber}</h1>
                <p className="text-muted-foreground">Manual FNO Application Processing</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={mockApplicationDetails.fno.portalUrl} target="_blank">
                <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 border-blue-200">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open {mockApplicationDetails.fno.name} Portal
                </Button>
              </Link>
              {status === "pending" && isAssigned && (
                <Button onClick={handleStartProcessing} className="bg-green-600 hover:bg-green-700">
                  <Play className="mr-2 h-4 w-4" />
                  Start Processing
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge className={`mt-2 ${getStatusColor(status)}`}>{status.replace("_", " ")}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Priority</span>
                </div>
                <Badge className={`mt-2 ${getPriorityColor(mockApplicationDetails.priority)}`}>
                  {mockApplicationDetails.priority}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Aging</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-orange-600">{mockApplicationDetails.agingHours}h</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Due Date</span>
                </div>
                <p className="mt-2 text-sm">{new Date(mockApplicationDetails.dueDate).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Steps</CardTitle>
                  <CardDescription>Follow these steps to complete the manual application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processingSteps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {completedSteps.includes(index) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : currentStep === index ? (
                            <div className="h-5 w-5 rounded-full border-2 border-blue-500 bg-blue-50" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`font-medium ${
                                completedSteps.includes(index)
                                  ? "text-green-600"
                                  : currentStep === index
                                    ? "text-blue-600"
                                    : ""
                              }`}
                            >
                              {step.name}
                            </h4>
                            {currentStep === index && !completedSteps.includes(index) && index > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteStep(index)}
                                className="ml-2"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {currentStep === index && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                              {index === 1 && "Click the FNO Portal button above to access the portal"}
                              {index === 2 && "Complete the application form in the FNO portal"}
                              {index === 3 && "Copy the reference number from the FNO portal and enter it below"}
                              {index === 4 && "Click 'Complete Application' to finish the process"}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application Processing</CardTitle>
                  <CardDescription>Complete the application and capture FNO reference</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Application Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fnoReference">FNO Reference Number *</Label>
                    <Input
                      id="fnoReference"
                      placeholder="Enter FNO application reference (e.g., VUM-REF-12345)"
                      value={fnoReference}
                      onChange={(e) => setFnoReference(e.target.value)}
                      className={fnoReference.trim() ? "border-green-300 bg-green-50" : ""}
                    />
                    {!fnoReference.trim() && status === "in_progress" && (
                      <p className="text-sm text-orange-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        FNO reference is required to complete the application
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processingNotes">Processing Notes</Label>
                    <Textarea
                      id="processingNotes"
                      placeholder="Add any notes about the application process..."
                      value={processingNotes}
                      onChange={(e) => setProcessingNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCompleteApplication}
                      disabled={isLoading || !fnoReference.trim() || status !== "in_progress"}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Complete Application
                        </>
                      )}
                    </Button>
                    {!isAssigned && (
                      <Button variant="outline" onClick={handleTakeOwnership}>
                        <User className="mr-2 h-4 w-4" />
                        Take Ownership
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
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
                      {mockApplicationDetails.order.customer.firstName} {mockApplicationDetails.order.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Number</p>
                    <p className="text-sm">{mockApplicationDetails.order.customer.customerNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{mockApplicationDetails.order.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm">{mockApplicationDetails.order.customer.phone}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Service Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                    <p className="text-sm">{mockApplicationDetails.order.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Package</p>
                    <p className="text-sm">{mockApplicationDetails.order.servicePackage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Created</p>
                    <p className="text-sm">{new Date(mockApplicationDetails.order.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Installation Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm">{mockApplicationDetails.order.installationAddress.street}</p>
                    <p className="text-sm">{mockApplicationDetails.order.installationAddress.city}</p>
                    <p className="text-sm">{mockApplicationDetails.order.installationAddress.province}</p>
                    <p className="text-sm">{mockApplicationDetails.order.installationAddress.postalCode}</p>
                  </div>
                </CardContent>
              </Card>

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
                      {mockApplicationDetails.fno.name} ({mockApplicationDetails.fno.code})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Integration Type</p>
                    <p className="text-sm capitalize">{mockApplicationDetails.fno.integrationType}</p>
                  </div>
                  <Link href={mockApplicationDetails.fno.portalUrl} target="_blank">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Portal
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {mockApplicationDetails.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Special Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{mockApplicationDetails.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
