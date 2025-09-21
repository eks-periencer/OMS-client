import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../../../../components/components/layout/sidebar'
import { Button } from '../../../../components/components/ui/button'
import { Input } from '../../../../components/components/ui/input'
import { Label } from '../../../../components/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/components/ui/select'
import { Switch } from '../../../../components/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { createFno } from '../../../../../lib/api/FNO'

export default function FnoCreatePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [integrationType, setIntegrationType] = useState<'api' | 'manual'>('manual')
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [portalUrl, setPortalUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        name,
        code,
        integration_type: integrationType,
        api_endpoint: integrationType === 'api' ? apiEndpoint || undefined : undefined,
        api_key: integrationType === 'api' && apiKey ? apiKey : undefined,
        portal_url: portalUrl || undefined,
        is_active: isActive,
      }
      const created = await createFno(payload)
      const createdObj = created as { id?: string; _id?: string }
      const newId = createdObj.id || createdObj._id
      if (newId) {
        navigate(`/fno`)
      } else {
        navigate(`/fno`)
      }
    } catch (e) {
      const message = (e as Error)?.message || 'Failed to create FNO'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/fno')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to FNOs
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create FNO</h1>
                <p className="text-muted-foreground">Add a new Fiber Network Operator</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Creating...' : 'Create FNO'}
              </Button>
            </div>
          </div>

          {error && (
            <Card className="mb-6">
              <CardContent className="p-4 text-red-600">{error}</CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>FNO identification and basic settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">FNO Name</Label>
                  <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">FNO Code</Label>
                  <Input id="code" value={code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="integrationType">Integration Type</Label>
                  <Select value={integrationType} onValueChange={(v: 'api' | 'manual') => setIntegrationType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API Integration</SelectItem>
                      <SelectItem value="manual">Manual Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>API endpoints and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrationType === 'api' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="apiEndpoint">API Endpoint</Label>
                      <Input id="apiEndpoint" value={apiEndpoint} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiEndpoint(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input id="apiKey" type="password" placeholder="Enter API key" value={apiKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)} />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="portalUrl">Portal URL</Label>
                  <Input id="portalUrl" value={portalUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPortalUrl(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
