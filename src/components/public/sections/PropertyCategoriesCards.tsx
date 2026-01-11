"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  Square3Stack3DIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const categories = [
  {
    name: 'Viviendas',
    description: 'Casas y hogares exclusivos',
    href: '/propiedades/casa',
    icon: HomeIcon,
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    lightGradient: 'from-blue-500/10 via-blue-600/5 to-indigo-500/10',
    iconBg: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-700',
    hoverText: 'group-hover:text-white',
    count: '500+'
  },
  {
    name: 'Departamentos',
    description: 'Apartamentos modernos y elegantes',
    href: '/propiedades/departamento',
    icon: Square3Stack3DIcon,
    gradient: 'from-purple-600 via-purple-700 to-pink-700',
    lightGradient: 'from-purple-500/10 via-purple-600/5 to-pink-500/10',
    iconBg: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-700',
    hoverText: 'group-hover:text-white',
    count: '300+'
  },
  {
    name: 'Proyectos',
    description: 'Desarrollos inmobiliarios premium',
    href: '/propiedades/edificio',
    icon: BuildingOfficeIcon,
    gradient: 'from-orange-600 via-orange-700 to-red-700',
    lightGradient: 'from-orange-500/10 via-orange-600/5 to-red-500/10',
    iconBg: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-700',
    hoverText: 'group-hover:text-white',
    count: '50+'
  },
  {
    name: 'Terrenos',
    description: 'Lotes y terrenos para inversión',
    href: '/propiedades/terreno',
    icon: MapPinIcon,
    gradient: 'from-green-600 via-emerald-700 to-teal-800',
    lightGradient: 'from-green-500/10 via-emerald-600/5 to-teal-500/10',
    iconBg: 'from-green-500 to-emerald-600',
    textColor: 'text-green-700',
    hoverText: 'group-hover:text-white',
    count: '200+'
  }
];

const PropertyCategoriesCards = () => {
  return (
    <section className="relative w-full py-24 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full text-blue-700 text-sm font-semibold">
              Categorías
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Explora nuestras categorías
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre propiedades cuidadosamente seleccionadas en cada categoría
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
              className="group h-full"
            >
              <Link
                href={category.href}
                className="relative block h-full p-8 lg:p-10 rounded-3xl bg-white border border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                
                {/* Light gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.lightGradient} opacity-100 group-hover:opacity-0 transition-opacity duration-700`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with count badge */}
                  <div className="relative mb-8 inline-block">
                    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${category.iconBg} shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    {/* Count badge */}
                    <div className={`absolute -top-2 -right-2 px-2.5 py-1 bg-white ${category.textColor} rounded-full text-xs font-bold shadow-md border-2 border-gray-100 group-hover:bg-white/20 group-hover:border-white/30 group-hover:text-white transition-all duration-700`}>
                      {category.count}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-2xl lg:text-3xl font-bold ${category.textColor} ${category.hoverText} mb-4 transition-colors duration-700 leading-tight`}>
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className={`text-base text-gray-600 ${category.hoverText} mb-8 transition-colors duration-700 leading-relaxed`}>
                    {category.description}
                  </p>
                  
                  {/* CTA Link */}
                  <div className="flex items-center text-sm font-bold">
                    <span className={`${category.textColor} ${category.hoverText} transition-colors duration-700`}>
                      Explorar
                    </span>
                    <div className={`ml-3 p-1.5 rounded-full ${category.textColor.replace('text-', 'bg-').replace('-700', '-100')} group-hover:bg-white/20 transition-all duration-700`}>
                      <ArrowRightIcon className={`w-4 h-4 ${category.textColor} ${category.hoverText} group-hover:translate-x-1 transition-all duration-700`} />
                    </div>
                  </div>
                </div>

                {/* Decorative corner elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/20 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-200"></div>
                
                {/* Subtle border glow on hover */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/30 transition-all duration-700 pointer-events-none`}></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCategoriesCards;
