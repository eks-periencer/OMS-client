"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Button } from "../../../components/components/ui/button"
import { Badge } from "../../../components/components/ui/badge"
import { Input } from "../../../components/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/components/ui/tabs"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../components/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/components/ui/dialog"
import { Label } from "../../../components/components/ui/label"
import { Textarea } from "../../../components/components/ui/textarea"
import { AlertTriangle, Clock, User, ArrowUp, CheckCircle, Plus, Search, Loader2, UserPlus } from "lucide-react"
import { escalationApi, type Escalation, type EscalationStats } from "../../../../lib/api/escalations"
import { Sidebar } from "../../../components/components/layout/sidebar"
import { useToast } from "../../../components/components/ui/use-toast"
// Note: Toaster is expected to be mounted at the app root
import { useSelector } from "react-redux"
import type { RootState } from "../../../../src/toolkit/store"
import Swal from "sweetalert2"

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [groupedEscalations, setGroupedEscalations] = useState<{
    open: Escalation[]
    in_progress: Escalation[]
    resolved: Escalation[]
    overdue: Escalation[]
  }>({
    open: [],
    in_progress: [],
    resolved: [],
    overdue: []
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null)
  const [assignToUser, setAssignToUser] = useState("")
  const [eligibleAssignees, setEligibleAssignees] = useState<Array<{ id: string; name: string; email: string; role: string; open_count: number; recent_assignments_24h: number }>>([])
  const [eligibleLoading, setEligibleLoading] = useState(false)
  const [eligibleError, setEligibleError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<EscalationStats>({
    open: 0,
    in_progress: 0,
    resolved_today: 0,
    overdue: 0
  })
  const [tabCounts, setTabCounts] = useState<{ open: number; in_progress: number; resolved: number; overdue: number; assigned: number }>({
    open: 0,
    in_progress: 0,
    resolved: 0,
    overdue: 0,
    assigned: 0,
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  
  // Active tab state for pagination
  const [activeTab, setActiveTab] = useState("open")
  // Cache last successful payload by status to avoid flicker between tab switches
  const [cacheByStatus, setCacheByStatus] = useState<Record<string, {
    escalations: Escalation[];
    full: Escalation[];
    grouped: { open: Escalation[]; in_progress: Escalation[]; resolved: Escalation[]; overdue: Escalation[] };
    total: number;
    summary: { open: number; in_progress: number; resolved: number; overdue: number };
  }>>({})
  // Remember page per tab for consistent UX
  const [pageByStatus, setPageByStatus] = useState<{ open: number; in_progress: number; resolved: number; overdue: number; assigned: number }>({
    open: 1,
    in_progress: 1,
    resolved: 1,
    overdue: 1,
    assigned: 1,
  })
  const { toast } = useToast()
  const [refreshNonce, setRefreshNonce] = useState(0)

  // Prevent duplicate fetches in dev StrictMode and concurrent requests
  const isFetchingRef = useRef(false)
  const lastRequestKeyRef = useRef<string | null>(null)

  // Get user data from Redux store with safety check
  const user = useSelector((state: RootState) => state?.authentication?.user)
  const userRole = user?.role_name || ''
  const userPermissions = useMemo(() => user?.role_permissions || [], [user?.role_permissions])
  
  // Determine if user can view all escalations (system admin only)
  const canViewAllEscalations = useMemo(() => 
    userPermissions.includes('admin:manage_roles') || 
    userRole.toLowerCase().includes('system administrator'),
    [userPermissions, userRole]
  )
  const isOperationsManager = useMemo(() => userRole.toLowerCase().includes('operations manager'), [userRole])

  // Create escalation form state
  const [createForm, setCreateForm] = useState({
    orderId: "",
    escalationReason: "",
    escalatedTo: "",
    priority: "medium"
  })

  // Manual options for the Create dialog
  const [manualOptionsLoading, setManualOptionsLoading] = useState(false)
  const [manualOptionsError, setManualOptionsError] = useState<string | null>(null)
  const [manualOrders, setManualOrders] = useState<Array<{ id: string; order_number: string; customer_name: string }>>([])
  const [manualAssignees, setManualAssignees] = useState<Array<{ id: string; name: string; role: string; openEscalations: number }>>([])

  // Load orders and assignees when Create dialog opens
  useEffect(() => {
    const loadManualOptions = async () => {
      if (!isCreateDialogOpen) return
      try {
        setManualOptionsLoading(true)
        setManualOptionsError(null)
        setManualOrders([])
        setManualAssignees([])
        const resp = await escalationApi.getManualOptions({ limit: 25 })
        if (resp?.success) {
          const orders = (resp.data?.orders || []).map(o => ({ id: o.id, order_number: o.order_number, customer_name: o.customer_name }))
          const assignees = (resp.data?.assignees || []).map(a => ({ id: a.id, name: a.name, role: a.role, openEscalations: a.openEscalations }))
          setManualOrders(orders)
          setManualAssignees(assignees)
        } else {
          setManualOptionsError('Failed to load options')
        }
      } catch (e: any) {
        setManualOptionsError(e?.response?.data?.error?.message || e?.message || 'Failed to load options')
      } finally {
        setManualOptionsLoading(false)
      }
    }
    loadManualOptions()
  }, [isCreateDialogOpen])

  // Test backend connectivity
  const testBackendConnectivity = async () => {
    try {
      console.log("🔌 Testing backend connectivity...")
      const baseUrl = 'https://oms-server-ntlv.onrender.com'
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log("🏥 Health check response:", response.status, response.statusText)
      return response.ok
    } catch (err) {
      console.error("❌ Backend connectivity test failed:", err)
      return false
    }
  }

  // Load eligible assignees when the Assign dialog opens
  useEffect(() => {
    const loadEligible = async () => {
      if (!isAssignDialogOpen || !selectedEscalation) return
      try {
        setEligibleLoading(true)
        setEligibleError(null)
        setEligibleAssignees([])
        const limitFromEnv = Number((import.meta as any).env?.VITE_ELIGIBLE_ASSIGNEES_LIMIT) || 25
        const resp = await escalationApi.getEligibleAssignees(selectedEscalation.id, { limit: limitFromEnv })
        if (resp?.success) {
          setEligibleAssignees(resp.data || [])
        } else {
          setEligibleError("Failed to load eligible assignees")
        }
      } catch (e: any) {
        console.error("Failed to fetch eligible assignees", e)
        setEligibleError(
          e?.response?.data?.error?.message ||
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load eligible assignees"
        )
      } finally {
        setEligibleLoading(false)
      }
    }
    loadEligible()
  }, [isAssignDialogOpen, selectedEscalation])

  // Fetch escalations data
  useEffect(() => {
    const fetchEscalations = async () => {
      const requestKey = JSON.stringify({
        tab: activeTab,
        page: currentPage,
        limit: itemsPerPage,
        statusFilter,
        levelFilter,
        canViewAllEscalations,
        isOperationsManager
      })

      if (isFetchingRef.current) {
        return
      }
      if (lastRequestKeyRef.current === requestKey) {
        return
      }
      isFetchingRef.current = true
      lastRequestKeyRef.current = requestKey
      try {
        setLoading(true)
        setError(null)
        
        // console.log("🔍 Fetching escalations...")
        // console.log("📡 API Base URL: http://localhost:3003")
        // console.log("👤 User role:", userRole)
        // console.log("🔐 User permissions:", userPermissions)
        // console.log("🔓 Can view all escalations:", canViewAllEscalations)
        // console.log("🎯 Access level:", canViewAllEscalations ? "ADMIN (All Escalations)" : "OPERATIONS (My Escalations Only)")
        
        // Check authentication token
        const token = localStorage.getItem('oms_access_token')
        console.log("🔑 Auth token exists:", !!token)
        console.log("🔑 Token preview:", token ? `${token.substring(0, 20)}...` : 'No token')
        
        if (!token) {
          setError("No authentication token found. Please log in first.")
          toast({
            title: "Authentication Required",
            description: "Please log in to view escalations.",
            variant: "destructive"
          })
          return
        }
        
        // Test backend connectivity first
        const isBackendUp = await testBackendConnectivity()
        if (!isBackendUp) {
          setError("Server is not responding. Please check if the server is running.")
          return
        }
        
        // Build request params with pagination for active tab
        const params: { status?: string; level?: number; page?: number; limit?: number; today?: string; from?: string; to?: string } = {}

        // For admin, send status/level/page/limit to backend.
        // For OM/IC, do NOT send status/level/page/limit to avoid backend SQL ambiguity; we filter + paginate client-side.
        if (canViewAllEscalations) {
          const effectiveStatus = statusFilter !== "all" ? statusFilter : activeTab
          if (effectiveStatus !== "all") params.status = effectiveStatus
          if (levelFilter !== "all") params.level = parseInt(levelFilter)
          params.page = currentPage
          params.limit = itemsPerPage
          params.today = 'false'
        } else {
          // Ensure backend returns beyond today for OM/IC
          params.today = 'false'
        }
        
        // console.log("📋 Request params:", params)
        // console.log("🔗 Full API URL will be:", `https://oms-server-ntlv.onrender.com/escalation/my-escalations?${new URLSearchParams(params as any).toString()}`)
        
        // Choose the correct endpoint
        let response
        const isAssignedTab = (activeTab || '').toLowerCase() === 'assigned'
        if (canViewAllEscalations) {
          if (isAssignedTab) {
            // For Assigned tab on Admin: fetch wide dataset once, then derive + paginate client-side
            console.log("🔓 Calling /escalation/all (admin, wide fetch for Assigned tab)")
            response = await escalationApi.getAllEscalations({ today: 'false' })
          } else {
            console.log("🔓 Calling /escalation/all with params (admin server-side pagination)")
            response = await escalationApi.getAllEscalations(params)
          }
        } else if (isOperationsManager) {
          console.log("🔒 Calling /escalation/my-escalations (OM single-source)")
          response = await escalationApi.getMyEscalations({ today: 'false' })
        } else {
          console.log("🔒 Calling /escalation/my-escalations (IC endpoint, one-shot)")
          response = await escalationApi.getMyEscalations({ today: 'false' })
        }

        // No more fallback; we prefetch both for OM
        
        console.log("📥 API Response:", response)
        // console.log("📊 Response success:", response.success)
        // console.log("📊 Response data:", response.data)
        // console.log("📊 Response data type:", typeof response.data)
        // console.log("📊 Response data keys:", response.data ? Object.keys(response.data) : 'No data')
        
        // Log the actual response data structure in detail
        // if (response.data) {
        //   console.log("🔍 Detailed response analysis:")
        //   console.log("  - escalations:", response.data.escalations)
        //   console.log("  - grouped:", response.data.grouped)
        //   console.log("  - summary:", response.data.summary)
        //   console.log("  - total:", response.data.total)
        //   console.log("  - All keys:", Object.keys(response.data))
        // }
        
        if (response.success) {
          console.log("✅ Success! Setting escalations:", response.data.escalations?.length || 0)
          console.log("📊 Full response data structure:", response.data)
          console.log("🔍 Response data keys:", Object.keys(response.data))
          
          // Handle escalations data
          const coalesceStatus = (s: string) => (s || '').toLowerCase().replace('-', '_')
          const inferStatus = (e: any) => coalesceStatus(e?.display_status || e?.status || e?.current_status || e?.state || '')
          let full = response.data.escalations || []
          // Some OM endpoints return grouped only; merge into a flat list if needed
          if (Array.isArray(full) && full.length === 0 && response.data.grouped) {
            const g = response.data.grouped
            const merged = [
              ...(g.open || []).map((x: any) => ({ ...x, display_status: x.display_status || 'open' })),
              ...(g.in_progress || []).map((x: any) => ({ ...x, display_status: x.display_status || 'in_progress' })),
              ...(g.resolved || []).map((x: any) => ({ ...x, display_status: x.display_status || 'resolved' })),
              ...(g.overdue || []).map((x: any) => ({ ...x, display_status: x.display_status || 'overdue' })),
            ]
            full = merged
          }
          const activeStatus = coalesceStatus(activeTab || 'open')
          // Determine "my assigned" filter
          const currentUserId = user?.id
          const currentUserFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
          const assignedFilter = (e: any) =>
            (currentUserId && e?.escalated_to === currentUserId) ||
            (currentUserId && e?.assigned_to === currentUserId) ||
            (currentUserFullName && e?.assigned_to_name === currentUserFullName)

          // Assigned derived from the same source list for all roles
          const assignedFull: Escalation[] = full.filter(assignedFilter)

          // Build filtered view without triggering a reload on tab switch
          const filteredForView = isAssignedTab
            ? assignedFull
            : (canViewAllEscalations ? full : full.filter((e: any) => inferStatus(e) === activeStatus))
          const offset = (currentPage - 1) * itemsPerPage
          // For Admin non-Assigned tabs: server already paginates; for others paginate client-side
          const pageSlice = (canViewAllEscalations && !isAssignedTab)
            ? full
            : filteredForView.slice(offset, offset + itemsPerPage)
          setEscalations(pageSlice)
          // Build grouped lists for all tabs so UI renders content per tab
          setGroupedEscalations({
            open: full.filter((e: any) => inferStatus(e) === 'open'),
            in_progress: full.filter((e: any) => inferStatus(e) === 'in_progress'),
            resolved: full.filter((e: any) => inferStatus(e) === 'resolved'),
            overdue: full.filter((e: any) => inferStatus(e) === 'overdue'),
          })
          
          // Handle counts for tab headers
          if (response.data.summary && canViewAllEscalations) {
            setTabCounts({
              open: response.data.summary.open || 0,
              in_progress: response.data.summary.in_progress || 0,
              resolved: response.data.summary.resolved || 0,
              overdue: response.data.summary.overdue || 0,
              assigned: assignedFull.length,
            })
          } else if (response.data.grouped && canViewAllEscalations) {
            setTabCounts({
              open: response.data.grouped.open?.length || 0,
              in_progress: response.data.grouped.in_progress?.length || 0,
              resolved: response.data.grouped.resolved?.length || 0,
              overdue: response.data.grouped.overdue?.length || 0,
              assigned: assignedFull.length,
            })
          } else {
            // Fallback count based on full data (accurate for OM/IC)
            setTabCounts({
              open: full.filter((e: any) => inferStatus(e) === 'open').length,
              in_progress: full.filter((e: any) => inferStatus(e) === 'in_progress').length,
              resolved: full.filter((e: any) => inferStatus(e) === 'resolved').length,
              overdue: full.filter((e: any) => inferStatus(e) === 'overdue').length,
              assigned: assignedFull.length,
            })
          }
          
          // Handle total items
          if (isAssignedTab) {
            setTotalItems(assignedFull.length)
          } else if (canViewAllEscalations) {
            setTotalItems(response.data.total ?? full.length)
          } else {
            setTotalItems(filteredForView.length)
          }

          // Cache by status key for instant tab switches (avoid flicker)
          // Populate cache for all tabs upfront to avoid reloads on switches
          const buildCacheEntry = (list: Escalation[]) => ({
            escalations: list.slice(0, itemsPerPage),
            full: list,
            grouped: {
              open: list.filter((e: any) => inferStatus(e) === 'open'),
              in_progress: list.filter((e: any) => inferStatus(e) === 'in_progress'),
              resolved: list.filter((e: any) => inferStatus(e) === 'resolved'),
              overdue: list.filter((e: any) => inferStatus(e) === 'overdue')
            },
            total: list.length,
            summary: {
              open: list.filter((e: any) => inferStatus(e) === 'open').length,
              in_progress: list.filter((e: any) => inferStatus(e) === 'in_progress').length,
              resolved: list.filter((e: any) => inferStatus(e) === 'resolved').length,
              overdue: list.filter((e: any) => inferStatus(e) === 'overdue').length
            }
          })
          setCacheByStatus({
            open: buildCacheEntry(full.filter((e: any) => inferStatus(e) === 'open')),
            in_progress: buildCacheEntry(full.filter((e: any) => inferStatus(e) === 'in_progress')),
            resolved: buildCacheEntry(full.filter((e: any) => inferStatus(e) === 'resolved')),
            overdue: buildCacheEntry(full.filter((e: any) => inferStatus(e) === 'overdue')),
            assigned: buildCacheEntry(assignedFull)
          })
          
          // Handle stats - prefer API summary; otherwise compute from full cached data
          if (response.data.summary) {
            console.log("📊 Using API summary data")
            setStats({
              open: response.data.summary.open || 0,
              in_progress: response.data.summary.in_progress || 0,
              resolved_today: response.data.summary.resolved || 0,
              overdue: response.data.summary.overdue || 0
            })
          } else {
            console.log("📊 Calculating stats from escalations")
            // Fallback: calculate stats from full cached data (not the current page)
            const statsFromFull = {
              open: full.filter((e: any) => inferStatus(e) === 'open').length,
              in_progress: full.filter((e: any) => inferStatus(e) === 'in_progress').length,
              resolved_today: full.filter((e: any) => inferStatus(e) === 'resolved').length,
              overdue: full.filter((e: any) => inferStatus(e) === 'overdue').length,
            }
            setStats(statsFromFull)
          }
        } else {
          console.error("❌ API returned success: false")
          setError("Failed to fetch escalations")
        }
      } catch (err: any) {
        console.error("💥 Error fetching escalations:", err)
        console.error("Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          name: err instanceof Error ? err.name : undefined
        })
        console.error("Error response:", err.response?.data)
        console.error("Error status:", err.response?.status)
        console.error("Error headers:", err.response?.headers)
        setError(`Failed to fetch escalations: ${err.response?.data?.message || (err instanceof Error ? err.message : 'Unknown error')}`)
        toast({
          title: "Error",
          description: `Failed to fetch escalations: ${err.response?.data?.message || (err instanceof Error ? err.message : 'Unknown error')}`,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
        isFetchingRef.current = false
      }
    }

    fetchEscalations()
  }, [statusFilter, levelFilter, toast, canViewAllEscalations, userRole, userPermissions, currentPage, itemsPerPage, activeTab, refreshNonce])

  // Note: Filtering and grouping is now handled by the API based on activeTab and filters


  const handleResolveEscalation = async (escalationId: string, resolutionNotes: string) => {
    try {
      toast({ title: "Resolving...", description: "Submitting resolution", })
      console.log("🔧 Resolving escalation:", escalationId, "with notes:", resolutionNotes)
      
      // First, try to get workflow state to understand current status
      try {
        const workflowState = await escalationApi.getWorkflowState(escalationId)
        console.log("🔧 Current workflow state:", workflowState)
      } catch {
        console.log("⚠️ Could not get workflow state, proceeding with direct resolution")
      }

      const response = await escalationApi.resolveEscalation(escalationId, { resolutionNotes })
      
      console.log("📤 Resolve response:", response)
      
      if (response.success) {
        // Refresh the escalations list with current pagination
        const refreshParams = {
          page: currentPage,
          limit: itemsPerPage,
          today: 'false',
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...(levelFilter !== "all" && { level: parseInt(levelFilter) })
        }
        
        const updatedResponse = canViewAllEscalations 
          ? await escalationApi.getAllEscalations(refreshParams)
          : await escalationApi.getMyEscalations(refreshParams)
        if (updatedResponse.success) {
          setEscalations(updatedResponse.data.escalations)
          setTotalItems(updatedResponse.data.total || updatedResponse.data.escalations.length)
          setStats({
            open: updatedResponse.data.summary.open,
            in_progress: updatedResponse.data.summary.in_progress,
            resolved_today: updatedResponse.data.summary.resolved,
            overdue: updatedResponse.data.summary.overdue
          })
        }
        
        toast({
          title: "Success",
          description: "Escalation resolved successfully"
        })
        try { await Swal.fire({ icon: 'success', title: 'Resolved', text: 'Escalation resolved successfully.' }) } catch {}
        // Notify sidebar bell to refresh
        try { window.dispatchEvent(new Event('oms:notifications:refresh')) } catch {}
      } else {
        throw new Error("Failed to resolve escalation")
      }
    } catch (err: any) {
      console.error("Error resolving escalation:", err)
      console.error("Resolve error response:", err?.response?.data)
      console.error("Resolve error status:", err?.response?.status)
      toast({
        title: "Resolve failed",
        description: err?.response?.data?.error?.message || err?.message || "Failed to resolve escalation.",
        variant: "destructive"
      })
      try { await Swal.fire({ icon: 'error', title: 'Resolve failed', text: err?.response?.data?.error?.message || err?.message || 'Failed to resolve escalation.' }) } catch {}
    }
  }

  const handleEscalateToNextLevel = async (escalationId: string) => {
    try {
      toast({ title: "Escalating...", description: "Requesting next level escalation" })
      const escalation = escalations.find(e => e.id === escalationId)
      if (!escalation) return

      console.log("🔄 Escalating further:", escalationId)
      
      // First, try to get workflow state to understand current status
      try {
        const workflowState = await escalationApi.getWorkflowState(escalationId)
        console.log("🔧 Current workflow state:", workflowState)
      } catch {
        console.log("⚠️ Could not get workflow state, proceeding with direct escalation")
      }

      const response = await escalationApi.escalateFurther(escalationId, {
        escalationReason: escalation.escalation_reason,
        escalatedTo: escalation.escalated_to,
        priority: escalation.priority
      })
      
      console.log("📤 Escalate further response:", response)
      
      if (response.success) {
        // Refresh the escalations list with current pagination
        const refreshParams = {
          page: currentPage,
          limit: itemsPerPage,
          today: 'false',
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...(levelFilter !== "all" && { level: parseInt(levelFilter) })
        }
        
        const updatedResponse = canViewAllEscalations 
          ? await escalationApi.getAllEscalations(refreshParams)
          : await escalationApi.getMyEscalations(refreshParams)
        if (updatedResponse.success) {
          setEscalations(updatedResponse.data.escalations)
          setTotalItems(updatedResponse.data.total || updatedResponse.data.escalations.length)
          setStats({
            open: updatedResponse.data.summary.open,
            in_progress: updatedResponse.data.summary.in_progress,
            resolved_today: updatedResponse.data.summary.resolved,
            overdue: updatedResponse.data.summary.overdue
          })
        }
        
        toast({
          title: "Success",
          description: `Escalation escalated to level ${response.level}`
        })
        try { await Swal.fire({ icon: 'success', title: 'Escalated', text: `Escalation escalated to level ${response.level}` }) } catch {}
        // Notify sidebar bell to refresh
        try { window.dispatchEvent(new Event('oms:notifications:refresh')) } catch {}
      } else {
        throw new Error("Failed to escalate further")
      }
    } catch (err: any) {
      console.error("Error escalating further:", err)
      console.error("Escalate error response:", err?.response?.data)
      console.error("Escalate error status:", err?.response?.status)
      toast({
        title: "Escalation failed",
        description: err?.response?.data?.error?.message || err?.message || "Failed to escalate further.",
        variant: "destructive"
      })
      try { await Swal.fire({ icon: 'error', title: 'Escalation failed', text: err?.response?.data?.error?.message || err?.message || 'Failed to escalate further.' }) } catch {}
    }
  }

  const handleCreateEscalation = async () => {
    try {
      // Validate required fields
      if (!createForm.orderId || !createForm.escalationReason) {
        toast({ title: "Error", description: "Order ID and reason are required", variant: "destructive" })
        try { await Swal.fire({ icon: 'error', title: 'Missing fields', text: 'Order ID and escalation reason are required.' }) } catch {}
        return
      }

      // Accept either UUID or OMS order number like ORD-XXXX-XXXX
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      const orderNumRegex = /^ORD-[A-Z0-9-]+$/i
      const orderIdTrimmed = createForm.orderId.trim()
      if (!(uuidRegex.test(orderIdTrimmed) || orderNumRegex.test(orderIdTrimmed))) {
        const msg = 'Enter a valid Order ID (UUID) or Order Number like ORD-XXXX.'
        toast({ title: "Invalid Order Identifier", description: msg, variant: "destructive" })
        try { await Swal.fire({ icon: 'error', title: 'Invalid Order Identifier', text: msg }) } catch {}
        return
      }
      if (createForm.escalatedTo && createForm.escalatedTo.trim() && !uuidRegex.test(createForm.escalatedTo.trim())) {
        toast({ title: "Invalid User ID", description: "Escalate To must be a valid UUID", variant: "destructive" })
        try { await Swal.fire({ icon: 'error', title: 'Invalid User ID', text: 'Escalate To must be a valid UUID.' }) } catch {}
        return
      }

      const response = await escalationApi.createEscalation({
        orderId: orderIdTrimmed,
        escalationReason: createForm.escalationReason.trim(),
        escalationLevel: 1,
        // If empty, omit to allow backend to treat as NULL
        escalatedTo: createForm.escalatedTo && createForm.escalatedTo.trim() ? createForm.escalatedTo.trim() : (undefined as any),
        priority: createForm.priority
      })

      if (response.success) {
        // Refresh the escalations list with current pagination
        const refreshParams = {
          page: currentPage,
          limit: itemsPerPage,
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...(levelFilter !== "all" && { level: parseInt(levelFilter) })
        }
        
        const updatedResponse = canViewAllEscalations 
          ? await escalationApi.getAllEscalations(refreshParams)
          : await escalationApi.getMyEscalations(refreshParams)
        if (updatedResponse.success) {
          setEscalations(updatedResponse.data.escalations)
          setTotalItems(updatedResponse.data.total || updatedResponse.data.escalations.length)
          setStats({
            open: updatedResponse.data.summary.open,
            in_progress: updatedResponse.data.summary.in_progress,
            resolved_today: updatedResponse.data.summary.resolved,
            overdue: updatedResponse.data.summary.overdue
          })
        }

        // Reset form
        setCreateForm({
          orderId: "",
          escalationReason: "",
          escalatedTo: "",
          priority: "medium"
        })
        setIsCreateDialogOpen(false)

        toast({
          title: "Success",
          description: "Escalation created successfully"
        })
        try { await Swal.fire({ icon: 'success', title: 'Created', text: 'Escalation created successfully.' }) } catch {}
      } else {
        throw new Error("Failed to create escalation")
      }
    } catch (err) {
      console.error("Error creating escalation:", err)
      toast({
        title: "Error",
        description: "Failed to create escalation. Please try again.",
        variant: "destructive"
      })
      try { await Swal.fire({ icon: 'error', title: 'Create failed', text: 'Failed to create escalation. Please try again.' }) } catch {}
    }
  }

  const handleAssignEscalation = async (escalationId: string, userId: string) => {
    try {
      toast({ title: "Assigning...", description: "Assigning escalation to selected user" })
      console.log("👤 Assigning escalation:", escalationId, "to user:", userId)
      
      const selected = eligibleAssignees.find(u => u.id === userId)
      if (!selected) {
        toast({
          title: "Select from list",
          description: "Please select an assignee from the dropdown so we include their full name.",
          variant: "destructive"
        })
        return
      }
      const response = await escalationApi.assignEscalation(escalationId, {
        assignedTo: userId,
        assignedToName: selected.name,
        broadcast: false
      })
      
      if (response.success) {
        // Show toast first to avoid being blocked by subsequent state work
        toast({
          title: "Success",
          description: `Escalation assigned to ${response.data.assigned_to_name}`
        })
        try { await Swal.fire({ icon: 'success', title: 'Assigned', text: `Escalation assigned to ${response.data.assigned_to_name}` }) } catch {}
        // Lightweight refresh to keep UI in sync without heavy state churn
        setRefreshNonce(n => n + 1)
      } else {
        throw new Error("Failed to assign escalation")
      }
    } catch (err: any) {
      console.error("Error assigning escalation:", err)
      const message = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to assign escalation. Please try again."
      toast({
        title: "Assignment failed",
        description: message,
        variant: "destructive"
      })
      try { await Swal.fire({ icon: 'error', title: 'Assignment failed', text: message }) } catch {}
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 container mx-auto min-w-0">
          <div className="space-y-6">
      {/* Toaster is mounted globally */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalation Management</h1>
          <p className="text-muted-foreground">Monitor and resolve escalated tasks and orders</p>
          {/*  */}
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Escalation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Manual Escalation</DialogTitle>
              <DialogDescription>Escalate an order or task that requires immediate attention.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="order">Order</Label>
                {manualOptionsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading orders…</div>
                ) : manualOrders.length > 0 ? (
                  <Select value={createForm.orderId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, orderId: value }))}>
                    <SelectTrigger id="order">
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent>
                      {manualOrders.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.order_number} – {o.customer_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="order"
                    placeholder="Enter order ID to escalate"
                    value={createForm.orderId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, orderId: e.target.value }))}
                  />
                )}
                {manualOptionsError && <div className="text-xs text-destructive">{manualOptionsError}</div>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="escalateTo">Escalate To</Label>
                {manualOptionsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading assignees…</div>
                ) : manualAssignees.length > 0 ? (
                  <Select value={createForm.escalatedTo} onValueChange={(value) => setCreateForm(prev => ({ ...prev, escalatedTo: value }))}>
                    <SelectTrigger id="escalateTo">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {manualAssignees
                        .sort((a, b) => a.openEscalations - b.openEscalations)
                        .map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name} ({u.role}) – open: {u.openEscalations}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="escalateTo"
                    placeholder="Enter user ID to escalate to"
                    value={createForm.escalatedTo}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, escalatedTo: e.target.value }))}
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={createForm.priority} onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Escalation Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe why this needs to be escalated..."
                  className="min-h-[100px]"
                  value={createForm.escalationReason}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, escalationReason: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEscalation} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Escalation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Assign Escalation</DialogTitle>
              <DialogDescription>
                Assign this escalation to a team member for resolution.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="assignTo">Assign To</Label>
                {eligibleLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading eligible assignees...
                  </div>
                )}
                {eligibleError && (
                  <div className="text-sm text-destructive">{eligibleError}</div>
                )}
                {!eligibleLoading && eligibleAssignees.length > 0 ? (
                  <Select value={assignToUser} onValueChange={setAssignToUser}>
                    <SelectTrigger id="assignTo">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleAssignees.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role}) – open: {user.open_count}, 24h: {user.recent_assignments_24h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (!eligibleLoading && (
                  <Input
                    id="assignTo"
                    placeholder="Enter user ID or email"
                    value={assignToUser}
                    onChange={(e) => setAssignToUser(e.target.value)}
                  />
                ))}
              </div>
              {selectedEscalation && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-sm font-medium">Escalation Details:</div>
                  <div className="text-sm text-gray-600">
                    Order {selectedEscalation.order_number} - Level {selectedEscalation.escalation_level}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedEscalation.escalation_reason}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAssignDialogOpen(false)
                setSelectedEscalation(null)
                setAssignToUser("")
                setEligibleAssignees([])
                setEligibleError(null)
              }}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedEscalation && assignToUser.trim()) {
                    handleAssignEscalation(selectedEscalation.id, assignToUser.trim())
                    setIsAssignDialogOpen(false)
                    setSelectedEscalation(null)
                    setAssignToUser("")
                    setEligibleAssignees([])
                    setEligibleError(null)
                  }
                }}
                disabled={!assignToUser.trim()}
              >
                Assign Escalation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
            <p className="text-xs text-muted-foreground">Being actively worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved_today}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <ArrowUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Over 24 hours old</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Escalations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search escalations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-muted-foreground">Loading escalations...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escalations Tabs */}
      {!loading && !error && (
        <Tabs value={activeTab} className="space-y-4" onValueChange={(value) => {
          setActiveTab(value)
          // Restore last page per tab
          const remembered = pageByStatus[value as keyof typeof pageByStatus] || 1
          setCurrentPage(remembered)
          // Optimistic UI: show cached payload immediately if present
          const cached = cacheByStatus[value]
          if (cached) {
            const offset = (remembered - 1) * itemsPerPage
            const slice = cached.full.slice(offset, offset + itemsPerPage)
            setEscalations(slice)
            setGroupedEscalations(cached.grouped)
            setTotalItems(cached.total)
            setStats({
              open: cached.summary.open,
              in_progress: cached.summary.in_progress,
              resolved_today: cached.summary.resolved,
              overdue: cached.summary.overdue
            })
          }
        }}>
        <TabsList>
            <TabsTrigger value="open">Open ({tabCounts.open})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({tabCounts.in_progress})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({tabCounts.resolved})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({tabCounts.overdue})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({tabCounts.assigned})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {(activeTab === 'open' ? escalations : groupedEscalations.open).map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
              onAssign={(escalation) => {
                setSelectedEscalation(escalation)
                setIsAssignDialogOpen(true)
              }}
            />
          ))}
          {(activeTab === 'open' ? escalations : groupedEscalations.open).length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No open escalations found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {(activeTab === 'in_progress' ? escalations : groupedEscalations.in_progress).map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
              onAssign={(escalation) => {
                setSelectedEscalation(escalation)
                setIsAssignDialogOpen(true)
              }}
            />
          ))}
          {(activeTab === 'in_progress' ? escalations : groupedEscalations.in_progress).length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No escalations in progress.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {(activeTab === 'resolved' ? escalations : groupedEscalations.resolved).map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
              onAssign={(escalation) => {
                setSelectedEscalation(escalation)
                setIsAssignDialogOpen(true)
              }}
            />
          ))}
          {(activeTab === 'resolved' ? escalations : groupedEscalations.resolved).length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No resolved escalations found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="overdue" className="space-y-4">
          {(activeTab === 'overdue' ? escalations : groupedEscalations.overdue).map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
              onAssign={(escalation) => {
                setSelectedEscalation(escalation)
                setIsAssignDialogOpen(true)
              }}
            />
          ))}
          {(activeTab === 'overdue' ? escalations : groupedEscalations.overdue).length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No overdue escalations found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="assigned" className="space-y-4">
          {(activeTab === 'assigned' ? escalations : groupedEscalations.in_progress).filter(e => (e.assigned_to && user?.id && e.assigned_to === user.id) || (e.assigned_to_name && `${user?.first_name || ''} ${user?.last_name || ''}`.trim() === e.assigned_to_name)).map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolveEscalation}
              onEscalate={handleEscalateToNextLevel}
              onAssign={(escalation) => {
                setSelectedEscalation(escalation)
                setIsAssignDialogOpen(true)
              }}
            />
          ))}
          {(activeTab === 'assigned' ? escalations : groupedEscalations.in_progress).filter(e => (e.assigned_to && user?.id && e.assigned_to === user.id) || (e.assigned_to_name && `${user?.first_name || ''} ${user?.last_name || ''}`.trim() === e.assigned_to_name)).length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No escalations assigned to you.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
        )}
        
        {totalItems > itemsPerPage && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} escalations
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    size="default"
                    onClick={() => {
                      const next = Math.max(1, currentPage - 1)
                      setPageByStatus(prev => ({ ...prev, [activeTab]: next }))
                      const cached = cacheByStatus[activeTab]
                      if (cached) {
                        const offset = (next - 1) * itemsPerPage
                        setEscalations(cached.full.slice(offset, offset + itemsPerPage))
                        setTotalItems(cached.full.length)
                      }
                      setCurrentPage(next)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {/* Page numbers */}
                {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === Math.ceil(totalItems / itemsPerPage) || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          size="default"
                          onClick={() => {
                            setPageByStatus(prev => ({ ...prev, [activeTab]: page }))
                            const cached = cacheByStatus[activeTab]
                            if (cached) {
                              const offset = (page - 1) * itemsPerPage
                              setEscalations(cached.full.slice(offset, offset + itemsPerPage))
                              setTotalItems(cached.full.length)
                            }
                            setCurrentPage(page)
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </div>
                  ))}
                <PaginationItem>
                  <PaginationNext 
                    size="default"
                    onClick={() => {
                      const maxPage = Math.ceil(totalItems / itemsPerPage)
                      const next = Math.min(maxPage, currentPage + 1)
                      setPageByStatus(prev => ({ ...prev, [activeTab]: next }))
                      const cached = cacheByStatus[activeTab]
                      if (cached) {
                        const offset = (next - 1) * itemsPerPage
                        setEscalations(cached.full.slice(offset, offset + itemsPerPage))
                        setTotalItems(cached.full.length)
                      }
                      setCurrentPage(next)
                    }}
                    className={currentPage === Math.ceil(totalItems / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  )
}

function EscalationCard({
  escalation,
  onResolve,
  onEscalate,
  onAssign,
}: {
  escalation: Escalation
  onResolve: (id: string, notes: string) => void
  onEscalate: (id: string) => void
  onAssign: (escalation: Escalation) => void
}) {
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState("")

  const getEscalationPriorityColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case 3:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const agingHours = escalation.aging_hours

  return (
    <Card className={`${agingHours > 24 ? "border-red-200 bg-red-50" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getEscalationPriorityColor(escalation.escalation_level)}>
                Level {escalation.escalation_level}
              </Badge>
              <Badge className={getStatusColor(escalation.display_status)}>{escalation.display_status}</Badge>
              {(escalation.assigned_to || escalation.assigned_to_name) && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <User className="mr-1 h-3 w-3" />
                  Assigned to {escalation.assigned_to_name || escalation.assigned_to}
                </Badge>
              )}
              {!escalation.assigned_to && !escalation.assigned_to_name && (
                <Badge variant="outline" className="border-orange-200 text-orange-700">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Unassigned
                </Badge>
              )}
              {agingHours > 24 && <Badge variant="destructive">Overdue ({agingHours}h)</Badge>}
            </div>
            <CardTitle className="text-lg">
              Order {escalation.order_number}
            </CardTitle>
            <CardDescription>{escalation.escalation_reason}</CardDescription>
          </div>
          <div className="flex gap-2">
            {escalation.display_status !== "resolved" && !escalation.assigned_to && !escalation.assigned_to_name && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAssign(escalation)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign
              </Button>
            )}
            {escalation.display_status !== "resolved" && (
              <>
                <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Resolve Escalation</DialogTitle>
                      <DialogDescription>Provide resolution notes for this escalation.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="resolution">Resolution Notes</Label>
                        <Textarea
                          id="resolution"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Describe how this escalation was resolved..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          onResolve(escalation.id, resolutionNotes)
                          setIsResolveDialogOpen(false)
                          setResolutionNotes("")
                        }}
                        disabled={!resolutionNotes.trim()}
                      >
                        Resolve Escalation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {escalation.escalation_level < 3 && (
                  <Button variant="outline" size="sm" onClick={() => onEscalate(escalation.id)}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Escalate Further
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Escalated by:</strong> {escalation.escalated_by_name?.trim() ? escalation.escalated_by_name : 'Auto escalation'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Assigned to:</strong> {escalation.assigned_to_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Created:</strong> {new Date(escalation.created_at).toLocaleString()}
              </span>
            </div>
          </div>
            <div className="space-y-2">
              <div className="text-sm">
              <strong>Customer:</strong> {escalation.customer_name}
              </div>
              <div className="text-sm">
              <strong>Service:</strong> {escalation.service_type}
              </div>
              <div className="text-sm">
              <strong>Order Status:</strong> {escalation.order_status}
              </div>
              <div className="text-sm">
              <strong>Priority:</strong> {escalation.priority}
            </div>
        </div>
        </div>
        {escalation.resolution_notes && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm font-medium text-green-800 mb-1">Resolution Notes:</div>
            <div className="text-sm text-green-700">{escalation.resolution_notes}</div>
            {escalation.resolved_at && (
              <div className="text-xs text-green-600 mt-1">
                Resolved on {new Date(escalation.resolved_at).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
