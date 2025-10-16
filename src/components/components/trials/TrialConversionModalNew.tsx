import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import TrialConversionFlow from './TrialConversionFlow';

interface TrialConversionModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onConversionComplete: () => void;
}

export default function TrialConversionModalNew({ 
  isOpen, 
  onClose, 
  orderId, 
  onConversionComplete 
}: TrialConversionModalNewProps) {
  const handleConversionComplete = () => {
    onConversionComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Trial to Paid Service</DialogTitle>
          <DialogDescription>
            Choose your package and payment method to continue your service
          </DialogDescription>
        </DialogHeader>
        
        <TrialConversionFlow
          orderId={orderId}
          onConversionComplete={handleConversionComplete}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
