import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { Button } from './button'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  type?: 'success' | 'error' | 'warning' | 'info'
  buttonText?: string
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  buttonText = 'OK'
}: AlertModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      default:
        return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  const getButtonVariant = () => {
    switch (type) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-left text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onClose}
            className="w-full"
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Specific alert modals for common scenarios
export function SuccessAlertModal({
  isOpen,
  onClose,
  title,
  description
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
}) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      type="success"
    />
  )
}

export function ErrorAlertModal({
  isOpen,
  onClose,
  title,
  description
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
}) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      type="error"
    />
  )
}

export function WarningAlertModal({
  isOpen,
  onClose,
  title,
  description
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
}) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      type="warning"
    />
  )
}
