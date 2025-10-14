"use client"

import { Sidebar } from "../../../components/components/layout/sidebar"
import { AnalyticsDashboard } from "../../../components/components/analytics/AnalyticsDashboard"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 container mx-auto">
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}


