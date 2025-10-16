import { apiClient } from './client';

export interface SystemSetting {
  key: string;
  value: any;
  version: number;
  updatedBy: {
    id: string;
    name: string;
    email: string;
  };
  updatedAt: string;
}

export interface SystemSettingsResponse {
  success: boolean;
  data: SystemSetting[];
}

export interface SingleSettingResponse {
  success: boolean;
  data: SystemSetting;
}

export interface ValidationResponse {
  success: boolean;
  valid: boolean;
  errors?: any[];
}

export interface AuditEntry {
  key: string;
  prevValue: any;
  nextValue: any;
  prevVersion: number;
  nextVersion: number;
  diff: any;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  isCurrentVersion: boolean;
  changeType: 'created' | 'updated' | 'rollback';
  isRollback: boolean;
}

export interface AuditResponse {
  success: boolean;
  data: {
    auditEntries: AuditEntry[];
    currentVersion: number;
    totalEntries: number;
  };
}

export interface UpdateSettingRequest {
  value: any;
  version?: number;
}

export interface PatchSettingRequest {
  valuePatch: any;
  version: number;
}

export interface RollbackRequest {
  toVersion: number;
}

export interface ValidateRequest {
  key: string;
  value: any;
}

export const systemSettingsApi = {
  /**
   * Get all settings or filtered by keys
   */
  getSettings: async (keys?: string[]): Promise<SystemSetting[]> => {
    const params = keys && keys.length > 0 ? `?keys=${keys.join(',')}` : '';
    const url = `/admin/settings${params}`;
    console.log('🧩 settings.getSettings →', url);
    const response = await apiClient.get<SystemSettingsResponse>(url);
    console.log('🧩 settings.getSettings ←', { count: response.data?.data?.length ?? 0 });
    return response.data.data;
  },

  /**
   * Get a single setting by key
   */
  getSetting: async (key: string): Promise<SystemSetting> => {
    const response = await apiClient.get<SingleSettingResponse>(`/admin/settings/${key}`);
    return response.data.data;
  },

  /**
   * Update a setting (upsert with versioning)
   */
  updateSetting: async (key: string, request: UpdateSettingRequest): Promise<SystemSetting> => {
    console.log('📝 settings.updateSetting →', { key, request });
    const response = await apiClient.put<SingleSettingResponse>(`/admin/settings/${key}`, request);
    console.log('📝 settings.updateSetting ←', { key, version: response.data?.data?.version });
    return response.data.data;
  },

  /**
   * Partially update a setting
   */
  patchSetting: async (key: string, request: PatchSettingRequest): Promise<SystemSetting> => {
    const response = await apiClient.patch<SingleSettingResponse>(`/admin/settings/${key}`, request);
    return response.data.data;
  },

  /**
   * Validate a setting value
   */
  validateSetting: async (request: ValidateRequest): Promise<ValidationResponse> => {
    const response = await apiClient.post<ValidationResponse>('/admin/settings/validate', request);
    return response.data;
  },

  /**
   * Get audit history for a setting
   */
  getAudit: async (key: string, limit: number = 20): Promise<{ auditEntries: AuditEntry[]; currentVersion: number; totalEntries: number }> => {
    const url = `/admin/settings/${key}/audit?limit=${limit}`;
    console.log('🕓 settings.getAudit →', url);
    const response = await apiClient.get<AuditResponse>(url);
    console.log('🕓 settings.getAudit ←', { entries: response.data?.data?.auditEntries?.length ?? 0 });
    return response.data.data;
  },

  /**
   * Rollback a setting to a previous version
   */
  rollbackSetting: async (key: string, request: RollbackRequest): Promise<SystemSetting> => {
    const response = await apiClient.post<SingleSettingResponse>(`/admin/settings/${key}/rollback`, request);
    return response.data.data;
  },
};

// Default settings structure matching the UI
export const defaultSettings = {
  escalation: {
    defaultSlaHours: 24,
    reportingManagerEscalationHours: 48,
    processOwnerEscalationHours: 72,
    autoEscalationEnabled: true,
  },
  trials: {
    defaultDurationDays: 30,
    reminderDays: [7, 14, 21, 28],
    autoConversionCampaigns: true,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    systemNotificationsEnabled: true,
    customerNotificationsEnabled: true,
  },
  system: {
    maintenanceMode: false,
    debugLogging: false,
    apiRateLimit: 100,
    sessionTimeout: 3600,
  },
  rbac: {
    adminCanManageUsers: true,
    managerCanViewReports: true,
    userCanCreateOrders: true,
    requireMfaForAdmins: true,
    allowRoleEscalation: false,
    maxConcurrentSessions: 3,
  },
};

