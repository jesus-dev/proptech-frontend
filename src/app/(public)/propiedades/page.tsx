"use client";

import React from 'react';
import PropertiesSection from '@/components/public/sections/PropertiesSection';

export default function PublicPropiedades() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Encuentra tu{' '}
            <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
              Propiedad Ideal
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Descubre las mejores propiedades en venta y alquiler en Paraguay. 
            Tu hogar perfecto te está esperando.
          </p>
        </div>
      </section>
      
      <PropertiesSection />
    </div>
  );
}


