import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/components/ui/card';
import { Button } from '../../../../components/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [refId, setRefId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    const refParam = searchParams.get('ref');
    setSessionId(sessionIdParam);
    setRefId(refParam);

    async function confirmPayment(): Promise<void> {
      if (!sessionIdParam && !refParam) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setConfirmError(null);
      try {
        const base = (import.meta as any).env?.VITE_ONB_BASE_URL
          || (typeof window !== 'undefined' ? (window as any).__ONB_API_BASE_URL__ : undefined)
          || 'https://microservices-oms.onrender.com';
        const qs = sessionIdParam ? `session_id=${encodeURIComponent(sessionIdParam)}` : `ref=${encodeURIComponent(refParam as string)}`;
        const url = `${String(base).replace(/\/+$/g, '')}/api/payments/confirm?${qs}`;
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

  const handleGoToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-start md:items-center justify-center pt-10 md:pt-16 lg:pt-20 px-4">
        <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-0 shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-start md:items-center justify-center p-4 pt-10 md:pt-16 lg:pt-20">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl shadow-xl border-0 bg-white">
        <CardHeader className="text-center pb-8">
          {/* Company Logo Placeholder */}
          <div className="mx-auto mb-6 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">X</div>
              <div className="text-[10px] md:text-xs text-orange-100 font-medium">XNEXT</div>
            </div>
          </div>
          
          <div className="mx-auto mb-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Payment <span className="text-orange-600">Successful!</span>
          </CardTitle>
          
          <CardDescription className="text-gray-600 text-base md:text-lg leading-relaxed">
            Your payment has been processed successfully.<br />
            Thank you for choosing <span className="font-semibold text-orange-600">Xnext</span>!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-6 md:px-8 pb-8">
          {(sessionId || refId) && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Transaction ID:</p>
              <p className="font-mono text-sm text-gray-800 break-all bg-white p-2 rounded-lg border">
                {sessionId || refId}
              </p>
            </div>
          )}
          
          {confirmed && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 text-sm p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Payment confirmed and order updated.</span>
              </div>
            </div>
          )}
          
          {!confirmed && confirmError && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium">{confirmError}</span>
              </div>
            </div>
          )}
          
          {/* Responsive grid for info sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Steps */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Payment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${confirmed ? 'bg-green-100' : 'bg-orange-100'}` }>
                    <CheckCircle className={`w-5 h-5 ${confirmed ? 'text-green-600' : 'text-orange-600'}`} />
                  </div>
                  <span className={`${confirmed ? 'text-gray-900 font-semibold' : 'text-gray-700'} text-base`}>
                    {confirmed ? 'Payment confirmed' : 'Awaiting confirmation'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-900 font-semibold text-base">Order processing initiated</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-700 text-base">Installation team will contact you within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-4 text-lg">What happens next?</h3>
              <ul className="text-gray-800 space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="bg-orange-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  <span className="text-base">Our team will contact you to schedule installation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-orange-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  <span className="text-base">Professional installation at your premises</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-orange-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                  <span className="text-base">Enjoy high-speed internet service</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleGoToHome}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-base md:text-lg font-semibold py-3 rounded-xl shadow-lg"
            >
              Return to Homepage
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-6">
            <p className="mb-2 font-medium">Need help? We're here to assist you.</p>
            <p>Contact us at <a href="mailto:support@xnext.co.za" className="text-orange-600 hover:underline font-semibold">support@xnext.co.za</a></p>
            <p className="mt-2">Call us at <span className="font-semibold text-gray-800">+27 (0) 21 123 4567</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;