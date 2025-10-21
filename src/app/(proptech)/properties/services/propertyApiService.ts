import { Property } from '../components/types';
import { propertyApi, ApiResponse, PaginatedResponse } from '@/lib/api';

export interface BackendProperty {
  id: number;
  titulo: string;
  descripcion: string;
  zona: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  barrio: string;
  descripcionUbicacion: string;
  latitud: number;
  longitud: number;
  habitaciones: number;
  banos: number;
  garajes: number;
  area: number;
  tamanoLote: number;
  cuartos: number;
  cocinas: number;
  pisos: number;
  anoConstruccion: number;
  disponibleDesde: string;
  detallesAdicionales: string;
  videoUrl: string;
  tourVirtualUrl: string;
  imagenDestacada: string;
  etiquetaPropiedad: string;
  estadoPropiedad: string;
  tipoPropiedad: string;
  etiquetaTipo: string;
  etiquetaEstado: string;
  etiquetaPrecio: string;
  amenidades: string;
  servicios: string;
  archivosPrivados: string;
  imagenesGaleria: string;
  precio: number;
  moneda: string;
  tipoId: number;
  estadoId: number;
  ciudadId: number;
  agenciaId: number;
  wordpressId: number;
  syncStatus: string;
  syncError: string;
  imagenes: Array<{
    id: number;
    url: string;
    altText: string;
    orden: number;
    esPrincipal: boolean;
  }>;
}

export interface BackendPropertyDetailed extends BackendProperty {
  tipo: {
    id: number;
    nombre: string;
    descripcion: string;
    slug: string;
  };
  estadoRelacion: {
    id: number;
    nombre: string;
    descripcion: string;
    slug: string;
  };
  ciudadRelacion: {
    id: number;
    nombre: string;
    estado: string;
    pais: string;
  };
  agencia: {
    id: number;
    nombre: string;
    descripcion: string;
    direccion: string;
    telefono: string;
    email: string;
    sitioWeb: string;
    logoUrl: string;
  };
}

// Función para normalizar el status de la propiedad
function normalizePropertyStatus(status: string | undefined): string {
  if (!status) return "active";
  
  const statusLower = status.toLowerCase();
  
  // Estados que se consideran "activo"
  if (statusLower === "disponible" || statusLower === "active" || statusLower === "activo" || statusLower === "activa") {
    return "active";
  }
  
  // Cualquier otro estado se considera "inactive"
  return "inactive";
}

function mapBackendToFrontend(backend: BackendProperty): Property {
  return {
    id: backend.id.toString(),
    title: backend.titulo,
    address: backend.direccion,
    city: backend.ciudad,
    state: backend.estado,
    zip: backend.codigoPostal,
    price: backend.precio,
    currency: backend.moneda as any,
    type: backend.tipoPropiedad || 'Casa',
    status: normalizePropertyStatus(backend.estadoPropiedad),
    description: backend.descripcion,
    images: backend.imagenes?.map(img => img.url) || [],
    bedrooms: backend.habitaciones,
    bathrooms: backend.banos,
    area: backend.area,
    amenities: backend.amenidades ? JSON.parse(backend.amenidades) : [],
    services: backend.servicios ? JSON.parse(backend.servicios) : [],
    privateFiles: backend.archivosPrivados ? JSON.parse(backend.archivosPrivados) : [],
    featured: backend.etiquetaPropiedad === 'Destacada',
    premium: backend.etiquetaPropiedad === 'Premium',
    agent: {
      name: 'Agente',
      email: 'agente@example.com',
      phone: '+595 985 940797',
      photo: '/images/user/user-01.png'
    },
    yearBuilt: backend.anoConstruccion,
    parking: backend.garajes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    latitude: backend.latitud,
    longitude: backend.longitud,
    lotSize: backend.tamanoLote,
    rooms: backend.cuartos,
    kitchens: backend.cocinas,
    floors: backend.pisos,
    availableFrom: backend.disponibleDesde,
    additionalDetails: backend.detallesAdicionales,
    country: backend.pais,
    neighborhood: backend.barrio,
    locationDescription: backend.descripcionUbicacion,
    videoUrl: backend.videoUrl,
    virtualTourUrl: backend.tourVirtualUrl,
    featuredImage: backend.imagenDestacada,
    propertyId: backend.id.toString(),
    propertyStatus: backend.estadoPropiedad,
    propertyLabel: backend.etiquetaPropiedad,
    propertyType: backend.tipoPropiedad,
    propertyTypeLabel: backend.etiquetaTipo,
    propertyStatusLabel: backend.etiquetaEstado,
    propertyPrice: backend.precio,
    propertyPriceLabel: backend.etiquetaPrecio,
    propertyBedrooms: backend.habitaciones,
    propertyBathrooms: backend.banos,
    propertyGarage: backend.garajes,
    propertySize: backend.area,
    propertyLotSize: backend.tamanoLote,
    propertyRooms: backend.cuartos,
    propertyKitchens: backend.cocinas,
    propertyFloors: backend.pisos,
    propertyYearBuilt: backend.anoConstruccion,
    propertyAvailableFrom: backend.disponibleDesde,
    propertyAdditionalDetails: backend.detallesAdicionales,
    propertyAddress: backend.direccion,
    propertyCity: backend.ciudad,
    propertyState: backend.estado,
    propertyZip: backend.codigoPostal,
    propertyCountry: backend.pais,
    propertyNeighborhood: backend.barrio,
    propertyLocationDescription: backend.descripcionUbicacion,
    propertyVideoUrl: backend.videoUrl,
    propertyVirtualTourUrl: backend.tourVirtualUrl,
    propertyFeaturedImage: backend.imagenDestacada,
    propertyGalleryImages: backend.imagenesGaleria ? JSON.parse(backend.imagenesGaleria) : [],
    propertyPrivateFiles: backend.archivosPrivados ? JSON.parse(backend.archivosPrivados) : [],
    propertyAmenities: backend.amenidades ? JSON.parse(backend.amenidades) : [],
    propertyServices: backend.servicios ? JSON.parse(backend.servicios) : [],
    propertyAgent: {
      name: 'Agente',
      email: 'agente@example.com',
      phone: '+595 985 940797',
      photo: '/images/user/user-01.png'
    }
  };
}

