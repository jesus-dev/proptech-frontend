"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  UserPlusIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { publicProfessionalService } from '@/services/publicProfessionalService';
import { apiClient } from '@/lib/api';

interface ServiceType {
  id: number;
  code: string;
  name: string;
  icon?: string;
  description?: string;
}

export default function RegistroProfesionalPage() {
  const router = useRouter();
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [step, setStep] = useState<'basic' | 'additional'>('basic'); // Paso 1: básico, Paso 2: adicional
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [countryCode, setCountryCode] = useState('+595'); // Paraguay por defecto
  const [showServiceTypeError, setShowServiceTypeError] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentNumber: '',
    documentType: 'CEDULA',
    serviceTypeId: undefined as number | undefined,
    companyName: '',
    address: '',
    city: '',
    state: '',
    country: 'Paraguay',
    zipCode: '',
    description: '',
    experienceYears: undefined as number | undefined
  });

  // Cargar tipos de servicio
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const response = await apiClient.get('/api/service-types');
        setServiceTypes(response.data || []);
      } catch (error) {
        console.error('Error loading service types:', error);
      }
    };
    loadServiceTypes();
  }, []);

  const handleSubmitBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerFormData.serviceTypeId) {
      setShowServiceTypeError(true);
      return;
    }
    if (!registerFormData.firstName || !registerFormData.lastName || !registerFormData.phone || !registerFormData.documentNumber) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    setShowServiceTypeError(false);
    try {
      setRegisterLoading(true);
      // Combinar código de país con el número de teléfono en formato internacional completo
      // Eliminar espacios y cualquier carácter no numérico del número local
      const cleanPhone = registerFormData.phone.replace(/\s/g, '').replace(/[^\d]/g, '');
      // Combinar código de país + número (sin espacios, formato internacional)
      const phoneWithCountryCode = `${countryCode}${cleanPhone}`;
      
      // Asegurar que serviceTypeId sea un número
      const serviceTypeId = Number(registerFormData.serviceTypeId);
      if (!serviceTypeId || isNaN(serviceTypeId)) {
        setShowServiceTypeError(true);
        alert('Por favor selecciona un tipo de servicio válido');
        setRegisterLoading(false);
        return;
      }
      
      const registrationData = {
        firstName: registerFormData.firstName.trim(),
        lastName: registerFormData.lastName.trim(),
        phone: phoneWithCountryCode,
        serviceTypeId: serviceTypeId,
        documentNumber: registerFormData.documentNumber.trim(),
        documentType: registerFormData.documentType
      };
      
      console.log('Enviando datos de registro:', registrationData);
      
      const result = await publicProfessionalService.registerProfessional(registrationData);
      
      if (result.professionalId) {
        setProfessionalId(result.professionalId);
        setStep('additional'); // Pasar al segundo paso
      } else {
        setRegisterSuccess(true);
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al registrar. Por favor intenta nuevamente.';
      alert(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSubmitAdditional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId) {
      alert('Error: No se encontró el ID del profesional');
      return;
    }
    try {
      setRegisterLoading(true);
      await publicProfessionalService.updateAdditionalInfo(professionalId, {
        email: registerFormData.email || undefined,
        companyName: registerFormData.companyName || undefined,
        address: registerFormData.address || undefined,
        city: registerFormData.city || undefined,
        state: registerFormData.state || undefined,
        country: registerFormData.country || undefined,
        zipCode: registerFormData.zipCode || undefined,
        description: registerFormData.description || undefined,
        experienceYears: registerFormData.experienceYears || undefined
      });
      setRegisterSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Error al actualizar la información. Por favor intenta nuevamente.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSkipAdditional = () => {
    setRegisterSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[30vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                <UserPlusIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
              Regístrate como
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                Profesional
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto px-4">
              Únete a nuestra plataforma y encuentra más clientes para tus servicios
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/profesionales"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Profesionales
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {registerSuccess ? (
            <div className="p-12 text-center">
              <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Registro Exitoso!</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Tu solicitud ha sido enviada correctamente. Nuestro equipo revisará tu información y te contactaremos pronto para activar tu perfil.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/profesionales"
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  Volver a Profesionales
                </Link>
                <button
                  onClick={() => {
                    setRegisterSuccess(false);
                    setCountryCode('+595'); // Resetear código de país a Paraguay
                    setRegisterFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      documentNumber: '',
                      documentType: 'CEDULA',
                      serviceTypeId: undefined as number | undefined,
                      companyName: '',
                      address: '',
                      city: '',
                      state: '',
                      country: 'Paraguay',
                      zipCode: '',
                      description: '',
                      experienceYears: undefined
                    });
                  }}
                  className="px-8 py-3 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all"
                >
                  Registrar Otro
                </button>
              </div>
            </div>
          ) : step === 'basic' ? (
            <>
              <div className="bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Paso 1: Información Básica</h2>
                    <p className="text-white/90 text-sm mt-1">Completa los datos obligatorios para registrarte</p>
                  </div>
                  <div className="text-white/80 text-sm">
                    Paso 1 de 2
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitBasic} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerFormData.firstName}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerFormData.lastName}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full sm:w-auto sm:min-w-[220px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm font-medium shadow-sm"
                    >
                      <option value="+595">🇵🇾 +595 (Paraguay)</option>
                      <option value="+54">🇦🇷 +54 (Argentina)</option>
                      <option value="+55">🇧🇷 +55 (Brasil)</option>
                      <option value="+56">🇨🇱 +56 (Chile)</option>
                      <option value="+57">🇨🇴 +57 (Colombia)</option>
                      <option value="+51">🇵🇪 +51 (Perú)</option>
                      <option value="+598">🇺🇾 +598 (Uruguay)</option>
                      <option value="+1">🇺🇸 +1 (EE.UU./Canadá)</option>
                      <option value="+34">🇪🇸 +34 (España)</option>
                      <option value="+52">🇲🇽 +52 (México)</option>
                    </select>
                    <input
                      type="tel"
                      required
                      value={registerFormData.phone}
                      onChange={(e) => {
                        // Permitir solo números y espacios
                        let phoneValue = e.target.value.replace(/[^\d\s]/g, '');
                        // Remover cero inicial solo si el código de país es Paraguay (+595)
                        // En Paraguay, los números suelen empezar con 0 (ej: 0981) pero con código de país no es necesario
                        if (countryCode === '+595') {
                          const digitsOnly = phoneValue.replace(/\s/g, '');
                          if (digitsOnly.startsWith('0')) {
                            phoneValue = phoneValue.replace(/^0\s?/, '');
                          }
                        }
                        // Limitar a 15 dígitos máximo
                        const finalDigitsOnly = phoneValue.replace(/\s/g, '');
                        if (finalDigitsOnly.length > 15) {
                          return; // No actualizar si excede el límite
                        }
                        setRegisterFormData({ ...registerFormData, phone: phoneValue });
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="981 123 456"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El número completo será: <span className="font-semibold text-orange-600">{countryCode} {registerFormData.phone || '...'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={registerFormData.documentType}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, documentType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="CEDULA">Cédula</option>
                      <option value="RUC">RUC</option>
                      <option value="PASSPORT">Pasaporte</option>
                      <option value="OTHER">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerFormData.documentNumber}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, documentNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="1234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Servicio <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={registerFormData.serviceTypeId || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      setRegisterFormData({ ...registerFormData, serviceTypeId: value });
                      if (value) {
                        setShowServiceTypeError(false);
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      showServiceTypeError && !registerFormData.serviceTypeId 
                        ? 'border-red-500' 
                        : registerFormData.serviceTypeId 
                          ? 'border-green-500' 
                          : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona un tipo de servicio *</option>
                    {serviceTypes.map(st => (
                      <option key={st.id} value={st.id}>{st.icon} {st.name}</option>
                    ))}
                  </select>
                  {showServiceTypeError && !registerFormData.serviceTypeId && (
                    <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>
                  )}
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Link
                    href="/profesionales"
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {registerLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Stepper Visual */}
              <div className="bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 p-6">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">Registro de Profesional</h2>
                  
                  {/* Stepper */}
                  <div className="flex items-center justify-center mb-4">
                    {/* Paso 1 - Completado */}
                    <div className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white text-green-600 flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white">
                          <CheckIcon className="w-6 h-6" />
                        </div>
                        <span className="text-white text-sm font-medium mt-2">Información Básica</span>
                      </div>
                    </div>
                    
                    {/* Línea conectora - Completada */}
                    <div className="flex-1 h-1 bg-white mx-4 relative">
                      <div className="absolute inset-0 bg-white w-full transition-all duration-500"></div>
                    </div>
                    
                    {/* Paso 2 - Activo */}
                    <div className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white">
                          2
                        </div>
                        <span className="text-white text-sm font-medium mt-2">Información Adicional</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/90 text-sm text-center mt-4">Completa más datos para mejorar tu perfil (opcional)</p>
                </div>
              </div>

              <form onSubmit={handleSubmitAdditional} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={registerFormData.email}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="juan@ejemplo.com (opcional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={registerFormData.city}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Asunción"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={registerFormData.experienceYears || ''}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, experienceYears: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    value={registerFormData.companyName}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nombre de tu empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={registerFormData.address}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Calle y número"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    value={registerFormData.description}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Cuéntanos sobre tus servicios, experiencia y especialidades..."
                  />
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSkipAdditional}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Omitir
                  </button>
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {registerLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        Finalizar Registro
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

