import GridShape from "@/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Type assertion to resolve JSX compatibility issues
const ImageComponent = Image as any;
const LinkComponent = Link as any;

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Fondo con patrón arquitectónico sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
        <div className="absolute top-40 right-20 w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
        <div className="absolute bottom-32 left-1/3 w-24 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
        <div className="absolute bottom-40 right-1/4 w-36 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
      </div>
      
      <div className="mx-auto w-full max-w-[520px] text-center relative z-10">

        
        {/* Edificio arquitectónico ultra elegante */}
        <div className="mb-16 flex justify-center">
          <div className="relative group">
            {/* Edificio principal con estilo arquitectónico premium */}
            <div className="text-8xl text-slate-600 dark:text-slate-400 transform group-hover:scale-105 transition-all duration-700 ease-out">
              <svg 
                viewBox="0 0 140 140" 
                className="w-36 h-36 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Edificio principal - forma base con gradiente */}
                <defs>
                  <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.95"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.85"/>
                  </linearGradient>
                  <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                
                {/* Sombra base */}
                <ellipse cx="70" cy="135" rx="45" ry="12" className="opacity-0 group-hover:opacity-40 transition-opacity duration-1000 fill-slate-400 blur-sm"/>
                
                {/* Edificio principal - forma base */}
                <rect x="35" y="25" width="70" height="90" rx="3" fill="url(#buildingGradient)" className="opacity-90 group-hover:opacity-100 transition-opacity duration-500"/>
                
                {/* Líneas de pisos horizontales - más detalladas */}
                <line x1="40" y1="45" x2="100" y2="45" stroke="currentColor" strokeWidth="1.2" className="opacity-70 group-hover:opacity-90 transition-opacity duration-600"/>
                <line x1="40" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1.2" className="opacity-70 group-hover:opacity-90 transition-opacity duration-700"/>
                <line x1="40" y1="85" x2="100" y2="85" stroke="currentColor" strokeWidth="1.2" className="opacity-70 group-hover:opacity-90 transition-opacity duration-800"/>
                
                {/* Líneas verticales de columnas - más definidas */}
                <line x1="50" y1="25" x2="50" y2="115" stroke="currentColor" strokeWidth="1" className="opacity-60 group-hover:opacity-80 transition-opacity duration-500"/>
                <line x1="90" y1="25" x2="90" y2="115" stroke="currentColor" strokeWidth="1" className="opacity-60 group-hover:opacity-80 transition-opacity duration-700"/>
                
                {/* Base del edificio - más robusta */}
                <rect x="30" y="115" width="80" height="4" rx="2" className="opacity-90 group-hover:opacity-100 transition-opacity duration-500"/>
                <rect x="35" y="119" width="70" height="3" rx="1.5" className="opacity-70 group-hover:opacity-90 transition-opacity duration-600"/>
                <rect x="40" y="122" width="60" height="2" rx="1" className="opacity-50 group-hover:opacity-70 transition-opacity duration-700"/>
                
                {/* Detalles superiores - más elegantes */}
                <rect x="45" y="20" width="50" height="4" rx="2" className="opacity-80 group-hover:opacity-95 transition-opacity duration-500"/>
                <rect x="50" y="16" width="40" height="3" rx="1.5" className="opacity-60 group-hover:opacity-80 transition-opacity duration-600"/>
                <rect x="55" y="13" width="30" height="2" rx="1" className="opacity-40 group-hover:opacity-60 transition-opacity duration-700"/>
                
                {/* Ventanas principales - más detalladas */}
                <rect x="42" y="30" width="5" height="8" rx="1" className="opacity-50 group-hover:opacity-75 transition-opacity duration-500"/>
                <rect x="93" y="30" width="5" height="8" rx="1" className="opacity-50 group-hover:opacity-75 transition-opacity duration-700"/>
                <rect x="42" y="50" width="5" height="8" rx="1" className="opacity-50 group-hover:opacity-75 transition-opacity duration-600"/>
                <rect x="93" y="50" width="5" height="8" rx="1" className="opacity-50 group-hover:opacity-75 transition-opacity duration-800"/>
                <rect x="42" y="70" width="5" height="8" rx="1" className="opacity-50 group-hover:opacity-75 transition-opacity duration-700"/>
                <rect x="93" y="70" width="5" height="8" rx="1" className="opacity-50 group-hover:opacity-75 transition-opacity duration-900"/>
                
                {/* Ventanas centrales adicionales */}
                <rect x="67" y="30" width="6" height="8" rx="1" className="opacity-40 group-hover:opacity-65 transition-opacity duration-600"/>
                <rect x="67" y="50" width="6" height="8" rx="1" className="opacity-40 group-hover:opacity-65 transition-opacity duration-700"/>
                <rect x="67" y="70" width="6" height="8" rx="1" className="opacity-40 group-hover:opacity-65 transition-opacity duration-800"/>
                
                {/* Detalles arquitectónicos laterales */}
                <rect x="25" y="40" width="3" height="12" rx="1.5" className="opacity-40 group-hover:opacity-70 transition-opacity duration-600"/>
                <rect x="25" y="60" width="3" height="12" rx="1.5" className="opacity-40 group-hover:opacity-70 transition-opacity duration-700"/>
                <rect x="25" y="80" width="3" height="12" rx="1.5" className="opacity-40 group-hover:opacity-70 transition-opacity duration-800"/>
                
                <rect x="112" y="40" width="3" height="12" rx="1.5" className="opacity-40 group-hover:opacity-70 transition-opacity duration-600"/>
                <rect x="112" y="60" width="3" height="12" rx="1.5" className="opacity-40 group-hover:opacity-70 transition-opacity duration-700"/>
                <rect x="112" y="80" width="3" height="12" rx="1.5" className="opacity-40 group-hover:opacity-70 transition-opacity duration-800"/>
                
                {/* Efecto de brillo superior */}
                <ellipse cx="70" cy="15" rx="20" ry="6" className="opacity-0 group-hover:opacity-30 transition-opacity duration-1000 fill-slate-300 blur-sm"/>
              </svg>
            </div>
            
            {/* Base arquitectónica del edificio - 5 niveles */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-28 h-1.5 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-90 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-80 group-hover:opacity-95 transition-all duration-600"></div>
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-70 group-hover:opacity-90 transition-all duration-700"></div>
            <div className="absolute -bottom-18 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-60 group-hover:opacity-85 transition-all duration-800"></div>
            <div className="absolute -bottom-22 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-50 group-hover:opacity-80 transition-all duration-900"></div>
            
            {/* Detalles arquitectónicos superiores - 4 niveles */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-70 group-hover:opacity-95 transition-all duration-500"></div>
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-60 group-hover:opacity-90 transition-all duration-600"></div>
            <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-50 group-hover:opacity-85 transition-all duration-700"></div>
            <div className="absolute -top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-40 group-hover:opacity-80 transition-all duration-800"></div>
            
            {/* Líneas verticales arquitectónicas - 6 columnas */}
            <div className="absolute top-0 left-1/6 w-0.5 h-16 bg-gradient-to-b from-slate-600 to-transparent opacity-50 group-hover:opacity-85 transition-all duration-500"></div>
            <div className="absolute top-0 left-1/3 w-0.5 h-16 bg-gradient-to-b from-slate-600 to-transparent opacity-50 group-hover:opacity-85 transition-all duration-600"></div>
            <div className="absolute top-0 right-1/3 w-0.5 h-16 bg-gradient-to-b from-slate-600 to-transparent opacity-50 group-hover:opacity-85 transition-all duration-700"></div>
            <div className="absolute top-0 right-1/6 w-0.5 h-16 bg-gradient-to-b from-slate-600 to-transparent opacity-50 group-hover:opacity-85 transition-all duration-800"></div>
            
            {/* Líneas horizontales intermedias para pisos */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-30 group-hover:opacity-70 transition-all duration-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-25 group-hover:opacity-65 transition-all duration-700"></div>
            <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-20 group-hover:opacity-60 transition-all duration-800"></div>
            
            {/* Efecto de sombra premium */}
            <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-gradient-to-r from-transparent via-slate-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-md"></div>
            
            {/* Efecto de brillo superior */}
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-slate-300/40 to-transparent opacity-0 group-hover:opacity-60 transition-all duration-1000 blur-sm rounded-full"></div>
            
            {/* Detalles arquitectónicos laterales */}
            <div className="absolute top-1/3 left-0 w-2 h-8 bg-gradient-to-r from-slate-600 to-transparent opacity-40 group-hover:opacity-80 transition-all duration-600 rounded-r-full"></div>
            <div className="absolute top-1/3 right-0 w-2 h-8 bg-gradient-to-l from-slate-600 to-transparent opacity-40 group-hover:opacity-80 transition-all duration-600 rounded-l-full"></div>
          </div>
        </div>

        {/* Título elegante y profesional */}
        <h1 className="mb-8 font-light text-slate-800 dark:text-slate-200 text-3xl tracking-wide">
          Propiedad no encontrada
        </h1>
        
        {/* Mensaje elegante */}
        <p className="mb-16 text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          La página que buscas no está disponible en nuestro catálogo inmobiliario.
          <br />
          <span className="text-slate-800 dark:text-slate-200 font-medium">
            Te invitamos a explorar nuestras propiedades disponibles.
          </span>
        </p>

        {/* Botones elegantes */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <LinkComponent
            href="/properties"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-slate-800 dark:bg-slate-200 dark:text-slate-800 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-100 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
          >
            Explorar Propiedades
          </LinkComponent>
          
          <LinkComponent
          href="/"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
        >
          Volver al Inicio
          </LinkComponent>
        </div>

        {/* Navegación inmobiliaria elegante */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wide">
            Navegación Inmobiliaria
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                <span className="mr-2 text-lg">🔍</span>
                <span className="text-sm font-medium">Búsqueda</span>
              </div>
            </div>
            <div className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                <span className="mr-2 text-lg">📍</span>
                <span className="text-sm font-medium">Ubicación</span>
              </div>
            </div>
            <div className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                <span className="mr-2 text-lg">💰</span>
                <span className="text-sm font-medium">Precio</span>
              </div>
            </div>
            <div className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                <span className="mr-2 text-lg">🏘️</span>
                <span className="text-sm font-medium">Tipo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer elegante */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mb-4 opacity-40"></div>
        <p className="text-xs text-slate-400 dark:text-slate-500 tracking-wide">
          ON Prop Tech • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
