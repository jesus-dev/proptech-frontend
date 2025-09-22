'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Trash2,
  Upload,
  Download
} from 'lucide-react';
import { Property } from '@/types/property';
import { houzezSyncService, SyncResult } from '@/services/houzezSyncService';
import { toast } from 'sonner';

interface HouzezSyncButtonProps {
  property: Property;
  onSyncComplete?: (result: SyncResult) => void;
  showActions?: boolean;
}

export function HouzezSyncButton({ 
  property, 
  onSyncComplete, 
  showActions = true 
}: HouzezSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const syncStatus = houzezSyncService.getSyncStatus(property);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await (houzezSyncService as any).syncProperty(property.id);
      
      if (result.success) {
        toast.success(result.message || 'Propiedad sincronizada exitosamente');
      } else {
        toast.error(result.error || 'Error al sincronizar la propiedad');
      }
      
      onSyncComplete?.(result);
    } catch (error) {
      toast.error('Error inesperado al sincronizar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad de Houzez?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await (houzezSyncService as any).deleteProperty(property.id);
      
      if (result.success) {
        toast.success(result.message || 'Propiedad eliminada de Houzez');
      } else {
        toast.error(result.error || 'Error al eliminar la propiedad');
      }
      
      onSyncComplete?.(result);
    } catch (error) {
      toast.error('Error inesperado al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'FAILED':
      case 'DELETE_FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'MANUAL':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      case 'DELETED':
        return <Trash2 className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    const color = houzezSyncService.getSyncStatusColor(property);
    const text = houzezSyncService.getSyncStatusText(property);
    
    return (
      <Badge variant="secondary" className={`${color} border-current`}>
        {getStatusIcon()}
        <span className="ml-1">{text}</span>
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
      
      {syncStatus.error && (
        <div className="text-xs text-red-600 max-w-xs truncate" title={syncStatus.error}>
          {syncStatus.error}
        </div>
      )}
      
      {showActions && (
        <div className="flex gap-1">
          {syncStatus.status !== 'SUCCESS' && syncStatus.status !== 'DELETED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isLoading}
              className="h-8 px-2"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : syncStatus.hasWordPressId ? (
                <Upload className="h-3 w-3" />
              ) : (
                <Download className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {syncStatus.hasWordPressId && syncStatus.status !== 'DELETED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-8 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function SyncAllButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSyncAll = async () => {
    setIsLoading(true);
    try {
      const results = await (houzezSyncService as any).syncAllProperties();
      
      const successCount = results.filter((r: any) => r.success).length;
      const errorCount = results.filter((r: any) => !r.success).length;
      
      if (errorCount === 0) {
        toast.success(`Todas las propiedades sincronizadas exitosamente (${successCount})`);
      } else {
        toast.warning(`${successCount} sincronizadas, ${errorCount} con errores`);
      }
    } catch (error) {
      toast.error('Error al sincronizar todas las propiedades');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSyncAll}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      Sincronizar Todo
    </Button>
  );
} 