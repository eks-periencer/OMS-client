import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/components/ui/card';
import { Button } from '../../../../components/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';

const PaymentCancelledPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refId = searchParams.get('ref');

  const handleTryAgain = () => {
    navigate('/');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

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
          
          <div className="mx-auto mb-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <XCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Payment <span className="text-red-600">Cancelled</span>
          </CardTitle>
          
          <CardDescription className="text-gray-600 text-base md:text-lg leading-relaxed">
            Your payment was cancelled.<br />
            No charges have been made to your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-6 md:px-8 pb-8">
          {refId && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Reference ID:</p>
              <p className="font-mono text-sm text-gray-800 break-all bg-white p-2 rounded-lg border">
                {refId}
              </p>
            </div>
          )}
          
          {/* Responsive grid for info sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-4 text-lg">What happened?</h3>
              <ul className="text-gray-800 space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="bg-orange-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  <span className="text-base">Payment process was cancelled before completion</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-orange-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  <span className="text-base">No money has been deducted from your account</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-orange-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                  <span className="text-base">You can try again anytime</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Need help?</h3>
              <p className="text-gray-700 mb-3 text-base">
                If you experienced technical difficulties, our support team is here to help.
              </p>
              <p className="text-gray-700 text-base">
                Contact us at <a href="mailto:support@xnext.co.za" className="text-orange-600 hover:underline font-semibold">support@xnext.co.za</a>
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleTryAgain}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-base md:text-lg font-semibold py-3 rounded-xl shadow-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Payment Again
            </Button>
            
            <Button 
              onClick={handleGoToHome}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl"
            >
              Return to Homepage
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-6">
            <p className="mb-2 font-medium">Having trouble? We're here to help.</p>
            <p>Call us at <span className="font-semibold text-gray-800">+27 (0) 21 123 4567</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelledPage;
