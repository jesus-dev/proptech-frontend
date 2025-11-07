import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | PropTech CRM',
  description: 'Ponte en contacto con PropTech CRM para solicitar una demo gratuita, soporte o información sobre planes para agencias inmobiliarias en Paraguay.',
  keywords: ['contacto proptech', 'demo crm inmobiliario', 'soporte proptech', 'software inmobiliario paraguay'],
  alternates: {
    canonical: 'https://proptech.com.py/contact',
  },
  openGraph: {
    title: 'Contacto | PropTech CRM',
    description: 'Agenda una demo o solicita soporte a nuestro equipo de PropTech CRM.',
    url: 'https://proptech.com.py/contact',
  },
};

export default function PublicContact() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-14 sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula de bienes raíces */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-contact" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
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
            <rect width="100%" height="100%" fill="url(#property-grid-contact)" />
          </svg>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Contacto
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto mb-8 px-4">
              ¿Tienes preguntas? Estamos aquí para ayudarte. 
              Nuestro equipo está listo para brindarte la mejor atención.
            </p>
          </div>
        </div>
      </section>
      
      {/* Form Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Tu nombre completo" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                <input type="email" placeholder="Tu email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="tel" placeholder="Tu teléfono" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option value="">Selecciona un asunto</option>
                  <option>Consulta General</option>
                  <option>Soporte Técnico</option>
                  <option>Información de Productos</option>
                  <option>Partnership</option>
                </select>
              </div>
              <textarea placeholder="Cuéntanos en detalle qué necesitas..." rows={6} className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none" />
              <button className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white py-4 rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold">Enviar Mensaje</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


