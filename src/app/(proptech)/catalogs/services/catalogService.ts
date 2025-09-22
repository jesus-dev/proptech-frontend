// Servicio unificado para todos los catálogos
import { AgentRole } from '../agents/types';

export interface Country {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  departmentId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  description?: string;
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  // Datos del usuario (vienen de la relación con User)
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Datos específicos del agente
  dni?: string;
  license?: string;
  position?: string;
  bio?: string;
  photo?: string;
  agencyId?: string;
  agencyName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  role: AgentRole;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  country?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generic CRUD operations
const createGenericService = <T extends { id: string }>(
  storageKey: string,
  generateId: () => string
) => {
  const getAll = (): Promise<T[]> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(storageKey);
        resolve(data ? JSON.parse(data) : []);
      } else {
        resolve([]);
      }
    });
  };

  const getById = (id: string): Promise<T | null> => {
    return new Promise(async (resolve) => {
      const items = await getAll();
      const item = items.find(item => item.id === id);
      resolve(item || null);
    });
  };

  const create = (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> => {
    return new Promise(async (resolve) => {
      const items = await getAll();
      const newItem = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as T;
      
      items.push(newItem);
      localStorage.setItem(storageKey, JSON.stringify(items));
      resolve(newItem);
    });
  };

  const update = (id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> => {
    return new Promise(async (resolve) => {
      const items = await getAll();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        resolve(null);
        return;
      }

      items[index] = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(storageKey, JSON.stringify(items));
      resolve(items[index]);
    });
  };

  const remove = (id: string): Promise<boolean> => {
    return new Promise(async (resolve) => {
      const items = await getAll();
      const filteredItems = items.filter(item => item.id !== id);
      
      if (filteredItems.length === items.length) {
        resolve(false);
        return;
      }
      
      localStorage.setItem(storageKey, JSON.stringify(filteredItems));
      resolve(true);
    });
  };

  const getActive = (): Promise<T[]> => {
    return new Promise(async (resolve) => {
      const items = await getAll();
      resolve(items.filter(item => (item as any).active !== false));
    });
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    getActive,
  };
};

// Generate unique IDs
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create services for each catalog
export const countryService = createGenericService<Country>('countries', generateId);
// export const cityService = createGenericService<City>('cities', generateId);
// export const departmentService = createGenericService<Department>('departments', generateId);
// export const neighborhoodService = createGenericService<Neighborhood>('neighborhoods', generateId);
export const propertyTypeService = createGenericService<PropertyType>('propertyTypes', generateId);
export const serviceService = createGenericService<Service>('services', generateId);
export const amenityService = createGenericService<Amenity>('amenities', generateId);
export const agencyService = createGenericService<Agency>('agencies', generateId);
export const agentService = createGenericService<Agent>('agents', generateId);
export const currencyService = createGenericService<Currency>('currencies', generateId);

// Importar y reexportar los servicios que consumen el backend
export * as cityService from '../cities/services/cityService';
export * as departmentService from '../departments/services/departmentService';
export * as neighborhoodService from '../neighborhoods/services/neighborhoodService';

