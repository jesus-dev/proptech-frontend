'use client';

import { useEffect, useState } from 'react';
import { apiConfig } from '@/lib/api-config';
import { apiClient } from '@/lib/api';
import { publicPropertyService } from '@/services/publicPropertyService';

interface DiagnosticResult {
  check: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnostics: DiagnosticResult[] = [];

    // 1. Verificar configuración de API
    try {
      const config = apiConfig.getConfig();
      diagnostics.push({
        check: 'Configuración de API',
        status: 'success',
        message: `API URL configurada correctamente`,
        details: config
      });
    } catch (error: any) {
      diagnostics.push({
        check: 'Configuración de API',
        status: 'error',
        message: error.message,
        details: error
      });
    }

    // 2. Verificar conexión al backend
    try {
      const apiUrl = apiConfig.getApiUrl();
      const healthResponse = await fetch(`${apiUrl}/q/health`);
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        diagnostics.push({
          check: 'Conexión al Backend',
          status: 'success',
          message: 'Backend responde correctamente',
          details: health
        });
      } else {
        diagnostics.push({
          check: 'Conexión al Backend',
          status: 'error',
          message: `Backend respondió con status ${healthResponse.status}`,
          details: { status: healthResponse.status, statusText: healthResponse.statusText }
        });
      }
    } catch (error: any) {
      diagnostics.push({
        check: 'Conexión al Backend',
        status: 'error',
        message: `No se pudo conectar al backend: ${error.message}`,
        details: error
      });
    }

    // 2b. Verificar catálogos (ciudades y monedas) - usados en Nuevo Desarrollo
    try {
      const citiesRes = await apiClient.get('/api/cities').catch((err: any) => ({ err }));
      if ('err' in citiesRes) {
        diagnostics.push({
          check: 'API Ciudades (/api/cities)',
          status: 'error',
          message: `Error: ${(citiesRes as any).err?.response?.status ?? (citiesRes as any).err?.code ?? (citiesRes as any).err?.message}`,
          details: (citiesRes as any).err?.response?.data ?? (citiesRes as any).err
        });
      } else {
        const data = (citiesRes as any).data;
        const count = Array.isArray(data) ? data.length : (data?.content?.length ?? data?.data?.length ?? '?');
        diagnostics.push({
          check: 'API Ciudades (/api/cities)',
          status: 'success',
          message: `${count} ciudades`,
          details: { status: (citiesRes as any).status, count, isArray: Array.isArray(data) }
        });
      }
    } catch (e: any) {
      diagnostics.push({
        check: 'API Ciudades (/api/cities)',
        status: 'error',
        message: e?.message ?? String(e),
        details: e
      });
    }
    try {
      const currRes = await apiClient.get('/api/currencies/active').catch((err: any) => ({ err }));
      if ('err' in currRes) {
        diagnostics.push({
          check: 'API Monedas (/api/currencies/active)',
          status: 'error',
          message: `Error: ${(currRes as any).err?.response?.status ?? (currRes as any).err?.code ?? (currRes as any).err?.message}`,
          details: (currRes as any).err?.response?.data ?? (currRes as any).err
        });
      } else {
        const data = (currRes as any).data;
        const count = Array.isArray(data) ? data.length : (data?.content?.length ?? data?.data?.length ?? '?');
        diagnostics.push({
          check: 'API Monedas (/api/currencies/active)',
          status: 'success',
          message: `${count} monedas activas`,
          details: { status: (currRes as any).status, count, isArray: Array.isArray(data) }
        });
      }
    } catch (e: any) {
      diagnostics.push({
        check: 'API Monedas (/api/currencies/active)',
        status: 'error',
        message: e?.message ?? String(e),
        details: e
      });
    }

    // 2c. Verificar desarrollos (requiere sesión)
    try {
      const devRes = await apiClient.get('/api/developments').catch((err: any) => ({ err }));
      if ('err' in devRes) {
        const err = (devRes as any).err;
        const status = err?.response?.status;
        diagnostics.push({
          check: 'API Desarrollos (/api/developments)',
          status: 'error',
          message: status === 401
            ? '401 - Inicia sesión para ver desarrollos'
            : status === 403
            ? '403 - Sin permiso'
            : `Error: ${status ?? err?.code ?? err?.message}`,
          details: err?.response?.data ?? err
        });
      } else {
        const data = (devRes as any).data;
        const count = Array.isArray(data) ? data.length : (data?.data?.length ?? data?.content?.length ?? '?');
        diagnostics.push({
          check: 'API Desarrollos (/api/developments)',
          status: 'success',
          message: `${count} desarrollos`,
          details: { status: (devRes as any).status, count, isArray: Array.isArray(data) }
        });
      }
    } catch (e: any) {
      diagnostics.push({
        check: 'API Desarrollos (/api/developments)',
        status: 'error',
        message: e?.message ?? String(e),
        details: e
      });
    }

    // 3. Verificar endpoint público de propiedades
    try {
      const properties = await publicPropertyService.getAllProperties();
      diagnostics.push({
        check: 'Endpoint Público de Propiedades',
        status: 'success',
        message: `${properties.length} propiedades encontradas`,
        details: { count: properties.length, sample: properties[0] }
      });
    } catch (error: any) {
      diagnostics.push({
        check: 'Endpoint Público de Propiedades',
        status: 'error',
        message: `Error al obtener propiedades: ${error.message}`,
        details: error
      });
    }

    // 4. Verificar variables de entorno
    diagnostics.push({
      check: 'Variables de Entorno',
      status: 'success',
      message: 'Variables de entorno',
      details: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NO DEFINIDA',
        NODE_ENV: process.env.NODE_ENV,
        isClient: typeof window !== 'undefined'
      }
    });

    // 5. Probar obtener propiedad por ID (si hay propiedades)
    try {
      const properties = await publicPropertyService.getAllProperties();
      if (properties.length > 0) {
        const firstProperty = properties[0];
        const propertyById = await publicPropertyService.getPropertyById(firstProperty.id);
        diagnostics.push({
          check: 'Obtener Propiedad por ID',
          status: 'success',
          message: `Propiedad ${firstProperty.id} obtenida correctamente`,
          details: { property: propertyById }
        });

        // 6. Probar obtener por slug si existe
        if (firstProperty.slug) {
          try {
            const propertyBySlug = await publicPropertyService.getPropertyBySlug(firstProperty.slug);
            diagnostics.push({
              check: 'Obtener Propiedad por Slug',
              status: 'success',
              message: `Propiedad con slug '${firstProperty.slug}' obtenida correctamente`,
              details: { property: propertyBySlug }
            });
          } catch (error: any) {
            diagnostics.push({
              check: 'Obtener Propiedad por Slug',
              status: 'error',
              message: `Error al obtener propiedad por slug '${firstProperty.slug}': ${error.message}`,
              details: error
            });
          }
        } else {
          diagnostics.push({
            check: 'Obtener Propiedad por Slug',
            status: 'warning',
            message: 'La primera propiedad no tiene slug generado',
            details: { property: firstProperty }
          });
        }
      }
    } catch (error: any) {
      diagnostics.push({
        check: 'Pruebas de Obtención de Propiedades',
        status: 'error',
        message: `No se pudieron ejecutar las pruebas: ${error.message}`,
        details: error
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Diagnósticos del Sistema
          </h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return '?';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Diagnósticos del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Estado de la conexión y configuración del sistema
          </p>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.check}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {result.message}
              </p>

              {result.details && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    Ver detalles técnicos
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto text-xs text-gray-800 dark:text-gray-200">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={runDiagnostics}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ejecutar diagnósticos nuevamente
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

