import type React from "react"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../../../lib/utils"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "../../../components/components/ui/button"
import { ScrollArea } from "../../../components/components/ui/scroll-area"
import { Separator } from "../../../components/components/ui/separator"
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
import { logout } from "../../../toolkit/authSlice"

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
    href: "/users",
    icon: Users,
    permission: "admin:manage_users",
  },
  {
    title: "System Settings",
    href: "/settings",
    icon: Settings,
    permission: "admin:system_config",
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const [thisUser, setThisUser] = useState(null)

  useEffect(()=>{
    assignUser()
  }, [])
  
  
  const user = useSelector((state)=> state.authentication.user)
  
  console.log(`user: ${user}`)

  const assignUser = () =>{
      setThisUser(user)
  }
  const dispatch = useDispatch()

  // Show all navigation items regardless of permissions for now
  // You can re-enable permission filtering once your auth system is properly set up
  const filteredNavigation = navigation
  const filteredAdminNavigation = adminNavigation

  // If you want to re-enable permission filtering later, use this instead:
  // const filteredNavigation = navigation.filter((item) => 
  //   !item.permission || (user && hasPermission(user, item.permission))
  // )
  // const filteredAdminNavigation = adminNavigation.filter(
  //   (item) => !item.permission || (user && hasPermission(user, item.permission))
  // )

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout())
      // Use React Router navigation instead of window.location
      window.location.href = "/login"
    }
  }

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
            {user.first_name} {user.last_name}
          </div>
          <div className="text-xs text-sidebar-foreground/70">{user.role_name || "Malicous Actor"}</div>
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
                to={item.href}
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

        {/*
        
        {filteredAdminNavigation.length > 0 && user?.role_name === 'System Administrator' && (
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
            to={item.href}
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

        
        */}

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
                    to={item.href}
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
          onClick={handleLogout}
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

export default Sidebar