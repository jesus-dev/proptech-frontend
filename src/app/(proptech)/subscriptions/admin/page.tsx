"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Calendar,
  FileText,
  CreditCard,
  Shield
} from 'lucide-react';

const adminModules = [
  {
    title: 'Planes de Suscripción',
    description: 'Gestionar planes, precios y características',
    icon: <Package className="h-8 w-8 text-blue-600" />,
    href: '/subscriptions/admin/plans',
    color: 'bg-blue-50 border-blue-200',
    stats: {
      label: 'Planes Activos',
      value: '8',
      change: '+2 este mes'
    }
  },
  {
    title: 'Suscripciones',
    description: 'Ver y administrar suscripciones de usuarios',
    icon: <Users className="h-8 w-8 text-green-600" />,
    href: '/subscriptions/admin/subscriptions',
    color: 'bg-green-50 border-green-200',
    stats: {
      label: 'Suscripciones Activas',
      value: '156',
      change: '+12 este mes'
    }
  },
  {
    title: 'Agentes de Ventas',
    description: 'Gestionar agentes y porcentajes de comisión',
    icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
    href: '/subscriptions/admin/sales-agents',
    color: 'bg-purple-50 border-purple-200',
    stats: {
      label: 'Agentes Activos',
      value: '12',
      change: '+3 este mes'
    }
  },
  {
    title: 'Dashboard de Comisiones',
    description: 'Seguimiento de comisiones y pagos',
    icon: <DollarSign className="h-8 w-8 text-orange-600" />,
    href: '/subscriptions/admin/commissions',
    color: 'bg-orange-50 border-orange-200',
    stats: {
      label: 'Comisiones Pendientes',
      value: '₲ 2.5M',
      change: '+15% vs mes anterior'
    }
  },
  {
    title: 'Reportes y Analytics',
    description: 'Análisis de ventas y rendimiento',
    icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
    href: '/subscriptions/admin/reports',
    color: 'bg-indigo-50 border-indigo-200',
    stats: {
      label: 'Ingresos Mensuales',
      value: '₲ 45M',
      change: '+8% vs mes anterior'
    }
  },
  {
    title: 'Configuración',
    description: 'Configurar parámetros del sistema',
    icon: <Settings className="h-8 w-8 text-gray-600" />,
    href: '/subscriptions/admin/settings',
    color: 'bg-gray-50 border-gray-200',
    stats: {
      label: 'Configuraciones',
      value: '24',
      change: 'Actualizado hoy'
    }
  }
];

const quickActions = [
  {
    title: 'Crear Nuevo Plan',
    description: 'Agregar un nuevo plan de suscripción',
    icon: <Package className="h-5 w-5" />,
    href: '/subscriptions/admin/plans',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'Agregar Agente',
    description: 'Registrar un nuevo agente de ventas',
    icon: <Users className="h-5 w-5" />,
    href: '/subscriptions/admin/sales-agents',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'Ver Comisiones',
    description: 'Revisar estado de comisiones',
    icon: <DollarSign className="h-5 w-5" />,
    href: '/subscriptions/admin/commissions',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    title: 'Generar Reporte',
    description: 'Crear reporte de ventas',
    icon: <FileText className="h-5 w-5" />,
    href: '/subscriptions/admin/reports',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Administración de Suscripciones
        </h1>
        <p className="text-gray-600">
          Gestiona planes, suscripciones, agentes de ventas y comisiones desde un solo lugar
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button className={`w-full ${action.color} text-white`}>
                {action.icon}
                <span className="ml-2">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Modules */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Módulos de Administración</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Link key={index} href={module.href}>
              <div className={`p-6 rounded-lg border-2 ${module.color} hover:shadow-lg transition-shadow duration-300 cursor-pointer`}>
                <div className="flex items-start justify-between mb-4">
                  {module.icon}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600">{module.stats.label}</div>
                    <div className="text-lg font-bold text-gray-900">{module.stats.value}</div>
                    <div className="text-xs text-green-600">{module.stats.change}</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm">{module.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suscripciones que Expiran</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-xs text-yellow-600">En los próximos 30 días</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">₲ 8.2M</p>
              <p className="text-xs text-orange-600">15 suscripciones</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasa de Retención</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-xs text-green-600">+2% vs mes anterior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Nueva suscripción: <strong>Juan Pérez</strong> se suscribió al plan <strong>PropTech Premium</strong>
              </span>
              <span className="text-xs text-gray-400">hace 2 horas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Comisión pagada: <strong>María González</strong> recibió ₲ 112,500 por venta
              </span>
              <span className="text-xs text-gray-400">hace 4 horas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Plan actualizado: <strong>PropTech Intermedio</strong> - precio ajustado a ₲ 350,000
              </span>
              <span className="text-xs text-gray-400">hace 6 horas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Nuevo agente: <strong>Carlos Mendoza</strong> registrado con 10% de comisión
              </span>
              <span className="text-xs text-gray-400">hace 1 día</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">¿Necesitas ayuda?</h3>
        <p className="text-blue-700 mb-4">
          Consulta la documentación o contacta al equipo de soporte para resolver dudas sobre la administración de suscripciones.
        </p>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            <FileText className="h-4 w-4 mr-2" />
            Documentación
          </Button>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            <Users className="h-4 w-4 mr-2" />
            Contactar Soporte
          </Button>
        </div>
      </div>
    </div>
  );
}
