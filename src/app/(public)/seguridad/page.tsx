import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheckIcon, LockClosedIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Seguridad - PropTech Paraguay',
  description: 'Información sobre seguridad y protección de datos en PropTech Paraguay',
  alternates: {
    canonical: 'https://proptech.com.py/seguridad',
  },
};

export default function SeguridadPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-seguridad" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-seguridad)" />
          </svg>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Seguridad
            </h1>
          </div>
          <p className="text-white/80 text-sm">
            Nuestro compromiso con la protección de sus datos
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
        <div className="prose prose-lg max-w-none space-y-8">
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Nuestro Compromiso con la Seguridad
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              En PropTech, la seguridad de su información es nuestra máxima prioridad. Implementamos 
              múltiples capas de seguridad para proteger sus datos personales y financieros contra 
              accesos no autorizados, pérdidas o alteraciones.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Medidas de Seguridad Técnica
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <LockClosedIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Cifrado de Datos</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Todos los datos se transmiten mediante conexiones seguras cifradas (SSL/TLS). 
                    Los datos sensibles se almacenan de forma cifrada.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Autenticación Segura</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Utilizamos sistemas de autenticación robustos y recomendamos el uso de contraseñas 
                    fuertes. Las contraseñas se almacenan de forma segura mediante hash.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <KeyIcon className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Control de Acceso</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Implementamos controles de acceso estrictos y monitoreo continuo para detectar 
                    actividades sospechosas o no autorizadas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Seguridad de la Infraestructura
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Nuestra infraestructura está diseñada con seguridad en mente:
            </p>
            <ul className="space-y-1.5 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Servidores protegidos con firewalls avanzados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Monitoreo 24/7 de la infraestructura</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Copias de seguridad regulares y automatizadas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Actualizaciones de seguridad aplicadas oportunamente</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Pruebas regulares de penetración y auditorías de seguridad</span>
              </li>
            </ul>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Protección de Datos Personales
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Cumplimos con las mejores prácticas de protección de datos personales. Solo recopilamos 
              la información necesaria para proporcionar nuestros servicios, y nunca compartimos su 
              información personal con terceros sin su consentimiento, excepto cuando sea requerido por ley.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Recomendaciones para Usuarios
            </h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="font-medium text-gray-900 mb-3 text-sm">
                Usted también juega un papel importante en la seguridad:
              </p>
              <ul className="space-y-1.5 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <span>Utilice contraseñas fuertes y únicas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <span>No comparta sus credenciales de acceso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <span>Cierre sesión cuando use computadoras compartidas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <span>Mantenga actualizado su navegador y sistema operativo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <span>Sea cauteloso con emails o mensajes sospechosos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <span>Verifique la identidad de los agentes antes de realizar transacciones</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Reportar Problemas de Seguridad
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Si detecta una vulnerabilidad de seguridad o un problema relacionado con la seguridad 
              de nuestra plataforma, por favor repórtelo de manera responsable:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-900 mb-1 text-sm">
                <strong>Email de Seguridad:</strong> seguridad@proptech.com.py
              </p>
              <p className="text-xs text-gray-600">
                Por favor, proporcione detalles sobre el problema encontrado y espere nuestra respuesta 
                antes de hacer público cualquier hallazgo.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Actualizaciones de Seguridad
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Mantenemos esta página actualizada con información sobre nuestras medidas de seguridad. 
              Recomendamos revisarla periódicamente para estar informado sobre cómo protegemos su información.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
