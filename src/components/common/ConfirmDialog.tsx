import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  isLoading = false,
}) => {
  const iconColors = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20`}>
          <AlertTriangle className={`w-6 h-6 ${iconColors[type]}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button 
              variant={buttonVariants[type]} 
              onClick={onConfirm} 
              isLoading={isLoading}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;