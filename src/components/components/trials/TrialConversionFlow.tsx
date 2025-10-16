import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/components/ui/card';
import { Button } from '../../../components/components/ui/button';
import { Badge } from '../../../components/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../../../components/components/ui/radio-group';
import { Label } from '../../../components/components/ui/label';
import { Input } from '../../../components/components/ui/input';
import { Textarea } from '../../../components/components/ui/textarea';
import { CheckCircle, CreditCard, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../lib/api/client';    
import Swal from 'sweetalert2';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  bandwidth: string;
  serviceType: string;
  features: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiresBankDetails: boolean;
}

interface ConversionData {
  serviceType: string;
  packages: ServicePackage[];
  paymentMethods: PaymentMethod[];
}

interface TrialConversionFlowProps {
  orderId: string;
  onConversionComplete: () => void;
  onCancel: () => void;
}

export default function TrialConversionFlow({ 
  orderId, 
  onConversionComplete, 
  onCancel 
}: TrialConversionFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    branchCode: ''
  });

  // Load conversion data on mount
  useEffect(() => {
    loadConversionData();
  }, [orderId]);

  const loadConversionData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/orders/${orderId}/trials/conversion/packages`);
      
      if (response.data.success) {
        setConversionData(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to load conversion data');
      }
    } catch (error) {
      console.error('Failed to load conversion data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load conversion packages. Please try again.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    const pkg = conversionData?.packages.find(p => p.id === packageId);
    setSelectedPackage(pkg || null);
    setStep(2);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setStep(3);
  };

  const handleProcessConversion = async () => {
    if (!selectedPackage || !selectedPaymentMethod) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please select a package and payment method.',
        icon: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiClient.post(`/orders/${orderId}/trials/conversion/process`, {
        packageId: selectedPackage.id,
        paymentMethod: selectedPaymentMethod,
        customerDetails,
        bankDetails: selectedPaymentMethod === 'debit_order' ? bankDetails : {}
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Conversion Successful!',
          text: 'Your trial has been converted to a paid service. You will receive a confirmation email shortly.',
          icon: 'success',
          timer: 3000
        });
        onConversionComplete();
      } else {
        throw new Error(response.data.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      Swal.fire({
        title: 'Conversion Failed',
        text: error instanceof Error ? error.message : 'Failed to process conversion. Please try again.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    return serviceType === 'wireless' ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />;
  };

  if (loading && !conversionData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading conversion options...</span>
      </div>
    );
  }

  if (!conversionData) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load conversion data</p>
        <Button onClick={loadConversionData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Convert Your Trial</h2>
        <p className="text-muted-foreground">
          Choose a package and payment method to continue your service
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNumber ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Package Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getServiceIcon(conversionData.serviceType)}
              <span className="ml-2">Choose Your Package</span>
            </CardTitle>
            <CardDescription>
              Select the package that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conversionData.packages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPackage?.id === pkg.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      R{pkg.price}/month
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {pkg.bandwidth}
                    </div>
                    <ul className="space-y-1 text-sm">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment Method Selection */}
      {step === 2 && selectedPackage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Choose Payment Method
            </CardTitle>
            <CardDescription>
              How would you like to pay for your service?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Selected Package</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedPackage.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPackage.bandwidth}</p>
                  </div>
                  <Badge variant="secondary">R{selectedPackage.price}/month</Badge>
                </div>
              </div>

              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {conversionData.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => handlePaymentMethodSelect(selectedPaymentMethod)}
                  disabled={!selectedPaymentMethod}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Customer Details & Payment */}
      {step === 3 && selectedPackage && selectedPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Conversion</CardTitle>
            <CardDescription>
              Provide your details to complete the conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Package Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedPackage.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPackage.bandwidth}</p>
                </div>
                <Badge variant="secondary">R{selectedPackage.price}/month</Badge>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Customer Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={customerDetails.firstName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={customerDetails.lastName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bank Details (if debit order) */}
            {selectedPaymentMethod === 'debit_order' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Bank Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchCode">Branch Code</Label>
                    <Input
                      id="branchCode"
                      value={bankDetails.branchCode}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, branchCode: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleProcessConversion}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Complete Conversion'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
