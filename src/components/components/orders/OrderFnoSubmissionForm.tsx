import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Loader2, Send } from 'lucide-react'
import Swal from 'sweetalert2'
import { useOrders } from '@hooks/useOrders'
import { listFNOs, submitOrderToFNO, type FNOItem } from '@lib/api/FNO.ts'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Client-side validation per integration type
      if (!fnoId) throw new Error('Please select an FNO')
      if (!serviceType || !bandwidth) throw new Error('Missing service details')
      if (!installStreet || !installCity || !installPostal) throw new Error('Missing installation address')
      if (!contactName || !contactEmail) throw new Error('Missing customer contact details')

      // Submit to FNO first (backend will link FNO and advance state)
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



