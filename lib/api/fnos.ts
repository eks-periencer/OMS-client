import { client } from './client'

export interface FNO {
  id: string
  name: string
  code: string
  integrationType: 'api' | 'manual'
  apiEndpoint?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FNOStats {
  total: number
  active: number
  api: number
  manual: number
}

export interface FNOConfiguration {
  fnos: FNO[]
  stats: FNOStats
  integrationLogs: any[]
  monitoring: any
}

export async function listFNOs(): Promise<FNO[]> {
  try {
    const response = await client.get('/fno')
    return response.data.fnos || []
  } catch (error) {
    console.error('Failed to fetch FNOs:', error)
    throw error
  }
}

export async function getFNOStats(): Promise<FNOStats> {
  try {
    const response = await client.get('/fno/stats')
    return response.data.stats || { total: 0, active: 0, api: 0, manual: 0 }
  } catch (error) {
    console.error('Failed to fetch FNO stats:', error)
    throw error
  }
}

export async function getFNOConfiguration(): Promise<FNOConfiguration> {
  try {
    const response = await client.get('/fno/fnoConfiguration')
    return response.data
  } catch (error) {
    console.error('Failed to fetch FNO configuration:', error)
    throw error
  }
}

export async function submitOrderToFNO(fnoId: string, orderId: string): Promise<any> {
  try {
    const response = await client.post(`/fno/${fnoId}/submit-order`, { orderId })
    return response.data
  } catch (error) {
    console.error('Failed to submit order to FNO:', error)
    throw error
  }
}

export async function updateManualApplication(applicationId: string, data: any): Promise<any> {
  try {
    const response = await client.put(`/fno/manual-application/${applicationId}`, data)
    return response.data
  } catch (error) {
    console.error('Failed to update manual application:', error)
    throw error
  }
}
