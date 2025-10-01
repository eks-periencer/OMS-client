import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../../../lib/utils"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../../../toolkit/store"
import { LogoutConfirmationModal } from "../ui/confirmation-modal"
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
  Bell,
} from "lucide-react"
import { logout } from "../../../toolkit/authSlice"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { getMyNotifications, markNotificationsRead, type NotificationItem } from "../../../../lib/api/notifications"
import { useNavigate } from "react-router-dom"


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
  const navigate = useNavigate()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  const [notifications, setNotifications] = useState<Array<NotificationItem & { readAt?: string | null }>>([])
  const unreadCount = notifications.filter((n) => !n.readAt).length
  const unreadNotifications = notifications.filter((n) => !n.readAt)
  const NOTIFICATION_STORAGE_KEY = "oms.notifications.readAtMap"
  const READ_EXPIRY_DAYS = 7
  // const dispatch = useDispatch()

  
  const purgeExpired = useCallback((items: typeof notifications) => {
    const now = new Date()
    return items.filter((n) => {
      if (!n.readAt) return true
      const readDate = new Date(n.readAt)
      const diffDays = (now.getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays < READ_EXPIRY_DAYS
    })
  }, [READ_EXPIRY_DAYS])

  const loadNotifications = useCallback(async () => {
    try {
      const readMapRaw = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      const readMap: Record<string, string> = readMapRaw ? JSON.parse(readMapRaw) : {}
      const items = await getMyNotifications()
      const withRead = items.map((n) => ({ ...n, readAt: readMap[n._id] || null }))
      setNotifications(purgeExpired(withRead))
    } catch (e) {
      console.error("Failed to fetch notifications", e)
    }
  }, [NOTIFICATION_STORAGE_KEY, purgeExpired])

  useEffect(()=>{
    const load = async () => {
      try {
        await loadNotifications()
      } catch (e) {
        console.error("Failed to fetch notifications", e)
      }
    }
    load()
  }, [loadNotifications])

  // Listen for global refresh events triggered by other parts of the app
  useEffect(() => {
    const handler = () => { loadNotifications().catch(() => {}) }
    window.addEventListener('oms:notifications:refresh', handler)
    return () => window.removeEventListener('oms:notifications:refresh', handler)
  }, [loadNotifications])
  
  
  const user = useSelector((state: RootState)=> state.authentication.user)
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
    setIsLogoutModalOpen(true)
  }

  const confirmLogout = () => {
    dispatch(logout())
    window.location.href = "/login"
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
      {user && (
        <div className="p-4 border-b border-sidebar-border">
          {isCollapsed ? (
            <div className="flex items-center justify-center">
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mt-2" align="end" side="right" sideOffset={8}>
                  <div className="p-4 border-b bg-muted/30">
                    <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                  </div>
                  <div className="max-h-80 overflow-auto scrollbar-hide">
                    {unreadNotifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Inbox className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                        <div className="text-sm text-muted-foreground font-medium">No new notifications</div>
                        <div className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</div>
                      </div>
                    ) : (
                      unreadNotifications.map((n) => (
                        <button
                          key={n._id}
                          className="w-full text-left border-b border-border/50 p-4 hover:bg-accent/50 transition-colors duration-200 last:border-b-0 group"
                          onClick={() => {
                            setNotifications((prev) => {
                              const nowIso = new Date().toISOString()
                              const next = prev.map((it) => it._id === n._id && !it.readAt ? { ...it, readAt: nowIso } : it)
                              const mapRaw = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
                              const map: Record<string, string> = mapRaw ? JSON.parse(mapRaw) : {}
                              map[n._id] = map[n._id] || nowIso
                              localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(map))
                              return next
                            })
                            markNotificationsRead([n._id]).catch(() => {})
                            if (n.url) {
                              setIsNotificationsOpen(false)
                              navigate(n.url)
                            }
                          }}
                        >
                          <div className="text-sm font-semibold text-foreground group-hover:text-foreground/90">{n.title}</div>
                          <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</div>
                          <div className="mt-2 text-xs text-muted-foreground/70 font-medium">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="text-sm font-medium text-sidebar-foreground">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-sidebar-foreground/70">{user.role_name || "Malicous Actor"}</div>
              </div>
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer">
                    <Bell size={25} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mt-2" align="end" side="right" sideOffset={8}>
                  <div className="p-4 border-b bg-muted/30">
                    <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                  </div>
                  <div className="max-h-80 overflow-auto scrollbar-hide">
                    {unreadNotifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Inbox className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                        <div className="text-sm text-muted-foreground font-medium">No new notifications</div>
                        <div className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</div>
                      </div>
                    ) : (
                      unreadNotifications.map((n) => (
                        <button
                          key={n._id}
                          className="w-full text-left border-b border-border/50 p-4 hover:bg-accent/50 transition-colors duration-200 last:border-b-0 group"
                          onClick={() => {
                            setNotifications((prev) => {
                              const nowIso = new Date().toISOString()
                              const next = prev.map((it) => it._id === n._id && !it.readAt ? { ...it, readAt: nowIso } : it)
                              const mapRaw = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
                              const map: Record<string, string> = mapRaw ? JSON.parse(mapRaw) : {}
                              map[n._id] = map[n._id] || nowIso
                              localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(map))
                              return next
                            })
                            markNotificationsRead([n._id]).catch(() => {})
                            if (n.url) {
                              setIsNotificationsOpen(false)
                              navigate(n.url)
                            }
                          }}
                        >
                          <div className="text-sm font-semibold text-foreground group-hover:text-foreground/90">{n.title}</div>
                          <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</div>
                          <div className="mt-2 text-xs text-muted-foreground/70 font-medium">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
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

        
        

        {/* {filteredAdminNavigation.length > 0 && (
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
        )} */}
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

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />

    </div>
  )
}

export default Sidebar