"use client";
import React, { useState } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { 
  StarIcon, 
  SparklesIcon, 
  EyeIcon, 
  RocketLaunchIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  UsersIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

interface VisibilityStepProps {
  formData: PropertyFormData;
  toggleBooleanField: (field: 'featured' | 'premium') => void;
  errors: PropertyFormErrors;
}

export default function VisibilityStep({ formData, toggleBooleanField, errors }: VisibilityStepProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const options = [
    {
      id: 'featured',
      title: 'Propiedad Destacada',
      description: 'Aparece en posiciones privilegiadas y con mayor visibilidad',
      icon: StarIcon,
      benefits: [
        'Posición destacada en listados',
        'Mayor exposición a potenciales compradores',
        'Incluida en newsletters y promociones',
        'Prioridad en búsquedas'
      ],
      stats: {
        views: '+150%',
        contacts: '+80%',
        timeToSell: '-40%'
      },
      color: 'yellow'
    },
    {
      id: 'premium',
      title: 'Propiedad Premium',
      description: 'Máxima exposición con herramientas avanzadas de marketing',
      icon: TrophyIcon,
      benefits: [
        'Todas las ventajas de Destacada',
        'Análisis detallado de visitas',
        'Reportes de rendimiento',
        'Soporte prioritario',
        'Marketing personalizado'
      ],
      stats: {
        views: '+300%',
        contacts: '+150%',
        timeToSell: '-60%'
      },
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors = {
      yellow: {
        bg: isActive ? 'bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-blue-900/20 dark:via-slate-900/20 dark:to-indigo-900/20' : 'bg-white dark:bg-gray-800',
        border: isActive ? 'border-2 border-blue-400 dark:border-blue-500 shadow-md' : 'border border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white',
        icon: isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400',
        button: isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md' : 'bg-blue-600 hover:bg-blue-700 text-white'
      },
      purple: {
        bg: isActive ? 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900/20 dark:via-gray-900/20 dark:to-blue-900/20' : 'bg-white dark:bg-gray-800',
        border: isActive ? 'border-2 border-slate-400 dark:border-slate-500 shadow-md' : 'border border-gray-200 dark:border-gray-700',
        text: isActive ? 'text-slate-900 dark:text-slate-100' : 'text-gray-900 dark:text-white',
        icon: isActive ? 'text-slate-600 dark:text-slate-400' : 'text-gray-600 dark:text-gray-400',
        button: isActive ? 'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white shadow-md' : 'bg-blue-600 hover:bg-blue-700 text-white'
      }
    };
    return colors[color as keyof typeof colors] || colors.yellow;
  };

  const isActive = (optionId: string) => {
    return optionId === 'featured' ? formData.featured : formData.premium;
  };

  const isBothActive = formData.featured && formData.premium;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Visibilidad de la Propiedad
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Mejora la exposición de tu propiedad con nuestras opciones de visibilidad
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {options.map((option) => {
          const Icon = option.icon;
          const colors = getColorClasses(option.color, isActive(option.id));
          const active = isActive(option.id);
          
          return (
            <div
              key={option.id}
              className={`relative rounded-xl transition-all duration-300 transform hover:scale-102 ${
                active ? 'ring-2 ring-blue-400/30 dark:ring-blue-500/30' : ''
              }`}
              onMouseEnter={() => setHoveredCard(option.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Active State Glow Effect */}
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl"></div>
              )}
              
              <div className={`relative ${colors.bg} ${colors.border} rounded-xl p-6 transition-all duration-300`}>
                {/* Active Badge */}
                {active && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                      <CheckCircleIcon className="w-3 h-3 inline mr-1" />
                      ACTIVO
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      active 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${colors.text}`}>
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Beneficios incluidos:
                  </h4>
                  <ul className="space-y-2">
                    {option.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Impacto esperado:
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {option.stats.views}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Vistas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {option.stats.contacts}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Contactos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                        {option.stats.timeToSell}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Tiempo de venta</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => toggleBooleanField(option.id as 'featured' | 'premium')}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 ${
                    active 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {active ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Activado</span>
                      </>
                    ) : (
                      <>
                        <Icon className="w-5 h-5" />
                        <span>Activar {option.title}</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combined State Banner */}
      {isBothActive && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center justify-center space-x-4">
            <div className="p-2 bg-white/20 rounded-full">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1">
                Máxima Visibilidad Activada
              </h3>
              <p className="text-blue-100 text-sm">
                Tu propiedad tiene todas las ventajas de visibilidad disponibles
              </p>
            </div>
            <div className="p-2 bg-white/20 rounded-full">
              <StarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <InformationCircleIcon className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información Importante
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <p className="mb-2">
              <strong>Propiedad Destacada:</strong> Recomendada para propiedades con buen potencial de venta.
            </p>
            <p>
              <strong>Propiedad Premium:</strong> Ideal para propiedades de alto valor o que requieren máxima exposición.
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>Combinación:</strong> Puedes activar ambas opciones para obtener el máximo beneficio.
            </p>
            <p>
              <strong>Flexibilidad:</strong> Puedes cambiar estas configuraciones en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 