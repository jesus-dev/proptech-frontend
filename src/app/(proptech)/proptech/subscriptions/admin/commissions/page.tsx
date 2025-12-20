"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Commission {
  id: number;
  salesAgentId: number;
  agentName: string;
  agentCode: string;
  subscriptionId: number;
  userName: string;
  planName: string;
  saleAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  saleDate: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentDate?: string;
  notes?: string;
}

interface CommissionStats {
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  cancelledCommissions: number;
  totalSales: number;
  averageCommissionRate: number;
  topPerformingAgent: string;
  monthlyGrowth: number;
}

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    agentCode: '',
    dateFrom: '',
    dateTo: '',
    page: 0,
    size: 20
  });
  const [stats, setStats] = useState<CommissionStats | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simular carga de datos (reemplazar con llamada real a la API)
      const mockCommissions: Commission[] = [
        {
          id: 1,
          salesAgentId: 1,
          agentName: 'María González',
          agentCode: 'AGENT001',
          subscriptionId: 101,
          userName: 'Juan Pérez',
          planName: 'PropTech Premium',
          saleAmount: 750000,
          commissionPercentage: 15,
          commissionAmount: 112500,
          saleDate: '2024-08-15',
          status: 'PAID',
          paymentDate: '2024-08-20',
          notes: 'Pago realizado por transferencia bancaria'
        },
        {
          id: 2,
          salesAgentId: 2,
          agentName: 'Carlos Mendoza',
          agentCode: 'AGENT002',
          subscriptionId: 102,
          userName: 'Ana López',
          planName: 'PropTech Intermedio',
          saleAmount: 350000,
          commissionPercentage: 10,
          commissionAmount: 35000,
          saleDate: '2024-08-18',
          status: 'PENDING',
          notes: 'Pendiente de verificación de pago'
        },
        {
          id: 3,
          salesAgentId: 3,
          agentName: 'Ana Patricia Silva',
          agentCode: 'AGENT003',
          subscriptionId: 103,
          userName: 'Roberto García',
          planName: 'PropTech Premium',
          saleAmount: 750000,
          commissionPercentage: 20,
          commissionAmount: 150000,
          saleDate: '2024-08-20',
          status: 'PENDING',
          notes: 'Pendiente de aprobación'
        },
        {
          id: 4,
          salesAgentId: 1,
          agentName: 'María González',
          agentCode: 'AGENT001',
          subscriptionId: 104,
          userName: 'Carmen Rodríguez',
          planName: 'PropTech Inicial',
          saleAmount: 150000,
          commissionPercentage: 15,
          commissionAmount: 22500,
          saleDate: '2024-08-22',
          status: 'PAID',
          paymentDate: '2024-08-25',
          notes: 'Pago realizado por tarjeta de crédito'
        }
      ];

      const mockStats: CommissionStats = {
        totalCommissions: 320000,
        paidCommissions: 135000,
        pendingCommissions: 185000,
        cancelledCommissions: 0,
        totalSales: 2000000,
        averageCommissionRate: 16.0,
        topPerformingAgent: 'Ana Patricia Silva',
        monthlyGrowth: 12.5
      };

      setCommissions(mockCommissions);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pagada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY');
  };

  const handleMarkAsPaid = (commissionId: number) => {
    setCommissions(prev => prev.map(commission => 
      commission.id === commissionId 
        ? { ...commission, status: 'PAID', paymentDate: new Date().toISOString().split('T')[0] }
        : commission
    ));
    toast.success('Comisión marcada como pagada');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-lg">Cargando comisiones...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Comisiones</h1>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCommissions)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comisiones Pagadas</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.paidCommissions)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comisiones Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingCommissions)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Ventas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ventas Totales:</span>
                <span className="font-medium">{formatCurrency(stats.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa Promedio:</span>
                <span className="font-medium">{stats.averageCommissionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Top Performer:</span>
                <span className="font-medium">{stats.topPerformingAgent}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Estado</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Pagadas</span>
                </div>
                <span className="font-medium">{((stats.paidCommissions / stats.totalCommissions) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Pendientes</span>
                </div>
                <span className="font-medium">{((stats.pendingCommissions / stats.totalCommissions) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Canceladas</span>
                </div>
                <span className="font-medium">{((stats.cancelledCommissions / stats.totalCommissions) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Button className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Reporte
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Programar Pagos
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Ver Agentes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos los estados</option>
              <option value="PAID">Pagada</option>
              <option value="PENDING">Pendiente</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de Agente
            </label>
            <Input
              value={filters.agentCode}
              onChange={(e) => handleFilterChange('agentCode', e.target.value)}
              placeholder="Ej: AGENT001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Elementos por página
            </label>
            <select
              value={filters.size}
              onChange={(e) => handleFilterChange('size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Comisiones */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Comisiones ({commissions.length})
          </h3>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente/Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{commission.agentName}</div>
                      <div className="text-sm text-gray-500">{commission.agentCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{commission.userName}</div>
                      <div className="text-sm text-gray-500">{commission.planName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(commission.saleAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(commission.saleDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {commission.commissionPercentage}%
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(commission.commissionAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(commission.status)}
                      <Badge className={`ml-2 ${getStatusColor(commission.status)}`}>
                        {getStatusLabel(commission.status)}
                      </Badge>
                    </div>
                    {commission.paymentDate && (
                      <div className="text-sm text-gray-500 mt-1">
                        Pagado: {formatDate(commission.paymentDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Ver detalles de la comisión
                          toast.info('Funcionalidad de ver detalles próximamente');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {commission.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(commission.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {commissions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron comisiones con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Mostrando {filters.page * filters.size + 1} a {Math.min((filters.page + 1) * filters.size, commissions.length)} de {commissions.length} resultados
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
            disabled={filters.page === 0}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={commissions.length < filters.size}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
