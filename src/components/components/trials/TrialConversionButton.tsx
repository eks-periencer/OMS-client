import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CreditCard } from 'lucide-react';
import TrialConversionModalNew from './TrialConversionModalNew';

interface TrialConversionButtonProps {
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
  onConversionSuccess?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showDetails?: boolean;
}

const TrialConversionButton = (props: TrialConversionButtonProps) => {
  const {
    trialId,
    trialData,
    onConversionSuccess,
    variant = 'default',
    size = 'default',
    className = '',
    showDetails = false
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConversionSuccess = () => {
    setIsModalOpen(false);
    if (onConversionSuccess) {
      onConversionSuccess();
    }
  };

  const getButtonText = () => {
    if (trialData.daysRemaining <= 7) {
      return 'Convert Now (Urgent)';
    } else if (trialData.daysRemaining <= 14) {
      return 'Convert to Paid';
    } else {
      return 'Convert to Paid';
    }
  };

  const getButtonVariant = () => {
    if (trialData.daysRemaining <= 7) {
      return 'destructive';
    } else if (trialData.daysRemaining <= 14) {
      return 'default';
    } else {
      return variant;
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant={getButtonVariant()}
          size={size}
          className={`${className} ${trialData.daysRemaining <= 7 ? 'animate-pulse' : ''}`}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
        
        {showDetails && (
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {trialData.daysRemaining} days left
              </Badge>
              <Badge 
                variant={trialData.engagementLevel === 'HOT' ? 'destructive' : 
                        trialData.engagementLevel === 'WARM' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {trialData.engagementLevel} engagement
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {trialData.customerName} • {trialData.customerEmail}
            </p>
          </div>
        )}
      </div>

      <TrialConversionModalNew
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderId={trialId}
        onConversionComplete={handleConversionSuccess}
      />
    </>
  );
}

export default TrialConversionButton;
