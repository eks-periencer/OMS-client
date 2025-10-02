import { apiClient } from './client'

// Types based on the API documentation
export interface Escalation {
  id: string
  order_id: string
  task_id: string | null
  escalation_level: number
  escalated_from: string
  escalated_to: string
  escalation_reason: string
  status: string
  escalation_type: string
  priority: string
  created_at: string
  resolved_at?: string
  resolution_notes?: string
  order_number: string
  order_status: string
  order_priority: string
  service_type: string
  customer_name: string
  customer_email: string
  escalated_by_name: string
  assigned_to?: string | null
  assigned_to_name?: string | null
  aging_hours: number
  display_status: string
}

export interface EscalationsResponse {
  success: boolean
  data: {
    escalations: Escalation[]
    grouped: {
      open: Escalation[]
      in_progress: Escalation[]
      resolved: Escalation[]
      overdue: Escalation[]
    }
    total: number
    summary: {
      open: number
      in_progress: number
      resolved: number
      overdue: number
    }
  }
}

export interface CreateEscalationRequest {
  orderId: string
  taskId?: string
  escalationReason: string
  escalationLevel: number
  escalatedTo: string
  priority: string
  justification?: string
}

export interface ResolveEscalationRequest {
  resolutionNotes: string
}

export interface EscalateFurtherRequest {
  escalationReason: string
  escalatedTo: string
  priority: string
}

export interface AssignEscalationRequest {
  assignedTo: string
  assignedToName?: string
  broadcast?: boolean
}

export interface EscalationStats {
  open: number
  in_progress: number
  resolved_today: number
  overdue: number
}

export interface EligibleAssignee {
  id: string
  name: string
  email: string
  role: string
  open_count: number
  recent_assignments_24h: number
}

export interface ManualEscalationOptionsResponse {
  success: boolean
  data: {
    orders: Array<{
      id: string
      order_number: string
      customer_id: string
      customer_name: string
      customer_email: string
      priority: string
      order_type: string
      current_state: string | null
      created_at: string
    }>
    assignees: Array<{
      id: string
      name: string
      email: string
      role: string
      openEscalations: number
    }>
  }
}

