// src/components/UI/Modal.jsx
import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        {/* Modal panel */}
        <div className={`
          inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl 
          transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]} ${className}
        `}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="bg-white px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-4 pb-4 sm:px-6 sm:pb-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal variant
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
        <Button
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
          disabled={loading}
        >
          {confirmText}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};

// Alert Modal variant
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "OK"
}) => {
  const icons = {
    success: (
      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex items-center">
        <div className={`
          flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full mx-auto
          ${type === 'success' ? 'bg-green-100' : ''}
          ${type === 'error' ? 'bg-red-100' : ''}
          ${type === 'warning' ? 'bg-yellow-100' : ''}
          ${type === 'info' ? 'bg-blue-100' : ''}
        `}>
          {icons[type]}
        </div>
      </div>
      
      <div className="mt-3 text-center sm:mt-5">
        {title && (
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            {title}
          </h3>
        )}
        <div className="mt-2">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>

      <div className="mt-5 sm:mt-6">
        <Button
          variant="primary"
          fullWidth
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

export default Modal;