// Helper to transform UI config to API format
export const transformConfigToApi = (config: typeof defaultSettings) => {
  // Normalize trials.reminderDays to an array<number>
  const normalizedReminderDays: number[] = Array.isArray(config.trials.reminderDays)
    ? (config.trials.reminderDays as number[])
    : String(config.trials.reminderDays || '')
        .split(',')
        .map((d: string) => parseInt(d.trim()))
        .filter((n) => Number.isFinite(n));

  return {
    escalation: {
      sla: {
        pendingHours: config.escalation.defaultSlaHours,
        breachEscalationLevels: [
          { level: 1, minutes: config.escalation.reportingManagerEscalationHours * 60 },
          { level: 2, minutes: config.escalation.processOwnerEscalationHours * 60 },
        ],
      },
      recipients: {
        defaultRoles: ['Operations Manager'],
        fallbackUserIds: [],
      },
      rules: {
        autoEscalate: config.escalation.autoEscalationEnabled,
        timeBased: true,
        hierarchical: true,
      },
      notifications: {
        enabled: true,
        channels: ['inApp', 'email'],
      },
    },
    trials: {
      trialDays: config.trials.defaultDurationDays,
      remindersDays: normalizedReminderDays,
      conversion: {
        autoCampaigns: config.trials.autoConversionCampaigns,
        segments: ['high-value', 'enterprise'],
      },
      metrics: {
        trackEngagement: true,
      },
    },
    notifications: {
      email: {
        enabled: config.notifications.emailEnabled,
        from: 'noreply@isp.co.za',
      },
      smtp: {
        host: 'smtp.mailgun.org',
        port: 587,
        user: 'postmaster@mg.isp.co.za',
        secure: false,
      },
      inApp: {
        retentionDays: 30,
        badgeBehavior: 'unreadOnly',
      },
      broadcast: {
        allowSystemWide: true,
        restrictedRoles: [],
      },
    },
    system: {
      security: {
        jwtExpiresMinutes: Math.floor(config.system.sessionTimeout / 60),
        rateLimit: {
          windowSeconds: 60,
          maxRequests: config.system.apiRateLimit,
        },
      },
      branding: {
        appName: 'OMS Platform',
        logoUrl: '/assets/logo.png',
      },
      features: {
        enableOnboarding: true,
      enableEscalations: true,
      enableFnoApi: true,
    },
      maintenanceMode: !!config.system.maintenanceMode,
      debugLogging: !!config.system.debugLogging,
  },
  rbac: {
    permissions: {
      adminCanManageUsers: config.rbac.adminCanManageUsers,
      managerCanViewReports: config.rbac.managerCanViewReports,
      userCanCreateOrders: config.rbac.userCanCreateOrders,
    },
    security: {
      requireMfaForAdmins: config.rbac.requireMfaForAdmins,
      allowRoleEscalation: config.rbac.allowRoleEscalation,
      maxConcurrentSessions: config.rbac.maxConcurrentSessions,
    },
  },
};
};

// Helper to transform API format to UI config
export const transformApiToConfig = (apiData: Record<string, unknown>) => {
  return {
    escalation: {
      defaultSlaHours: Number((apiData.escalation as any)?.sla?.pendingHours) || 24,
      reportingManagerEscalationHours: Number(((apiData.escalation as any)?.sla?.breachEscalationLevels?.[0]?.minutes ?? 2880)) / 60,
      processOwnerEscalationHours: Number(((apiData.escalation as any)?.sla?.breachEscalationLevels?.[1]?.minutes ?? 4320)) / 60,
      autoEscalationEnabled: (apiData.escalation as any)?.rules?.autoEscalate ?? true,
    },
    trials: {
      defaultDurationDays: Number((apiData.trials as any)?.trialDays) || 30,
      // Keep UI input as string for easy editing but normalize when saving
      reminderDays: Array.isArray((apiData.trials as any)?.remindersDays)
        ? (apiData.trials as any).remindersDays.join(', ')
        : ((apiData.trials as any)?.remindersDays ?? '7, 14, 21, 28'),
      autoConversionCampaigns: (apiData.trials as any)?.conversion?.autoCampaigns ?? true,
    },
    notifications: {
      emailEnabled: (apiData.notifications as any)?.email?.enabled ?? true,
      smsEnabled: false, // Not in API yet
      systemNotificationsEnabled: (apiData.notifications as any)?.inApp?.retentionDays > 0 || true,
      customerNotificationsEnabled: (apiData.notifications as any)?.email?.enabled ?? true,
    },
    system: {
      maintenanceMode: (apiData.system as any)?.maintenanceMode ?? false,
      debugLogging: (apiData.system as any)?.debugLogging ?? false,
      apiRateLimit: (apiData.system as any)?.security?.rateLimit?.maxRequests || 100,
      sessionTimeout: ((apiData.system as any)?.security?.jwtExpiresMinutes || 60) * 60,
    },
    rbac: {
      adminCanManageUsers: (apiData.rbac as any)?.permissions?.adminCanManageUsers ?? true,
      managerCanViewReports: (apiData.rbac as any)?.permissions?.managerCanViewReports ?? true,
      userCanCreateOrders: (apiData.rbac as any)?.permissions?.userCanCreateOrders ?? true,
      requireMfaForAdmins: (apiData.rbac as any)?.security?.requireMfaForAdmins ?? true,
      allowRoleEscalation: (apiData.rbac as any)?.security?.allowRoleEscalation ?? false,
      maxConcurrentSessions: (apiData.rbac as any)?.security?.maxConcurrentSessions || 3,
    },
  };
};