// API Functions
export const escalationApi = {
  // Get escalations assigned to current user
  async getMyEscalations(params?: {
    status?: string
    level?: number
    page?: number
    limit?: number
    today?: string
    from?: string
    to?: string
  }): Promise<EscalationsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.level) queryParams.append('level', params.level.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.today) queryParams.append('today', params.today)
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    
    const qs = queryParams.toString()
    const url = `/escalation/my-escalations${qs ? `?${qs}` : ''}`
    
    const response = await apiClient.get(url)
    return response.data
  },

  // Get team escalations (Operations Manager)
  async getMyTeamEscalations(params?: {
    status?: string
    level?: number
    page?: number
    limit?: number
    today?: string
    from?: string
    to?: string
  }): Promise<EscalationsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.level) queryParams.append('level', params.level.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.today) queryParams.append('today', params.today)
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)

    const qs = queryParams.toString()
    const url = `/escalation/my-team${qs ? `?${qs}` : ''}`

    const response = await apiClient.get(url)
    return response.data
  },

  // Get all escalations (admin only)
  async getAllEscalations(params?: {
    status?: string
    level?: number
    orderId?: string
    page?: number
    limit?: number
    today?: string
    from?: string
    to?: string
  }): Promise<EscalationsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.level) queryParams.append('level', params.level.toString())
    if (params?.orderId) queryParams.append('orderId', params.orderId)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.today) queryParams.append('today', params.today)
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    
    const qs = queryParams.toString()
    const url = `/escalation/all${qs ? `?${qs}` : ''}`
    const response = await apiClient.get(url)
    return response.data
  },

  // Create a new escalation
  async createEscalation(data: CreateEscalationRequest): Promise<{ success: boolean; id: string }> {
    const response = await apiClient.post('/escalation', data)
    return response.data
  },

  // Resolve an escalation
  async resolveEscalation(id: string, data: ResolveEscalationRequest): Promise<{ success: boolean }> {
    const response = await apiClient.put(`/escalation/${id}/resolve`, data)
    return response.data
  },

  // Escalate to next level
  async escalateFurther(id: string, data: EscalateFurtherRequest): Promise<{ success: boolean; id: string; level: number }> {
    const response = await apiClient.post(`/escalation/${id}/escalate-further`, data)
    return response.data
  },

  // Get escalation detail with workflow
  async getEscalationDetail(id: string): Promise<{
    success: boolean
    data: {
      escalation: Escalation
      workflow: {
        state: {
          stateName: string
          instanceId: string
        }
        history: Array<{
          id: string
          instance_id: string
          from_state_id: string
          to_state_id: string
          transition_id: string
          executed_by: string
          execution_reason: string
          execution_data: Record<string, unknown>
          executed_at: string
          from_state_name: string
          to_state_name: string
        }>
      }
    }
  }> {
    const response = await apiClient.get(`/escalation/${id}/detail`)
    return response.data
  },

  // Get global escalation statistics (admin only)
  async getGlobalStats(): Promise<{ success: boolean; data: EscalationStats }> {
    const response = await apiClient.get('/escalation/stats')
    return response.data
  },

  // Get user-specific escalation statistics
  async getMyStats(): Promise<{ success: boolean; data: EscalationStats }> {
    const response = await apiClient.get('/escalation/my/stats')
    return response.data
  },

  // Assign escalation to a user
  async assignEscalation(escalationId: string, data: AssignEscalationRequest): Promise<{
    success: boolean
    data: {
      id: string
      assigned_to: string
      assigned_to_name: string
      assigned_at: string
    }
  }> {
    const response = await apiClient.post(`/escalation/${escalationId}/assign`, data)
    return response.data
  },

  // Get eligible assignees for an escalation
  async getEligibleAssignees(escalationId: string, params?: { role?: string; limit?: number }): Promise<{
    success: boolean
    data: EligibleAssignee[]
  }> {
    const queryParams = new URLSearchParams()
    if (params?.role) queryParams.append('role', params.role)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const qs = queryParams.toString()
    const url = `/escalation/${escalationId}/eligible-assignees${qs ? `?${qs}` : ''}`
    const response = await apiClient.get(url)
    return response.data
  },

  // Get team-specific escalation statistics (Operations Manager)
  async getMyTeamStats(): Promise<{ success: boolean; data: EscalationStats }> {
    const response = await apiClient.get('/escalation/my-team/stats')
    return response.data
  },

  // Get escalation rules (admin only)
  async getEscalationRules(): Promise<{
    success: boolean
    data: Array<{
      id: string
      name: string
      order_type: string
      fno_id: string
      task_type: string
      priority: string
      time_threshold_hours: number
      reescalate_after_hours: number
      max_levels: number
      target_role: string
      is_active: boolean
      created_at: string
      updated_at: string
    }>
  }> {
    const response = await apiClient.get('/escalation/admin/rules')
    return response.data
  },

  // Create escalation rule (admin only)
  async createEscalationRule(data: {
    name: string
    order_type: string
    fno_id: string
    task_type: string
    priority: string
    time_threshold_hours: number
    reescalate_after_hours: number
    max_levels: number
    target_role: string
    is_active: boolean
  }): Promise<{
    success: boolean
    data: {
      id: string
      name: string
      order_type: string
      fno_id: string
      task_type: string
      priority: string
      time_threshold_hours: number
      reescalate_after_hours: number
      max_levels: number
      target_role: string
      is_active: boolean
      created_at: string
      updated_at: string
    }
  }> {
    const response = await apiClient.post('/escalation/admin/rules', data)
    return response.data
  },

  // Update escalation rule (admin only)
  async updateEscalationRule(id: string, data: Partial<{
    name: string
    order_type: string
    fno_id: string
    task_type: string
    priority: string
    time_threshold_hours: number
    reescalate_after_hours: number
    max_levels: number
    target_role: string
    is_active: boolean
  }>): Promise<{
    success: boolean
    data: {
      id: string
      name: string
      order_type: string
      fno_id: string
      task_type: string
      priority: string
      time_threshold_hours: number
      reescalate_after_hours: number
      max_levels: number
      target_role: string
      is_active: boolean
      created_at: string
      updated_at: string
    }
  }> {
    const response = await apiClient.put(`/escalation/admin/rules/${id}`, data)
    return response.data
  },

  // Get SLA policies (admin only)
  async getSlaPolicies(): Promise<{
    success: boolean
    data: Array<{
      id: string
      order_type: string
      task_type: string
      priority: string
      sla_hours: number
      warn_threshold_pct: number
      reescalate_threshold_pct: number
      is_active: boolean
      created_at: string
      updated_at: string
    }>
  }> {
    const response = await apiClient.get('/escalation/admin/sla')
    return response.data
  },

  // Create SLA policy (admin only)
  async createSlaPolicy(data: {
    order_type: string
    task_type: string
    priority: string
    sla_hours: number
    warn_threshold_pct: number
    reescalate_threshold_pct: number
    is_active: boolean
  }): Promise<{
    success: boolean
    data: {
      id: string
      order_type: string
      task_type: string
      priority: string
      sla_hours: number
      warn_threshold_pct: number
      reescalate_threshold_pct: number
      is_active: boolean
      created_at: string
      updated_at: string
    }
  }> {
    const response = await apiClient.post('/escalation/admin/sla', data)
    return response.data
  },

  // Update SLA policy (admin only)
  async updateSlaPolicy(id: string, data: Partial<{
    order_type: string
    task_type: string
    priority: string
    sla_hours: number
    warn_threshold_pct: number
    reescalate_threshold_pct: number
    is_active: boolean
  }>): Promise<{
    success: boolean
    data: {
      id: string
      order_type: string
      task_type: string
      priority: string
      sla_hours: number
      warn_threshold_pct: number
      reescalate_threshold_pct: number
      is_active: boolean
      created_at: string
      updated_at: string
    }
  }> {
    const response = await apiClient.put(`/escalation/admin/sla/${id}`, data)
    return response.data
  },

  // Set on-call user for a role (admin only)
  async setOnCallUser(roleName: string, userId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post('/escalation/admin/on-call', { roleName, userId })
    return response.data
  },

  // Get on-call user for a role (admin only)
  async getOnCallUser(roleName: string): Promise<{ success: boolean; data: { userId: string } }> {
    const response = await apiClient.get(`/escalation/admin/on-call?roleName=${roleName}`)
    return response.data
  },

  // Get workflow state for an escalation
  async getWorkflowState(escalationId: string): Promise<{
    success: boolean
    data: {
      stateName: string
      instanceId: string
    }
  }> {
    const response = await apiClient.get(`/escalation/workflow/${escalationId}/state`)
    return response.data
  },

  // Get workflow history for an escalation
  async getWorkflowHistory(escalationId: string): Promise<{
    success: boolean
    data: Array<{
      id: string
      instance_id: string
      from_state_id: string
      to_state_id: string
      transition_id: string
      executed_by: string
      execution_reason: string
      execution_data: Record<string, unknown>
      executed_at: string
      from_state_name: string
      to_state_name: string
    }>
  }> {
    const response = await apiClient.get(`/escalation/workflow/${escalationId}/history`)
    return response.data
  },

  // Execute workflow transition
  async executeWorkflowTransition(escalationId: string, data: {
    transition: string
    reason: string
    data: Record<string, unknown>
  }): Promise<{
    success: boolean
    data: {
      stateName: string
    }
  }> {
    const response = await apiClient.post(`/escalation/workflow/${escalationId}/transition`, data)
    return response.data
  },

  // Manual escalation helper: fetch orders and eligible assignees
  async getManualOptions(params?: { q?: string; limit?: number }): Promise<ManualEscalationOptionsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.q) queryParams.append('q', params.q)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const qs = queryParams.toString()
    const url = `/escalation/manual/options${qs ? `?${qs}` : ''}`
    const response = await apiClient.get(url)
    return response.data
  }
}
