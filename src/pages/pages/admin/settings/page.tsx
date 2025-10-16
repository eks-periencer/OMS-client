"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Button } from "../../../../components/components/ui/button"
import { Input } from "../../../../components/components/ui/input"
import { Label } from "../../../../components/components/ui/label"
import { Switch } from "../../../../components/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/components/ui/tabs"
import { Separator } from "../../../../components/components/ui/separator"
import { Badge } from "../../../../components/components/ui/badge"
import { Settings, Clock, Bell, Save, RefreshCw, History, Loader2 } from "lucide-react"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { systemSettingsApi, defaultSettings, transformConfigToApi, transformApiToConfig } from "../../../../../lib/api/systemSettings"
import { useToast } from "../../../../../hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../../components/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/components/ui/table"
import Swal from "sweetalert2"


export default function SystemSettingsPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState(defaultSettings)
  const [versions, setVersions] = useState<Record<string, number>>({
    escalation: 0,
    trials: 0,
    notifications: 0,
    rbac: 0,
    system: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [currentHistoryKey, setCurrentHistoryKey] = useState<string>('')
  const [auditHistory, setAuditHistory] = useState<Array<{
    nextVersion: number;
    updatedBy: string;
    updatedByName: string;
    updatedAt: string;
    diff: Record<string, unknown>;
    isCurrentVersion: boolean;
    changeType: 'created' | 'updated' | 'rollback';
    isRollback: boolean;
  }>>([])
  const [currentVersion, setCurrentVersion] = useState<number>(0)
  const [totalEntries, setTotalEntries] = useState<number>(0)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      
      const settings = await systemSettingsApi.getSettings(['escalation', 'trials', 'notifications', 'system', 'rbac'])
      
      // Transform API data to UI config format
      const apiData = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, unknown>)
      
      const uiConfig = transformApiToConfig(apiData)
      setConfig(uiConfig as typeof defaultSettings)
      
      // Update versions
      const newVersions = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.version
        return acc
      }, {} as Record<string, number>)
      setVersions(newVersions)
      
      toast({
        title: "Settings loaded",
        description: "System settings have been loaded successfully.",
      })
    } catch (error: unknown) {
      console.error('Failed to load settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load system settings.'
      toast({
        title: "Error loading settings",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    try {
      setIsSaving(true)
      
      const apiData = transformConfigToApi(config)
      const sectionData = apiData[section as keyof typeof apiData]
      const currentVersion = versions[section]
      
      const updatedSetting = await systemSettingsApi.updateSetting(section, {
        value: sectionData,
        version: currentVersion,
      })
      
      // Update version
      setVersions(prev => ({ ...prev, [section]: updatedSetting.version }))
      
      
      // Show success with SweetAlert
      await Swal.fire({
        title: 'Success!',
        text: `${section} settings have been saved successfully.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
      
      toast({
        title: "Settings saved",
        description: `${section} settings have been saved successfully.`,
      })
    } catch (error: unknown) {
      console.error(`Failed to save ${section} settings:`, error)
      
      if (error instanceof Error && error.message.includes('409')) {
        // Version conflict - reload settings
        await Swal.fire({
          title: 'Conflict!',
          text: 'Settings were updated by another user. Reloading...',
          icon: 'warning',
          confirmButtonText: 'OK'
        })
        await loadSettings()
      } else {
        const errorMessage = error instanceof Error ? error.message : `Failed to save ${section} settings`
        
        await Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    } finally {
    setIsSaving(false)
    }
  }

  const handleSaveAll = async () => {
    const result = await Swal.fire({
      title: 'Save All Settings?',
      text: 'This will save all settings across all tabs. Continue?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save all',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    const sections = ['escalation', 'trials', 'notifications', 'system', 'rbac']
    let successCount = 0
    
    for (const section of sections) {
      try {
        await handleSave(section)
        successCount++
      } catch (error) {
        console.error(`Failed to save ${section}:`, error)
      }
    }
    
    if (successCount === sections.length) {
      await Swal.fire({
        title: 'Success!',
        text: 'All system settings have been saved successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    } else {
      await Swal.fire({
        title: 'Partial Success',
        text: `${successCount}/${sections.length} settings saved successfully.`,
        icon: 'warning'
      })
    }
  }

  const loadHistory = async (key: string) => {
    try {
      setIsLoadingHistory(true)
      setCurrentHistoryKey(key)
      const response = await systemSettingsApi.getAudit(key, 20)
      setAuditHistory(response.auditEntries)
      setCurrentVersion(response.currentVersion)
      setTotalEntries(response.totalEntries)
      setHistoryDialogOpen(true)
    } catch (error) {
      console.error('Failed to load history:', error)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to load history for this setting.',
        icon: 'error'
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleRollback = async (key: string, toVersion: number) => {
    const result = await Swal.fire({
      title: 'Rollback Setting?',
      text: `This will rollback ${key} to version ${toVersion}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, rollback',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    })

    if (!result.isConfirmed) return

    try {
      await systemSettingsApi.rollbackSetting(key, { toVersion })
      await Swal.fire({
        title: 'Success!',
        text: `${key} has been rolled back to version ${toVersion}.`,
        icon: 'success'
      })
      await loadSettings() // Reload all settings
      setHistoryDialogOpen(false)
    } catch (error) {
      console.error('Failed to rollback:', error)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to rollback setting.',
        icon: 'error'
      })
    }
  }

  const handleConfigChange = (section: string, key: string, value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const resetToDefaults = async () => {
    const result = await Swal.fire({
      title: 'Reset to Defaults?',
      text: 'This will reset all settings to their default values. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset all',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    })

    if (!result.isConfirmed) return

    setConfig(defaultSettings)
    setVersions({
      escalation: 0,
      trials: 0,
      notifications: 0,
      rbac: 0,
      system: 0,
    })
    
    await Swal.fire({
      title: 'Reset Complete!',
      text: 'Settings have been reset to defaults.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
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
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
                {isLoading && (
                  <div className="flex items-center gap-2 mt-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading settings...</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetToDefaults} disabled={isLoading || isSaving}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveAll} disabled={isLoading || isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save All"}
                </Button>
              </div>
            </div>


            {/* Settings Tabs */}
            <Tabs defaultValue="escalation" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="escalation">Escalation</TabsTrigger>
                <TabsTrigger value="trials">Trial Management</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="rbac">RBAC</TabsTrigger>
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
                          disabled={isLoading || isSaving}
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
                          disabled={isLoading || isSaving}
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
                          disabled={isLoading || isSaving}
                        />
                        <p className="text-xs text-muted-foreground">Time before escalating to process owner</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="autoEscalation"
                            checked={config.escalation.autoEscalationEnabled}
                            onCheckedChange={(checked: boolean) => handleConfigChange("escalation", "autoEscalationEnabled", checked)}
                            disabled={isLoading || isSaving}
                          />
                          <Label htmlFor="autoEscalation">Enable Auto-Escalation</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">Automatically escalate tasks based on time thresholds</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleSave("escalation")} disabled={isLoading || isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Escalation Settings"}
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isLoading || isSaving}
                        onClick={() => loadHistory('escalation')}
                      >
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trials" className="space-y-4">
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
                          value={config.trials.defaultDurationDays}
                          onChange={(e) =>
                            handleConfigChange("trials", "defaultDurationDays", Number.parseInt(e.target.value))
                          }
                          disabled={isLoading || isSaving}
                        />
                        <p className="text-xs text-muted-foreground">Default length of trial period for new customers</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminderDays">Reminder Days</Label>
                        <Input
                          id="reminderDays"
                          value={typeof config.trials.reminderDays === 'string' ? config.trials.reminderDays : config.trials.reminderDays.join(', ')}
                          onChange={(e) => handleConfigChange("trials", "reminderDays", e.target.value)}
                          placeholder="7, 14, 21, 28"
                          disabled={isLoading || isSaving}
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
                          checked={config.trials.autoConversionCampaigns}
                          onCheckedChange={(checked) => handleConfigChange("trials", "autoConversionCampaigns", checked)}
                          disabled={isLoading || isSaving}
                        />
                        <Label htmlFor="autoConversion">Enable Auto-Conversion Campaigns</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automatically trigger conversion campaigns for trial customers
                      </p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleSave("trials")} disabled={isLoading || isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Trial Settings"}
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isLoading || isSaving}
                        onClick={() => loadHistory('trials')}
                      >
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                    </div>
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
                              disabled={isLoading || isSaving}
                            />
                            <Label htmlFor="emailEnabled">Email Notifications</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="smsEnabled"
                              checked={config.notifications.smsEnabled}
                              onCheckedChange={(checked) => handleConfigChange("notifications", "smsEnabled", checked)}
                              disabled={isLoading || isSaving}
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
                              disabled={isLoading || isSaving}
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
                              disabled={isLoading || isSaving}
                            />
                            <Label htmlFor="customerNotifications">Customer Notifications</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleSave("notifications")} disabled={isLoading || isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Notification Settings"}
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isLoading || isSaving}
                        onClick={() => loadHistory('notifications')}
                      >
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                    </div>
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
                          disabled={isLoading || isSaving}
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
                          disabled={isLoading || isSaving}
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
                            disabled={isLoading || isSaving}
                          />
                          <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                          {config.system.maintenanceMode && <Badge variant="destructive">Active</Badge>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="debugLogging"
                            checked={config.system.debugLogging}
                            onCheckedChange={(checked) => handleConfigChange("system", "debugLogging", checked)}
                            disabled={isLoading || isSaving}
                          />
                          <Label htmlFor="debugLogging">Debug Logging</Label>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleSave("system")} disabled={isLoading || isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save System Settings"}
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={isLoading || isSaving}
                        onClick={() => loadHistory('system')}
                      >
                        <History className="mr-2 h-4 w-4" />
                        View History
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* RBAC Tab */}
              <TabsContent value="rbac" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Role-Based Access Control (RBAC)
                    </CardTitle>
                    <CardDescription>
                      Configure role permissions, access levels, and security policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Role Permissions</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="adminCanManageUsers">Admins can manage users</Label>
                            <Switch
                              id="adminCanManageUsers"
                              checked={!!config.rbac?.adminCanManageUsers}
                              onCheckedChange={(checked) => setConfig(prev => ({
                                ...prev,
                                rbac: {
                                  ...prev.rbac,
                                  adminCanManageUsers: checked
                                }
                              }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="managerCanViewReports">Managers can view reports</Label>
                            <Switch
                              id="managerCanViewReports"
                              checked={!!config.rbac?.managerCanViewReports}
                              onCheckedChange={(checked) => setConfig(prev => ({
                                ...prev,
                                rbac: {
                                  ...prev.rbac,
                                  managerCanViewReports: checked
                                }
                              }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="userCanCreateOrders">Users can create orders</Label>
                            <Switch
                              id="userCanCreateOrders"
                              checked={!!config.rbac?.userCanCreateOrders}
                              onCheckedChange={(checked) => setConfig(prev => ({
                                ...prev,
                                rbac: {
                                  ...prev.rbac,
                                  userCanCreateOrders: checked
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Access Control</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="requireMfaForAdmins">Require MFA for Admins</Label>
                            <Switch
                              id="requireMfaForAdmins"
                              checked={!!config.rbac?.requireMfaForAdmins}
                              onCheckedChange={(checked) => setConfig(prev => ({
                                ...prev,
                                rbac: {
                                  ...prev.rbac,
                                  requireMfaForAdmins: checked
                                }
                              }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="allowRoleEscalation">Allow Role Escalation</Label>
                            <Switch
                              id="allowRoleEscalation"
                              checked={!!config.rbac?.allowRoleEscalation}
                              onCheckedChange={(checked) => setConfig(prev => ({
                                ...prev,
                                rbac: {
                                  ...prev.rbac,
                                  allowRoleEscalation: checked
                                }
                              }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="maxConcurrentSessions">Max Concurrent Sessions</Label>
                            <Input
                              id="maxConcurrentSessions"
                              type="number"
                              value={config.rbac?.maxConcurrentSessions || 3}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                rbac: {
                                  ...prev.rbac,
                                  maxConcurrentSessions: parseInt(e.target.value) || 3
                                }
                              }))}
                              className="w-20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Configure role-based access control and security policies
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleSave('rbac')} disabled={isLoading || isSaving}>
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Save RBAC Settings'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={isLoading || isSaving}
                          onClick={() => loadHistory('rbac')}
                        >
                          <History className="mr-2 h-4 w-4" />
                          View History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              History for {currentHistoryKey.charAt(0).toUpperCase() + currentHistoryKey.slice(1)}
            </DialogTitle>
            <DialogDescription>
              View and rollback to previous versions of this setting
              <div className="mt-2 text-sm text-muted-foreground">
                Current Version: <span className="font-mono font-semibold">{currentVersion}</span> • 
                Total Entries: <span className="font-mono font-semibold">{totalEntries}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading history...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {auditHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No history available for this setting
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead>Changes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditHistory.map((entry, index) => (
                      <TableRow key={index} className={entry.isCurrentVersion ? 'bg-green-50 dark:bg-green-950' : ''}>
                        <TableCell className="font-mono">
                          {entry.nextVersion}
                          {entry.isCurrentVersion && (
                            <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={entry.changeType === 'rollback' ? 'destructive' : 
                                   entry.changeType === 'created' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {entry.changeType === 'rollback' ? '🔄 Rollback' :
                             entry.changeType === 'created' ? '✨ Created' : '✏️ Updated'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {entry.updatedByName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entry.updatedBy}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(entry.updatedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {Object.keys(entry.diff || {}).length} field(s) changed
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.isCurrentVersion ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Historical
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!entry.isCurrentVersion && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRollback(currentHistoryKey, entry.nextVersion)}
                            >
                              Rollback
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
