"use client";
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  errors: string[];
  type?: 'validation' | 'error' | 'warning';
}

export default function ErrorDialog({ isOpen, onClose, title, errors, type = 'validation' }: ErrorDialogProps) {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'validation':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-orange-500 dark:text-orange-400';
      default:
        return 'text-yellow-500 dark:text-yellow-400';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'validation':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'validation':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-orange-800 dark:text-orange-200';
      default:
        return 'text-yellow-800 dark:text-yellow-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 transition-opacity"
          onClick={onClose}
        />
        
        {/* Dialog */}
        <div className={`relative w-full max-w-md transform rounded-lg ${getBgColor()} p-6 shadow-xl transition-all`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className={`h-6 w-6 ${getIconColor()}`} />
              <h3 className={`text-lg font-semibold ${getTextColor()}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className={`text-sm ${getTextColor()} mb-4`}>
              Por favor, corrige los siguientes errores antes de continuar:
            </p>
            
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className={`mt-1 h-1.5 w-1.5 rounded-full ${getIconColor().replace('text-', 'bg-')}`} />
                  <p className={`text-sm ${getTextColor()}`}>
                    {error}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                type === 'validation' 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                  : type === 'error'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-900/50'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 