function mapBackendDetailedToFrontend(backend: BackendPropertyDetailed): Property {
  const basic = mapBackendToFrontend(backend);
  
  // Agregar información detallada de las relaciones
  if (backend.tipo) {
    basic.propertyType = backend.tipo.nombre;
    basic.propertyTypeLabel = backend.tipo.nombre;
  }
  
  if (backend.estadoRelacion) {
    basic.propertyStatus = backend.estadoRelacion.nombre;
    basic.propertyStatusLabel = backend.estadoRelacion.nombre;
  }
  
  if (backend.ciudadRelacion) {
    basic.propertyCity = backend.ciudadRelacion.nombre;
    basic.propertyState = backend.ciudadRelacion.estado;
    basic.propertyCountry = backend.ciudadRelacion.pais;
  }
  
  if (backend.agencia) {
    basic.propertyAgent = {
      name: backend.agencia.nombre,
      email: backend.agencia.email,
      phone: backend.agencia.telefono,
      photo: backend.agencia.logoUrl || '/images/user/user-01.png'
    };
  }
  
  return basic;
}

function mapFrontendToBackend(frontend: Partial<Property>): Partial<BackendProperty> {
  return {
    titulo: frontend.title,
    descripcion: frontend.description,
    zona: frontend.neighborhood,
    direccion: frontend.address,
    ciudad: frontend.city,
    estado: frontend.state,
    codigoPostal: frontend.zip,
    pais: frontend.country,
    barrio: frontend.neighborhood,
    descripcionUbicacion: frontend.locationDescription,
    latitud: frontend.latitude,
    longitud: frontend.longitude,
    habitaciones: frontend.bedrooms,
    banos: frontend.bathrooms,
    garajes: frontend.parking,
    area: frontend.area,
    tamanoLote: frontend.lotSize,
    cuartos: frontend.rooms,
    cocinas: frontend.kitchens,
    pisos: frontend.floors,
    anoConstruccion: frontend.yearBuilt,
    disponibleDesde: frontend.availableFrom,
    detallesAdicionales: frontend.additionalDetails,
    videoUrl: frontend.videoUrl,
    tourVirtualUrl: frontend.virtualTourUrl,
    imagenDestacada: frontend.featuredImage,
    etiquetaPropiedad: frontend.propertyLabel,
    estadoPropiedad: frontend.status,
    tipoPropiedad: frontend.type,
    etiquetaTipo: frontend.propertyTypeLabel,
    etiquetaEstado: frontend.propertyStatusLabel,
    etiquetaPrecio: frontend.propertyPriceLabel,
    amenidades: frontend.amenities ? JSON.stringify(frontend.amenities) : undefined,
    servicios: frontend.services ? JSON.stringify(frontend.services) : undefined,
    archivosPrivados: frontend.privateFiles ? JSON.stringify(frontend.privateFiles) : undefined,
    imagenesGaleria: frontend.propertyGalleryImages ? JSON.stringify(frontend.propertyGalleryImages) : undefined,
    precio: frontend.price,
    moneda: frontend.currency
  };
}

export const propertyApiService = {
  async getProperties(): Promise<Property[]> {
    try {
      const response = await propertyApi.getAll();
      if (response.success && response.data) {
        return response.data.content.map(mapBackendToFrontend);
      }
      return [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const response = await propertyApi.getDetailedById(id);
      if (response.success && response.data) {
        return mapBackendDetailedToFrontend(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  },

  async createProperty(property: Partial<Property>): Promise<Property> {
    try {
      const backendProperty = mapFrontendToBackend(property);
      const response = await propertyApi.create(backendProperty);
      if (response.success && response.data) {
        return mapBackendToFrontend(response.data);
      }
      throw new Error('Failed to create property');
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    try {
      const backendProperty = mapFrontendToBackend(property);
      const response = await propertyApi.update(id, backendProperty);
      if (response.success && response.data) {
        return mapBackendToFrontend(response.data);
      }
      throw new Error('Failed to update property');
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  async deleteProperty(id: string): Promise<void> {
    try {
      const response = await propertyApi.delete(id);
      if (!response.success) {
        throw new Error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Función para verificar si la API está disponible
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await propertyApi.getAll({ page: 1, size: 1 });
      return response.success;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  // Función para obtener propiedades con paginación
  async getPropertiesPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Property>> {
    try {
      const response = await propertyApi.getAll({ page, size: limit });
      if (response.success && response.data) {
        return {
          ...response.data,
          content: response.data.content.map(mapBackendToFrontend)
        };
      }
      throw new Error('Failed to fetch paginated properties');
    } catch (error) {
      console.error('Error fetching paginated properties:', error);
      throw error;
    }
  }
}; 