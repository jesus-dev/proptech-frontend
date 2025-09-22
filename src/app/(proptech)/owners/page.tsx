"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Building2, 
  MessageSquare, 
  Eye, 
  Heart, 
  TrendingUp, 
  Calendar,
  Download,
  Mail,
  Bell,
  BarChart3,
  Star,
  DollarSign,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  propertiesCount: number;
  totalValue: number;
  lastContact: string;
  status: 'active' | 'inactive' | 'pending';
}

interface PropertyMetrics {
  id: number;
  title: string;
  address: string;
  price: number;
  currency: string;
  views: number;
  favorites: number;
  comments: number;
  shares: number;
  lastActivity: string;
  status: 'active' | 'sold' | 'rented' | 'inactive';
}

interface OwnerReport {
  id: number;
  ownerId: number;
  period: string;
  generatedAt: string;
  propertiesCount: number;
  totalViews: number;
  totalFavorites: number;
  totalComments: number;
  recommendations: string[];
  status: 'pending' | 'sent' | 'failed';
}

export default function OwnersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [ownerProperties, setOwnerProperties] = useState<PropertyMetrics[]>([]);
  const [ownerReports, setOwnerReports] = useState<OwnerReport[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data para desarrollo
  useEffect(() => {
    const mockOwners: Owner[] = [
      {
        id: 1,
        name: "María González",
        email: "maria.gonzalez@email.com",
        phone: "+595 981 123 456",
        avatar: "/images/user/user-01.jpg",
        propertiesCount: 3,
        totalValue: 450000,
        lastContact: "2024-01-15T10:30:00Z",
        status: 'active'
      },
      {
        id: 2,
        name: "Carlos Mendoza",
        email: "carlos.mendoza@email.com",
        phone: "+595 982 234 567",
        avatar: "/images/user/user-02.jpg",
        propertiesCount: 2,
        totalValue: 320000,
        lastContact: "2024-01-14T15:45:00Z",
        status: 'active'
      },
      {
        id: 3,
        name: "Ana Rodríguez",
        email: "ana.rodriguez@email.com",
        phone: "+595 983 345 678",
        avatar: "/images/user/user-03.jpg",
        propertiesCount: 1,
        totalValue: 180000,
        lastContact: "2024-01-13T09:20:00Z",
        status: 'pending'
      }
    ];

    const mockProperties: PropertyMetrics[] = [
      {
        id: 1,
        title: "Casa Moderna en Las Mercedes",
        address: "Las Mercedes 1234, Asunción",
        price: 250000,
        currency: "USD",
        views: 245,
        favorites: 18,
        comments: 5,
        shares: 12,
        lastActivity: "2024-01-15T14:30:00Z",
        status: 'active'
      },
      {
        id: 2,
        title: "Apartamento Premium Centro",
        address: "Palma 567, Asunción",
        price: 180000,
        currency: "USD",
        views: 189,
        favorites: 12,
        comments: 3,
        shares: 8,
        lastActivity: "2024-01-14T16:20:00Z",
        status: 'active'
      }
    ];

    const mockReports: OwnerReport[] = [
      {
        id: 1,
        ownerId: 1,
        period: "Enero 2024",
        generatedAt: "2024-01-15T10:00:00Z",
        propertiesCount: 3,
        totalViews: 434,
        totalFavorites: 30,
        totalComments: 8,
        recommendations: [
          "Considerar reducir el precio de la casa en Las Mercedes",
          "Agregar más fotos del apartamento premium",
          "Responder a los comentarios pendientes"
        ],
        status: 'sent'
      }
    ];

    setOwners(mockOwners);
    setOwnerProperties(mockProperties);
    setOwnerReports(mockReports);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'sold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'rented':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      case 'sold':
        return 'Vendida';
      case 'rented':
        return 'Alquilada';
      default:
        return 'Desconocido';
    }
  };

  const handleGenerateReport = async (ownerId: number) => {
    // TODO: Implementar generación de reporte
    console.log('Generando reporte para propietario:', ownerId);
  };

  const handleSendNotification = async (ownerId: number) => {
    // TODO: Implementar envío de notificación
    console.log('Enviando notificación a propietario:', ownerId);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard de propietarios" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Propietarios
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administra propietarios, propiedades y genera reportes automáticos
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Propietario
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Propietarios
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {owners.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Propiedades Activas
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {owners.reduce((total, owner) => total + owner.propertiesCount, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Valor Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(owners.reduce((total, owner) => total + owner.totalValue, 0), 'USD')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Owners List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Propietarios
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {owners.map((owner) => (
                  <div 
                    key={owner.id} 
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => setSelectedOwner(owner)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold">
                          {owner.avatar ? (
                            <img src={owner.avatar} alt={owner.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            owner.name.charAt(0)
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {owner.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {owner.email}
                          </p>
                          <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{owner.propertiesCount} propiedades</span>
                            <span>•</span>
                            <span>{formatCurrency(owner.totalValue, 'USD')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(owner.status)}`}>
                          {getStatusText(owner.status)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReport(owner.id);
                          }}
                          className="p-2 text-gray-400 hover:text-brand-600 transition-colors"
                          title="Generar Reporte"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendNotification(owner.id);
                          }}
                          className="p-2 text-gray-400 hover:text-brand-600 transition-colors"
                          title="Enviar Notificación"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar Reportes
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Bell className="h-4 w-4 mr-2" />
                  Configurar Notificaciones
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Métricas
                </button>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reportes Recientes
              </h3>
              <div className="space-y-3">
                {ownerReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.period}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'sent' ? 'bg-green-100 text-green-800' :
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status === 'sent' ? 'Enviado' :
                         report.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p>{report.propertiesCount} propiedades</p>
                      <p>{report.totalViews} vistas • {report.totalComments} comentarios</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
