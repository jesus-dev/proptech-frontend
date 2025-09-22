import React, { useState, useEffect } from 'react';
import { SignatureAuditService } from '../services/signatureAuditService';
import { Clock, Monitor, Globe, Smartphone, Trash2, Eye, EyeOff, Database, RefreshCw } from 'lucide-react';

interface SignatureAuditLogProps {
  contractId?: string;
}

export default function SignatureAuditLog({ contractId }: SignatureAuditLogProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'local' | 'database'>('local');

  useEffect(() => {
    loadLogs();
  }, [contractId, dataSource]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      if (dataSource === 'local') {
        const localLogs = SignatureAuditService.getAuditLogs();
        setLogs(localLogs);
      } else {
        const dbLogs = await SignatureAuditService.getAuditLogsFromDatabase(contractId);
        setLogs(dbLogs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithDatabase = async () => {
    setIsLoading(true);
    try {
      await SignatureAuditService.syncLocalLogsWithDatabase();
      await loadLogs();
    } catch (error) {
      console.error('Error syncing with database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'created':
      case 'CREATED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cleared':
      case 'CLEARED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'modified':
      case 'MODIFIED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getEventTypeText = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case 'created':
        return 'Creada';
      case 'cleared':
        return 'Limpiada';
      case 'modified':
        return 'Modificada';
      default:
        return eventType || 'Desconocido';
    }
  };

  const getSignatureTypeText = (signatureType: string) => {
    switch (signatureType?.toLowerCase()) {
      case 'client':
        return 'Cliente';
      case 'broker':
        return 'Corredor';
      default:
        return signatureType || 'Desconocido';
    }
  };

  if (logs.length === 0 && !isVisible) {
    return null;
  }

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Registro de Auditoría de Firmas
            <span className="text-xs text-gray-500">({logs.length} eventos)</span>
          </h3>
          <div className="flex items-center gap-2">
            {/* Selector de fuente de datos */}
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value as 'local' | 'database')}
              className="text-xs px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="local">Local</option>
              <option value="database">Base de Datos</option>
            </select>
            
            {/* Botón de sincronización */}
            {dataSource === 'local' && (
              <button
                onClick={syncWithDatabase}
                disabled={isLoading}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Sincronizar con BD"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            {/* Botón de mostrar/ocultar */}
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {/* Botón de limpiar */}
            <button
              onClick={() => {
                SignatureAuditService.clearAuditLogs();
                setLogs([]);
              }}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Limpiar logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isVisible && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <span className="ml-2 text-sm text-gray-500">Cargando logs...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {logs.slice().reverse().map((log, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(log.eventType)}`}>
                        {getEventTypeText(log.eventType)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getSignatureTypeText(log.signatureType || log.auditData?.signatureType)}
                      </span>
                      {dataSource === 'database' && (
                        <span className="text-xs text-blue-500 flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          BD
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(log.timestamp || log.auditData?.timestamp || log.logTimestamp)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Monitor className="w-3 h-3" />
                      <span>
                        {log.auditData?.deviceInfo?.platform || log.platform} - 
                        {log.auditData?.deviceInfo?.browser || log.browser} 
                        {log.auditData?.deviceInfo?.browserVersion || log.browserVersion}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Globe className="w-3 h-3" />
                      <span>{log.auditData?.deviceInfo?.timezone || log.timezone}</span>
                    </div>
                    {(log.auditData?.ipAddress || log.ipAddress) && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Smartphone className="w-3 h-3" />
                        <span>IP: {log.auditData?.ipAddress || log.ipAddress}</span>
                      </div>
                    )}
                    {(log.auditData?.signatureData?.signatureHash || log.signatureHash) && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span>Hash: {(log.auditData?.signatureData?.signatureHash || log.signatureHash).substring(0, 8)}...</span>
                      </div>
                    )}
                  </div>

                  {(log.auditData?.sessionInfo || log.sessionId) && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>Sesión: {(log.auditData?.sessionInfo?.sessionId || log.sessionId).substring(0, 20)}...</div>
                      <div>URL: {log.auditData?.sessionInfo?.pageUrl || log.pageUrl}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 