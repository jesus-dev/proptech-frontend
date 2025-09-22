import React from 'react';

export default function PublicContact() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[30vh] sm:min-h-[35vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Main Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/40 via-brand-700/30 to-brand-800/40"></div>
          
          {/* Animated Mesh Gradient */}
          <div className="absolute inset-0 opacity-60">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-500/20 via-transparent to-emerald-500/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-500/20 via-transparent to-brand-600/20 animate-pulse delay-1000"></div>
          </div>
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Contacto</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">¿Tienes preguntas? Estamos aquí para ayudarte.</p>
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


