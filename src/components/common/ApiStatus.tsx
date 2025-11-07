"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { createTimeoutSignal } from '@/utils/createTimeoutSignal';
interface ApiStatusProps {
  className?: string;
}

export default function ApiStatus({ className = '' }: ApiStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      const signal = createTimeoutSignal(5000);
      const response = await apiClient.get('/api/health', {
        ...(signal ? { signal } : {}),
      });
      
      setStatus('online');
    } catch (error) {
      console.error('API health check failed:', error);
      const axiosError = error as any;
      if (axiosError?.response) {
        setStatus('offline');
      } else {
        setStatus('error');
      }
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'API Online';
      case 'offline':
        return 'API Offline';
      case 'error':
        return 'Error de Conexión';
      default:
        return 'Verificando...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-red-600';
      case 'error':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {lastCheck && (
        <span className="text-xs text-gray-500">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={checkApiStatus}
        className="text-xs text-blue-500 hover:text-blue-700 underline"
        disabled={status === 'checking'}
      >
        Verificar
      </button>
    </div>
  );
} 