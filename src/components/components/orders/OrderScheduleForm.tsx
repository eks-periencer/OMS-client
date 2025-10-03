import React, { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Alert, AlertDescription } from "../ui/alert"
import { Loader2, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react"
import { useOrders } from "../../../../hooks/useOrders"

type Props = {
  order: any
  onUpdate: () => Promise<void> | void
}

function mapOrderTypeToScheduledState(orderType?: string): string | null {
  switch ((orderType || '').toLowerCase()) {
    case 'new_install':
      return 'installation_scheduled'
    case 'service_change':
      return 'change_scheduled'
    case 'disconnect':
      return 'disconnection_scheduled'
    default:
      return null
  }
}

export function OrderScheduleForm({ order, onUpdate }: Props) {
  const { updateOrder, updateOrderStatus } = useOrders()
  const [when, setWhen] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const targetState = useMemo(() => mapOrderTypeToScheduledState(order?.order_type), [order?.order_type])
  const isAlreadyScheduled = useMemo(() => {
    const s = String(order?.current_state || '').toLowerCase()
    return ['installation_scheduled', 'change_scheduled', 'disconnection_scheduled'].includes(s)
  }, [order?.current_state])

  const canSchedule = Boolean(targetState)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!canSchedule || !targetState) {
      setError('Scheduling is not supported for this order type')
      return
    }
    if (!when) {
      setError('Please choose a date and time')
      return
    }
    try {
      setSubmitting(true)
      // 1) Save scheduled date on the order (using estimatedCompletionDate as schedule date)
      await updateOrder(order.id, { estimatedCompletionDate: new Date(when).toISOString() } as any)
      // 2) Move to scheduled state
      await updateOrderStatus(order.id, { status: targetState })
      setSuccess('Schedule saved and state updated')
      if (onUpdate) await onUpdate()
    } catch (e: any) {
      setError(e?.message || 'Failed to schedule')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Schedule</span>
        </CardTitle>
        <CardDescription>
          {canSchedule ? `Set the scheduled date and move the order to ${targetState?.replace(/_/g, ' ')}` : 'This workflow does not have a scheduled state.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!canSchedule && (
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertDescription>
              Scheduling is not available for this order type.
            </AlertDescription>
          </Alert>
        )}
        {canSchedule && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled for</label>
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">This will be saved as the order’s scheduled date and transition it to {targetState?.replace(/_/g, ' ')}.</p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{success}</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Button type="submit" disabled={submitting || isAlreadyScheduled}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAlreadyScheduled ? 'Already Scheduled' : 'Save & Move to Scheduled'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}


