"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ArrowRightIcon,
  UserGroupIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';
import { 
  validateAndSanitizeEmail, 
  validateAndSanitizePhone, 
  validateAndSanitizeName, 
  validateAndSanitizeCompany
} from '@/lib/validation';
import { logger } from '@/lib/logger';
import { registerRateLimiter } from '@/lib/rateLimiter';
import { subscriptionService, SubscriptionPlan } from '@/services/subscriptionService';
import AppointmentScheduler from '@/components/appointment-scheduling/AppointmentScheduler';
import { useToast } from '@/components/ui/use-toast';

type UserType = 'independent' | 'agency' | null;

export default function RegistrarsePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    meetingDate: '',
    meetingTime: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [bookedAppointments, setBookedAppointments] = useState<Array<{ date: string; time: string }>>([]);

  // Cargar planes cuando se selecciona el tipo de usuario
  useEffect(() => {
    if (userType) {
      loadPlans();
    }
  }, [userType]);

  // Cargar citas ocupadas al montar el componente
  useEffect(() => {
    loadBookedAppointments();
  }, []);

  const loadBookedAppointments = async () => {
    try {
      // Por ahora, usar un array vacío hasta que tengamos el endpoint
      // TODO: Implementar endpoint para obtener citas ocupadas
      // const response = await apiClient.get('/api/public/appointments/booked');
      // setBookedAppointments(response.data);
      setBookedAppointments([]);
    } catch (error) {
      logger.error('Error cargando citas ocupadas:', error);
      // En caso de error, continuar con array vacío
      setBookedAppointments([]);
    }
  };

  // Establecer fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const allPlans = await subscriptionService.getPropTechPlans();
      // Mostrar todos los planes disponibles para ambos tipos de usuario
      setPlans(allPlans);
    } catch (error) {
      logger.error('Error cargando planes:', error);
      setErrors({ submit: 'Error al cargar los planes disponibles' });
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validar nombre
    const nameValidation = validateAndSanitizeName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'El nombre es requerido';
    }

    // Validar email
    const emailValidation = validateAndSanitizeEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'El email es requerido';
    }

    // Validar empresa (solo si es agencia)
    if (userType === 'agency') {
      const companyValidation = validateAndSanitizeCompany(formData.company);
      if (!companyValidation.isValid) {
        newErrors.company = companyValidation.error || 'La empresa es requerida';
      }
    }

    // Validar que se haya seleccionado un plan
    if (!selectedPlanId) {
      newErrors.plan = 'Debes seleccionar un plan';
    }

    // Validar teléfono
    const phoneValidation = validateAndSanitizePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error || 'El teléfono es requerido';
    }

    // Validar fecha de reunión
    if (!formData.meetingDate) {
      newErrors.meetingDate = 'Debes seleccionar una fecha para la reunión';
    }

    // Validar hora de reunión
    if (!formData.meetingTime) {
      newErrors.meetingTime = 'Debes seleccionar una hora para la reunión';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Rate limiting: verificar si se puede proceder
    const rateLimitKey = formData.email.toLowerCase();
    if (!registerRateLimiter.canProceed(rateLimitKey)) {
      const timeUntilReset = registerRateLimiter.getTimeUntilReset(rateLimitKey);
      const minutes = Math.ceil(timeUntilReset / 60000);
      setErrors({ 
        submit: `Has excedido el límite de intentos. Por favor, espera ${minutes} minuto${minutes > 1 ? 's' : ''} antes de intentar nuevamente.` 
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Combinar fecha y hora en formato ISO
      const meetingDateTime = formData.meetingDate && formData.meetingTime 
        ? new Date(`${formData.meetingDate}T${formData.meetingTime}:00`).toISOString()
        : null;

      const response = await apiClient.post('/api/public/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: userType === 'agency' ? formData.company : undefined,
        userType: userType,
        selectedPlanId: selectedPlanId,
        meetingDateTime: meetingDateTime
      });

      if (response.data.success) {
        // Resetear rate limiter en caso de éxito
        registerRateLimiter.reset(rateLimitKey);
        
        setSuccess(true);
        
        // Mostrar toast de confirmación
        toast({
          variant: "success",
          title: "¡Registro exitoso!",
          description: "Hemos recibido tu solicitud. Te contactaremos en el horario agendado para crear tu cuenta y activar tu plan.",
        });
        
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          meetingDate: '',
          meetingTime: ''
        });
        
        // Limpiar selecciones
        setUserType(null);
        setSelectedPlanId(null);
        
        // NO redirigir - el usuario permanece en la página
      }
    } catch (error: any) {
      logger.error('Error en registro:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al procesar el registro. Por favor, intenta nuevamente.';
      
      if (error.response) {
        // Error con respuesta del servidor
        errorMessage = error.response?.data?.error || 
                      error.response?.data?.message || 
                      errorMessage;
        
        // Errores específicos por código de estado
        if (error.response.status === 400) {
          // Error de validación
          const validationError = error.response?.data?.error || errorMessage;
          // Intentar extraer errores de campos específicos si vienen en el formato del backend
          if (validationError.includes('nombre')) {
            setErrors({ name: validationError });
          } else if (validationError.includes('email')) {
            setErrors({ email: validationError });
          } else if (validationError.includes('teléfono') || validationError.includes('telefono')) {
            setErrors({ phone: validationError });
          } else if (validationError.includes('empresa')) {
            setErrors({ company: validationError });
          } else if (validationError.includes('fecha') || validationError.includes('hora') || validationError.includes('reunión')) {
            setErrors({ meetingDate: validationError, meetingTime: validationError });
          } else if (validationError.includes('plan')) {
            setErrors({ plan: validationError });
          } else {
            setErrors({ submit: validationError });
          }
          setLoading(false);
          return;
        } else if (error.response.status === 409) {
          // Email duplicado
          setErrors({ email: errorMessage });
          setLoading(false);
          return;
        } else if (error.response.status === 429) {
          // Rate limit
          errorMessage = 'Has excedido el límite de intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
        } else if (error.response.status >= 500) {
          // Error del servidor
          errorMessage = 'Error del servidor. Por favor, intenta nuevamente más tarde.';
        }
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        // Error de red
        errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula de bienes raíces */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-registrarse" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <rect x="15" y="45" width="10" height="8" fill="cyan" opacity="0.2"/>
                <rect x="30" y="45" width="8" height="8" fill="cyan" opacity="0.2"/>
                <rect x="45" y="45" width="8" height="8" fill="cyan" opacity="0.2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
                <circle cx="55" cy="20" r="1.5" fill="cyan" opacity="0.4"/>
                <rect x="25" y="15" width="4" height="6" fill="none" stroke="cyan" strokeWidth="0.2" opacity="0.3"/>
                <rect x="40" y="18" width="4" height="6" fill="none" stroke="cyan" strokeWidth="0.2" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-registrarse)" />
          </svg>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Regístrate
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto mb-8 px-4">
              Completa tus datos y agenda una reunión breve con nosotros. 
              Te contactaremos para crear tu cuenta y activar tu plan.
            </p>
          </div>
        </div>
      </section>
      
      {/* Form Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12 border border-gray-100"
          >
            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="mb-8 p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-4 border-green-300 rounded-3xl shadow-2xl"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">
                      ¡Registro Exitoso! 🎉
                    </h3>
                    <p className="text-lg text-green-800 mb-4 max-w-2xl mx-auto">
                      Hemos recibido tu solicitud correctamente. Nuestro equipo se pondrá en contacto contigo en el horario que agendaste para crear tu cuenta y activar tu plan.
                    </p>
                    <div className="mt-6 p-4 bg-white/80 rounded-xl border-2 border-green-200">
                      <p className="text-sm text-green-700 font-medium">
                        <ClockIcon className="w-5 h-5 inline mr-2" />
                        Te contactaremos pronto para continuar con el proceso.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSuccess(false);
                          setUserType(null);
                          setSelectedPlanId(null);
                          setFormData({
                            name: '',
                            email: '',
                            company: '',
                            phone: '',
                            meetingDate: '',
                            meetingTime: ''
                          });
                        }}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Registrar otra solicitud
                      </button>
                      <a
                        href="/login"
                        className="px-6 py-3 bg-white text-green-700 border-2 border-green-300 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                      >
                        Ir al inicio de sesión
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* Tipo de Usuario */}
            {!userType && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  ¿Eres un agente independiente o una agencia? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('independent')}
                    className="p-6 border-2 border-gray-300 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <UserIcon className="w-6 h-6 text-gray-600 group-hover:text-cyan-600" />
                      <h3 className="text-lg font-bold text-gray-900">Agente Independiente</h3>
                    </div>
                    <p className="text-sm text-gray-600">Trabajas por tu cuenta, sin agencia</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('agency')}
                    className="p-6 border-2 border-gray-300 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <BuildingOfficeIcon className="w-6 h-6 text-gray-600 group-hover:text-cyan-600" />
                      <h3 className="text-lg font-bold text-gray-900">Agencia/Inmobiliaria</h3>
                    </div>
                    <p className="text-sm text-gray-600">Tienes múltiples agentes en tu equipo</p>
                  </button>
                </div>
              </div>
            )}

            {/* Planes Disponibles */}
            {userType && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Selecciona el plan que te interesa *
                </label>
                {loadingPlans ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando planes...</p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-yellow-800">No hay planes disponibles en este momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                          selectedPlanId === plan.id
                            ? 'border-cyan-500 bg-cyan-50 shadow-lg scale-105'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                          {selectedPlanId === plan.id && (
                            <CheckCircleIcon className="w-6 h-6 text-cyan-600" />
                          )}
                        </div>
                        <div className="mb-3">
                          <span className="text-3xl font-bold text-gray-900">
                            ${plan.price.toLocaleString()}
                          </span>
                          <span className="text-gray-600 ml-2">
                            / {plan.billingCycleDays === 30 ? 'mes' : plan.billingCycleDays === 365 ? 'año' : `${plan.billingCycleDays} días`}
                          </span>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                        )}
                        <div className="space-y-2">
                          {plan.maxProperties !== -1 && (
                            <div className="flex items-center text-sm text-gray-700">
                              <SparklesIcon className="w-4 h-4 mr-2 text-cyan-600" />
                              {plan.maxProperties} propiedades
                            </div>
                          )}
                          {plan.maxProperties === -1 && (
                            <div className="flex items-center text-sm text-gray-700">
                              <SparklesIcon className="w-4 h-4 mr-2 text-cyan-600" />
                              Propiedades ilimitadas
                            </div>
                          )}
                          {plan.maxAgents !== -1 && plan.maxAgents > 1 && (
                            <div className="flex items-center text-sm text-gray-700">
                              <UserGroupIcon className="w-4 h-4 mr-2 text-cyan-600" />
                              Hasta {plan.maxAgents} agentes
                            </div>
                          )}
                          {plan.maxAgents === -1 && (
                            <div className="flex items-center text-sm text-gray-700">
                              <UserGroupIcon className="w-4 h-4 mr-2 text-cyan-600" />
                              Agentes ilimitados
                            </div>
                          )}
                          {plan.features && plan.features.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Características:</p>
                              <ul className="space-y-1">
                                {plan.features.slice(0, 3).map((feature, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-center">
                                    <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.plan && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    {errors.plan}
                  </p>
                )}
                {userType && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserType(null);
                      setSelectedPlanId(null);
                      setPlans([]);
                    }}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Cambiar tipo de usuario
                  </button>
                )}
              </div>
            )}

            {/* Error general */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <XMarkIcon className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Form - Solo mostrar si se seleccionó tipo y plan */}
            {userType && selectedPlanId && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email in grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Company and Phone in grid */}
              <div className={`grid grid-cols-1 ${userType === 'agency' ? 'lg:grid-cols-2' : ''} gap-6`}>
                {/* Company - Solo para agencias */}
                {userType === 'agency' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Empresa/Inmobiliaria *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                        errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      placeholder="Ej: Inmobiliaria del Sol"
                    />
                  </div>
                  {errors.company && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      {errors.company}
                    </p>
                  )}
                </div>
                )}

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    placeholder="+595 981 123 456"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
                </div>
              </div>

              {/* Agendar Reunión */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border-2 border-cyan-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="w-6 h-6 mr-2 text-cyan-600" />
                  Agenda una reunión breve
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Selecciona una fecha y hora para que te contactemos y creemos tu cuenta
                </p>
                
                <AppointmentScheduler
                  selectedDate={formData.meetingDate}
                  selectedTime={formData.meetingTime}
                  onDateSelect={(date) => {
                    setFormData(prev => ({ ...prev, meetingDate: date }));
                    if (errors.meetingDate) {
                      setErrors(prev => ({ ...prev, meetingDate: '' }));
                    }
                  }}
                  onTimeSelect={(time) => {
                    setFormData(prev => ({ ...prev, meetingTime: time }));
                    if (errors.meetingTime) {
                      setErrors(prev => ({ ...prev, meetingTime: '' }));
                    }
                  }}
                  minDate={getMinDate()}
                  bookedAppointments={bookedAppointments}
                />
                
                {(errors.meetingDate || errors.meetingTime) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    {errors.meetingDate && (
                      <p className="text-sm text-red-600 flex items-center">
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        {errors.meetingDate}
                      </p>
                    )}
                    {errors.meetingTime && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        {errors.meetingTime}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>¡Registro exitoso!</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Solicitud</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <a
                    href="/login"
                    className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition-colors"
                  >
                    Inicia sesión aquí
                  </a>
                </p>
              </div>
            </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

