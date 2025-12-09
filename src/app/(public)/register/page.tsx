"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';
import { 
  validateAndSanitizeEmail, 
  validateAndSanitizePhone, 
  validateAndSanitizeName, 
  validateAndSanitizeCompany,
  isValidPassword 
} from '@/lib/validation';
import { logger } from '@/lib/logger';
import { registerRateLimiter } from '@/lib/rateLimiter';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener entre 6 y 128 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar empresa
    const companyValidation = validateAndSanitizeCompany(formData.company);
    if (!companyValidation.isValid) {
      newErrors.company = companyValidation.error || 'La empresa es requerida';
    }

    // Validar teléfono
    const phoneValidation = validateAndSanitizePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error || 'El teléfono es requerido';
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
      const response = await apiClient.post('/api/public/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        password: formData.password
      });

      if (response.data.success) {
        // Resetear rate limiter en caso de éxito
        registerRateLimiter.reset(rateLimitKey);
        
        setSuccess(true);
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          company: '',
          phone: ''
        });
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 3000);
      }
    } catch (error: any) {
      logger.error('Error en registro:', error);
      const errorMessage = error.response?.data?.error || 'Error al procesar el registro. Por favor, intenta nuevamente.';
      
      if (error.response?.status === 409) {
        setErrors({ email: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[30vh] sm:min-h-[35vh] overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula de bienes raíces */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-register" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
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
            <rect width="100%" height="100%" fill="url(#property-grid-register)" />
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
                Crear Cuenta
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto mb-8 px-4">
              Únete a Proptech CRM y comienza a gestionar tus propiedades. 
              Una plataforma completa para profesionales inmobiliarios.
            </p>
          </div>
        </div>
      </section>
      
      {/* Form Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100"
          >
            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-green-900">¡Registro exitoso!</h3>
                    <p className="text-green-700 mt-1">
                      Te contactaremos pronto para activar tu cuenta. Redirigiendo al login...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Crea tu cuenta</h2>
              <p className="text-gray-600">Únete a PropTech CRM y transforma tu negocio inmobiliario</p>
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <XMarkIcon className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Company */}
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

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
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
                    <span>Crear Cuenta</span>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
