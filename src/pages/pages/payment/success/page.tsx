import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/components/ui/card';
import { Button } from '../../../../components/components/ui/button';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    setSessionId(sessionIdParam);

    async function confirmPayment(): Promise<void> {
      if (!sessionIdParam) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setConfirmError(null);
      try {
        const base = (import.meta as any).env?.VITE_ONB_BASE_URL
          || (typeof window !== 'undefined' ? (window as any).__ONB_API_BASE_URL__ : undefined)
          || 'https://oms-server-ntlv.onrender.com';
        const url = `${String(base).replace(/\/+$/g, '')}/api/payments/confirm?session_id=${encodeURIComponent(sessionIdParam)}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await resp.json().catch(() => ({} as any));
        if (!resp.ok || data?.success === false) {
          throw new Error(data?.error?.message || `Payment confirmation failed (${resp.status})`);
        }
        setConfirmed(true);
      } catch (err: any) {
        setConfirmError(err?.message || 'Failed to confirm payment');
        setConfirmed(false);
      } finally {
        setIsLoading(false);
      }
    }

    void confirmPayment();
  }, [searchParams]);

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your payment has been processed successfully. Thank you for choosing Xnext!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {sessionId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Transaction ID:</p>
              <p className="font-mono text-sm text-gray-800 break-all">
                {sessionId}
              </p>
            </div>
          )}
          {confirmed && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded">
              Payment confirmed and order updated.
            </div>
          )}
          {!confirmed && confirmError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
              {confirmError}
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{confirmed ? 'Payment confirmed' : 'Awaiting confirmation'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Order processing initiated</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Installation team will contact you within 24 hours</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Our team will contact you to schedule installation</li>
              <li>• Professional installation at your premises</li>
              <li>• Enjoy high-speed internet service</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleGoToOrders}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              View My Orders
            </Button>
            <Button 
              onClick={handleGoToDashboard}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact us at <a href="mailto:support@xnext.co.za" className="text-blue-600 hover:underline">support@xnext.co.za</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;