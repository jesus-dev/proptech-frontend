"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ 
    email: 'dev@proptech.com', 
    password: 'dev123' 
  });
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<Date | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if account is locked
  useEffect(() => {
    if (lockTime) {
      const now = new Date();
      const timeDiff = now.getTime() - lockTime.getTime();
      const lockDuration = 30 * 60 * 1000; // 30 minutes
      if (timeDiff < lockDuration) {
        setIsLocked(true);
        const remainingTime = Math.ceil((lockDuration - timeDiff) / 1000 / 60);
        handleLoginError(`Cuenta bloqueada. Intenta nuevamente en ${remainingTime} minutos.`);
      } else {
        setIsLocked(false);
        setLockTime(null);
        setLoginAttempts(0);
      }
    }
  }, [lockTime]);

  // Validate form in real-time
  useEffect(() => {
    const emailValid = formData.email.includes('@') && formData.email.includes('.');
    const passwordValid = formData.password.length >= 3;
    setIsFormValid(emailValid && passwordValid);
    
    // Debug: ver qué valores tienen las variables
    console.log('🔍 DEBUG - Estado actual:', {
      isLocked,
      isFormValid: emailValid && passwordValid,
      isLoading,
      emailValid,
      passwordValid
    });
  }, [formData.email, formData.password, isLocked, isLoading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
      setShowError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || !isFormValid || isLoading) return;
    
    try {
      setIsLoading(true);
      setShowSuccess(true);
      
      // Usar el método login del contexto de autenticación
      const user = await login({ email: formData.email, password: formData.password });
      
      console.log('🔑 Login: Usuario autenticado:', {
        userEmail: user?.email,
        userId: user?.id
      });
      
      setLoginAttempts(0);
      setError(null);
      
      // Small delay to show success state
      setTimeout(() => {
        console.log('🔑 Login: Redirigiendo a /dash');
        router.push('/dash');
      }, 800);
    } catch (error: any) {
      setShowSuccess(false);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockTime(new Date());
        handleLoginError('Demasiados intentos fallidos. Tu cuenta ha sido bloqueada por 30 minutos.');
      } else {
        handleLoginError(error.response?.data?.error || 'Credenciales incorrectas. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };

  // Verificar si ya hay un usuario logueado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Usuario ya logueado, redirigir al dashboard
      router.push('/dash');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Fondo cool: gradiente diagonal gris y patrón */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          <defs>
            <pattern id="coolGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="40" fill="none" stroke="#bbb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#coolGrid)" />
        </svg>
      {/* Columna izquierda: formulario */}
        <div className="w-full max-w-md flex flex-col items-center justify-center gap-8 mx-auto animate-slide-up">
          {/* Logo animado solo en mobile, más grande y centrado */}
          <div className="block sm:hidden mt-8 mb-8 animate-fade-in-up w-full flex justify-center">
            <img src="/images/logo/proptech.png" alt="Proptech" className="mx-auto drop-shadow-xl w-80" />
          </div>
          {/* Tarjeta flotante */}
          <div className="bg-white/80 rounded-2xl shadow-2xl px-4 sm:px-6 py-10 backdrop-blur-md animate-slide-up transition-all duration-500 w-full max-w-md flex flex-col items-center justify-center mx-auto">
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold animate-fade-in-up">Iniciar Sesión</h1>
              <p className="text-base text-gray-500 animate-fade-in-up">Accede a tu panel de control</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium animate-fade-in-up">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                dev@proptech.com / dev123
              </div>
            </div>
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fade-in-up w-full">
              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Email <span className="text-red-500">*</span></label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-105' : ''}`}> 
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      {/* SVG usuario */}
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 10-8 0m8 0v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1m12 0a4 4 0 00-8 0" />
                        <circle cx="12" cy="8" r="4" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLocked || isLoading}
                      className={`w-full pl-10 pr-10 h-12 rounded-xl px-4 border-2 text-gray-900 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-gray-400/20 focus:border-gray-500 text-base transition-all duration-300 disabled:opacity-50 placeholder-gray-400 shadow-sm hover:shadow-md ${focusedField === 'email' ? 'shadow-lg' : ''}`}
                      placeholder="tu@email.com"
                      autoFocus
                      autoComplete="email"
                      inputMode="email"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-300/10 to-gray-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Contraseña <span className="text-red-500">*</span></label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-105' : ''}`}> 
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      {/* SVG candado */}
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 1110 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLocked || isLoading}
                      className={`w-full pl-10 pr-10 h-12 rounded-xl px-4 border-2 text-gray-900 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-gray-400/20 focus:border-gray-500 text-base transition-all duration-300 disabled:opacity-50 placeholder-gray-400 shadow-sm hover:shadow-md ${focusedField === 'password' ? 'shadow-lg' : ''}`}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      inputMode="text"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors duration-200 focus:outline-none p-1 rounded-md hover:bg-gray-100"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-300/10 to-gray-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={e => setKeepLoggedIn(e.target.checked)}
                      className="form-checkbox rounded border-gray-300 text-gray-700 focus:ring-gray-500 transition-all duration-200"
                    />
                    <div className="absolute inset-0 rounded bg-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                  <span className="group-hover:text-gray-900 transition-colors duration-200">Mantener sesión iniciada</span>
                </label>
                <button 
                  type="button" 
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium focus:outline-none transition-colors duration-200 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="block sm:hidden h-4"></div>
              <button
                type="submit"
                disabled={isLocked || isLoading || !isFormValid}
                className={`relative w-full h-12 px-4 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group ${
                  showSuccess 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-900 hover:to-gray-700'
                } mt-4 animate-pulse`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Ingresando...</span>
                    </>
                  ) : showSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>¡Bienvenido!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </div>
              </button>
            </form>
            {/* Error Toast */}
            {showError && error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4 text-sm flex items-center gap-3 animate-slide-down">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M6.938 19h10.124c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Error de autenticación</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}
            <div className="text-center text-sm text-gray-500">
              ¿No tienes una cuenta? 
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200 ml-1">
                Solicitar acceso
              </a>
            </div>
          </div>
        </div>
      {/* Columna derecha: branding */}
      <div className="hidden md:flex w-1/2 min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg width="100%" height="100%" className="opacity-10">
            <defs>
              <pattern id="subtleGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="40" height="40" fill="none" stroke="#bbb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#subtleGrid)" />
          </svg>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full relative z-20 animate-fade-in">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="relative group">
              <img 
                src="/images/logo/proptech.png" 
                alt="PropTech CRM" 
                className="w-96 h-auto filter brightness-0 invert transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-3xl font-bold text-white">
                La forma más fácil de gestionar bienes raíces
              </h2>
              <p className="text-lg text-blue-100 leading-relaxed">
                Accede a herramientas avanzadas de gestión, análisis en tiempo real y control total de tus propiedades
              </p>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Gestión avanzada</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Análisis en tiempo real</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Seguridad total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 