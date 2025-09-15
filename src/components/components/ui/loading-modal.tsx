import React from 'react'
import {
  Dialog,
  DialogContent,
} from './dialog'
import { Loader2 } from 'lucide-react'

interface LoadingModalProps {
  isOpen: boolean
  title?: string
  description?: string
}

export function LoadingModal({
  isOpen,
  title = 'Processing...',
  description = 'Please wait while we process your request.'
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[440px]">
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-center space-y-1">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
