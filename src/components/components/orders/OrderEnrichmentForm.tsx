import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Save, Network, MapPin, Settings, User } from 'lucide-react'
import { useOrders } from '../../../../hooks/useOrders'
import Swal from 'sweetalert2'

interface OrderEnrichmentFormProps {
  order: any
  onUpdate: () => void
}

export function OrderEnrichmentForm({ order, onUpdate }: OrderEnrichmentFormProps) {
  const { updateOrder } = useOrders()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [serviceDetails, setServiceDetails] = useState({
    serviceType: order.serviceDetails?.serviceType || '',
    bandwidth: order.serviceDetails?.bandwidth || '',
    installationType: order.serviceDetails?.installationType || 'standard',
    networkType: order.serviceDetails?.networkType || '',
    equipment: order.serviceDetails?.equipment || '',
    specialRequirements: order.serviceDetails?.specialRequirements || ''
  })

  const [technicalSpecs, setTechnicalSpecs] = useState({
    ipType: order.technicalSpecs?.ipType || 'dynamic',
    vlanId: order.technicalSpecs?.vlanId || '',
    portSpeed: order.technicalSpecs?.portSpeed || '',
    routingProtocol: order.technicalSpecs?.routingProtocol || 'static',
    qosSettings: order.technicalSpecs?.qosSettings || '',
    securityRequirements: order.technicalSpecs?.securityRequirements || ''
  })

  const [installationDetails, setInstallationDetails] = useState({
    preferredDate: order.installationDetails?.preferredDate || '',
    timeSlot: order.installationDetails?.timeSlot || 'morning',
    accessInstructions: order.installationDetails?.accessInstructions || '',
    contactPerson: order.installationDetails?.contactPerson || '',
    contactPhone: order.installationDetails?.contactPhone || '',
    specialInstructions: order.installationDetails?.specialInstructions || ''
  })

  const [fnoDetails, setFnoDetails] = useState({
    fnoId: order.fnoId || '',
    fnoReference: order.fnoReference || '',
    fnoContact: order.fnoDetails?.fnoContact || '',
    fnoNotes: order.fnoDetails?.fnoNotes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const enrichmentData = {
        serviceDetails: {
          ...serviceDetails,
          // Ensure required fields are present
          serviceType: serviceDetails.serviceType || order.orderType,
          bandwidth: serviceDetails.bandwidth || order.serviceDetails?.bandwidth,
          installationType: serviceDetails.installationType || 'standard'
        },
        technicalSpecs,
        installationDetails,
        fnoDetails,
        // Update FNO fields if provided
        ...(fnoDetails.fnoId && { fnoId: fnoDetails.fnoId }),
        ...(fnoDetails.fnoReference && { fnoReference: fnoDetails.fnoReference })
      }

      await updateOrder(order.id, enrichmentData)

      await Swal.fire({
        icon: 'success',
        title: 'Order Enriched!',
        text: 'Order has been successfully enriched with additional data.',
        timer: 2000,
        showConfirmButton: false
      })

      onUpdate()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enrich order'
      setError(errorMessage)
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return serviceDetails.serviceType && serviceDetails.bandwidth
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Order Enrichment</span>
        </CardTitle>
        <CardDescription>
          Add detailed information to enrich the order for processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Network className="h-4 w-4" />
              <span>Service Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={serviceDetails.serviceType} onValueChange={(value) => 
                  setServiceDetails(prev => ({ ...prev, serviceType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiber">Fiber Optic</SelectItem>
                    <SelectItem value="wireless">Wireless</SelectItem>
                    <SelectItem value="hybrid">Hybrid Solution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bandwidth">Bandwidth *</Label>
                <Input
                  id="bandwidth"
                  placeholder="e.g., 100Mbps, 1Gbps"
                  value={serviceDetails.bandwidth}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, bandwidth: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installationType">Installation Type</Label>
                <Select value={serviceDetails.installationType} onValueChange={(value) => 
                  setServiceDetails(prev => ({ ...prev, installationType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="networkType">Network Type</Label>
                <Input
                  id="networkType"
                  placeholder="e.g., MPLS, Internet, Dedicated"
                  value={serviceDetails.networkType}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, networkType: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Input
                  id="equipment"
                  placeholder="e.g., Router model, Switch type"
                  value={serviceDetails.equipment}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, equipment: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  placeholder="Any special service requirements..."
                  value={serviceDetails.specialRequirements}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Technical Specifications</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ipType">IP Type</Label>
                <Select value={technicalSpecs.ipType} onValueChange={(value) => 
                  setTechnicalSpecs(prev => ({ ...prev, ipType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="dhcp">DHCP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vlanId">VLAN ID</Label>
                <Input
                  id="vlanId"
                  placeholder="e.g., 100, 200"
                  value={technicalSpecs.vlanId}
                  onChange={(e) => setTechnicalSpecs(prev => ({ ...prev, vlanId: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portSpeed">Port Speed</Label>
                <Input
                  id="portSpeed"
                  placeholder="e.g., 1Gbps, 10Gbps"
                  value={technicalSpecs.portSpeed}
                  onChange={(e) => setTechnicalSpecs(prev => ({ ...prev, portSpeed: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingProtocol">Routing Protocol</Label>
                <Select value={technicalSpecs.routingProtocol} onValueChange={(value) => 
                  setTechnicalSpecs(prev => ({ ...prev, routingProtocol: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="ospf">OSPF</SelectItem>
                    <SelectItem value="bgp">BGP</SelectItem>
                    <SelectItem value="rip">RIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="qosSettings">QoS Settings</Label>
                <Input
                  id="qosSettings"
                  placeholder="e.g., Priority queues, bandwidth limits"
                  value={technicalSpecs.qosSettings}
                  onChange={(e) => setTechnicalSpecs(prev => ({ ...prev, qosSettings: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="securityRequirements">Security Requirements</Label>
                <Textarea
                  id="securityRequirements"
                  placeholder="Security requirements and configurations..."
                  value={technicalSpecs.securityRequirements}
                  onChange={(e) => setTechnicalSpecs(prev => ({ ...prev, securityRequirements: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Installation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Installation Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={installationDetails.preferredDate}
                  onChange={(e) => setInstallationDetails(prev => ({ ...prev, preferredDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">Time Slot</Label>
                <Select value={installationDetails.timeSlot} onValueChange={(value) => 
                  setInstallationDetails(prev => ({ ...prev, timeSlot: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  placeholder="Name of contact person"
                  value={installationDetails.contactPerson}
                  onChange={(e) => setInstallationDetails(prev => ({ ...prev, contactPerson: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="Phone number"
                  value={installationDetails.contactPhone}
                  onChange={(e) => setInstallationDetails(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="accessInstructions">Access Instructions</Label>
                <Textarea
                  id="accessInstructions"
                  placeholder="Instructions for accessing the installation site..."
                  value={installationDetails.accessInstructions}
                  onChange={(e) => setInstallationDetails(prev => ({ ...prev, accessInstructions: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Any special installation instructions..."
                  value={installationDetails.specialInstructions}
                  onChange={(e) => setInstallationDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* FNO Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>FNO Details (Placeholder)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fnoId">FNO ID</Label>
                <Input
                  id="fnoId"
                  placeholder="FNO identifier"
                  value={fnoDetails.fnoId}
                  onChange={(e) => setFnoDetails(prev => ({ ...prev, fnoId: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fnoReference">FNO Reference</Label>
                <Input
                  id="fnoReference"
                  placeholder="FNO reference number"
                  value={fnoDetails.fnoReference}
                  onChange={(e) => setFnoDetails(prev => ({ ...prev, fnoReference: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fnoNotes">FNO Notes</Label>
                <Textarea
                  id="fnoNotes"
                  placeholder="Notes related to FNO processing..."
                  value={fnoDetails.fnoNotes}
                  onChange={(e) => setFnoDetails(prev => ({ ...prev, fnoNotes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={!isFormValid() || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Enriching Order...' : 'Enrich Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
