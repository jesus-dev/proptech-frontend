import React from 'react';
import type { Metadata } from 'next';
import { QuestionMarkCircleIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Centro de Ayuda - PropTech Paraguay',
  description: 'Centro de ayuda y soporte de PropTech Paraguay',
  alternates: {
    canonical: 'https://proptech.com.py/ayuda',
  },
};

export default function AyudaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-ayuda" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-ayuda)" />
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
              <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Centro de Ayuda
            </h1>
          </div>
          <p className="text-white/80 text-sm">
            Encuentra respuestas rápidas a tus preguntas
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Cómo puedo buscar propiedades?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Puede buscar propiedades utilizando nuestra barra de búsqueda principal. Puede filtrar 
                por tipo de propiedad, ubicación, precio, y otras características. Utilice los filtros 
                avanzados para refinar su búsqueda.
              </p>
            </div>

            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Cómo contacto con un agente?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                En cada anuncio de propiedad encontrará la información de contacto del agente, incluyendo 
                teléfono, email y WhatsApp. También puede visitar el perfil del agente para conocer más 
                sobre sus servicios.
              </p>
            </div>

            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Cómo publico una propiedad?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Para publicar propiedades, necesita ser un agente registrado. Regístrese en nuestra 
                plataforma y complete su perfil. Una vez aprobado, podrá comenzar a publicar propiedades.
              </p>
            </div>

            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿La plataforma es gratuita?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Buscar y consultar propiedades es completamente gratuito para los usuarios. Los agentes 
                pueden acceder a planes con diferentes características según sus necesidades.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Cómo puedo denunciar un anuncio?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Si encuentra un anuncio que considera fraudulento, duplicado o inapropiado, puede 
                utilizar el botón "Denunciar anuncio" que se encuentra en cada página de propiedad. 
                Revisaremos cada denuncia de manera cuidadosa.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Contactar Soporte
          </h2>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Email de Soporte</h3>
                  <p className="text-gray-600 text-sm">soporte@proptech.com.py</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Horario de Atención</h3>
                  <p className="text-gray-600 text-sm">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p className="text-gray-600 text-sm">Sábados: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
              
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Ir al Formulario de Contacto
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Recursos Adicionales
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/terminos" className="group block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1 text-sm">Términos de Uso</h3>
              <p className="text-xs text-gray-600">Consulte nuestros términos y condiciones</p>
            </Link>
            <Link href="/privacidad" className="group block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1 text-sm">Política de Privacidad</h3>
              <p className="text-xs text-gray-600">Información sobre cómo manejamos sus datos</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
