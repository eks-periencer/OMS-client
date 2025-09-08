"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth, hasPermission } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Users,
  Package,
  Inbox,
  AlertTriangle,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Network,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  badge?: number
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: Package,
    permission: "orders:read",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    permission: "customers:read",
  },
  {
    title: "Application Inbox",
    href: "/application-admin",
    icon: Inbox,
    permission: "app_admin:view_inbox",
  },
  {
    title: "Escalations",
    href: "/escalations",
    icon: AlertTriangle,
    permission: "escalations:view",
  },
  {
    title: "Customer Onboarding",
    href: "/onboarding",
    icon: UserCheck,
    permission: "onboarding:manage",
  },
  {
    title: "FNO Management",
    href: "/fno",
    icon: Network,
    permission: "fno:configure",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    permission: "orders:read",
  },
]

const adminNavigation: NavItem[] = [
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    permission: "admin:manage_users",
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "admin:system_config",
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredNavigation = navigation.filter((item) => !item.permission || hasPermission(user, item.permission))

  const filteredAdminNavigation = adminNavigation.filter(
    (item) => !item.permission || hasPermission(user, item.permission),
  )

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">ISP OMS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="text-sm font-medium text-sidebar-foreground">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-sidebar-foreground/70">{user.role.name}</div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {filteredAdminNavigation.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                  Administration
                </div>
              )}
              {filteredAdminNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isCollapsed && "justify-center",
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </ScrollArea>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm("Are you sure you want to logout?")) {
              logout()
              window.location.href = "/login"
            }
          }}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
