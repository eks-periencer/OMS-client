"use client"

import { Sidebar } from "../../../components/components/layout/sidebar"
import { Button } from "../../../components/components/ui/button"
import { AlertTriangle, BarChart3, Download, Package, Timer, Users } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    { id: "1", title: "Order Performance Report", description: "Monthly order processing metrics and KPIs", type: "Performance", lastGenerated: "2025-01-09", status: "Ready" },
    { id: "2", title: "Customer Onboarding Analytics", description: "Trial conversion rates and onboarding success metrics", type: "Analytics", lastGenerated: "2025-01-08", status: "Ready" },
    { id: "3", title: "FNO Integration Summary", description: "API vs manual application statistics by FNO", type: "Integration", lastGenerated: "2025-01-07", status: "Generating" },
    { id: "4", title: "Escalation Trends Report", description: "Escalation patterns and resolution timeframes", type: "Operations", lastGenerated: "2025-01-06", status: "Ready" },
  ]

  const metrics = [
    { label: "Total Orders", value: "1,247", change: "+12%", icon: Package },
    { label: "Active Customers", value: "892", change: "+8%", icon: Users },
    { label: "Avg Processing Time", value: "2.3 days", change: "-15%", icon: Timer },
    { label: "Open Escalations", value: "23", change: "-5%", icon: AlertTriangle },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 container mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
              <p className="text-muted-foreground">Generate and view system performance reports</p>
            </div>
            <Button variant="outline" className="gap-2"><BarChart3 className="h-4 w-4" /> Generate Custom Report</Button>
          </div>

          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border p-4">
                <div className="flex items-center justify-between pb-2">
                  <div className="text-sm font-medium">{metric.label}</div>
                  <div className="h-7 w-7 rounded-full border flex items-center justify-center text-muted-foreground">
                    {(() => {
                      const Icon = metric.icon
                      return <Icon className="h-4 w-4" />
                    })()}
                  </div>
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{metric.change}</span> from last month
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" className="bg-background">Available Reports</Button>
              <Button variant="outline">Scheduled Reports</Button>
              <Button variant="outline">Custom Reports</Button>
            </div>

            <div className="grid gap-3">
              {reports.map((report) => (
                <div key={report.id} className="rounded-lg border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">{report.title}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={
                          report.status === "Ready"
                            ? "text-xs rounded-full px-2.5 py-0.5 border border-emerald-200 bg-emerald-100 text-emerald-700 font-medium"
                            : "text-xs rounded-full px-2.5 py-0.5 border bg-muted text-muted-foreground"
                        }>
                          {report.status}
                        </span>
                        {report.status === "Ready" && (
                          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Download</Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 text-sm text-muted-foreground flex items-center justify-between">
                    <span>Type: {report.type}</span>
                    <span>Last Generated: {report.lastGenerated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


