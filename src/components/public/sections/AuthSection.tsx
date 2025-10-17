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
  XMarkIcon
} from '@heroicons/react/24/outline';

const AuthSection = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'El nombre es requerido';
      }
      if (!formData.company) {
        newErrors.company = 'La empresa es requerida';
      }
      if (!formData.phone) {
        newErrors.phone = 'El teléfono es requerido';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Aquí iría la lógica de autenticación
      console.log(isLogin ? 'Iniciar sesión:' : 'Registrarse:', formData);
      alert(isLogin ? 'Inicio de sesión exitoso!' : 'Registro exitoso!');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
      phone: ''
    });
    setErrors({});
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/30 to-cyan-600/20"></div>
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-2 border-blue-400/50 text-white text-sm font-bold mb-8 shadow-sm backdrop-blur-sm">
                <UserIcon className="w-4 h-4 mr-2" />
                {isLogin ? 'Acceso seguro' : 'Registro gratuito'}
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
                {isLogin ? 'Bienvenido de vuelta' : 'Únete a Proptech CRM'}
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed drop-shadow-md">
                {isLogin 
                  ? 'Accede a tu cuenta y gestiona tus propiedades de manera profesional con las herramientas más avanzadas del mercado.'
                  : 'Comienza a gestionar tus propiedades con la plataforma más avanzada del mercado. Únete a miles de agentes que ya confían en nosotros.'
                }
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-sm drop-shadow-md">Gestión completa de propiedades</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-sm drop-shadow-md">CRM integrado para agentes</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-sm drop-shadow-md">Reportes y analytics en tiempo real</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-sm drop-shadow-md">Soporte 24/7</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center p-6 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">500+</div>
                <div className="text-xs text-white/90 font-bold drop-shadow-md">Agentes activos</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">10K+</div>
                <div className="text-xs text-white/90 font-bold drop-shadow-md">Propiedades</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">98%</div>
                <div className="text-xs text-white/90 font-bold drop-shadow-md">Satisfacción</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 relative overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-transparent to-transparent opacity-50"></div>
            {/* Header */}
            <div className="text-center mb-8 relative">
              <div className="w-20 h-20 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h3>
              <p className="text-gray-600 text-base">
                {isLogin 
                  ? 'Ingresa tus credenciales para acceder'
                  : 'Completa el formulario para registrarte'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name - Only for registration */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
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
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

              {/* Company - Only for registration */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa/Inmobiliaria
                  </label>
                  <div className="relative">
                    {React.createElement(UserIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
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
              )}

              {/* Phone - Only for registration */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    {React.createElement(UserIcon, { className: "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
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
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
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

              {/* Confirm Password - Only for registration */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirma tu contraseña"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      {React.createElement(XMarkIcon, { className: "w-4 h-4 mr-1" })}
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3 px-6 rounded-xl font-bold text-base hover:from-brand-700 hover:to-brand-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>

              {/* Toggle Mode */}
              <div className="text-center">
                <p className="text-gray-600">
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="ml-2 text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
