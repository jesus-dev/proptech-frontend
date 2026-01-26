"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CheckCircleIcon, AcademicCapIcon, HomeIcon, Cog6ToothIcon, MapPinIcon, PhotoIcon, StarIcon, WrenchScrewdriverIcon, DocumentTextIcon, EyeIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function InstructivoCargarPropiedadesPage() {
  const steps = [
    {
      number: 1,
      title: "Accede al formulario de nueva propiedad",
      description: "Desde el menú principal, navega a la sección de Propiedades y haz clic en 'Nueva Propiedad'.",
      details: [
        "Ve al menú lateral y busca la opción 'Propiedades'",
        "Haz clic en el botón 'Nueva Propiedad' o en el icono '+'",
        "Se abrirá el formulario con múltiples pasos para completar"
      ],
      icon: HomeIcon
    },
    {
      number: 2,
      title: "Paso 1: Descripción y Precio",
      description: "Completa la información básica de la propiedad: título, tipo, operación, precio y descripción.",
      details: [
        "Ingresa un título descriptivo para la propiedad (ej: 'Hermosa casa moderna en barrio cerrado con vista al lago')",
        "Selecciona el tipo de propiedad principal desde el dropdown (Casa, Departamento, Terreno, etc.)",
        "Opcionalmente, puedes agregar tipos adicionales haciendo clic en el mismo campo",
        "Elige la operación usando los botones con iconos: Venta (bolsa), Alquiler (llave) o Ambos (flechas)",
        "Establece el precio (se formatea automáticamente con puntos como separadores de miles)",
        "Selecciona la moneda desde el selector (USD, PYG, EUR, etc.)",
        "Elige el estado de la propiedad desde el dropdown (Borrador, Disponible, Reservado, Vendido, etc.)",
        "Escribe una descripción detallada usando el editor de texto enriquecido (puedes usar formato, listas, etc.)"
      ],
      icon: HomeIcon,
      showFormPreview: true,
      formPreview: {
        title: "Descripción y Precio",
        fields: [
          { label: "Título de la Propiedad", type: "text", placeholder: "Ej: Hermosa casa moderna en barrio cerrado con vista al lago", required: true },
          { label: "Tipo de Propiedad", type: "select", options: ["Casa", "Departamento", "Terreno", "Local Comercial"], required: true },
          { label: "Operación", type: "radio", options: ["Venta", "Alquiler", "Ambos"], required: true },
          { label: "Precio", type: "number", placeholder: "0", required: true },
          { label: "Moneda", type: "select", options: ["USD", "PYG", "EUR"], required: true },
          { label: "Estado", type: "select", options: ["Borrador", "Disponible", "Reservado", "Vendido"], required: true },
          { label: "Descripción", type: "textarea", placeholder: "Describe la propiedad en detalle usando el editor...", required: true }
        ]
      }
    },
    {
      number: 3,
      title: "Paso 2: Características",
      description: "Define las características físicas de la propiedad organizadas en 4 secciones: Básicas, Espacios, Dimensiones y Detalles.",
      details: [
        "Navega entre las 4 secciones usando los botones en la parte superior: Básicas, Espacios, Dimensiones, Detalles",
        "Sección Básicas (requeridos): Área total en m², Habitaciones, Baños, Habitaciones Totales, Cocinas, Pisos, Año de Construcción",
        "Sección Espacios: Disponible Desde (fecha), Estacionamientos, Salas, Comedores, Oficinas, etc.",
        "Sección Dimensiones: Área construida, Área cubierta, Área descubierta, Tamaño del lote, Altura de techos, etc.",
        "Sección Detalles: Tipo de construcción, Materiales, Estado de conservación, Orientación, etc.",
        "Los campos marcados con * son obligatorios (Área, Habitaciones, Baños)"
      ],
      icon: Cog6ToothIcon,
      showFormPreview: true,
      formPreview: {
        title: "Características",
        sections: ["Básicas", "Espacios", "Dimensiones", "Detalles"],
        fields: [
          { label: "Área (m²)", type: "number", placeholder: "0", required: true, section: "Básicas" },
          { label: "Habitaciones", type: "number", placeholder: "0", required: true, section: "Básicas" },
          { label: "Baños", type: "number", placeholder: "0", required: true, section: "Básicas" },
          { label: "Habitaciones Totales", type: "number", placeholder: "0", required: false, section: "Básicas" },
          { label: "Cocinas", type: "number", placeholder: "0", required: false, section: "Básicas" },
          { label: "Pisos", type: "number", placeholder: "0", required: false, section: "Básicas" },
          { label: "Año de construcción", type: "number", placeholder: "2024", required: false, section: "Básicas" }
        ]
      }
    },
    {
      number: 4,
      title: "Paso 3: Ubicación",
      description: "Especifica la dirección y ubicación geográfica usando el buscador inteligente del sistema.",
      details: [
        "Usa el buscador inteligente: cambia entre modo 'Ciudad' o 'Barrio' usando los botones",
        "Escribe en el campo de búsqueda y selecciona de los resultados que aparecen",
        "Si no encuentras la ciudad o barrio, puedes crearlo usando el botón '+' que aparece",
        "Selecciona el País desde el dropdown",
        "Selecciona el Departamento/Estado (se carga automáticamente según el país)",
        "Ingresa la Dirección completa (calle y número) - campo requerido",
        "Opcionalmente agrega Código Postal",
        "El sistema guarda automáticamente las coordenadas geográficas cuando seleccionas la ubicación"
      ],
      icon: MapPinIcon,
      showFormPreview: true,
      formPreview: {
        title: "Ubicación",
        fields: [
          { label: "Buscador", type: "search", placeholder: "Buscar ciudad o barrio...", required: false },
          { label: "País", type: "select", options: ["Paraguay", "Argentina", "Brasil"], required: false },
          { label: "Departamento/Estado", type: "select", options: ["Alto Paraná", "Asunción", "Itapúa"], required: false },
          { label: "Dirección", type: "text", placeholder: "Calle y número", required: true },
          { label: "Código Postal", type: "text", placeholder: "0000", required: false }
        ]
      }
    },
    {
      number: 5,
      title: "Paso 4: Multimedia",
      description: "Sube imágenes, videos y tours virtuales de la propiedad con arrastrar y soltar.",
      details: [
        "Haz clic en 'Seleccionar imágenes' o arrastra y suelta múltiples imágenes directamente",
        "Las imágenes se suben automáticamente y aparecen en una galería",
        "Arrastra las imágenes usando el icono de agarre (☰) para reordenarlas",
        "Haz clic en 'Establecer como destacada' en una imagen para que aparezca primero (se marca con un borde amarillo)",
        "Puedes eliminar imágenes haciendo clic en el icono de basura",
        "Agrega videos opcionales: Video Principal, Reel o Tour Virtual usando los campos de URL",
        "Las imágenes se optimizan automáticamente al subirlas"
      ],
      icon: PhotoIcon,
      showImagePreview: true
    },
    {
      number: 6,
      title: "Paso 5: Amenidades",
      description: "Selecciona las amenidades usando el selector múltiple con búsqueda y categorías.",
      details: [
        "Usa el campo de búsqueda para encontrar amenidades específicas",
        "Las amenidades están organizadas por categorías (Seguridad, Recreación, Comodidades, etc.)",
        "Marca las casillas de las amenidades que aplican a tu propiedad",
        "Puedes seleccionar múltiples opciones de diferentes categorías",
        "Las amenidades seleccionadas aparecen marcadas visualmente",
        "Este paso es opcional pero ayuda a los clientes a encontrar propiedades con características específicas"
      ],
      icon: StarIcon
    },
    {
      number: 7,
      title: "Paso 6: Servicios",
      description: "Selecciona los servicios adicionales usando el mismo selector múltiple que las amenidades.",
      details: [
        "Usa el selector múltiple con búsqueda para encontrar servicios",
        "Selecciona los servicios que incluye la propiedad (internet, cable, agua, electricidad, gas, etc.)",
        "Puedes seleccionar múltiples servicios",
        "Este paso es opcional pero ayuda a los clientes a entender qué servicios están incluidos en el precio"
      ],
      icon: WrenchScrewdriverIcon
    },
    {
      number: 8,
      title: "Paso 7: Archivos Privados",
      description: "Sube documentos confidenciales con descripción que solo verán usuarios autorizados.",
      details: [
        "Haz clic en 'Seleccionar archivos' para subir documentos (PDF, imágenes, etc.)",
        "Agrega una descripción para cada archivo que subas",
        "Los archivos se muestran con un icono según su tipo (PDF, imagen, etc.)",
        "Puedes descargar o eliminar archivos después de subirlos",
        "Estos archivos solo serán visibles para usuarios con permisos específicos",
        "Útil para compartir información sensible como escrituras, contratos, planos técnicos con clientes potenciales"
      ],
      icon: DocumentTextIcon
    },
    {
      number: 9,
      title: "Paso 8: Visibilidad",
      description: "Configura la visibilidad de la propiedad: Destacada o Premium con sus beneficios.",
      details: [
        "Propiedad Destacada: Aparece en posiciones privilegiadas, mayor exposición (+150% vistas, +80% contactos)",
        "Propiedad Premium: Máxima exposición con herramientas avanzadas (+300% vistas, +150% contactos)",
        "Cada opción muestra sus beneficios y estadísticas de rendimiento",
        "Puedes activar ambas opciones o ninguna",
        "Las opciones se activan/desactivan haciendo clic en las tarjetas correspondientes"
      ],
      icon: EyeIcon
    },
    {
      number: 10,
      title: "Paso 9: Planos de Planta",
      description: "Agrega planos de planta de la propiedad si los tienes disponibles.",
      details: [
        "Sube imágenes de los planos de planta",
        "Puedes agregar múltiples planos (planta baja, primer piso, etc.)",
        "Agrega una descripción para cada plano",
        "Los planos ayudan a los clientes a visualizar la distribución"
      ],
      icon: DocumentTextIcon
    },
    {
      number: 11,
      title: "Paso 10: Facilidades Cercanas",
      description: "Indica servicios y facilidades cercanas a la propiedad.",
      details: [
        "Agrega facilidades cercanas como escuelas, hospitales, centros comerciales",
        "Especifica la distancia aproximada a cada facilidad",
        "Esto ayuda a los clientes a evaluar la ubicación"
      ],
      icon: MapPinIcon
    },
    {
      number: 12,
      title: "Paso 11: Información del Propietario",
      description: "Opcionalmente, agrega información del propietario de la propiedad.",
      details: [
        "Este paso es opcional",
        "Puedes vincular la propiedad con un propietario existente",
        "O crear un nuevo registro de propietario",
        "Útil para gestionar múltiples propiedades del mismo dueño"
      ],
      icon: UserIcon
    },
    {
      number: 13,
      title: "Paso 12: Alquiler Temporal",
      description: "Configura opciones específicas para alquileres de corta duración (opcional).",
      details: [
        "Activa el alquiler temporal usando el toggle si aplica",
        "Configura el precio por noche",
        "Establece la tarifa de limpieza",
        "Define el número mínimo y máximo de noches",
        "Especifica el número máximo de huéspedes",
        "Configura horarios de check-in y check-out",
        "Activa/desactiva reserva instantánea",
        "Selecciona el tipo de alquiler (Apartamento, Casa, etc.)",
        "Configura políticas: mascotas permitidas, fumar permitido, eventos permitidos",
        "Indica si hay WiFi disponible",
        "Selecciona la política de cancelación (Flexible, Moderada, Estricta, etc.)",
        "Este paso es completamente opcional y solo aplica para alquileres temporales"
      ],
      icon: CalendarIcon
    },
    {
      number: 14,
      title: "Revisar y Publicar",
      description: "Revisa toda la información, navega entre pasos y publica la propiedad.",
      details: [
        "Usa la barra de navegación lateral para revisar todos los pasos",
        "Los pasos con errores se marcan en rojo, los completados en verde",
        "Puedes navegar libremente entre pasos usando los botones 'Anterior' y 'Siguiente'",
        "El sistema guarda automáticamente tu progreso mientras completas el formulario",
        "Haz clic en 'Guardar' para guardar como borrador (estado 'Borrador')",
        "Haz clic en 'Publicar' cuando estés listo para que la propiedad sea visible públicamente",
        "Puedes editar la propiedad después de publicarla desde el listado de propiedades"
      ],
      icon: CheckCircleIcon
    }
  ];

  const renderFormPreview = (formPreview: any) => {
    if (!formPreview) return null;

    return (
      <div className="lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">{formPreview.title}</h4>
          <div className="space-y-4">
            {formPreview.fields.map((field: any, index: number) => (
              <div key={index}>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'text' || field.type === 'number' || field.type === 'search' ? (
                  <input
                    type={field.type === 'search' ? 'text' : field.type}
                    disabled
                    className="w-full px-4 h-10 rounded-lg border-2 border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed"
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'select' ? (
                  <select
                    disabled
                    className="w-full px-4 h-10 rounded-lg border-2 border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed"
                  >
                    <option>{field.placeholder || 'Selecciona...'}</option>
                    {field.options?.map((opt: string, i: number) => (
                      <option key={i}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'radio' ? (
                  <div className="grid grid-cols-3 gap-3">
                    {field.options?.map((opt: string, i: number) => (
                      <div key={i} className="p-4 border-2 border-gray-300 rounded-xl bg-gray-50 text-center text-sm text-gray-600">
                        {opt}
                      </div>
                    ))}
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    disabled
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed resize-none"
                    placeholder={field.placeholder}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center italic">
            Vista previa del formulario
          </p>
        </div>
      </div>
    );
  };

  const renderImagePreview = () => {
    // Imágenes de ejemplo para la vista previa
    const exampleImages = [
      { id: 1, url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImagen 1%3C/text%3E%3C/svg%3E', featured: true },
      { id: 2, url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23d1d5db" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImagen 2%3C/text%3E%3C/svg%3E', featured: false },
      { id: 3, url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImagen 3%3C/text%3E%3C/svg%3E', featured: false },
      { id: 4, url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23d1d5db" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImagen 4%3C/text%3E%3C/svg%3E', featured: false },
    ];

    return (
      <div className="lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Galería de Imágenes</h4>
          <div className="grid grid-cols-2 gap-3">
            {exampleImages.map((img) => (
              <div
                key={img.id}
                className={`relative group bg-gray-100 rounded-lg overflow-hidden ${
                  img.featured ? 'ring-2 ring-yellow-500' : ''
                }`}
              >
                <div className="relative w-full h-32">
                  <img
                    src={img.url}
                    alt={`Imagen ${img.id}`}
                    className="w-full h-full object-cover"
                  />
                  {img.featured && (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                      <StarIcon className="h-3 w-3 fill-current" />
                      <span>Destacada</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-gray-700/80 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      disabled
                      className="bg-yellow-500 text-white rounded-full p-1 disabled:opacity-50"
                      title="Destacada"
                    >
                      <StarIcon className="h-3 w-3 fill-current" />
                    </button>
                    <button
                      type="button"
                      disabled
                      className="bg-red-500 text-white rounded-full p-1 disabled:opacity-50"
                      title="Eliminar"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center italic">
            Vista previa de la galería - Pasa el mouse sobre las imágenes para ver los controles
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-instructivo-prop" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-instructivo-prop)" />
          </svg>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-6 sm:pb-8 w-full z-10">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Cómo Cargar Propiedades
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto mb-8 px-4"
            >
              Guía completa paso a paso para publicar propiedades en el sistema con todos los detalles necesarios.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
        {/* Back Button */}
        <Link
          href="/instructivos"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Volver a Instructivos</span>
        </Link>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Step Number and Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Step Number */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                          {step.number}
                        </div>
                      </div>

                      {/* Step Title and Description */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Details List */}
                    <ul className="space-y-2 ml-16">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Form Preview */}
                  {step.showFormPreview && step.formPreview && renderFormPreview(step.formPreview)}
                  
                  {/* Image Preview */}
                  {step.showImagePreview && renderImagePreview()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Help */}
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
            💡 Consejos Adicionales
          </h3>
          <ul className="space-y-2 text-indigo-800 dark:text-indigo-200">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>El sistema guarda automáticamente tu progreso mientras completas el formulario, así que no perderás información si cierras la página.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Puedes guardar como borrador y continuar editando más tarde antes de publicar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Las imágenes de buena calidad aumentan las posibilidades de que tu propiedad sea vista por más clientes potenciales.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Completa todos los campos requeridos (marcados con *) para asegurar que la propiedad tenga toda la información necesaria.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
