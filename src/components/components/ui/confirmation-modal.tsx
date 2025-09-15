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
import { AlertTriangle, Trash2, Key, LogOut, AlertCircle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'warning' | 'default'
  icon?: React.ReactNode
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  loading = false
}: ConfirmationModalProps) {
  const getIcon = () => {
    if (icon) return icon
    
    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-blue-500" />
    }
  }

  const getButtonVariant = () => {
    switch (variant) {
      case 'destructive':
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
        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Specific confirmation modals for common actions
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'item',
  loading = false
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName?: string
  loading?: boolean
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemName}`}
      description={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
      confirmText="Delete"
      variant="destructive"
      loading={loading}
    />
  )
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Logout"
      description="Are you sure you want to logout? You will need to sign in again to access your account."
      confirmText="Logout"
      variant="warning"
      icon={<LogOut className="h-6 w-6 text-yellow-500" />}
      loading={loading}
    />
  )
}

export function ResetPasswordConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userName = 'user',
  loading = false
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName?: string
  loading?: boolean
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Reset Password"
      description={`Are you sure you want to reset ${userName}'s password? They will receive an email with reset instructions.`}
      confirmText="Reset Password"
      variant="warning"
      icon={<Key className="h-6 w-6 text-yellow-500" />}
      loading={loading}
    />
  )
}
