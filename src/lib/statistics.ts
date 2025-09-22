// Configuración centralizada de estadísticas del sitio
export interface SiteStatistics {
  properties: {
    total: number;
    forSale: number;
    forRent: number;
    featured: number;
  };
  agents: {
    total: number;
    active: number;
  };
  clients: {
    total: number;
    satisfied: number;
  };
  locations: {
    total: number;
  };
  support: {
    availability: string;
  };
  experience: {
    years: number;
  };
  // Estadísticas dinámicas que se pueden calcular desde el backend
  dynamic?: {
    totalProperties?: number;
    totalAgents?: number;
    totalClients?: number;
    totalLocations?: number;
  };
}

// Configuración por defecto de estadísticas
export const DEFAULT_STATISTICS: SiteStatistics = {
  properties: {
    total: +150,
    forSale: 0,
    forRent: 0,
    featured: 0,
  },
  agents: {
    total: +5,
    active: 5,
  },
  clients: {
    total: +75,
    satisfied: 150,
  },
  locations: {
    total: 15,
  },
  support: {
    availability: "24/7",
  },
  experience: {
    years: new Date().getFullYear() - 2020,
  },
};

// Función para obtener estadísticas con valores dinámicos
export const getSiteStatistics = async (): Promise<SiteStatistics> => {
  try {
    // Aquí puedes hacer llamadas al backend para obtener estadísticas reales
    // Por ahora usamos las estadísticas por defecto
    return DEFAULT_STATISTICS;
  } catch (error) {
    console.error('Error loading site statistics:', error);
    return DEFAULT_STATISTICS;
  }
};

// Función para obtener estadísticas específicas para páginas de propiedades
export const getPropertyPageStats = (propertiesCount: number = 0) => {
  const stats = DEFAULT_STATISTICS;
  
  return {
    properties: propertiesCount,
    locations: stats.locations.total,
    clients: stats.clients.total,
    support: stats.support.availability,
  };
};

// Función para obtener estadísticas de la página "Nosotros"
export const getAboutPageStats = () => {
  const stats = DEFAULT_STATISTICS;
  
  return [
    {
      number: `${stats.experience.years}+`,
      label: "Años de Experiencia",
      icon: "ClockIcon",
    },
    {
      number: `${stats.properties.total}+`,
      label: "Propiedades Vendidas",
      icon: "HomeIcon",
    },
    {
      number: `${stats.clients.satisfied}+`,
      label: "Clientes Satisfechos",
      icon: "UserGroupIcon",
    },
    {
      number: `${stats.agents.total}+`,
      label: "Agentes Expertos",
      icon: "BuildingOfficeIcon",
    },
  ];
};

// Función para obtener estadísticas del dashboard
export const getDashboardStats = () => {
  const stats = DEFAULT_STATISTICS;
  
  return {
    totalProperties: stats.properties.total,
    totalAgents: stats.agents.total,
    totalClients: stats.clients.total,
    activeProperties: stats.properties.forSale + stats.properties.forRent,
  };
};

// Función para actualizar estadísticas dinámicamente
export const updateStatistics = (newStats: Partial<SiteStatistics>) => {
  // Aquí puedes implementar la lógica para actualizar las estadísticas
  // Por ejemplo, guardar en localStorage o hacer llamadas al backend
  console.log('Updating statistics:', newStats);
};

// Función para formatear números con el sufijo "+"
export const formatStatNumber = (number: number): string => {
  return `${number}+`;
};

// Función para obtener estadísticas con formato específico
export const getFormattedStats = (stats: SiteStatistics) => {
  return {
    properties: formatStatNumber(stats.properties.total),
    agents: formatStatNumber(stats.agents.total),
    clients: formatStatNumber(stats.clients.total),
    locations: formatStatNumber(stats.locations.total),
    years: formatStatNumber(stats.experience.years),
    support: stats.support.availability,
  };
}; 