export const SERVICE_TYPES = [
  { value: "ELECTRICIAN", label: "Electricista", icon: "⚡", description: "Instalaciones eléctricas, reparaciones y mantenimiento" },
  { value: "CARPENTER", label: "Carpintero", icon: "🔨", description: "Muebles, reparaciones en madera y carpintería general" },
  { value: "CLEANING", label: "Limpieza", icon: "🧹", description: "Limpieza de hogares, oficinas y espacios comerciales" },
  { value: "MAINTENANCE", label: "Mantenimiento", icon: "🔧", description: "Mantenimiento general del hogar y reparaciones" },
  { value: "PLUMBER", label: "Plomero", icon: "🚿", description: "Instalaciones y reparaciones de plomería" },
  { value: "PAINTER", label: "Pintor", icon: "🎨", description: "Pintura de interiores y exteriores" },
  { value: "GARDENER", label: "Jardinero", icon: "🌳", description: "Jardinería, paisajismo y mantenimiento de espacios verdes" },
  { value: "LOCKSMITH", label: "Cerrajero", icon: "🔐", description: "Apertura de puertas, cerraduras y seguridad" },
  { value: "AIR_CONDITIONING", label: "Aire Acondicionado", icon: "❄️", description: "Instalación y reparación de sistemas de climatización" },
  { value: "APPLIANCE_REPAIR", label: "Reparación de Electrodomésticos", icon: "🔌", description: "Reparación de electrodomésticos y equipos" },
  { value: "FLOORING", label: "Pisos y Revestimientos", icon: "🏠", description: "Instalación de pisos, cerámicos y revestimientos" },
  { value: "ROOFING", label: "Techista", icon: "🏡", description: "Reparación y construcción de techos" },
  { value: "GLASSWORK", label: "Vidriería", icon: "🪟", description: "Instalación y reparación de vidrios" },
  { value: "WELDER", label: "Soldador", icon: "🔥", description: "Soldadura y trabajos en metal" },
  { value: "MASON", label: "Albañil", icon: "🧱", description: "Construcción, albañilería y trabajos en obra" },
  { value: "DECORATOR", label: "Decorador", icon: "✨", description: "Decoración de interiores y diseño" },
  { value: "MOVING", label: "Mudanzas", icon: "📦", description: "Servicios de mudanza y transporte" },
  { value: "PEST_CONTROL", label: "Control de Plagas", icon: "🐛", description: "Fumigación y control de plagas" },
  { value: "SECURITY", label: "Seguridad", icon: "🛡️", description: "Instalación de sistemas de seguridad" },
  { value: "OTHER", label: "Otro", icon: "🔧", description: "Otros servicios del hogar" }
] as const;

export type ServiceType = typeof SERVICE_TYPES[number]['value'];

export const SERVICE_STATUS = [
  { value: "ACTIVE", label: "Activo", color: "green" },
  { value: "PENDING", label: "Pendiente", color: "yellow" },
  { value: "INACTIVE", label: "Inactivo", color: "gray" },
  { value: "SUSPENDED", label: "Suspendido", color: "red" }
] as const;

export type ServiceStatus = typeof SERVICE_STATUS[number]['value'];

