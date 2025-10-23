"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Partner, partnerService } from "../services/partnerService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  BanknotesIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MapPinIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import QRCode from 'react-qr-code';
import { Dialog } from '@headlessui/react';
import PartnerSubscriptionsSection from '../components/PartnerSubscriptionsSection';

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const partnerId = Number(params?.id);

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getPartnerById(partnerId);
      
      // Ensure specializations and territories are always arrays
      const processedPartner = {
        ...data,
        specializations: Array.isArray(data.specializations) 
          ? data.specializations 
          : (typeof data.specializations === 'string' && data.specializations
              ? (data.specializations as string).split(",").map((s: string) => s.trim())
              : []),
        territories: Array.isArray(data.territories)
          ? data.territories
          : (typeof data.territories === 'string' && data.territories
              ? (data.territories as string).split(",").map((s: string) => s.trim())
              : []),
        socialMedia: Array.isArray(data.socialMedia) ? data.socialMedia : [],
        languages: Array.isArray(data.languages) ? data.languages : ["Español"],
        certifications: Array.isArray(data.certifications) ? data.certifications : []
      };
      
      setPartner(processedPartner);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar el socio",
        variant: "destructive",
      });
      router.push("/partners");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!partner) return;
    
    if (!confirm("¿Estás seguro de que quieres eliminar este socio? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setActionLoading(true);
      await partnerService.deletePartner(partner.id);
      toast({
        title: "Socio eliminado",
        description: "El socio ha sido eliminado exitosamente.",
      });
      router.push("/partners");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el socio",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      INACTIVE: { color: "bg-gray-100 text-gray-800", icon: UserIcon },
      SUSPENDED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon },
      TERMINATED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INDIVIDUAL: { color: "bg-blue-100 text-blue-800", icon: UserIcon },
      COMPANY: { color: "bg-purple-100 text-purple-800", icon: BuildingOfficeIcon },
      AGENCY: { color: "bg-indigo-100 text-indigo-800", icon: BuildingOfficeIcon },
      BROKER: { color: "bg-orange-100 text-orange-800", icon: BriefcaseIcon },
      INVESTOR: { color: "bg-green-100 text-green-800", icon: BanknotesIcon }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INDIVIDUAL;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {type}
      </span>
    );
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "$0";
    return formatPrice(amount, (partner?.currency as "USD" | "ARS" | "EUR" | "PYG" | "MXN") || "USD");
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificado";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
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
          <Link
            href="/partners"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
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
                href="/partners"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {partner.firstName} {partner.lastName}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Socio #{partner.id}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
              {getTypeBadge(partner.type || "")}
              {getStatusBadge(partner.status || "")}
              {partner.isVerified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Verificado
                </span>
              )}
                </div>
                <div className="flex flex-nowrap gap-2 mt-4 overflow-x-auto pb-2">
                  <Link
                    href={`/partners/${partner.id}/dashboard`}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                  >
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href={`/partners/${partner.id}/payments`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Historial de Pagos
                  </Link>
                  <button
                    onClick={() => setShowCard(true)}
                    className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Carnet Digital
                  </button>
                  <Link
                    href={`/partners/${partner.id}/edit`}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Editar Socio
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Eliminar Socio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nombre Completo
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {partner.firstName} {partner.lastName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <a 
                      href={`mailto:${partner.email}`}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      {partner.email}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Teléfono
                  </label>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <a 
                      href={`tel:${partner.phone}`}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      {partner.phone}
                    </a>
                  </div>
                </div>

                {partner.documentNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Documento
                    </label>
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {partner.documentType}: {partner.documentNumber}
                      </span>
                    </div>
                  </div>
                )}

                {partner.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Sitio Web
                    </label>
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <a 
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        {partner.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información de la Empresa */}
            {(partner.companyName || partner.position) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Información de la Empresa
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partner.companyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Empresa
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {partner.companyName}
                      </p>
                    </div>
                  )}

                  {partner.position && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Cargo/Puesto
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {partner.position}
                      </p>
                    </div>
                  )}

                  {partner.companyRegistration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Registro de Empresa
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {partner.companyRegistration}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dirección */}
            {partner.address && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Dirección
                </h2>
                
                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-gray-900 dark:text-white">{partner.address}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {partner.city}{partner.state && `, ${partner.state}`}
                      {partner.zipCode && ` ${partner.zipCode}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {partner.country}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Especializaciones y Territorios */}
            {(partner.specializations?.length || partner.territories?.length) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Especializaciones y Territorios
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partner.specializations?.length && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        Especializaciones
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(partner.specializations || []).map((spec: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-100 text-brand-800"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {partner.territories?.length && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        Territorios de Trabajo
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(partner.territories || []).map((territory: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {territory}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notas */}
            {partner.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Notas
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {partner.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información Financiera */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información Financiera
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tasa de Comisión
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.commissionRate}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Ganancias Totales
                  </label>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(partner.totalEarnings)}
                  </p>
                </div>

                {partner.pendingEarnings && partner.pendingEarnings > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Ganancias Pendientes
                    </label>
                    <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(partner.pendingEarnings)}
                    </p>
                  </div>
                )}

                {partner.contractValue && partner.contractValue > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Valor del Contrato
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {formatCurrency(partner.contractValue)}
                    </p>
                  </div>
                )}

                {partner.paymentFrequency && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Frecuencia de Pago
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {partner.paymentFrequency === "MONTHLY" && "Mensual"}
                      {partner.paymentFrequency === "QUARTERLY" && "Trimestral"}
                      {partner.paymentFrequency === "YEARLY" && "Anual"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estadísticas
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Propiedades Gestionadas
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.propertiesManaged || 0}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Ventas Exitosas
                  </label>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {partner.successfulDeals || 0}
                  </p>
                </div>

                {partner.experienceYears && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Años de Experiencia
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {partner.experienceYears} años
                    </p>
                  </div>
                )}

                {partner.averageRating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Calificación Promedio
                    </label>
                    <div className="flex items-center">
                      <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {partner.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        ({partner.totalReviews || 0} reseñas)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suscripciones */}
            <div className="col-span-full">
              <PartnerSubscriptionsSection 
                partnerId={partner.id} 
                partnerName={`${partner.firstName} ${partner.lastName}`}
              />
            </div>

            {/* Fechas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fechas Importantes
              </h3>
              
              <div className="space-y-3">
                {partner.partnershipDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fecha de Asociación
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(partner.partnershipDate)}
                    </p>
                  </div>
                )}

                {partner.contractStartDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Inicio de Contrato
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(partner.contractStartDate)}
                    </p>
                  </div>
                )}

                {partner.contractEndDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fin de Contrato
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(partner.contractEndDate)}
                    </p>
                  </div>
                )}

                {partner.verificationDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fecha de Verificación
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(partner.verificationDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del Carnet Digital */}
      <Dialog open={showCard} onClose={() => setShowCard(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full z-10">
            <Dialog.Title className="text-xl font-bold mb-4 text-center">Carnet Digital de Socio</Dialog.Title>
            <div className="flex flex-col items-center gap-2">
              {/* Foto del socio */}
              {partner.photo ? (
                <img src={partner.photo} alt="Foto socio" className="w-24 h-24 rounded-full object-cover border-2 border-brand-500 mb-2" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                  <UserIcon className="w-12 h-12 text-gray-500" />
                </div>
              )}
              <div className="text-lg font-semibold">{partner.firstName} {partner.lastName}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{partner.type}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Membresía: {partner.paymentFrequency || 'N/A'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Vencimiento: {partner.nextPaymentDate || 'N/A'}</div>
              <div className="mt-4">
                <QRCode value={`${window.location.origin}/validar-socio/${partner.id}`} size={128} />
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowCard(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 