// Type definitions for ISP Order Management System

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: Role
  reportingManager?: User
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  createdAt: string
}

export interface Customer {
  id: string
  customerNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: Address
  customerType: "individual" | "business"
  isTrial: boolean
  trialStartDate?: string
  trialEndDate?: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface Order {
  id: string
  orderNumber: string
  customer: Customer
  serviceType: "fiber" | "wireless" | "hybrid"
  servicePackage: string
  installationAddress: Address
  fno?: FNO
  fnoReference?: string
  currentState: OrderState
  priority: "low" | "normal" | "high" | "urgent"
  createdBy?: User
  assignedTo?: User
  estimatedCompletion?: string
  actualCompletion?: string
  createdAt: string
  updatedAt: string
}

export type OrderState =
  | "created"
  | "validated"
  | "fno_submitted"
  | "fno_accepted"
  | "in_progress"
  | "installation_scheduled"
  | "installed"
  | "activated"
  | "completed"
  | "cancelled"
  | "rejected"

export interface OrderStateHistory {
  id: string
  orderId: string
  fromState?: OrderState
  toState: OrderState
  changedBy?: User
  changeReason?: string
  createdAt: string
}

export interface FNO {
  id: string
  name: string
  code: string
  integrationType: "api" | "manual"
  apiEndpoint?: string
  portalUrl?: string
  coverageAreas: string[]
  isActive: boolean
  createdAt: string
}

export interface ApplicationInboxItem {
  id: string
  order: Order
  fno: FNO
  assignedTo?: User
  priority: "low" | "normal" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed"
  dueDate?: string
  completedAt?: string
  notes?: string
  createdAt: string
  agingHours: number
}

export interface Escalation {
  id: string
  order?: Order
  taskId?: string
  escalationLevel: number
  escalatedFrom: User
  escalatedTo: User
  escalationReason: string
  status: "open" | "in_progress" | "resolved" | "closed"
  resolvedAt?: string
  resolutionNotes?: string
  createdAt: string
  agingHours: number
}

export interface CustomerOnboarding {
  id: string
  customer: Customer
  order?: Order
  onboardingType: "new_customer" | "trial"
  currentStep: string
  completionPercentage: number
  steps: OnboardingStep[]
  assignedTo?: User
  startedAt: string
  completedAt?: string
  notes?: string
}

export interface OnboardingStep {
  id: string
  name: string
  description: string
  status: "pending" | "in_progress" | "completed" | "skipped"
  completedAt?: string
  completedBy?: User
  notes?: string
}

export interface TrialCustomer extends Customer {
  daysRemaining: number
  engagementScore: number
  lastActivity: string
  conversionCampaigns: number
}

export interface SystemConfig {
  id: string
  configKey: string
  configValue: any
  description?: string
  updatedBy?: User
  updatedAt: string
}

export interface AuditLog {
  id: string
  user?: User
  action: string
  resourceType: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface CreateOrderRequest {
  customerId: string
  serviceType: "fiber" | "wireless" | "hybrid"
  servicePackage: string
  installationAddress: Address
  priority?: "low" | "normal" | "high" | "urgent"
  notes?: string
}

export interface UpdateOrderStateRequest {
  newState: OrderState
  reason?: string
  notes?: string
}

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  phone?: string
  roleId: string
  reportingManagerId?: string
  temporaryPassword?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}
