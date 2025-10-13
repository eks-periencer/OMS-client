import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/components/ui/card';
import { Button } from '../../components/components/ui/button';
import { Input } from '../../components/components/ui/input';
import { Label } from '../../components/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentData {
  amount: string;
  email: string;
  reference: string;
  orderId: string;
  checkoutId: string;
  entityId: string;
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    // Use mock data for preview since database is expired
    const mockPaymentData: PaymentData = {
      amount: '1748.00',
      email: 'adam.reeves@example.com',
      reference: 'test-order-123',
      orderId: 'test-order-123',
      checkoutId: 'mock_checkout_123',
      entityId: 'mock_entity_id'
    };

    // Try to get real data from URL params first, fallback to mock
    const amount = searchParams.get('amount') || mockPaymentData.amount;
    const email = searchParams.get('email') || mockPaymentData.email;
    const reference = searchParams.get('reference') || mockPaymentData.reference;
    const orderId = searchParams.get('orderId') || mockPaymentData.orderId;
    const checkoutId = searchParams.get('checkoutId') || mockPaymentData.checkoutId;
    const entityId = searchParams.get('entityId') || mockPaymentData.entityId;

    setPaymentData({
      amount,
      email,
      reference,
      orderId,
      checkoutId,
      entityId
    });
    setLoading(false);
  }, [searchParams]);

  const handlePayment = () => {
    if (!paymentData) return;

    // Check if terms are accepted
    if (!termsAccepted) {
      alert('Please accept the Terms and Conditions to proceed with payment.');
      return;
    }

    // Check if this is a mock payment
    if (paymentData.entityId === 'mock_entity_id') {
      // For mock payments, show success message
      alert('🎉 Mock Payment Successful!\n\n' +
            'In the real flow, this would:\n' +
            '• Redirect to Peach Payments\n' +
            '• Show only the card entry screen\n' +
            '• Have amount and customer data pre-filled\n' +
            '• Process the payment securely');
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
          <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <Card className="w-[400px] text-center">
          <CardHeader>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-2xl font-bold text-red-700">Payment Error</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
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
            <p className="text-sm text-gray-500 mt-1">{paymentData?.email}</p>
          </div>

          {/* Order Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">📦 Order Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Reference:</span>
                <span className="font-medium">{paymentData?.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Email:</span>
                <span className="font-medium">{paymentData?.email}</span>
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
                  <span className="text-orange-600">R{parseFloat(paymentData?.amount || '0').toFixed(2)}</span>
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
                  value={paymentData?.amount || ''}
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
                value={paymentData?.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                value={paymentData?.reference || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div className="text-sm">
                <label htmlFor="terms" className="text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <a 
                    href="#" 
                    className="text-orange-600 hover:text-orange-700 underline"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Terms and Conditions:\n\n' +
                            '1. Service Agreement: By proceeding with payment, you agree to our internet service terms.\n' +
                            '2. Installation: Professional installation will be scheduled within 5-7 business days.\n' +
                            '3. Billing: Monthly billing will commence from the installation date.\n' +
                            '4. Cancellation: 30-day notice required for service cancellation.\n' +
                            '5. Data Usage: Fair usage policy applies to all internet services.\n' +
                            '6. Support: 24/7 technical support included with your service.\n\n' +
                            'Full terms available at: https://xnext.co.za/terms');
                    }}
                  >
                    Terms and Conditions
                  </a>
                  {' '}and{' '}
                  <a 
                    href="#" 
                    className="text-orange-600 hover:text-orange-700 underline"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Privacy Policy:\n\n' +
                            '1. Data Collection: We collect necessary information for service provision.\n' +
                            '2. Payment Security: All payment data is processed securely via Peach Payments.\n' +
                            '3. Data Usage: Information used only for service delivery and support.\n' +
                            '4. Data Protection: We comply with POPIA (Protection of Personal Information Act).\n' +
                            '5. Marketing: You may opt out of marketing communications at any time.\n\n' +
                            'Full privacy policy at: https://xnext.co.za/privacy');
                    }}
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handlePayment}
            disabled={!termsAccepted}
            className={`w-full mt-6 py-3 px-4 rounded-md font-medium transition-colors ${
              termsAccepted 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            💳 Proceed to Payment - R{parseFloat(paymentData?.amount || '0').toFixed(2)}
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

          {/* Mock Data Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Preview Mode:</strong> Using mock data since database is unavailable. 
              In production, this would show real order details from your database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
