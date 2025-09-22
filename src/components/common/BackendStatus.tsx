'use client';

import { useState, useEffect } from 'react';
import { healthService, HealthStatus } from '@/services/healthService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function BackendStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [backendInfo, setBackendInfo] = useState<HealthStatus | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackendStatus = async () => {
    setStatus('loading');
    try {
      const isAvailable = await healthService.isBackendAvailable();
      if (isAvailable) {
        setStatus('connected');
        const info = await healthService.getBackendInfo();
        setBackendInfo(info);
      } else {
        setStatus('disconnected');
        setBackendInfo(null);
      }
    } catch (error) {
      setStatus('disconnected');
      setBackendInfo(null);
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Verificando conexión...';
      case 'connected':
        return 'Backend conectado';
      case 'disconnected':
        return 'Backend desconectado';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        <button
          onClick={checkBackendStatus}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Verificar
        </button>
      </div>
      
      {backendInfo && (
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <div>Servicio: {backendInfo.service}</div>
          <div>Versión: {backendInfo.version}</div>
          <div>Última verificación: {lastCheck?.toLocaleTimeString()}</div>
        </div>
      )}
      
      {status === 'disconnected' && (
        <div className="mt-2 text-xs text-red-600">
          No se puede conectar con el backend. Verifica que esté ejecutándose en http://localhost:8080
        </div>
      )}
    </div>
  );
} 