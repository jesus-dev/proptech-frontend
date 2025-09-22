"use client";

import { ArrowLeftIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, BanknotesIcon, BriefcaseIcon, BuildingOfficeIcon, CalendarIcon, ChartBarIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon, ExclamationTriangleIcon, EyeIcon, StarIcon, UserIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Partner, partnerService } from "../../services/partnerService";
import { PartnerPayment, partnerPaymentService } from "../../services/partnerPaymentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardStats {
  totalEarnings: number;
  pendingEarnings: number;
  totalPayments: number;
  overduePayments: number;
  activeProperties: number;
  successRate: number;
  averageRating: number;
  membershipStatus: string;
}

interface PaymentHistory {
  month: string;
  earnings: number;
  payments: number;
}

export default function PartnerDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [payments, setPayments] = useState<PartnerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    totalPayments: 0,
    overduePayments: 0,
    activeProperties: 0,
    successRate: 0,
    averageRating: 0,
    membershipStatus: 'ACTIVE'
  });

  const partnerId = Number(params.id);

  useEffect(() => {
    if (partnerId) {
      loadDashboardData();
    }
  }, [partnerId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [partnerData, paymentsData] = await Promise.all([
        partnerService.getPartnerById(partnerId),
        partnerPaymentService.getPaymentsByPartner(partnerId)
      ]);
      
      setPartner(partnerData);
      setPayments(paymentsData);
      
      // Calcular estadísticas
      const totalEarnings = partnerData.totalEarnings || 0;
      const pendingEarnings = partnerData.pendingEarnings || 0;
      const totalPayments = paymentsData.length;
      const overduePayments = paymentsData.filter(p => 
        p.status === 'PENDING' && new Date(p.dueDate) < new Date()
      ).length;
      
      const successRate = partnerData.successfulDeals && partnerData.propertiesManaged 
        ? (partnerData.successfulDeals / partnerData.propertiesManaged) * 100 
        : 0;

      setStats({
        totalEarnings,
        pendingEarnings,
        totalPayments,
        overduePayments,
        activeProperties: partnerData.propertiesManaged || 0,
        successRate: Math.round(successRate),
        averageRating: partnerData.averageRating || 0,
        membershipStatus: partnerData.status || 'ACTIVE'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar el dashboard",
        variant: "destructive",
      });
      router.push("/partners");
    } finally {
      setLoading(false);
    }
  };

  // Datos para gráficos
  const earningsData = [
    { month: 'Ene', earnings: stats.totalEarnings * 0.2 },
    { month: 'Feb', earnings: stats.totalEarnings * 0.3 },
    { month: 'Mar', earnings: stats.totalEarnings * 0.25 },
    { month: 'Abr', earnings: stats.totalEarnings * 0.35 },
    { month: 'May', earnings: stats.totalEarnings * 0.4 },
    { month: 'Jun', earnings: stats.totalEarnings * 0.5 }
  ];

  const paymentStatusData = [
    { name: 'Pagados', value: payments.filter(p => p.status === 'PAID').length, color: '#10B981' },
    { name: 'Pendientes', value: payments.filter(p => p.status === 'PENDING').length, color: '#F59E0B' },
    { name: 'Vencidos', value: payments.filter(p => p.status === 'PENDING' && new Date(p.dueDate) < new Date()).length, color: '#EF4444' }
  ];

  const recentPayments = payments
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      INACTIVE: { color: "bg-gray-100 text-gray-800", icon: UserIcon },
      SUSPENDED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status === 'ACTIVE' ? 'Activo' : status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return formatPrice(amount, (partner?.currency as "USD" | "PYG") || "USD");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Socio no encontrado
          </h2>
          <Link href="/partners" className="text-brand-600 hover:text-brand-700">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/partners/${partner.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard de {partner.firstName} {partner.lastName}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Panel de control y análisis de rendimiento
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(stats.membershipStatus)}
              <Link
                href={`/partners/${partner.id}/payments`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Ver Pagos
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganancias Totales</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalEarnings)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  +12.5% este mes
                </p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganancias Pendientes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.pendingEarnings)}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center mt-1">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {stats.overduePayments} vencidos
                </p>
              </div>
              <ClockIcon className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Propiedades Activas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.activeProperties}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  {stats.successRate}% éxito
                </p>
              </div>
              <BuildingOfficeIcon className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calificación</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                  <StarIcon className="w-4 h-4 mr-1" />
                  Excelente
                </p>
              </div>
              <StarIcon className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Ganancias */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Evolución de Ganancias
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Ganancias']}
                  labelStyle={{ color: '#374151' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Estado de Pagos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Estado de Pagos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Próximos Vencimientos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Próximos Vencimientos
            </h3>
            <div className="space-y-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {payment.description}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(payment.dueDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        payment.status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'PENDING' && new Date(payment.dueDate) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'PAID' ? 'Pagado' : 
                         payment.status === 'PENDING' && new Date(payment.dueDate) < new Date() ? 'Vencido' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay pagos próximos
                </p>
              )}
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Estadísticas Rápidas
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total de Pagos</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.totalPayments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pagos Vencidos</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{stats.overduePayments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tasa de Éxito</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{stats.successRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Años de Experiencia</span>
                <span className="font-semibold text-gray-900 dark:text-white">{partner.experienceYears || 0}</span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <Link
                href={`/partners/${partner.id}/payments`}
                className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Ver Historial de Pagos
              </Link>
              <Link
                href={`/partners/${partner.id}/edit`}
                className="flex items-center justify-center w-full px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                Editar Perfil
              </Link>
              <button
                onClick={() => router.push(`/partners/${partner.id}`)}
                className="flex items-center justify-center w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 