'use client';

import { useState } from 'react';

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

// Componente para el ícono de estrella
const StarIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

// Componente para el ícono de búsqueda
const SearchIcon = () => (
  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

// Componente para el ícono de teléfono
const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

// Componente para el ícono de email
const EmailIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

// Componente para el ícono de no resultados
const NoResultsIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

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
      {/* Header de la página */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Asesores</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Conectamos con los mejores profesionales inmobiliarios para ayudarte a encontrar 
          la propiedad perfecta o asesorarte en tus inversiones.
        </p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar asesores por nombre o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro de especialidad */}
          <div className="md:w-48">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Todas">Todas las especialidades</option>
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Asesores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvisors.map((advisor) => (
          <div key={advisor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header del card */}
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                  advisor.available ? 'bg-orange-500' : 'bg-gray-400'
                }`}>
                  {advisor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{advisor.name}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      advisor.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {advisor.available ? 'Disponible' : 'Ocupado'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{advisor.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{advisor.experience} de experiencia</p>
                </div>
              </div>

              {/* Especialidades */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {advisor.specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      filled={i < Math.floor(advisor.rating)}
                      className={`w-5 h-5 ${
                        i < Math.floor(advisor.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">{advisor.rating}</span>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <PhoneIcon />
                  <span>{advisor.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <EmailIcon />
                  <span>{advisor.email}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center space-x-3 mt-4">
                <button 
                  onClick={() => window.location.href = `tel:${advisor.phone}`}
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Llamar
                </button>
                <button 
                  onClick={() => window.location.href = `mailto:${advisor.email}`}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  Email
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredAdvisors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <NoResultsIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron asesores</h3>
          <p className="text-gray-600">Intenta ajustar los filtros o términos de búsqueda.</p>
        </div>
      )}
    </>
  );
}
