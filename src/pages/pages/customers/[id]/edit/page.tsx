"use client"
import { useState } from "react"
import type React from "react"

import { Sidebar } from "../../../../../components/components/layout/sidebar"
import { Button } from "../../../../../components/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/components/ui/card"
import { Input } from "../../../../../components/components/ui/input"
import { Label } from "../../../../../components/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/components/ui/select"
import { Textarea } from "../../../../../components/components/ui/textarea"
import { Checkbox } from "../../../../../components/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import {Link} from "react-router-dom"
import { useNavigate, useParams, type  NavigateFunction } from "react-router-dom"

// Mock customer data - in real app, fetch by params.id
const mockCustomer = {
  id: "1",
  customerNumber: "CUST-001",
  firstName: "John",
  lastName: "Smith",
  email: "john@example.com",
  phone: "+27123456789",
  customerType: "individual",
  isTrial: false,
  address: {
    street: "123 Main Street",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001",
  },
  notes: "VIP customer, prefers morning installations",
}

export default function EditCustomerPage() {
const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: mockCustomer.firstName,
    lastName: mockCustomer.lastName,
    email: mockCustomer.email,
    phone: mockCustomer.phone,
    customerType: mockCustomer.customerType,
    isTrial: mockCustomer.isTrial,
    street: mockCustomer.address.street,
    city: mockCustomer.address.city,
    province: mockCustomer.address.province,
    postalCode: mockCustomer.address.postalCode,
    notes: mockCustomer.notes,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Updating customer:", formData)
    setIsLoading(false)

    // Redirect back to customer details
    navigate(`/customers/${id}`)
    navigate(`/customers/${id}`)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <Link to={`/customers/${id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Customer
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Customer</h1>
                <p className="text-muted-foreground">{mockCustomer.customerNumber}</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerType">Customer Type</Label>
                    <Select
                      value={formData.customerType}
                      onValueChange={(value) => handleInputChange("customerType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="isTrial"
                      checked={formData.isTrial}
                      onCheckedChange={(checked) => handleInputChange("isTrial", checked as boolean)}
                    />
                    <Label htmlFor="isTrial">Trial Customer</Label>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Western Cape">Western Cape</SelectItem>
                          <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                          <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                          <SelectItem value="Free State">Free State</SelectItem>
                          <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                          <SelectItem value="North West">North West</SelectItem>
                          <SelectItem value="Gauteng">Gauteng</SelectItem>
                          <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                          <SelectItem value="Limpopo">Limpopo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes about the customer..."
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                      <Link to={`/customers/${id}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
