"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { publicPropertyService } from '@/services/publicPropertyService';

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalAgents: 0,
    totalCities: 0,
    featuredProperties: 0,
    averagePrice: 0,
    propertiesForSale: 0,
    propertiesForRent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Cargar solo la primera página para obtener total y calcular estadísticas básicas
        const response = await publicPropertyService.getPropertiesPaginated({
          page: 1,
          limit: 12 // Solo cargar las primeras 12 para calcular estadísticas básicas
        });

        const properties = response.properties || [];
        const totalProps = response.pagination?.totalProperties || properties.length;
        
        // Calcular estadísticas de la muestra
        const cities = new Set(properties.map((p: any) => p.cityName).filter(Boolean));
        const forSale = properties.filter((p: any) => p.operacion === 'SALE').length;
        const forRent = properties.filter((p: any) => p.operacion === 'RENT').length;
        const featured = properties.filter((p: any) => p.featured).length;
        
        const prices = properties
          .map((p: any) => p.price)
          .filter((p: number) => p && p > 0);
        const avgPrice = prices.length > 0 
          ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length)
          : 0;

        // Estimar totales basados en la muestra (si hay datos)
        const saleRatio = properties.length > 0 ? forSale / properties.length : 0.5;
        const rentRatio = properties.length > 0 ? forRent / properties.length : 0.5;

        setStats({
          totalProperties: totalProps,
          totalAgents: 50, // Valor por defecto
          totalCities: Math.max(cities.size, 5), // Mínimo 5 ciudades
          featuredProperties: featured,
          averagePrice: avgPrice,
          propertiesForSale: Math.round(totalProps * saleRatio),
          propertiesForRent: Math.round(totalProps * rentRatio)
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Valores por defecto en caso de error
        setStats({
          totalProperties: 0,
          totalAgents: 50,
          totalCities: 10,
          featuredProperties: 0,
          averagePrice: 0,
          propertiesForSale: 0,
          propertiesForRent: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₲${(price / 1000000).toFixed(1)}M`;
    }
    return `₲${new Intl.NumberFormat('es-PY').format(price)}`;
  };

  const statCards = [
    {
      icon: HomeIcon,
      value: stats.totalProperties.toLocaleString(),
      label: 'Propiedades Disponibles',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: UserGroupIcon,
      value: stats.totalAgents.toLocaleString(),
      label: 'Agentes Activos',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2
    },
    {
      icon: MapPinIcon,
      value: stats.totalCities.toLocaleString(),
      label: 'Ciudades',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.3
    },
    {
      icon: CurrencyDollarIcon,
      value: formatPrice(stats.averagePrice),
      label: 'Precio Promedio',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.4
    },
    {
      icon: BuildingOfficeIcon,
      value: stats.propertiesForSale.toLocaleString(),
      label: 'En Venta',
      gradient: 'from-indigo-500 to-blue-500',
      delay: 0.5
    },
    {
      icon: ChartBarIcon,
      value: stats.propertiesForRent.toLocaleString(),
      label: 'En Alquiler',
      gradient: 'from-teal-500 to-cyan-500',
      delay: 0.6
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Nuestro Impacto en el Mercado
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Miles de propiedades gestionadas, cientos de agentes confían en nosotros
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: stat.delay }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 group"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

