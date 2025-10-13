import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PaymentData {
  amount: string;
  email: string;
  reference: string;
  orderId: string;
  checkoutId: string;
  entityId: string;
}

const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract payment data from URL parameters
    const amount = searchParams.get('amount');
    const email = searchParams.get('email');
    const reference = searchParams.get('reference');
    const orderId = searchParams.get('orderId');
    const checkoutId = searchParams.get('checkoutId');
    const entityId = searchParams.get('entityId');

    if (!amount || !email || !reference || !checkoutId || !entityId) {
      setError('Missing required payment parameters');
      setLoading(false);
      return;
    }

    setPaymentData({
      amount,
      email,
      reference,
      orderId: orderId || reference,
      checkoutId,
      entityId
    });
    setLoading(false);
  }, [searchParams]);

  const handlePayment = () => {
    if (!paymentData) return;

    // Check if this is a mock payment
    if (paymentData.entityId === 'mock_entity_id') {
      // For mock payments, redirect to mock payment handler
      const mockUrl = `https://microservices-oms.onrender.com/api/payments/mock-checkout/${paymentData.checkoutId}`;
      window.location.href = mockUrl;
      return;
    }

    // Redirect to Peach Payments hosted checkout
    // The checkout is already created with the correct amount and customer data
    const peachEndpoint = process.env.NODE_ENV === 'production' 
      ? 'https://card.peachpayments.com' 
      : 'https://sandbox-card.peachpayments.com';
    
    const paymentUrl = `${peachEndpoint}/v1/checkouts/${paymentData.checkoutId}/payment?entityId=${encodeURIComponent(paymentData.entityId)}`;
    
    // Redirect to Peach Payments (amount and customer data are already set in the checkout)
    window.location.href = paymentUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Invalid payment link'}</p>
          <button
            onClick={() => window.close()}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
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

          {/* Payment Form - Pre-filled and Read-only */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentData.amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">ZAR</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={paymentData.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                value={paymentData.reference}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handlePayment}
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

          {/* Security Notice */}
          <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Secured by Peach Payments
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
