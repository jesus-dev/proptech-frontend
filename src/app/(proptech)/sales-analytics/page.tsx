"use client";
import React, { useState, useEffect } from "react";
import { 
  PipelineOverview,
  StageBreakdown,
  AgentPerformance,
  SourceAnalysis
} from "../sales-pipeline/types";
import { salesPipelineService } from "../sales-pipeline/services/salesPipelineService";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
export default function SalesAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days
  const [overview, setOverview] = useState<PipelineOverview | null>(null);
  const [stageBreakdown, setStageBreakdown] = useState<StageBreakdown | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance | null>(null);
  const [sourceAnalysis, setSourceAnalysis] = useState<SourceAnalysis | null>(null);
  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewData, stageData, agentData, sourceData] = await Promise.all([
        salesPipelineService.getPipelineOverview(),
        salesPipelineService.getStageBreakdown(),
        salesPipelineService.getAgentPerformance(),
        salesPipelineService.getSourceAnalysis()
      ]);
      setOverview(overviewData);
      setStageBreakdown(stageData);
      setAgentPerformance(agentData);
      setSourceAnalysis(sourceData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Error al cargar los analytics');
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return "0.0%";
    return `${value.toFixed(1)}%`;
  };
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };
  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ChartBarIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                  Analytics de Ventas
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Análisis detallado del rendimiento comercial
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.totalLeads}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(overview.totalLeads, overview.totalLeads - 5)}
                  <span className="text-sm text-gray-500 ml-1">+5 vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Activos</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.activeLeads}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(overview.activeLeads, overview.activeLeads - 3)}
                  <span className="text-sm text-gray-500 ml-1">+3 vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Ganancia</p>
                <p className="text-2xl font-semibold text-gray-900">{formatPercentage(overview.winRate)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(overview.winRate, overview.winRate - 2)}
                  <span className="text-sm text-gray-500 ml-1">+2% vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Pipeline</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(overview.totalPipelineValue)}
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(overview.totalPipelineValue, overview.totalPipelineValue - 50000)}
                  <span className="text-sm text-gray-500 ml-1">+$50K vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stage Breakdown */}
        {stageBreakdown && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose por Etapas</h3>
            <div className="space-y-4">
              {Object.entries(stageBreakdown).map(([stage, data]) => (
                <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">{stage}</p>
                      <p className="text-sm text-gray-500">{data.count} leads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(data.value)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPercentage(data.avgProbability)} probabilidad
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Embudo de Conversión</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Leads</span>
              <span className="text-sm font-semibold text-gray-900">{overview?.totalLeads || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Contactados</span>
              <span className="text-sm font-semibold text-gray-900">
                {stageBreakdown?.CONTACTED?.count || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${((stageBreakdown?.CONTACTED?.count || 0) / (overview?.totalLeads || 1)) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Reuniones</span>
              <span className="text-sm font-semibold text-gray-900">
                {stageBreakdown?.MEETING?.count || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${((stageBreakdown?.MEETING?.count || 0) / (overview?.totalLeads || 1)) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Propuestas</span>
              <span className="text-sm font-semibold text-gray-900">
                {stageBreakdown?.PROPOSAL?.count || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${overview?.totalLeads ? ((stageBreakdown?.PROPOSAL?.count || 0) / overview.totalLeads) * 100 : 0}%` 
                }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Ganados</span>
              <span className="text-sm font-semibold text-gray-900">{overview?.closedWon || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: `${overview?.totalLeads ? ((overview?.closedWon || 0) / overview.totalLeads) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      {/* Agent Performance */}
      {agentPerformance && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Agente</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasa de Conversión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio Probabilidad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(agentPerformance).map(([agentId, data]) => (
                  <tr key={agentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">A{agentId}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            Agente {agentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.totalLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.wonLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">
                          {formatPercentage(data.conversionRate)}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${data.conversionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(data.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(data.avgProbability)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Source Analysis */}
      {sourceAnalysis && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Fuente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(sourceAnalysis).map(([source, data]) => (
              <div key={source} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{source}</h4>
                  <span className="text-sm text-gray-500">{data.totalLeads} leads</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ganados:</span>
                    <span className="font-medium text-gray-900">{data.wonLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Perdidos:</span>
                    <span className="font-medium text-gray-900">{data.lostLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversión:</span>
                    <span className="font-medium text-gray-900">
                      {formatPercentage(data.conversionRate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(data.totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prob. Promedio:</span>
                    <span className="font-medium text-gray-900">
                      {formatPercentage(data.avgProbability)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${data.conversionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatPercentage(data.conversionRate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Key Performance Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores Clave de Rendimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overview ? formatPercentage(overview.winRate) : '0%'}
            </div>
            <div className="text-sm text-gray-600">Tasa de Ganancia</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {overview && overview.totalLeads ? Math.round(overview.totalLeads / 30) : 0}
            </div>
            <div className="text-sm text-gray-600">Leads por Día</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {overview && overview.totalPipelineValue && overview.totalLeads ? formatCurrency(overview.totalPipelineValue / overview.totalLeads) : '$0'}
            </div>
            <div className="text-sm text-gray-600">Valor Promedio por Lead</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {overview && overview.closedWon && overview.totalLeads ? Math.round((overview.closedWon / overview.totalLeads) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Conversión</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
