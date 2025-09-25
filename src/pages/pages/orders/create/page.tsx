import type React from "react"

import { useState, useEffect } from "react"
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

  // Build a dynamic Google Maps embed URL from the address inputs
  const addressQuery = [street, city, province, postalCode].filter(Boolean).join(" ")
  const defaultMapQuery = "Cape Town, South Africa"
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(addressQuery || defaultMapQuery)}&output=embed`

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
          postalCode,
          country: "South Africa"
        },
        serviceDetails: {
          serviceType, // This is the actual service type (fiber, wireless, hybrid)
          bandwidth: servicePackage,
          installationType: "standard"
        }
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

  const handleCheckCoverage = async () => {
    const missing: string[] = []
    if (!street) missing.push("Street Address")
    if (!city) missing.push("City")
    if (!province) missing.push("Province")
    if (!postalCode) missing.push("Postal Code")

    if (missing.length > 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Incomplete address',
        text: `Please provide: ${missing.join(', ')}`
      })
      return
    }

    const query = [street, city, province, postalCode].filter(Boolean).join(" ")
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

    window.open(mapsUrl, '_blank', 'noopener,noreferrer')

    await Swal.fire({
      icon: 'info',
      title: 'Coverage check',
      text: 'Opening Google Maps with the provided address for a quick coverage look.'
    })
  }

  // const handleCheckCoverage = async () => {
  //   const missing: string[] = []
  //   if (!street) missing.push("Street Address")
  //   if (!city) missing.push("City")
  //   if (!province) missing.push("Province")
  //   if (!postalCode) missing.push("Postal Code")

  //   if (missing.length > 0) {
  //     await Swal.fire({
  //       icon: 'warning',
  //       title: 'Incomplete address',
  //       text: `Please provide: ${missing.join(', ')}`
  //     })
  //     return
  //   }

  //   const query = [street, city, province, postalCode].filter(Boolean).join(" ")
  //   const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

  //   window.open(mapsUrl, '_blank', 'noopener,noreferrer')

  //   await Swal.fire({
  //     icon: 'info',
  //     title: 'Coverage check',
  //     text: 'Opening Google Maps with the provided address for a quick coverage look.'
  //   })
  // }

  return (
    <div className="flex h-screen bg-background" >
      <Sidebar />

      <main className="flex-1 overflow-auto" >
        <div className="flex h-full">
          {/* Left side - Form */}
          <div className="flex-1 p-6" style={{ paddingBottom: '100px' }}>
            <div className="flex items-center space-x-4 mb-6">
              <Link to="/orders">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create New Order</h1>
                <p className="text-muted-foreground">Create a new customer installation order</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Order Type: <span className="font-medium">New Installation</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name} - {customer.email}
                          </SelectItem>
                        ))}
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

          {/* Right side - Service Information and Map */}
          <div className="w-1/3 pt-30 pr-6">
            <div className="sticky top-0 space-y-6">
            {/* Service Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
                <CardDescription>Configure the service details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Coverage Map</CardTitle>
                <CardDescription>Check service availability in the area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <iframe 
                    src={mapSrc}
                    width="100%" 
                    height="300"
                    style={{ border: 0, borderRadius: '0.375rem' }}
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Installation Location Map"
                  >
                  </iframe>
                  <div className="mt-3">
                    <Button 
                      type="button"
                      onClick={handleCheckCoverage} 
                      className="w-full"
                      variant="outline"
                    >
                      Check Coverage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}