"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Users, Building2, Calendar, DollarSign } from 'lucide-react';

interface PerformanceAnalyticsProps {
  agentStats: {
    myProperties: number;
    activeLeads: number;
    todayAppointments: number;
    weekAppointments: number;
    conversionRate: number;
    propertiesNeedingAttention: number;
    newLeadsToday: number;
    activeClients: number;
    avgResponseTime: number;
    avgDaysToClose: number;
    closedDealsMonth?: number;
    monthCommissions?: number;
  } | null;
}

export default function PerformanceAnalytics({ agentStats }: PerformanceAnalyticsProps) {
  if (!agentStats) return null;

  // Calcular métricas comparativas
  const benchmarks = {
    conversionRate: 20, // Promedio del mercado
    responseTime: 12, // Horas ideales
    propertiesPerAgent: 15,
    appointmentsPerWeek: 5
  };

  const comparisons = {
    conversion: ((agentStats.conversionRate - benchmarks.conversionRate) / benchmarks.conversionRate * 100).toFixed(1),
    response: ((benchmarks.responseTime - agentStats.avgResponseTime) / benchmarks.responseTime * 100).toFixed(1),
    properties: ((agentStats.myProperties - benchmarks.propertiesPerAgent) / benchmarks.propertiesPerAgent * 100).toFixed(1),
    appointments: ((agentStats.weekAppointments - benchmarks.appointmentsPerWeek) / benchmarks.appointmentsPerWeek * 100).toFixed(1)
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Análisis de Performance
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comparativa vs. promedio del mercado
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          
          {/* Tasa de Conversión */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Tasa de Conversión</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{agentStats.conversionRate}%</span>
                {parseFloat(comparisons.conversion) > 0 ? (
                  <span className="text-green-600 text-xs flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{comparisons.conversion}%
                  </span>
                ) : (
                  <span className="text-red-600 text-xs flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {comparisons.conversion}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 ${
                  agentStats.conversionRate >= benchmarks.conversionRate ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((agentStats.conversionRate / 40) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Promedio del mercado: {benchmarks.conversionRate}%
            </p>
          </div>

          {/* Tiempo de Respuesta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Tiempo de Respuesta</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{agentStats.avgResponseTime}h</span>
                {parseFloat(comparisons.response) > 0 ? (
                  <span className="text-green-600 text-xs flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {comparisons.response}% mejor
                  </span>
                ) : (
                  <span className="text-red-600 text-xs flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Mejorar
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 ${
                  agentStats.avgResponseTime <= benchmarks.responseTime ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.max(100 - (agentStats.avgResponseTime / 48) * 100, 0)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Meta ideal: {benchmarks.responseTime}h o menos
            </p>
          </div>

          {/* Inventario de Propiedades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Inventario Activo</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{agentStats.myProperties}</span>
                {parseFloat(comparisons.properties) > 0 ? (
                  <span className="text-green-600 text-xs flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{comparisons.properties}%
                  </span>
                ) : parseFloat(comparisons.properties) < 0 ? (
                  <span className="text-orange-600 text-xs flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {comparisons.properties}%
                  </span>
                ) : null}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-2"
                style={{ width: `${Math.min((agentStats.myProperties / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Promedio recomendado: {benchmarks.propertiesPerAgent} propiedades
            </p>
          </div>

          {/* Actividad Semanal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Citas Esta Semana</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{agentStats.weekAppointments}</span>
                {parseFloat(comparisons.appointments) > 0 ? (
                  <span className="text-green-600 text-xs flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{comparisons.appointments}%
                  </span>
                ) : parseFloat(comparisons.appointments) < 0 ? (
                  <span className="text-orange-600 text-xs flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {comparisons.appointments}%
                  </span>
                ) : null}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 ${
                  agentStats.weekAppointments >= benchmarks.appointmentsPerWeek ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((agentStats.weekAppointments / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Meta semanal: {benchmarks.appointmentsPerWeek} citas
            </p>
          </div>

          {/* Resumen de Rendimiento */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2">
              📊 Resumen Semanal
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">Leads generados:</span>
                <span className="font-semibold text-gray-900">{agentStats.newLeadsToday * 7} (est.)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">Citas completadas:</span>
                <span className="font-semibold text-gray-900">{agentStats.closedDealsMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">Tiempo promedio cierre:</span>
                <span className="font-semibold text-gray-900">{agentStats.avgDaysToClose} días</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">Clientes activos:</span>
                <span className="font-semibold text-gray-900">{agentStats.activeClients}</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

