import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Loader2, Send, Play } from 'lucide-react'
import Swal from 'sweetalert2'
import { useOrders } from '@hooks/useOrders'
import { listFNOs, submitOrderToFNO, type FNOItem } from '@lib/api/FNO.ts'
import { simulateProvisioning } from '@lib/api/orders'

interface OrderFnoSubmissionFormProps {
  order: any
  onUpdate: () => void
}

export function OrderFnoSubmissionForm({ order, onUpdate }: OrderFnoSubmissionFormProps) {
  const { updateOrder } = useOrders()
  const [loading, setLoading] = useState(false)
  const [fnoId, setFnoId] = useState(order.fno_id || '')
  const [fnoReference, setFnoReference] = useState(order.fno_reference || '')
  const [notes, setNotes] = useState('')
  const [fnos, setFnos] = useState<FNOItem[]>([])
  const [loadingFnos, setLoadingFnos] = useState(false)
  const [submissionType, setSubmissionType] = useState<'api' | 'manual'>('manual')
  const [installationStatus, setInstallationStatus] = useState<'new' | 'existing'>('new')
  const [simulating, setSimulating] = useState(false)

  // Reactive snapshots from order (recompute if order prop changes)
  const serviceType = React.useMemo(() => (
    order?.service_details?.serviceType
      || order?.service_details?.service_type
      || order?.service_type
      || ''
  ), [order])
  const bandwidth = React.useMemo(() => (
    order?.service_details?.bandwidth
      || order?.service_package
      || ''
  ), [order])
  const installStreet = React.useMemo(() => (
    order?.service_address?.street || ''
  ), [order])
  const installCity = React.useMemo(() => (
    order?.service_address?.city || ''
  ), [order])
  const installPostal = React.useMemo(() => (
    order?.service_address?.postalCode || order?.service_address?.postal_code || ''
  ), [order])
  const contactName = React.useMemo(() => (
    ((order?.customer?.first_name || '') + ' ' + (order?.customer?.last_name || '')).trim()
  ), [order])
  const contactEmail = React.useMemo(() => (
    order?.customer?.email || ''
  ), [order])
  const contactPhone = React.useMemo(() => (
    order?.customer?.phone || ''
  ), [order])

  React.useEffect(() => {
    const load = async () => {
      setLoadingFnos(true)
      try {
        const items = await listFNOs()
        setFnos(items)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[FNO] failed to load FNOs', e)
      } finally {
        setLoadingFnos(false)
      }
    }
    void load()
  }, [])

  const handleSimulateFnoProvisioning = async () => {
    setSimulating(true)
    try {
      const result = await simulateProvisioning(order.id, {
        fno: fnoId ? fnos.find(f => f.id === fnoId)?.name : 'Openserve',
        installationStatus,
        stopAt: 'fno_accepted'
      })

      if (result?.converted) {
        await Swal.fire({
          icon: 'info',
          title: 'Trial Converted to Regular',
          text: 'This customer had an existing installation, so they were converted to a regular customer.',
          timer: 3000,
          showConfirmButton: false
        })
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'FNO Simulation Complete',
          text: `Order advanced to ${result?.executed?.[result.executed.length - 1] || 'fno_accepted'} state.`,
          timer: 2000,
          showConfirmButton: false
        })
      }
      onUpdate()
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Simulation Failed',
        text: err?.message || 'Failed to simulate FNO provisioning'
      })
    } finally {
      setSimulating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Client-side validation per integration type
      if (!fnoId) throw new Error('Please select an FNO')
      if (!serviceType || !bandwidth) throw new Error('Missing service details')
      if (!installStreet || !installCity || !installPostal) throw new Error('Missing installation address')
      if (!contactName || !contactEmail) throw new Error('Missing customer contact details')

      // Note: Trial qualification is now handled automatically during order creation
      // based on customer's is_trial flag, no manual qualification needed here

      // Submit to FNO (backend will link FNO and advance state)
      await submitOrderToFNO(fnoId, order.id, submissionType)

      // Optionally persist reference/notes after successful submission (avoid status side-effects)
      if (fnoReference || notes) {
        await updateOrder(order.id, {
          // Do not send fnoId here to avoid premature state transitions
          fnoReference: fnoReference || order.fno_reference,
          submissionNotes: notes
        } as any)
      }

      await Swal.fire({
        icon: 'success',
        title: 'Submitted to FNO',
        text: submissionType === 'manual' ? 'Manual application created and order advanced.' : 'API submission sent and order advanced.',
        timer: 2000,
        showConfirmButton: false
      })
      onUpdate()
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err?.message || 'Failed to submit to FNO'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>FNO Submission</CardTitle>
        <CardDescription>Provide FNO details and submit the order</CardDescription>
      </CardHeader>
      <CardContent>
        {/* FNO Simulation Section - visible for all orders */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">FNO Provisioning Simulation</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="installationStatus">Installation Status</Label>
                <Select value={installationStatus} onValueChange={(value: 'new' | 'existing') => setInstallationStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Installation (Proceed as Trial)</SelectItem>
                    <SelectItem value="existing">Installation Exists (Convert to Regular)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button" 
                onClick={handleSimulateFnoProvisioning}
                disabled={simulating}
                variant="outline"
              >
                {simulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Play className="mr-2 h-4 w-4" />
                {simulating ? 'Simulating...' : 'Simulate to FNO Accepted'}
              </Button>
            </div>
            <p className="text-xs text-blue-700">
              {String(order?.service_details?.serviceType || '').toLowerCase() === 'trial'
                ? (installationStatus === 'new' 
                    ? 'This will proceed as a trial customer with installation workflow and stop at FNO Accepted.'
                    : 'This will convert the customer to regular and remove trial status.')
                : 'This will advance the order workflow to FNO Accepted (simulation).'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fnoId">FNO</Label>
              <select
                id="fnoId"
                className="w-full border rounded px-3 py-2 bg-background"
                value={fnoId}
                onChange={(e) => setFnoId(e.target.value)}
                disabled={loadingFnos}
              >
                <option value="">{loadingFnos ? 'Loading FNOs...' : 'Select FNO'}</option>
                {fnos.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="submissionType">Submission Type</Label>
              <select
                id="submissionType"
                className="w-full border rounded px-3 py-2 bg-background"
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value as 'api' | 'manual')}
              >
                <option value="manual">Manual</option>
                <option value="api">API</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fnoReference">FNO Reference</Label>
              <Input id="fnoReference" value={fnoReference} onChange={(e) => setFnoReference(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Submission Notes</Label>
              <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Submission payload snapshot (read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Service Details</Label>
              <div className="text-sm text-muted-foreground">{serviceType} • {bandwidth}</div>
            </div>
            <div className="space-y-1">
              <Label>Installation Address</Label>
              <div className="text-sm text-muted-foreground">{installStreet}, {installCity} {installPostal}</div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Customer Contact</Label>
              <div className="text-sm text-muted-foreground">{contactName} • {contactEmail}{contactPhone ? ` • ${contactPhone}` : ''}</div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !fnoId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit to FNO'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}



