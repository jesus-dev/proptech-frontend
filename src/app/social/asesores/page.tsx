'use client';

import { useState } from 'react';
import { Search, Phone, Mail, Star, Users, Award, TrendingUp } from 'lucide-react';

// Datos de asesores
const advisors = [
  {
    id: 1,
    name: 'María González',
    avatar: 'M',
    role: 'Asesora Inmobiliaria Senior',
    phone: '+595 981 123 456',
    email: 'maria.gonzalez@proptech.com',
    specialties: ['Residencial', 'Comercial', 'Inversiones'],
    rating: 4.8,
    experience: '8 años',
    available: true
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    avatar: 'C',
    role: 'Asesor de Créditos Hipotecarios',
    phone: '+595 981 234 567',
    email: 'carlos.mendoza@proptech.com',
    specialties: ['Hipotecas', 'Financiamiento', 'Asesoría Legal'],
    rating: 4.9,
    experience: '12 años',
    available: true
  },
  {
    id: 3,
    name: 'Ana Rodríguez',
    avatar: 'A',
    role: 'Asesora de Propiedades Comerciales',
    phone: '+595 981 345 678',
    email: 'ana.rodriguez@proptech.com',
    specialties: ['Comercial', 'Oficinas', 'Locales'],
    rating: 4.7,
    experience: '6 años',
    available: false
  },
  {
    id: 4,
    name: 'Luis Fernández',
    avatar: 'L',
    role: 'Asesor de Inversiones',
    phone: '+595 981 456 789',
    email: 'luis.fernandez@proptech.com',
    specialties: ['Inversiones', 'Rentabilidad', 'Análisis de Mercado'],
    rating: 4.6,
    experience: '10 años',
    available: true
  },
  {
    id: 5,
    name: 'Patricia López',
    avatar: 'P',
    role: 'Asesora de Propiedades de Lujo',
    phone: '+595 981 567 890',
    email: 'patricia.lopez@proptech.com',
    specialties: ['Lujo', 'Premium', 'Exclusivo'],
    rating: 4.9,
    experience: '15 años',
    available: true
  },
  {
    id: 6,
    name: 'Roberto Silva',
    avatar: 'R',
    role: 'Asesor de Desarrollo Inmobiliario',
    phone: '+595 981 678 901',
    email: 'roberto.silva@proptech.com',
    specialties: ['Desarrollo', 'Construcción', 'Proyectos'],
    rating: 4.5,
    experience: '18 años',
    available: false
  }
];


export default function AsesoresPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar asesores por especialidad y búsqueda
  const filteredAdvisors = advisors.filter(advisor => {
    const matchesSpecialty = selectedSpecialty === 'Todas' || advisor.specialties.includes(selectedSpecialty);
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         advisor.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  // Obtener especialidades únicas
  const allSpecialties = Array.from(new Set(advisors.flatMap(advisor => advisor.specialties)));

  return (
    <>
      {/* Header de la página - Mejorado */}
      <div className="relative mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-orange-200">
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Award className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2 sm:mb-3">
            Nuestros Agentes Inmobiliarios
          </h1>
          <p className="text-sm sm:text-base text-gray-700 text-center max-w-2xl mx-auto leading-relaxed">
            Conecta con profesionales certificados para encontrar tu propiedad ideal o maximizar tus inversiones
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda - Mejorado */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Buscar por nombre o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base bg-white/80 backdrop-blur-sm outline-none"
              />
            </div>
          </div>

          {/* Filtro de especialidad */}
          <div className="md:w-56">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base bg-white outline-none cursor-pointer"
            >
              <option value="Todas">✨ Todas las especialidades</option>
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Contador de resultados */}
        {(searchTerm || selectedSpecialty !== 'Todas') && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-semibold text-orange-600">{filteredAdvisors.length}</span> {filteredAdvisors.length === 1 ? 'agente encontrado' : 'agentes encontrados'}
            </p>
          </div>
        )}
      </div>

      {/* Lista de Asesores - Mejorada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAdvisors.map((advisor) => (
          <div key={advisor.id} className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            {/* Header del card con gradiente */}
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-6 pb-20">
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                  advisor.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-400 text-white'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${advisor.available ? 'bg-white animate-pulse' : 'bg-gray-200'}`}></span>
                  {advisor.available ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
              
              {/* Avatar centrado */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg ${
                    advisor.available ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {advisor.avatar}
                  </div>
                  {advisor.rating >= 4.8 && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información principal */}
            <div className="px-6 -mt-12 relative z-10">
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-1">{advisor.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-2">{advisor.role}</p>
                
                {/* Rating y experiencia */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">{advisor.rating}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>{advisor.experience}</span>
                  </div>
                </div>

                {/* Especialidades */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {advisor.specialties.map((specialty, index) => (
                    <span key={index} className="px-2.5 py-1 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 text-[10px] sm:text-xs rounded-full font-medium border border-orange-200">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="px-6 py-4 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 group/phone hover:text-orange-600 transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{advisor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 group/email hover:text-orange-600 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{advisor.email}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.location.href = `tel:${advisor.phone}`}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </button>
                <button 
                  onClick={() => window.location.href = `mailto:${advisor.email}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay resultados - Mejorado */}
      {filteredAdvisors.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <Search className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No se encontraron agentes</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
            Intenta ajustar los filtros o términos de búsqueda para encontrar el agente perfecto.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('Todas');
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            <Users className="w-4 h-4" />
            Ver todos los agentes
          </button>
        </div>
      )}
    </>
  );
}
