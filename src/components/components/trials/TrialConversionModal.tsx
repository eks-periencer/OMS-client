import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { apiClient } from '../../../../lib/api/client';  
import { CreditCard, Banknote, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  price: number;
  installationFee: number;
  isActive: boolean;
}

interface TrialConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialId: string;
  trialData: {
    customerName: string;
    customerEmail: string;
    daysRemaining: number;
    engagementLevel: string;
    // Additional customer data for auto-population
    customerFirstName?: string;
    customerLastName?: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCity?: string;
    customerProvince?: string;
    customerPostalCode?: string;
    trialStartDate?: string;
    trialEndDate?: string;
    orderCreatedAt?: string;
    serviceAddress?: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
    };
  };
  onConversionSuccess: () => void;
}

export default function TrialConversionModal({
  isOpen,
  onClose,
  trialId,
  trialData,
  onConversionSuccess
}: TrialConversionModalProps) {
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [customerDetails, setCustomerDetails] = useState({
    firstName: trialData.customerFirstName || '',
    lastName: trialData.customerLastName || '',
    email: trialData.customerEmail || '',
    phone: trialData.customerPhone || '',
    address: trialData.customerAddress || trialData.serviceAddress?.street || '',
    city: trialData.customerCity || trialData.serviceAddress?.city || '',
    postalCode: trialData.customerPostalCode || trialData.serviceAddress?.postalCode || '',
    province: trialData.customerProvince || trialData.serviceAddress?.province || ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Package selection, 2: Payment method, 3: Customer details, 4: Confirmation

  // Load service packages
  useEffect(() => {
    if (isOpen) {
      loadServicePackages();
    }
  }, [isOpen]);

  // Auto-populate customer details when trialData changes
  useEffect(() => {
    setCustomerDetails({
      firstName: trialData.customerFirstName || '',
      lastName: trialData.customerLastName || '',
      email: trialData.customerEmail || '',
      phone: trialData.customerPhone || '',
      address: trialData.customerAddress || trialData.serviceAddress?.street || '',
      city: trialData.customerCity || trialData.serviceAddress?.city || '',
      postalCode: trialData.customerPostalCode || trialData.serviceAddress?.postalCode || '',
      province: trialData.customerProvince || trialData.serviceAddress?.province || ''
    });
  }, [trialData]);

  // Auto-advance to next step when package is selected
  useEffect(() => {
    if (selectedPackage && step === 1) {
      // Small delay to show the selection before advancing
      const timer = setTimeout(() => {
        setStep(2);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedPackage, step]);

  // Auto-advance to next step when payment method is selected
  useEffect(() => {
    if (paymentMethod && step === 2) {
      // Small delay to show the selection before advancing
      const timer = setTimeout(() => {
        setStep(3);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [paymentMethod, step]);

  const loadServicePackages = async () => {
    try {
      const response = await apiClient.get('/orders/service-packages');
      if (response.data.success) {
        setServicePackages(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load service packages:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load service packages'
      });
    }
  };

  const selectedPackageData = servicePackages.find(pkg => pkg.id === selectedPackage);

  const handleNext = () => {
    if (step === 1 && !selectedPackage) {
      Swal.fire({ icon: 'warning', title: 'Please select a service package' });
      return;
    }
    if (step === 2 && !paymentMethod) {
      Swal.fire({ icon: 'warning', title: 'Please select a payment method' });
      return;
    }
    if (step === 3) {
      // Validate customer details
      if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.phone) {
        Swal.fire({ icon: 'warning', title: 'Please fill in all required fields' });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConversion = async () => {
    if (!selectedPackage || !paymentMethod) {
      Swal.fire({ icon: 'error', title: 'Missing required information' });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(`/orders/${trialId}/convert-to-paid`, {
        planId: selectedPackage,
        paymentMethod: paymentMethod,
        customerDetails: customerDetails
      });

      const data = response.data;
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Conversion Initiated!',
          text: 'Payment link has been generated. Check your email for payment instructions.',
          confirmButtonText: 'OK'
        });
        
        onConversionSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'Conversion failed');
      }
    } catch (error: unknown) {
      console.error('Conversion error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Conversion Failed',
        text: error instanceof Error ? error.message : 'An error occurred during conversion'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedPackage('');
    setPaymentMethod('');
    setCustomerDetails({
      firstName: '',
      lastName: '',
      email: trialData.customerEmail,
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      province: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Convert Trial to Paid Service
          </DialogTitle>
          <DialogDescription>
            Complete your trial conversion by selecting a service package and payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-8 h-0.5 ${
                    step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Package Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Service Package</h3>
              <div className="grid gap-4">
                {servicePackages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <Badge variant="secondary">{pkg.speed}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly Price:</span>
                          <span className="font-semibold">R{pkg.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Installation Fee:</span>
                          <span className="font-semibold">R{pkg.installationFee.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total First Payment:</span>
                          <span className="text-green-600">R{(pkg.price + pkg.installationFee).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Payment Method</h3>
              <div className="grid gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    paymentMethod === 'peach_payments' 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setPaymentMethod('peach_payments')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Banknote className="h-6 w-6 text-green-500" />
                      <div>
                        <h4 className="font-semibold">Peach Payments</h4>
                        <p className="text-sm text-gray-600">Cash, Debit Order, EFT</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    paymentMethod === 'stripe' 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-blue-500" />
                      <div>
                        <h4 className="font-semibold">Stripe</h4>
                        <p className="text-sm text-gray-600">Credit Card, Debit Card</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={customerDetails.firstName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={customerDetails.lastName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={customerDetails.postalCode}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Enter postal code"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="province">Province</Label>
                  <Select
                    value={customerDetails.province}
                    onValueChange={(value) => setCustomerDetails(prev => ({ ...prev, province: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gauteng">Gauteng</SelectItem>
                      <SelectItem value="Western Cape">Western Cape</SelectItem>
                      <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                      <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                      <SelectItem value="Free State">Free State</SelectItem>
                      <SelectItem value="Limpopo">Limpopo</SelectItem>
                      <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                      <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                      <SelectItem value="North West">North West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && selectedPackageData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confirm Conversion</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Customer Information</h4>
                    <p className="text-sm text-gray-600">
                      {customerDetails.firstName} {customerDetails.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{customerDetails.email}</p>
                    <p className="text-sm text-gray-600">{customerDetails.phone}</p>
                    <p className="text-sm text-gray-600">
                      {customerDetails.address}, {customerDetails.city}, {customerDetails.province} {customerDetails.postalCode}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold">Trial Information</h4>
                    <p className="text-sm text-gray-600">
                      Trial Started: {trialData.trialStartDate ? new Date(trialData.trialStartDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Trial Ends: {trialData.trialEndDate ? new Date(trialData.trialEndDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Days Remaining: {trialData.daysRemaining} days
                    </p>
                    <p className="text-sm text-gray-600">
                      Engagement Level: <Badge variant="outline">{trialData.engagementLevel}</Badge>
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold">Service Package</h4>
                    <p className="text-sm">{selectedPackageData.name} - {selectedPackageData.speed}</p>
                    <p className="text-sm text-gray-600">Monthly: R{selectedPackageData.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Installation: R{selectedPackageData.installationFee.toFixed(2)}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold">Payment Method</h4>
                    <p className="text-sm">
                      {paymentMethod === 'peach_payments' ? 'Peach Payments (Cash/Debit Order)' : 'Stripe (Credit/Debit Card)'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total First Payment:</span>
                    <span className="text-green-600">
                      R{(selectedPackageData.price + selectedPackageData.installationFee).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={step === 1 ? handleClose : handleBack}
              disabled={loading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            {step < 4 ? (
              <Button onClick={handleNext} disabled={loading}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleConversion} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : 'Complete Conversion'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


