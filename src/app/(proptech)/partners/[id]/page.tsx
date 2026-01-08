"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Partner, partnerService } from "../services/partnerService";
import { AgentService, Agent } from "@/services/agentService";
import { subscriptionService } from "../services/subscriptionService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { getEndpoint } from "@/lib/api-config";
import ModernPopup from "@/components/ui/ModernPopup";
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
  ChartBarIcon,
  HomeIcon
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
  const [relatedAgent, setRelatedAgent] = useState<Agent | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showAssignAgentPopup, setShowAssignAgentPopup] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [removingAgent, setRemovingAgent] = useState(false);

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
      
      // Cargar agente relacionado si tiene agentId
      if (processedPartner.agentId) {
        loadRelatedAgent(processedPartner.agentId);
      }
      
      // Verificar suscripciones activas
      checkActiveSubscriptions(partnerId);
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
  
  const loadRelatedAgent = async (agentId: number) => {
    try {
      setLoadingAgent(true);
      const agent = await AgentService.getAgentById(String(agentId));
      setRelatedAgent(agent);
    } catch (error) {
      console.error('Error loading related agent:', error);
      setRelatedAgent(null);
    } finally {
      setLoadingAgent(false);
    }
  };
  
  const checkActiveSubscriptions = async (partnerId: number) => {
    try {
      const subscriptions = await subscriptionService.getPartnerSubscriptions(partnerId);
      // Verificar si hay una suscripción activa de tipo PROPTECH
      const hasActiveProptech = subscriptions.some(sub => 
        sub.status === 'ACTIVE' && sub.plan?.category === 'PROPTECH'
      );
      setHasActiveSubscription(hasActiveProptech);
    } catch (error) {
      console.error('Error checking subscriptions:', error);
      setHasActiveSubscription(false);
    }
  };

  const loadAgents = async () => {
    try {
      setLoadingAgents(true);
      const agentsList = await AgentService.getAllAgents();
      setAgents(agentsList);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: "Error",
        description: "Error al cargar la lista de agentes",
        variant: "destructive",
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!partner) return;

    try {
      setAssigningAgent(true);
      await partnerService.updatePartner(partner.id, { agentId: Number(agentId) });
      
      toast({
        title: "Agente asignado",
        description: "El agente ha sido asignado exitosamente al socio",
      });
      
      setShowAssignAgentPopup(false);
      setSearchTerm("");
      
      // Recargar datos del partner
      await loadPartner();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al asignar el agente",
        variant: "destructive",
      });
    } finally {
      setAssigningAgent(false);
    }
  };

  const handleRemoveAgent = async () => {
    if (!partner) return;

    if (!confirm("¿Estás seguro de que quieres eliminar la relación con este agente?")) {
      return;
    }

    try {
      setRemovingAgent(true);
      // Enviar null explícitamente para eliminar la relación
      const updateData: any = { agentId: null };
      await partnerService.updatePartner(partner.id, updateData);
      
      toast({
        title: "Relación eliminada",
        description: "La relación con el agente ha sido eliminada exitosamente",
      });
      
      // Recargar datos del partner
      await loadPartner();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la relación con el agente",
        variant: "destructive",
      });
    } finally {
      setRemovingAgent(false);
    }
  };

  const handleOpenAssignAgentPopup = () => {
    setShowAssignAgentPopup(true);
    if (agents.length === 0) {
      loadAgents();
    }
  };

  const filteredAgents = agents.filter(agent => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.toLowerCase();
    const email = (agent.email || '').toLowerCase();
    const phone = (agent.phone || '').toLowerCase();
    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

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
    return formatPrice(amount, "USD");
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

  const getPhotoUrl = () => {
    if (!partner.photo) return null;
    if (partner.photo.startsWith('http')) return partner.photo;
    // Si es una URL relativa del backend (como /uploads/partners/...), usar getEndpoint
    if (partner.photo.startsWith('/uploads/')) {
      return getEndpoint(partner.photo);
    }
    // Para cualquier otra ruta relativa, usar getEndpoint
    return getEndpoint(partner.photo.startsWith('/') ? partner.photo : `/${partner.photo}`);
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Mejorado */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/partners"
              className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Volver a Socios</span>
            </Link>
          </div>

          {/* Card Principal del Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Foto del Partner */}
                <div className="flex-shrink-0">
                  {photoUrl ? (
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt={`${partner.firstName} ${partner.lastName}`}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-xl';
                            fallback.innerHTML = `<svg class="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-xl">
                      <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                  )}
                </div>

                {/* Información Principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {partner.firstName} {partner.lastName}
                    </h1>
                    {partner.isVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-white/90 text-sm sm:text-base mb-3">
                    Socio #{partner.id}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getTypeBadge(partner.type || "")}
                    {getStatusBadge(partner.status || "")}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link
                  href={`/partners/${partner.id}/edit`}
                  className="group flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all shadow-sm hover:shadow"
                >
                  <PencilIcon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  <span className="text-sm font-medium">Editar</span>
                </Link>
                <Link
                  href={`/partners/${partner.id}/dashboard`}
                  className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link
                  href={`/partners/${partner.id}/payments`}
                  className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Pagos</span>
                </Link>
                <button
                  onClick={() => setShowCard(true)}
                  className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-sm hover:shadow-md"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Carnet</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="group flex items-center px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Información Personal
                </h2>
              </div>
              <div className="p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Nombre Completo
                  </label>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {partner.firstName} {partner.lastName}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="flex items-center group">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <EnvelopeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <a 
                      href={`mailto:${partner.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      {partner.email}
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Teléfono
                  </label>
                  <div className="flex items-center group">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mr-3 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                      <PhoneIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <a 
                      href={`tel:${partner.phone}`}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                    >
                      {partner.phone}
                    </a>
                  </div>
                </div>

                {partner.documentNumber && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Documento
                    </label>
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-3">
                        <DocumentTextIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {partner.documentType}: {partner.documentNumber}
                      </span>
                    </div>
                  </div>
                )}

                {partner.website && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Sitio Web
                    </label>
                    <div className="flex items-center group">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mr-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                        <GlobeAltIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <a 
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                      >
                        {partner.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Información de la Empresa */}
            {(partner.companyName || partner.position) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Información de la Empresa
                  </h2>
                </div>
                <div className="p-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partner.companyName && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Empresa
                      </label>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {partner.companyName}
                      </p>
                    </div>
                  )}

                  {partner.position && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Cargo/Puesto
                      </label>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {partner.position}
                      </p>
                    </div>
                  )}

                  {partner.companyRegistration && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Registro de Empresa
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {partner.companyRegistration}
                      </p>
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* Dirección */}
            {partner.address && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                    Dirección
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mr-4">
                      <MapPinIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900 dark:text-white font-medium">{partner.address}</p>
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
              </div>
            )}

            {/* Especializaciones y Territorios */}
            {(partner.specializations?.length || partner.territories?.length) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <BriefcaseIcon className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                    Especializaciones y Territorios
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {partner.specializations?.length && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                          Especializaciones
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(partner.specializations || []).map((spec: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 text-brand-800 dark:text-brand-200 border border-brand-300 dark:border-brand-700"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {partner.territories?.length && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                          Territorios de Trabajo
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(partner.territories || []).map((territory: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700"
                            >
                              {territory}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {partner.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                    Notas
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {partner.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Relacionamiento con Agente */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Relacionamiento con Agente
                </h2>
              </div>
              <div className="p-6">
                {loadingAgent ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando información del agente...</span>
                  </div>
                ) : partner.agentId && relatedAgent ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <div className="flex-shrink-0">
                        {relatedAgent.photo ? (
                          <img
                            src={relatedAgent.photo.startsWith('http') ? relatedAgent.photo : getEndpoint(relatedAgent.photo)}
                            alt={`${relatedAgent.firstName} ${relatedAgent.lastName}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-300 dark:border-indigo-700"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-300 dark:border-indigo-700';
                                fallback.innerHTML = '<svg class="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-300 dark:border-indigo-700">
                            <UserIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {relatedAgent.firstName} {relatedAgent.lastName}
                          </h3>
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Agente relacionado con este socio
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {relatedAgent.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{relatedAgent.email}</span>
                            </div>
                          )}
                          {relatedAgent.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">{relatedAgent.phone}</span>
                            </div>
                          )}
                          {relatedAgent.propertiesCount !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <HomeIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {relatedAgent.propertiesCount} propiedades
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/agente/${relatedAgent.id}`}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            Ver Perfil del Agente
                          </Link>
                          <button
                            onClick={handleRemoveAgent}
                            disabled={removingAgent}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            {removingAgent ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Eliminando...</span>
                              </>
                            ) : (
                              <>
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Eliminar Relación
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : hasActiveSubscription ? (
                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                          Sin Relacionamiento con Agente
                        </h3>
                        <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                          Este socio tiene una suscripción Proptech activa pero aún no tiene un agente relacionado. 
                          Para que pueda gestionar propiedades, es necesario asignarle un agente.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleOpenAssignAgentPopup}
                            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                          >
                            Asignar Agente
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Este socio no tiene un agente relacionado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Estadísticas
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Propiedades Gestionadas
                  </label>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {partner.propertiesManaged || 0}
                  </p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Ventas Exitosas
                  </label>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {partner.successfulDeals || 0}
                  </p>
                </div>

                {partner.experienceYears && (
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Años de Experiencia
                    </label>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {partner.experienceYears} años
                    </p>
                  </div>
                )}

                {partner.averageRating && (
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Calificación Promedio
                    </label>
                    <div className="flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-amber-500 mr-2" />
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {partner.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                      ({partner.totalReviews || 0} reseñas)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                  Fechas Importantes
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                {partner.partnershipDate && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Fecha de Asociación
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(partner.partnershipDate)}
                    </p>
                  </div>
                )}

                {partner.contractStartDate && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <label className="block text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                      Inicio de Contrato
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(partner.contractStartDate)}
                    </p>
                  </div>
                )}

                {partner.contractEndDate && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <label className="block text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                      Fin de Contrato
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(partner.contractEndDate)}
                    </p>
                  </div>
                )}

                {partner.verificationDate && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                      Fecha de Verificación
                    </label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(partner.verificationDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Suscripciones - Full Width */}
        <div className="mt-8">
          <PartnerSubscriptionsSection 
            partnerId={partner.id} 
            partnerName={`${partner.firstName || ''} ${partner.lastName || ''}`.trim() || `Socio #${partner.id}`}
          />
        </div>
      </div>

      {/* Modal del Carnet Digital */}
      <Dialog open={showCard} onClose={() => setShowCard(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCard(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full z-10 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Carnet Digital de Socio
              </Dialog.Title>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
            </div>
            <div className="flex flex-col items-center gap-4">
              {/* Foto del socio */}
              {photoUrl ? (
                <div className="relative">
                  <img 
                    src={photoUrl} 
                    alt="Foto socio" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-gradient-to-r from-blue-600 to-indigo-600 shadow-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border-4 border-blue-600 shadow-xl';
                        fallback.innerHTML = `<svg class="w-14 h-14 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border-4 border-blue-600 shadow-xl">
                  <UserIcon className="w-14 h-14 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className="text-center space-y-1">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{partner.firstName} {partner.lastName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{partner.type}</div>
                {partner.nextPaymentDate && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Vencimiento: {new Date(partner.nextPaymentDate).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <QRCode 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/validar-socio/${partner.id}`} 
                  size={160}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
              onClick={() => setShowCard(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Dialog>

      {/* Popup para Asignar Agente */}
      <ModernPopup
        isOpen={showAssignAgentPopup}
        onClose={() => {
          setShowAssignAgentPopup(false);
          setSearchTerm("");
        }}
        title="Asignar Agente"
        subtitle="Selecciona un agente para relacionarlo con este socio"
        maxWidth="max-w-3xl"
        icon={<UserIcon className="w-6 h-6" />}
      >
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar agente por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Lista de Agentes */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loadingAgents ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="sm" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando agentes...</span>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchTerm ? "No se encontraron agentes con ese criterio de búsqueda" : "No hay agentes disponibles"}
              </div>
            ) : (
              filteredAgents.map((agent) => {
                const agentPhoto = agent.photo 
                  ? (agent.photo.startsWith('http') ? agent.photo : getEndpoint(agent.photo))
                  : null;
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAssignAgent(agent.id)}
                    disabled={assigningAgent}
                    className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-4">
                      {/* Foto del Agente */}
                      <div className="flex-shrink-0">
                        {agentPhoto ? (
                          <img
                            src={agentPhoto}
                            alt={`${agent.firstName} ${agent.lastName}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600';
                                fallback.innerHTML = '<svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                            <UserIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                      </div>

                      {/* Información del Agente */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {agent.firstName} {agent.lastName}
                          </h3>
                          {agent.active !== false && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Activo
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {agent.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span className="truncate">{agent.email}</span>
                            </div>
                          )}
                          {agent.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{agent.phone}</span>
                            </div>
                          )}
                          {agent.propertiesCount !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <HomeIcon className="w-4 h-4" />
                              <span>{agent.propertiesCount} propiedades</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Icono de selección */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Información adicional */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAgents.length} {filteredAgents.length === 1 ? 'agente encontrado' : 'agentes encontrados'}
            </p>
          </div>
        </div>
      </ModernPopup>
    </div>
  );
} 