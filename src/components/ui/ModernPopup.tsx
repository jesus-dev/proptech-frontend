"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModernPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  icon?: React.ReactNode;
}

export default function ModernPopup({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  showCloseButton = true,
  closeOnBackdropClick = true,
  icon
}: ModernPopupProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fondo degradado con blur */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/40 to-brand-900/30 dark:from-black/80 dark:via-black/60 dark:to-brand-900/50 backdrop-blur-sm transition-all duration-300"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Contenido del popup */}
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-3xl w-full max-h-[90vh] transform transition-all duration-300 scale-100 my-8 ${maxWidth}`}>
        {/* Header con gradiente - sticky */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-2xl px-6 py-5 sm:px-8 sm:py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-white/80 text-sm mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20 flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto text-gray-900 dark:text-gray-100" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
} 