// Specialized methods for dependent catalogs
export const catalogService = {
  // Countries
  ...countryService,
  
  // Cities with country dependency
  // ...cityService,
  getCitiesByCountry: async (countryId: string): Promise<City[]> => {
    return [];
  },
  
  // Neighborhoods with city dependency
  // ...neighborhoodService,
  getNeighborhoodsByCity: async (cityId: string): Promise<Neighborhood[]> => {
    return [];
  },
  
  // Property Types
  ...propertyTypeService,
  
  // Services
  ...serviceService,
  
  // Amenities
  ...amenityService,
  getAmenitiesByCategory: async (category?: string): Promise<Amenity[]> => {
    return [];
  },
  
  // Agencies
  ...agencyService,
  
  // Agents with agency dependency
  ...agentService,
  getAgentsByAgency: async (agencyId: string): Promise<Agent[]> => {
    return [];
  },
  
  // Update agent agency names when agency is updated
  updateAgentAgencyNames: async (agencyId: string, agencyName: string): Promise<void> => {
    // const agents = await agentService.getAll();
    // const agentsToUpdate = agents.filter(agent => agent.agencyId === agencyId);
    
    // for (const agent of agentsToUpdate) {
    //   await agentService.update(agent.id, { agencyName });
    // }
  },
  
  // Remove agency from agents when agency is deleted
  removeAgencyFromAgents: async (agencyId: string): Promise<void> => {
    // const agents = await agentService.getAll();
    // const agentsToUpdate = agents.filter(agent => agent.agencyId === agencyId);
    
    // for (const agent of agentsToUpdate) {
    //   await agentService.update(agent.id, { agencyId: undefined, agencyName: undefined });
    // }
  },
  
  // Initialize with sample data
  initializeSampleData: async () => {
    // Check if data already exists
    const countries = await countryService.getAll();
    if (countries.length > 0) return; // Data already exists
    
    // Create sample countries - only Paraguay
    const paraguay = await countryService.create({
      name: "Paraguay", 
      code: "PY",
      active: true,
    });
    
    // Create sample cities - only Paraguayan cities
    // const asuncion = await cityService.create({
    //   name: "Asunción",
    //   departmentId: "11",
    //   active: true,
    // });
    
    // const sanLorenzo = await cityService.create({
    //   name: "San Lorenzo",
    //   departmentId: "11",
    //   active: true,
    // });
    
    // const luque = await cityService.create({
    //   name: "Luque",
    //   departmentId: "11",
    //   active: true,
    // });
    
    // const capiata = await cityService.create({
    //   name: "Capiatá",
    //   departmentId: "11",
    //   active: true,
    // });
    
    // const ciudadDelEste = await cityService.create({
    //   name: "Ciudad del Este",
    //   departmentId: "10",
    // });
    
    // Create sample neighborhoods - Paraguayan neighborhoods
    // await neighborhoodService.create({
    //   name: "Villa Morra",
    //   cityId: asuncion.id,
    //   cityName: asuncion.name,
    //   active: true,
    // });
    
    // await neighborhoodService.create({
    //   name: "Carmelitas",
    //   cityId: asuncion.id,
    //   cityName: asuncion.name,
    //   active: true,
    // });
    
    // await neighborhoodService.create({
    //   name: "Centro",
    //   cityId: asuncion.id,
    //   cityName: asuncion.name,
    //   active: true,
    // });
    
    // await neighborhoodService.create({
    //   name: "San Lorenzo Centro",
    //   cityId: sanLorenzo.id,
    //   cityName: sanLorenzo.name,
    //   active: true,
    // });
    
    // Create sample property types
    // await propertyTypeService.create({
    //   name: "Casa",
    //   description: "Vivienda unifamiliar",
    //   active: true,
    // });
    
    // await propertyTypeService.create({
    //   name: "Departamento",
    //   description: "Unidad residencial en edificio",
    //   active: true,
    // });
    
    // await propertyTypeService.create({
    //   name: "Casa Quinta",
    //   description: "Casa con terreno amplio",
    //   active: true,
    // });
    
    // await propertyTypeService.create({
    //   name: "Duplex",
    //   description: "Vivienda de dos niveles",
    //   active: true,
    // });
    
    // await propertyTypeService.create({
    //   name: "Local Comercial",
    //   description: "Espacio para negocio",
    //   active: true,
    // });
    
    // await propertyTypeService.create({
    //   name: "Oficina",
    //   description: "Espacio de trabajo",
    //   active: true,
    // });
    
    // await propertyTypeService.create({
    //   name: "Terreno",
    //   description: "Lote para construcción",
    //   active: true,
    // });
    
    // Create sample services
    // await serviceService.create({
    //   name: "Agua",
    //   description: "Servicio de agua potable",
    //   active: true,
    // });
    
    // await serviceService.create({
    //   name: "Electricidad",
    //   description: "Servicio eléctrico",
    //   active: true,
    // });
    
    // await serviceService.create({
    //   name: "Gas",
    //   description: "Servicio de gas natural",
    //   active: true,
    // });
    
    // await serviceService.create({
    //   name: "Internet",
    //   description: "Servicio de internet",
    //   active: true,
    // });
    
    // await serviceService.create({
    //   name: "Cable TV",
    //   description: "Servicio de televisión por cable",
    //   active: true,
    // });
    
    // Create sample amenities
    // await amenityService.create({
    //   name: "Piscina",
    //   description: "Piscina privada o comunitaria",
    //   category: "Recreación",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Gimnasio",
    //   description: "Gimnasio equipado",
    //   category: "Deportes",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Jardín",
    //   description: "Jardín privado o común",
    //   category: "Exterior",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Estacionamiento",
    //   description: "Estacionamiento cubierto o descubierto",
    //   category: "Estacionamiento",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Aire acondicionado",
    //   description: "Sistema de aire acondicionado",
    //   category: "Climatización",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Calefacción",
    //   description: "Sistema de calefacción",
    //   category: "Climatización",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Balcón",
    //   description: "Balcón privado",
    //   category: "Exterior",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Terraza",
    //   description: "Terraza privada o común",
    //   category: "Exterior",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Seguridad 24h",
    //   description: "Servicio de seguridad las 24 horas",
    //   category: "Seguridad",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Ascensor",
    //   description: "Ascensor en el edificio",
    //   category: "Accesibilidad",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Amueblado",
    //   description: "Propiedad amueblada",
    //   category: "Mobiliario",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Se admiten mascotas",
    //   description: "Permite mascotas",
    //   category: "Mascotas",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Lavandería",
    //   description: "Servicio de lavandería",
    //   category: "Servicios",
    //   active: true,
    // });
    
    // await amenityService.create({
    //   name: "Bodega",
    //   description: "Bodega incluida",
    //   category: "Almacenamiento",
    //   active: true,
    // });
    
    // Create sample currencies - focus on Paraguayan currency
    // await currencyService.create({
    //   code: "PYG",
    //   name: "Guaraní Paraguayo",
    //   symbol: "Gs.",
    //   country: "Paraguay",
    //   active: true,
    // });
    
    // await currencyService.create({
    //   code: "USD",
    //   name: "Dólar Americano",
    //   symbol: "$",
    //   country: "Estados Unidos",
    //   active: true,
    // });
    
    // Create sample agencies - Paraguayan agencies
    // const agency1 = await agencyService.create({
    //   name: "Inmobiliaria Paraguay",
    //   address: "Av. España 1234, Asunción",
    //   phone: "+595 21 555-1234",
    //   email: "info@inmobiliariaparaguay.com",
    //   website: "www.inmobiliariaparaguay.com",
    //   logo: "",
    //   description: "Agencia líder en el mercado inmobiliario paraguayo.",
    //   active: true,
    // });
    // const agency2 = await agencyService.create({
    //   name: "Propiedades del Sur",
    //   address: "Calle Palma 456, Asunción",
    //   phone: "+595 21 555-5678",
    //   email: "info@propiedadesdelsur.com",
    //   website: "www.propiedadesdelsur.com",
    //   logo: "",
    //   description: "Especialistas en propiedades residenciales y comerciales en Paraguay.",
    //   active: true,
    // });
    
    // Create sample agents - Paraguayan agents
    // await agentService.create({
    //   firstName: "María",
    //   lastName: "González",
    //   email: "maria.gonzalez@inmobiliaria.com",
    //   phone: "+595 981 123-456",
    //   dni: "12345678",
    //   license: "AG-001",
    //   position: "Agente Principal",
    //   bio: "Especialista en propiedades residenciales con más de 10 años de experiencia en el mercado paraguayo.",
    //   agencyId: agency1.id,
    //   agencyName: agency1.name,
    //   active: true,
    // });
    // await agentService.create({
    //   firstName: "Carlos",
    //   lastName: "Rodríguez",
    //   email: "carlos.rodriguez@inmobiliaria.com",
    //   phone: "+595 982 987-654",
    //   dni: "87654321",
    //   license: "AG-002",
    //   position: "Agente Comercial",
    //   bio: "Experto en propiedades comerciales e inversiones en Paraguay.",
    //   agencyId: agency1.id,
    //   agencyName: agency1.name,
    //   active: true,
    // });
    // await agentService.create({
    //   firstName: "Ana",
    //   lastName: "Martínez",
    //   email: "ana.martinez@inmobiliaria.com",
    //   phone: "+595 983 555-123",
    //   dni: "11223344",
    //   license: "AG-003",
    //   position: "Agente Junior",
    //   bio: "Nueva agente especializada en atención al cliente en el mercado inmobiliario paraguayo.",
    //   agencyId: agency2.id,
    //   agencyName: agency2.name,
    //   active: true,
    // });
  }
}; 