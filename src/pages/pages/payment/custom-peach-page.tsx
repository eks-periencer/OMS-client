"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface PaymentData {
  amount: string
  email: string
  reference: string
  checkoutId: string
  entityId: string
}

export default function CustomPeachPaymentPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
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

  const handlePayment = async () => {
    if (!paymentData) return

    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
      alert('Please fill in all card details')
      return
    }

    // For now, redirect to Peach Payments with the card details
    // In a real implementation, you would process the payment through your backend
    const peachEndpoint = 'https://page.peachpayments.com/xnext'
    const params = new URLSearchParams({
      checkoutId: paymentData.checkoutId,
      entityId: paymentData.entityId,
      amount: paymentData.amount,
      currency: 'ZAR',
      email: paymentData.email,
      reference: paymentData.reference
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Xnext.</h1>
          </div>
          <p className="text-sm text-gray-600">BIG FIBRE | BIG WI-FI</p>
          <p className="text-xs text-gray-500 mt-1">kholofelo@xnext.co.za</p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Details</h2>
          
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">R{paymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{paymentData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{paymentData.reference}</span>
              </div>
            </div>
          </div>

          {/* Card Details Form */}
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

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Peach Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
