"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
  import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Input } from "../../../../components/components/ui/input"
import { Label } from "../../../../components/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Badge } from "../../../../components/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/components/ui/select"
import { Switch } from "../../../../components/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/components/ui/tabs"
import { ArrowLeft, Save, TestTube, Activity, Settings, AlertCircle } from "lucide-react"
import {Link} from "react-router-dom"

// Mock FNO details
const mockFNODetails = {
  id: "1",
  name: "Openserve",
  code: "OS",
  integrationType: "api",
  apiEndpoint: "https://api.openserve.co.za",
  apiKey: "••••••••••••••••",
  portalUrl: "https://portal.openserve.co.za",
  coverageAreas: ["Western Cape", "Gauteng", "KwaZulu-Natal"],
  isActive: true,
  status: "connected",
  configuration: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    webhookUrl: "https://ispoms.com/webhooks/openserve",
    authMethod: "api_key",
  },
  statistics: {
    ordersSubmitted: 145,
    successfulSubmissions: 143,
    failedSubmissions: 2,
    averageResponseTime: 1250,
    lastSuccessfulSync: "2025-01-09T14:30:00Z",
    lastError: null,
  },
}

const mockRecentActivity = [
  {
    id: "1",
    action: "Order Submitted",
    orderNumber: "ORD-2025-001",
    status: "success",
    timestamp: "2025-01-09T14:30:00Z",
    responseTime: 1250,
  },
  {
    id: "2",
    action: "Status Update",
    orderNumber: "ORD-2025-002",
    status: "success",
    timestamp: "2025-01-09T14:25:00Z",
    responseTime: 890,
  },
  {
    id: "3",
    action: "Order Query",
    orderNumber: "ORD-2025-003",
    status: "error",
    timestamp: "2025-01-09T14:20:00Z",
    responseTime: 5000,
  },
]

export default function FNODetailsPage() {
  const params = useParams()
  const fnoId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(mockFNODetails.name)
  const [code, setCode] = useState(mockFNODetails.code)
  const [integrationType, setIntegrationType] = useState(mockFNODetails.integrationType)
  const [apiEndpoint, setApiEndpoint] = useState(mockFNODetails.apiEndpoint)
  const [apiKey, setApiKey] = useState("")
  const [portalUrl, setPortalUrl] = useState(mockFNODetails.portalUrl)
  const [isActive, setIsActive] = useState(mockFNODetails.isActive)
  const [timeout, setTimeout] = useState(mockFNODetails.configuration.timeout.toString())
  const [retryAttempts, setRetryAttempts] = useState(mockFNODetails.configuration.retryAttempts.toString())

  const handleSave = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Saving FNO configuration:", {
        name,
        code,
        integrationType,
        apiEndpoint,
        portalUrl,
        isActive,
        timeout: Number.parseInt(timeout),
        retryAttempts: Number.parseInt(retryAttempts),
      })
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)
    try {
      console.log("[v0] Testing FNO connection")
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setTestResult("Connection successful! API is responding correctly.")
    } catch (error) {
      setTestResult("Connection failed. Please check your configuration.")
    } finally {
      setIsLoading(false)
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
              <Link to="/fno">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to FNOs
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{mockFNODetails.name}</h1>
                <p className="text-muted-foreground">FNO Configuration and Management</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {integrationType === "api" && (
                <Button variant="outline" onClick={handleTestConnection} disabled={isLoading}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
              )}
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge className="mt-2 bg-green-100 text-green-800">{mockFNODetails.status}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Orders Submitted</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{mockFNODetails.statistics.ordersSubmitted}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {(
                    (mockFNODetails.statistics.successfulSubmissions / mockFNODetails.statistics.ordersSubmitted) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Response</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{mockFNODetails.statistics.averageResponseTime}ms</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Result */}
          {testResult && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  {testResult.includes("successful") ? (
                    <Activity className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">{testResult}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="configuration" className="space-y-6">
            <TabsList>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>FNO identification and basic settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">FNO Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">FNO Code</Label>
                      <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="integrationType">Integration Type</Label>
                      <Select value={integrationType} onValueChange={setIntegrationType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api">API Integration</SelectItem>
                          <SelectItem value="manual">Manual Integration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Integration Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Integration Settings</CardTitle>
                    <CardDescription>API endpoints and authentication</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {integrationType === "api" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="apiEndpoint">API Endpoint</Label>
                          <Input
                            id="apiEndpoint"
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input
                            id="apiKey"
                            type="password"
                            placeholder="Enter new API key to update"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="portalUrl">Portal URL</Label>
                      <Input id="portalUrl" value={portalUrl} onChange={(e) => setPortalUrl(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Configuration */}
                {integrationType === "api" && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Advanced Configuration</CardTitle>
                      <CardDescription>Timeout, retry settings, and other advanced options</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="timeout">Timeout (ms)</Label>
                          <Input
                            id="timeout"
                            type="number"
                            value={timeout}
                            onChange={(e) => setTimeout(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retryAttempts">Retry Attempts</Label>
                          <Input
                            id="retryAttempts"
                            type="number"
                            value={retryAttempts}
                            onChange={(e) => setRetryAttempts(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="webhookUrl">Webhook URL</Label>
                          <Input id="webhookUrl" value={mockFNODetails.configuration.webhookUrl} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authMethod">Auth Method</Label>
                          <Select value={mockFNODetails.configuration.authMethod} disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="api_key">API Key</SelectItem>
                              <SelectItem value="oauth">OAuth 2.0</SelectItem>
                              <SelectItem value="basic">Basic Auth</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Coverage Areas */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Coverage Areas</CardTitle>
                    <CardDescription>Geographic areas covered by this FNO</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mockFNODetails.coverageAreas.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest API calls and integration activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.status === "success" ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <div>
                            <div className="font-medium">{activity.action}</div>
                            <div className="text-sm text-muted-foreground">{activity.orderNumber}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{new Date(activity.timestamp).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{activity.responseTime}ms</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>API performance and reliability statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Orders Submitted</span>
                      <span className="text-sm">{mockFNODetails.statistics.ordersSubmitted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Successful Submissions</span>
                      <span className="text-sm">{mockFNODetails.statistics.successfulSubmissions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Failed Submissions</span>
                      <span className="text-sm">{mockFNODetails.statistics.failedSubmissions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="text-sm">{mockFNODetails.statistics.averageResponseTime}ms</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Connection status and last activity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Connection Status</span>
                      <Badge className="bg-green-100 text-green-800">{mockFNODetails.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Last Successful Sync</span>
                      <span className="text-sm">
                        {new Date(mockFNODetails.statistics.lastSuccessfulSync).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Last Error</span>
                      <span className="text-sm">{mockFNODetails.statistics.lastError || "None"}</span>
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
