"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Clock, Bell, Save, RefreshCw } from "lucide-react"
import { systemConfig } from "@/lib/mock-data"

export default function SystemSettingsPage() {
  const [config, setConfig] = useState({
    escalation: {
      defaultSlaHours: systemConfig.escalation.defaultSlaHours,
      reportingManagerEscalationHours: systemConfig.escalation.reportingManagerEscalationHours,
      processOwnerEscalationHours: systemConfig.escalation.processOwnerEscalationHours,
      autoEscalationEnabled: true,
    },
    trial: {
      defaultDurationDays: systemConfig.trial.defaultDurationDays,
      reminderDays: systemConfig.trial.reminderDays.join(", "),
      autoConversionCampaigns: true,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      systemNotificationsEnabled: true,
      customerNotificationsEnabled: true,
    },
    system: {
      maintenanceMode: false,
      debugLogging: false,
      apiRateLimit: 100,
      sessionTimeout: 3600,
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (section: string) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const handleConfigChange = (section: string, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={() => handleSave("all")} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="escalation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="trial">Trial Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="escalation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Escalation Configuration
              </CardTitle>
              <CardDescription>Configure automatic escalation rules and SLA timeframes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultSla">Default SLA Hours</Label>
                  <Input
                    id="defaultSla"
                    type="number"
                    value={config.escalation.defaultSlaHours}
                    onChange={(e) =>
                      handleConfigChange("escalation", "defaultSlaHours", Number.parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Default time before first escalation</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerEscalation">Manager Escalation Hours</Label>
                  <Input
                    id="managerEscalation"
                    type="number"
                    value={config.escalation.reportingManagerEscalationHours}
                    onChange={(e) =>
                      handleConfigChange(
                        "escalation",
                        "reportingManagerEscalationHours",
                        Number.parseInt(e.target.value),
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">Time before escalating to reporting manager</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="processOwnerEscalation">Process Owner Escalation Hours</Label>
                  <Input
                    id="processOwnerEscalation"
                    type="number"
                    value={config.escalation.processOwnerEscalationHours}
                    onChange={(e) =>
                      handleConfigChange("escalation", "processOwnerEscalationHours", Number.parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Time before escalating to process owner</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoEscalation"
                      checked={config.escalation.autoEscalationEnabled}
                      onCheckedChange={(checked) => handleConfigChange("escalation", "autoEscalationEnabled", checked)}
                    />
                    <Label htmlFor="autoEscalation">Enable Auto-Escalation</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Automatically escalate tasks based on time thresholds</p>
                </div>
              </div>
              <Separator />
              <Button onClick={() => handleSave("escalation")} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Escalation Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="h-5 w-5" />
                Trial Customer Management
              </CardTitle>
              <CardDescription>Configure trial periods and conversion campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trialDuration">Default Trial Duration (Days)</Label>
                  <Input
                    id="trialDuration"
                    type="number"
                    value={config.trial.defaultDurationDays}
                    onChange={(e) =>
                      handleConfigChange("trial", "defaultDurationDays", Number.parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Default length of trial period for new customers</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Reminder Days</Label>
                  <Input
                    id="reminderDays"
                    value={config.trial.reminderDays}
                    onChange={(e) => handleConfigChange("trial", "reminderDays", e.target.value)}
                    placeholder="7, 14, 21, 28"
                  />
                  <p className="text-xs text-muted-foreground">
                    Days before trial expiry to send reminders (comma-separated)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoConversion"
                    checked={config.trial.autoConversionCampaigns}
                    onCheckedChange={(checked) => handleConfigChange("trial", "autoConversionCampaigns", checked)}
                  />
                  <Label htmlFor="autoConversion">Enable Auto-Conversion Campaigns</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatically trigger conversion campaigns for trial customers
                </p>
              </div>
              <Separator />
              <Button onClick={() => handleSave("trial")} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Trial Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure notification channels and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Communication Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailEnabled"
                        checked={config.notifications.emailEnabled}
                        onCheckedChange={(checked) => handleConfigChange("notifications", "emailEnabled", checked)}
                      />
                      <Label htmlFor="emailEnabled">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smsEnabled"
                        checked={config.notifications.smsEnabled}
                        onCheckedChange={(checked) => handleConfigChange("notifications", "smsEnabled", checked)}
                      />
                      <Label htmlFor="smsEnabled">SMS Notifications</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="systemNotifications"
                        checked={config.notifications.systemNotificationsEnabled}
                        onCheckedChange={(checked) =>
                          handleConfigChange("notifications", "systemNotificationsEnabled", checked)
                        }
                      />
                      <Label htmlFor="systemNotifications">System Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="customerNotifications"
                        checked={config.notifications.customerNotificationsEnabled}
                        onCheckedChange={(checked) =>
                          handleConfigChange("notifications", "customerNotificationsEnabled", checked)
                        }
                      />
                      <Label htmlFor="customerNotifications">Customer Notifications</Label>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <Button onClick={() => handleSave("notifications")} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure system-level settings and security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={config.system.apiRateLimit}
                    onChange={(e) => handleConfigChange("system", "apiRateLimit", Number.parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Maximum API requests per minute per user</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.system.sessionTimeout}
                    onChange={(e) => handleConfigChange("system", "sessionTimeout", Number.parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">User session timeout duration</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">System Modes</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={config.system.maintenanceMode}
                      onCheckedChange={(checked) => handleConfigChange("system", "maintenanceMode", checked)}
                    />
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    {config.system.maintenanceMode && <Badge variant="destructive">Active</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debugLogging"
                      checked={config.system.debugLogging}
                      onCheckedChange={(checked) => handleConfigChange("system", "debugLogging", checked)}
                    />
                    <Label htmlFor="debugLogging">Debug Logging</Label>
                  </div>
                </div>
              </div>
              <Separator />
              <Button onClick={() => handleSave("system")} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
