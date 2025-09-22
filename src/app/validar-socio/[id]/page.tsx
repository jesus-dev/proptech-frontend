"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Partner, partnerService } from "../../../app/(proptech)/partners/services/partnerService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";

export default function ValidarSocioPage() {
  const params = useParams();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const partnerId = Number(params.id);

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
      setError("Socio no encontrado o no válido");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon, text: "Activo" },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon, text: "Pendiente" },
      INACTIVE: { color: "bg-gray-100 text-gray-800", icon: UserIcon, text: "Inactivo" },
      SUSPENDED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon, text: "Suspendido" },
      TERMINATED: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon, text: "Terminado" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INDIVIDUAL: { color: "bg-blue-100 text-blue-800", icon: UserIcon, text: "Individual" },
      COMPANY: { color: "bg-purple-100 text-purple-800", icon: BuildingOfficeIcon, text: "Empresa" },
      AGENCY: { color: "bg-indigo-100 text-indigo-800", icon: BuildingOfficeIcon, text: "Agencia" },
      BROKER: { color: "bg-orange-100 text-orange-800", icon: BriefcaseIcon, text: "Broker" },
      INVESTOR: { color: "bg-green-100 text-green-800", icon: BanknotesIcon, text: "Inversor" }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INDIVIDUAL;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
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
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Validando socio...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Socio no válido
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error || "El código QR no corresponde a un socio válido"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con estado de validación */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {partner.photo ? (
                  <img 
                    src={partner.photo} 
                    alt="Foto socio" 
                    className="w-20 h-20 rounded-full object-cover border-4 border-brand-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center border-4 border-brand-500">
                    <UserIcon className="w-10 h-10 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {partner.firstName} {partner.lastName}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Socio #{partner.id}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getTypeBadge(partner.type || "")}
                  {getStatusBadge(partner.status || "")}
                </div>
              </div>
            </div>
            <div className="text-right">
              {partner.isVerified ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <ShieldCheckIcon className="w-8 h-8 mr-2" />
                  <div>
                    <div className="text-sm font-medium">Verificado</div>
                    <div className="text-xs text-gray-500">
                      {partner.verificationDate && formatDate(partner.verificationDate)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <ShieldExclamationIcon className="w-8 h-8 mr-2" />
                  <div>
                    <div className="text-sm font-medium">No verificado</div>
                    <div className="text-xs text-gray-500">Pendiente de verificación</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información Personal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Información Personal
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                  <div className="text-gray-900 dark:text-white">{partner.email}</div>
                </div>
              </div>

              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</div>
                  <div className="text-gray-900 dark:text-white">{partner.phone}</div>
                </div>
              </div>

              {partner.address && (
                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</div>
                    <div className="text-gray-900 dark:text-white">
                      {partner.address}
                      {partner.city && `, ${partner.city}`}
                      {partner.state && `, ${partner.state}`}
                      {partner.country && `, ${partner.country}`}
                    </div>
                  </div>
                </div>
              )}

              {partner.website && (
                <div className="flex items-center">
                  <div className="w-5 h-5 text-gray-400 mr-3 flex items-center justify-center">
                    🌐
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Sitio Web</div>
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

          {/* Información Profesional */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Información Profesional
            </h2>
            
            <div className="space-y-4">
              {partner.companyName && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Empresa</div>
                  <div className="text-gray-900 dark:text-white">{partner.companyName}</div>
                </div>
              )}

              {partner.position && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargo/Puesto</div>
                  <div className="text-gray-900 dark:text-white">{partner.position}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasa de Comisión</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {partner.commissionRate}%
                </div>
              </div>

              {partner.experienceYears && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Años de Experiencia</div>
                  <div className="text-gray-900 dark:text-white">{partner.experienceYears} años</div>
                </div>
              )}

              {partner.averageRating && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Calificación</div>
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {partner.averageRating ? partner.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ({partner.totalReviews || 0} reseñas)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Especializaciones y Territorios */}
          {(partner.specializations?.length || partner.territories?.length) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Especializaciones y Territorios
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partner.specializations?.length && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      Especializaciones
                    </div>
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
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      Territorios de Trabajo
                    </div>
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

          {/* Fechas Importantes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Fechas Importantes
            </h2>
            
            <div className="space-y-4">
              {partner.partnershipDate && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Asociación</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(partner.partnershipDate)}</div>
                  </div>
                </div>
              )}

              {partner.contractStartDate && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Inicio de Contrato</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(partner.contractStartDate)}</div>
                  </div>
                </div>
              )}

              {partner.contractEndDate && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fin de Contrato</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(partner.contractEndDate)}</div>
                  </div>
                </div>
              )}

              {partner.verificationDate && (
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Verificación</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(partner.verificationDate)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Estadísticas
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Propiedades Gestionadas</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {partner.propertiesManaged || 0}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas Exitosas</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {partner.successfulDeals || 0}
                </div>
              </div>

              {partner.totalEarnings && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Ganancias Totales</div>
                  <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                    ${partner.totalEarnings.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con información de validación */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {partner.isVerified ? (
                <CheckCircleIcon className="w-8 h-8 text-green-500 mr-2" />
              ) : (
                <ClockIcon className="w-8 h-8 text-yellow-500 mr-2" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {partner.isVerified ? "Socio Verificado" : "Socio Pendiente de Verificación"}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {partner.isVerified 
                ? "Este socio ha sido verificado y está autorizado para realizar operaciones comerciales."
                : "Este socio está en proceso de verificación. Contacte al administrador para más información."
              }
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Validado el {new Date().toLocaleDateString("es-ES")} a las {new Date().toLocaleTimeString("es-ES")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 