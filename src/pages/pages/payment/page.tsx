"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface PaymentData {
  amount: string
  email: string
  reference: string
  orderId: string
  checkoutId: string
  entityId: string
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCardForm, setShowCardForm] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  useEffect(() => {
    // Extract payment data from URL parameters
    const data: PaymentData = {
      amount: searchParams.get('amount') || '0.00',
      email: searchParams.get('email') || '',
      reference: searchParams.get('reference') || '',
      orderId: searchParams.get('orderId') || '',
      checkoutId: searchParams.get('checkoutId') || '',
      entityId: searchParams.get('entityId') || ''
    }
    
    setPaymentData(data)
    setLoading(false)
  }, [searchParams])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
    setCardDetails(prev => ({ ...prev, cardNumber: formattedValue }))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4)
    }
    setCardDetails(prev => ({ ...prev, expiryDate: value }))
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4)
    setCardDetails(prev => ({ ...prev, cvv: value }))
  }

  const handleProceedToPayment = () => {
    if (!paymentData) return

    // Check if this is a mock payment
    if (paymentData.entityId === 'mock_entity_id') {
      const mockUrl = `https://microservices-oms.onrender.com/api/payments/mock-checkout/${paymentData.checkoutId}`;
      window.location.href = mockUrl;
      return;
    }

    // Show card form instead of redirecting to Peach Payments
    setShowCardForm(true)
  }

  const handlePayment = async () => {
    if (!paymentData) return

    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
      alert('Please fill in all card details')
      return
    }

    // Redirect to Peach Payments for actual payment processing
    const peachEndpoint = 'https://page.peachpayments.com/xnext'
    const params = new URLSearchParams({
      checkoutId: paymentData.checkoutId,
      entityId: paymentData.entityId
    })
    
    window.location.href = `${peachEndpoint}?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h1>
          <p className="text-gray-600">Invalid payment data. Please check your payment link.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button className="float-right text-sm text-gray-500 hover:text-gray-700">
            Report page 🚩
          </button>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">Xnext.</span>
            </div>
            <p className="text-sm text-gray-600">BIG FIBRE | BIG WI-FI</p>
            <p className="text-sm text-gray-500 mt-1">{paymentData.email}</p>
          </div>

          {/* Order Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">📦 Order Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Reference:</span>
                <span className="font-medium">{paymentData.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Email:</span>
                <span className="font-medium">{paymentData.email}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Package:</span>
                  <span className="font-medium">Internet Service</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-medium">100/50 Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Installation:</span>
                  <span className="font-medium">Professional Install</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-orange-600">R{parseFloat(paymentData.amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {!showCardForm ? (
            <>
              {/* Payment Form - Pre-filled and Read-only */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>🔒 Locked Fields:</strong> The amount, email, and reference are pre-filled and cannot be changed to ensure payment security.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed select-none">
                      {paymentData.amount}
                    </div>
                    <span className="absolute right-3 top-2 text-sm text-gray-500">ZAR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed select-none">
                    {paymentData.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed select-none">
                    {paymentData.reference}
                  </div>
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full mt-6 bg-orange-500 text-white py-3 px-4 rounded-md font-medium hover:bg-orange-600 transition-colors"
              >
                💳 Proceed to Payment - R{parseFloat(paymentData.amount).toFixed(2)}
              </button>
              
              {/* Confirmation Message */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Next Step:</strong> You'll be redirected to our secure payment page where you can enter your card details. 
                  The amount and order details are already confirmed and cannot be changed.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Card Details Form */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>✅ Order Confirmed:</strong> Amount: R{paymentData.amount} | Reference: {paymentData.reference}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
              >
                Pay Now - R{paymentData.amount}
              </button>
            </>
          )}

          {/* Security Notice */}
          <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Secured by Peach Payments
          </div>
        </div>
      </div>
    </div>
  )
}