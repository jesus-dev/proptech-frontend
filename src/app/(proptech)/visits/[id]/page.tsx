"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Visit } from "../components/types";
import { 
  ChevronLeft, 
  Edit, 
  Calendar,
  User,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  AlertCircle,
  Eye
} from "lucide-react";
import { visitService } from "../services/visitService";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface PageProps {
  params: Promise<{ id: string }>
}

export default function VisitPage({ params }: PageProps) {
  const router = useRouter();
  const { id: visitId } = React.use(params);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const visitData = await visitService.getVisitById(visitId);
        if (visitData) {
          setVisit(visitData);
        } else {
          setError("Visita no encontrada");
        }
      } catch (err) {
        setError("Error al cargar la visita");
        console.error("Error fetching visit:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [visitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Visita no encontrada
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || "La visita solicitada no existe o no está disponible."}
          </p>
          <button
            onClick={() => router.push('/visits')}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Volver a Visitas
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programada";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/visits')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {visit.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {visit.clientName} • {formatDate(visit.scheduledDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/visits/${visit.id}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Visit Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resumen de la Visita
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {visit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {visit.description || "Sin descripción"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Fecha Programada
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(visit.scheduledDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Clock className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Estado
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(visit.status)}`}>
                          {getStatusIcon(visit.status)}
                          {getStatusText(visit.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <User className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Cliente
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {visit.clientName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Building className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Propiedad
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {visit.propertyId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {visit.notes && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Notas Adicionales
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {visit.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información de Contacto
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Email
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {visit.clientEmail || "No disponible"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Teléfono
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {visit.clientPhone || "No disponible"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información de la Visita
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Eye className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ID de Visita
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {visit.id}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Fecha de Creación
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(visit.createdAt).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FileText className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Última Actualización
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(visit.updatedAt).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 