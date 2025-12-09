"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  StarIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface Property {
  id: number;
  title: string;
  price: number;
  currency: string;
  type: 'venta' | 'alquiler';
  pricePeriod?: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  description: string;
  featured?: boolean;
}

export default function AsesorDetailPage({ params }: { params: { id: string } }) {
  const [selectedTab, setSelectedTab] = useState<'propiedades' | 'reseñas' | 'contacto'>('propiedades');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - en producción vendría de una API
  const asesor = {
    id: parseInt(params?.id as string),
    name: 'María González',
    company: 'Inmobiliaria del Sol',
    city: 'Asunción',
    specialty: 'Residencial',
    rating: 4.9,
    reviews: 127,
    experience: '8 años',
    phone: '+595 981 123-456',
    email: 'maria@inmobiliariadelsol.com',
    whatsapp: '+595981123456',
    image: '/images/asesor1.jpg',
    verified: true,
    properties: 45,
    description: 'Especialista en propiedades residenciales de alto valor en Asunción. Con más de 8 años de experiencia ayudando a familias a encontrar su hogar ideal. Certificada en evaluación inmobiliaria y con amplio conocimiento del mercado local.',
    bio: 'María González es una profesional inmobiliaria con más de 8 años de experiencia en el mercado paraguayo. Se especializa en propiedades residenciales de alto valor y ha ayudado a más de 200 familias a encontrar su hogar ideal. Con formación en arquitectura y certificaciones en evaluación inmobiliaria, María combina conocimiento técnico con un servicio personalizado que la distingue en el mercado.',
    achievements: [
      'Top 5 agentes inmobiliarios 2023',
      'Certificación en evaluación inmobiliaria',
      'Más de 200 familias satisfechas',
      'Especialista en propiedades de lujo'
    ],
    languages: ['Español', 'Inglés', 'Guaraní'],
    social: {
      linkedin: 'https://linkedin.com/in/mariagonzalez',
      facebook: 'https://facebook.com/mariagonzalez.inmobiliaria'
    }
  };

  const properties: Property[] = [
    {
      id: 1,
      title: 'Casa moderna en Barrio Villa Morra',
      price: 450000,
      currency: 'USD',
      type: 'venta',
      location: 'Villa Morra, Asunción',
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      images: ['/images/property1.jpg', '/images/property1-2.jpg'],
      description: 'Hermosa casa moderna con acabados de primera calidad, ubicada en el exclusivo barrio Villa Morra.',
      featured: true
    },
    {
      id: 2,
      title: 'Departamento en Las Mercedes',
      price: 1200,
      currency: 'USD',
      type: 'alquiler',
      pricePeriod: 'mes',
      location: 'Las Mercedes, Asunción',
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      images: ['/images/property2.jpg'],
      description: 'Moderno departamento con excelente ubicación y todas las comodidades.'
    },
    {
      id: 3,
      title: 'Casa familiar en San Lorenzo',
      price: 180000,
      currency: 'USD',
      type: 'venta',
      location: 'San Lorenzo',
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      images: ['/images/property3.jpg'],
      description: 'Casa familiar ideal para primeros compradores, en zona tranquila y segura.'
    }
  ];

  const formatPrice = (price: number, currency: string, period?: string) => {
    const formattedPrice = new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    
    return period ? `${formattedPrice}/${period}` : formattedPrice;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section con perfil del asesor */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 pt-12 sm:pt-16 pb-12 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-0">
        {/* Botón de volver */}
        <div className="absolute top-20 left-4 sm:left-8 z-20">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Avatar y info básica */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="relative inline-block">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow-2xl ring-4 ring-white/20">
                  {asesor.name.split(' ').map(n => n[0]).join('')}
                </div>
                {asesor.verified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <CheckBadgeIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Información del asesor */}
            <div className="flex-1">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {asesor.name}
                </h1>
                <p className="text-xl text-cyan-200 mb-4">{asesor.company}</p>
                
                {/* Rating y verificación */}
                <div className="flex items-center justify-center lg:justify-start space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon key={i} className={`w-5 h-5 ${i < Math.floor(asesor.rating) ? 'text-yellow-400' : 'text-gray-400'}`} />
                      ))}
                    </div>
                    <span className="text-white font-semibold">{asesor.rating}</span>
                    <span className="text-cyan-200">({asesor.reviews} reseñas)</span>
                  </div>
                  
                  {asesor.verified && (
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Verificado
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{asesor.experience}</div>
                    <div className="text-sm text-cyan-200">Experiencia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{asesor.properties}</div>
                    <div className="text-sm text-cyan-200">Propiedades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{asesor.specialty}</div>
                    <div className="text-sm text-cyan-200">Especialidad</div>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-lg text-cyan-100 max-w-2xl mb-8 leading-relaxed">
                  {asesor.description}
                </p>

                {/* Botones de contacto */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href={`tel:${asesor.phone}`}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    <span>Llamar ahora</span>
                  </a>
                  <a
                    href={`https://wa.me/${asesor.whatsapp}`}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.786"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:${asesor.email}`}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navegación por tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'propiedades', label: 'Propiedades', count: properties.length },
              { id: 'reseñas', label: 'Reseñas', count: asesor.reviews },
              { id: 'contacto', label: 'Contacto', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    selectedTab === tab.id
                      ? 'bg-cyan-100 text-cyan-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido según tab seleccionado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'propiedades' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Propiedades de {asesor.name.split(' ')[0]}
              </h2>
              <div className="text-sm text-gray-600">
                {properties.length} propiedades disponibles
              </div>
            </div>

            {/* Grid de propiedades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group bg-gradient-to-br from-white via-white to-gray-50/50 rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100/50 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02] relative"
                >
                  {/* Imagen de la propiedad */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10"></div>
                    <img
                      src={property.images[0] || '/images/placeholder.jpg'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Badge del tipo */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className={`px-3 py-1 rounded-2xl text-xs font-bold text-white backdrop-blur-md shadow-xl ${
                        property.type === 'venta' 
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      }`}>
                        {property.type === 'venta' ? 'En Venta' : 'En Alquiler'}
                      </span>
                    </div>

                    {/* Botones de acción */}
                    <div className="absolute top-4 right-4 z-20 flex space-x-2">
                      <button className="p-2 bg-black/20 backdrop-blur-md text-white rounded-2xl hover:bg-black/40 transition-all duration-300 shadow-xl">
                        <HeartIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-black/20 backdrop-blur-md text-white rounded-2xl hover:bg-black/40 transition-all duration-300 shadow-xl">
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-4 z-20 flex space-x-2">
                      <div className="flex items-center bg-black/20 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs">
                        <EyeIcon className="w-3 h-3 mr-1" />
                        1.2k
                      </div>
                      {property.images.length > 1 && (
                        <div className="flex items-center bg-black/20 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs">
                          <CameraIcon className="w-3 h-3 mr-1" />
                          +{property.images.length - 1}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 lg:p-5">
                    {/* Título y precio */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                      <div className="flex-1 sm:pr-3">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-cyan-700 transition-colors duration-300">
                          {property.title}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                            {formatPrice(property.price, property.currency, property.pricePeriod)}
                          </div>
                          {property.type === 'alquiler' && (
                            <div className="text-xs text-gray-600 font-semibold">por mes</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <div className="p-1.5 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg mr-2 shadow-sm">
                        <MapPinIcon className="w-3 h-3 text-cyan-700" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">{property.location}</span>
                    </div>

                    {/* Características */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 rounded-xl border border-gray-200/50">
                        <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{property.bedrooms}</div>
                          <div className="text-xs text-gray-700 font-medium">Dorm.</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 rounded-xl border border-gray-200/50">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{property.bathrooms}</div>
                          <div className="text-xs text-gray-700 font-medium">Baños</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 rounded-xl border border-gray-200/50">
                        <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{property.area}</div>
                          <div className="text-xs text-gray-700 font-medium">m²</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 mb-3 line-clamp-2 font-medium leading-relaxed">
                      {property.description}
                    </p>

                    {/* Botón de acción */}
                    <button className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-xl font-bold text-xs transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]">
                      Ver Detalles
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'reseñas' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas de clientes</h2>
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="text-gray-400 mb-4">
                <StarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Próximamente</h3>
              <p className="text-gray-600">Las reseñas de clientes estarán disponibles pronto.</p>
            </div>
          </div>
        )}

        {selectedTab === 'contacto' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de contacto</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información de contacto */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Datos de contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <PhoneIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Teléfono</div>
                      <div className="font-semibold text-gray-900">{asesor.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-semibold text-gray-900">{asesor.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Empresa</div>
                      <div className="font-semibold text-gray-900">{asesor.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cyan-100 rounded-lg">
                      <MapPinIcon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ubicación</div>
                      <div className="font-semibold text-gray-900">{asesor.city}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de contacto */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Enviar mensaje</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="+595 981 123-456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="¿En qué te puedo ayudar?"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                  >
                    Enviar mensaje
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
