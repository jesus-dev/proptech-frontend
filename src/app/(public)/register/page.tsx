"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.company) {
      newErrors.company = 'La empresa es requerida';
    }

    if (!formData.phone) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Registro:', formData);
      alert('Registro exitoso!');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-14 sm:-mt-16 min-h-[30vh] sm:min-h-[35vh] overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
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
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-12 sm:pb-16 w-full z-10">
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
      <div className="bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Header */}
            <div className="text-center mb-4">
            
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrarse</h2>
              <p className="text-gray-600">Completa el formulario para crear tu cuenta</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <div className="relative">
                  {React.createElement(UserIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    {React.createElement(XMarkIcon, { className: "w-4 h-4 mr-1" })}
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  {React.createElement(EnvelopeIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    {React.createElement(XMarkIcon, { className: "w-4 h-4 mr-1" })}
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa/Inmobiliaria *
                </label>
                <div className="relative">
                  {React.createElement(BuildingOfficeIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    {React.createElement(XMarkIcon, { className: "w-4 h-4 mr-1" })}
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  {React.createElement(PhoneIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+595 123 456 789"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    {React.createElement(XMarkIcon, { className: "w-4 h-4 mr-1" })}
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  {React.createElement(LockClosedIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      React.createElement(EyeSlashIcon, { className: "w-5 h-5" })
                    ) : (
                      React.createElement(EyeIcon, { className: "w-5 h-5" })
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    {React.createElement(XMarkIcon, { className: "w-4 h-4 mr-1" })}
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  {React.createElement(LockClosedIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      React.createElement(EyeSlashIcon, { className: "w-5 h-5" })
                    ) : (
                      React.createElement(EyeIcon, { className: "w-5 h-5" })
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    {React.createElement(XMarkIcon, { className: "w-4 h-4 mr-1" })}
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Crear Cuenta
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <a
                    href="/login"
                    className="text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Inicia sesión aquí
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
