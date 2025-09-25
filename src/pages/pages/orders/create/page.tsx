import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { Button } from "../../../../components/components/ui/button"
import { Input } from "../../../../components/components/ui/input"
import { Label } from "../../../../components/components/ui/label"
import { Textarea } from "../../../../components/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/components/ui/select"
import { Alert, AlertDescription } from "../../../../components/components/ui/alert"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useOrders } from "../../../../../hooks/useOrders"
import { useCustomers } from "../../../../../hooks/useCustomers"
import { useOnboarding } from "../../../../../hooks/useOnboarding"
import Swal from "sweetalert2"

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const { createOrder, items: ordersList } = useOrders()
  const { customers, loading: customersLoading } = useCustomers()
  const { items: onboardingItems } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [customerId, setCustomerId] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [servicePackage, setServicePackage] = useState("")
  const [priority, setPriority] = useState("normal")
  const [orderType, setOrderType] = useState("new_install")
  const [notes, setNotes] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const eligibleCustomers = useMemo(() => {
    const activeOrderCustomerIds = new Set<string>()
    for (const o of (ordersList ?? [])) {
      const status = (o as any)?.current_state || (o as any)?.status || 'created'
      const isActive = !['completed','cancelled'].includes(String(status))
      const cid = (o as any)?.customer_id ?? (o as any)?.customerId
      if (cid && isActive) activeOrderCustomerIds.add(String(cid))
    }
    const activeOnboardingCustomerIds = new Set<string>()
    for (const ob of (onboardingItems ?? [])) {
      const step = String((ob as any)?.current_step || '').toLowerCase()
      const done = step === 'completed'
      const cid = (ob as any)?.customer_id ?? (ob as any)?.customerId
      if (cid && !done) activeOnboardingCustomerIds.add(String(cid))
    }
    return (customers ?? []).filter((c: any) => {
      const id = String(c?.id)
      return !activeOrderCustomerIds.has(id) && !activeOnboardingCustomerIds.has(id)
    })
  }, [customers, ordersList, onboardingItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!customerId || !serviceType || !servicePackage || !street || !city || !province || !postalCode) {
        throw new Error("Please fill in all required fields")
      }

      // Normalize order type to backend/PRD-supported values
      const normalizedOrderType = orderType === 'upgrade' ? 'service_change' : orderType
      const allowedOrderTypes = new Set(['new_install', 'service_change', 'disconnect'])
      const finalOrderType = allowedOrderTypes.has(normalizedOrderType) ? normalizedOrderType : 'new_install'

      const orderData = {
        customerId,
        orderType: finalOrderType,
        priority: priority as "low" | "normal" | "high" | "urgent",
        serviceAddress: {
          street,
          city,
          province,
          postalCode
        },
        serviceDetails: {
          serviceType, // This is the actual service type (fiber, wireless, hybrid)
          bandwidth: servicePackage,
          installationType: "standard"
        },
        notes: notes || undefined
      }

      await createOrder(orderData)
      await Swal.fire({ icon: 'success', title: 'Order Created!', text: 'The order has been successfully created.', timer: 2000, showConfirmButton: false })
      navigate("/orders")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create order"
      setError(errorMessage)
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
            <div className="ml-60">
              <h1 className="text-3xl font-bold text-foreground">Create New Order</h1>
              <p className="text-muted-foreground">Create a new customer order</p>
              <p className="text-xs text-muted-foreground mt-1">
                Order Type: <span className="font-medium">{orderType === 'new_install' ? 'New Installation' : orderType === 'service_change' ? 'Service Change' : orderType === 'disconnect' ? 'Disconnect' : orderType}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Select the customer for this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={customerId} onValueChange={setCustomerId} required disabled={customersLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select a customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleCustomers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} - {customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Only customers without an active order or onboarding are listed.</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Type & Service Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order & Service Information</CardTitle>
                <CardDescription>Select the order type and configure service details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderType">Order Type *</Label>
                  <Select value={orderType} onValueChange={setOrderType} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_install">New Installation</SelectItem>
                      <SelectItem value="service_change">Service Change</SelectItem>
                      <SelectItem value="disconnect">Disconnect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select value={serviceType} onValueChange={setServiceType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiber">Fiber Optic</SelectItem>
                      <SelectItem value="wireless">Wireless</SelectItem>
                      <SelectItem value="hybrid">Hybrid Solution</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This determines the type of service to be installed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicePackage">Service Package *</Label>
                  <Input
                    id="servicePackage"
                    placeholder="e.g., Premium 100Mbps"
                    value={servicePackage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServicePackage(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Installation Address */}
            <Card>
              <CardHeader>
                <CardTitle>Installation Address</CardTitle>
                <CardDescription>Where should the service be installed?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street"
                    value={street}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Cape Town"
                      value={city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Select value={province} onValueChange={setProvince} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="western-cape">Western Cape</SelectItem>
                        <SelectItem value="gauteng">Gauteng</SelectItem>
                        <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    placeholder="8001"
                    value={postalCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Any special instructions or notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions..."
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-4">
              <Link to="/orders">
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Creating Order..." : "Create Order"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
