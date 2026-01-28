import { Property } from "../components/types";
import { apiClient } from '@/lib/api';

export interface RecommendationCriteria {
  priceRange?: {
    min: number;
    max: number;
  };
  preferredLocations?: string[];
  preferredTypes?: string[];
  preferredAmenities?: string[];
  bedrooms?: {
    min: number;
    max: number;
  };
  bathrooms?: {
    min: number;
    max: number;
  };
  area?: {
    min: number;
    max: number;
  };
}

export interface RecommendationScore {
  priceMatch: number;
  locationMatch: number;
  typeMatch: number;
  amenityMatch: number;
  popularity: number;
  urgency: number;
  investmentPotential: number;
  marketTrend: number;
  totalScore: number;
  explanations: string[];
}

export interface PropertyRecommendation {
  property: Property;
  score: RecommendationScore;
}

export interface UserBehaviorRequest {
  userId: number;
  propertyId: string;
  action: 'view' | 'favorite' | 'contact' | 'search';
}

export interface RecommendationStats {
  totalRecommendations: number;
  averageScore: number;
  topCategories: string[];
  topLocations: string[];
  priceRange: {
    min: number;
    max: number;
  };
  lastUpdated: number;
}

class RecommendationApiService {
  private async makeRequest<T>(endpoint: string, options?: { method?: string; data?: any }): Promise<T> {
    try {
      const method = options?.method || 'GET';
      const data = options?.data;
      
      let response;
      if (method === 'GET') {
        response = await apiClient.get(endpoint);
      } else if (method === 'POST') {
        response = await apiClient.post(endpoint, data);
      } else if (method === 'PUT') {
        response = await apiClient.put(endpoint, data);
      } else if (method === 'DELETE') {
        response = await apiClient.delete(endpoint);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }

      const responseData = response.data;
      
      if (responseData && !responseData.success && responseData.error) {
        throw new Error(responseData.error || 'Error en la respuesta del servidor');
      }

      return responseData?.data || responseData;
    } catch (error) {
      console.error('Error en recomendationService:', error);
      throw error;
    }
  }

  /**
   * Obtiene recomendaciones inteligentes para un usuario
   */
  async getSmartRecommendations(userId: number, limit: number = 12): Promise<PropertyRecommendation[]> {
    return this.makeRequest<PropertyRecommendation[]>(`/api/recommendations/smart/${userId}?limit=${limit}`);
  }

  /**
   * Obtiene recomendaciones personalizadas basadas en criterios específicos
   */
  async getCustomRecommendations(
    userId: number, 
    criteria: RecommendationCriteria, 
    limit: number = 12
  ): Promise<PropertyRecommendation[]> {
    return this.makeRequest<PropertyRecommendation[]>(`/api/recommendations/custom/${userId}?limit=${limit}`, {
      method: 'POST',
      data: criteria,
    });
  }

  /**
   * Obtiene propiedades similares a una propiedad específica
   */
  async getSimilarProperties(propertyId: number, limit: number = 6): Promise<Property[]> {
    return this.makeRequest<Property[]>(`/api/recommendations/similar/${propertyId}?limit=${limit}`);
  }

  /**
   * Registra comportamiento del usuario para mejorar recomendaciones
   */
  async recordUserBehavior(request: UserBehaviorRequest): Promise<void> {
    return this.makeRequest<void>('/api/recommendations/behavior', {
      method: 'POST',
      data: request,
    });
  }

  /**
   * Obtiene estadísticas de recomendaciones
   */
  async getRecommendationStats(userId: number): Promise<RecommendationStats> {
    return this.makeRequest<RecommendationStats>(`/api/recommendations/stats/${userId}`);
  }

  /**
   * Obtiene recomendaciones de tendencias del mercado
   */
  async getTrendingRecommendations(limit: number = 8): Promise<PropertyRecommendation[]> {
    return this.makeRequest<PropertyRecommendation[]>(`/api/recommendations/trending?limit=${limit}`);
  }

  /**
   * Registra que un usuario vio una propiedad
   */
  async recordPropertyView(userId: number, propertyId: number): Promise<void> {
    return this.recordUserBehavior({
      userId,
      propertyId: propertyId.toString(),
      action: 'view'
    });
  }

  /**
   * Registra que un usuario marcó una propiedad como favorita
   */
  async recordPropertyFavorite(userId: number, propertyId: number): Promise<void> {
    return this.recordUserBehavior({
      userId,
      propertyId: propertyId.toString(),
      action: 'favorite'
    });
  }

  /**
   * Registra que un usuario contactó sobre una propiedad
   */
  async recordPropertyContact(userId: number, propertyId: number): Promise<void> {
    return this.recordUserBehavior({
      userId,
      propertyId: propertyId.toString(),
      action: 'contact'
    });
  }

  /**
   * Registra una búsqueda del usuario
   */
  async recordSearch(userId: number, searchQuery: string): Promise<void> {
    return this.recordUserBehavior({
      userId,
      propertyId: searchQuery,
      action: 'search'
    });
  }
}

// Instancia singleton del servicio
const recommendationApiService = new RecommendationApiService();

class RecommendationService {
  private apiService = recommendationApiService;

  /**
   * Obtiene recomendaciones inteligentes
   */
  async getSmartRecommendations(userId: number, limit?: number): Promise<PropertyRecommendation[]> {
    return this.apiService.getSmartRecommendations(userId, limit);
  }

  /**
   * Obtiene recomendaciones personalizadas
   */
  async getCustomRecommendations(
    userId: number, 
    criteria: RecommendationCriteria, 
    limit?: number
  ): Promise<PropertyRecommendation[]> {
    return this.apiService.getCustomRecommendations(userId, criteria, limit);
  }

  /**
   * Obtiene propiedades similares
   */
  async getSimilarProperties(propertyId: number, limit?: number): Promise<Property[]> {
    return this.apiService.getSimilarProperties(propertyId, limit);
  }

  /**
   * Registra comportamiento del usuario
   */
  async recordUserBehavior(request: UserBehaviorRequest): Promise<void> {
    return this.apiService.recordUserBehavior(request);
  }

  /**
   * Obtiene estadísticas de recomendaciones
   */
  async getRecommendationStats(userId: number): Promise<RecommendationStats> {
    return this.apiService.getRecommendationStats(userId);
  }

  /**
   * Obtiene recomendaciones de tendencias
   */
  async getTrendingRecommendations(limit?: number): Promise<PropertyRecommendation[]> {
    return this.apiService.getTrendingRecommendations(limit);
  }

  /**
   * Registra vista de propiedad
   */
  async recordPropertyView(userId: number, propertyId: number): Promise<void> {
    return this.apiService.recordPropertyView(userId, propertyId);
  }

  /**
   * Registra favorito de propiedad
   */
  async recordPropertyFavorite(userId: number, propertyId: number): Promise<void> {
    return this.apiService.recordPropertyFavorite(userId, propertyId);
  }

  /**
   * Registra contacto de propiedad
   */
  async recordPropertyContact(userId: number, propertyId: number): Promise<void> {
    return this.apiService.recordPropertyContact(userId, propertyId);
  }

  /**
   * Registra búsqueda
   */
  async recordSearch(userId: number, searchQuery: string): Promise<void> {
    return this.apiService.recordSearch(userId, searchQuery);
  }

  /**
   * Genera recomendaciones locales (fallback cuando no hay API)
   */
  generateLocalRecommendations(
    properties: Property[], 
    criteria: RecommendationCriteria,
    limit: number = 12
  ): PropertyRecommendation[] {
    const scoredProperties = properties.map(property => {
      const score = this.calculateLocalScore(property, criteria);
      return {
        property,
        score
      };
    });

    return scoredProperties
      .filter(rec => rec.score.totalScore > 0.3)
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, limit);
  }

  /**
   * Calcula score local para una propiedad
   */
  private calculateLocalScore(property: Property, criteria: RecommendationCriteria): RecommendationScore {
    const score: RecommendationScore = {
      priceMatch: 0,
      locationMatch: 0,
      typeMatch: 0,
      amenityMatch: 0,
      popularity: 0,
      urgency: 0,
      investmentPotential: 0,
      marketTrend: 0,
      totalScore: 0,
      explanations: []
    };

    // Factor de precio
    if (criteria.priceRange) {
      const price = property.price || 0;
      const { min, max } = criteria.priceRange;
      
      if (price >= min && price <= max) {
        score.priceMatch = 1;
        score.explanations.push("✅ Perfecto para tu presupuesto");
      } else if (price < min) {
        score.priceMatch = 0.8;
        score.explanations.push("💰 Por debajo de tu presupuesto");
      } else {
        score.priceMatch = Math.max(0, 1 - (price - max) / max);
      }
    } else {
      score.priceMatch = 0.5;
    }

    // Factor de ubicación
    if (criteria.preferredLocations && criteria.preferredLocations.length > 0) {
      const propertyLocation = property.city?.toLowerCase() || '';
      const locationMatch = criteria.preferredLocations.some(loc => 
        propertyLocation.includes(loc.toLowerCase())
      );
      
      if (locationMatch) {
        score.locationMatch = 1;
        score.explanations.push("📍 En tu zona preferida");
      } else {
        score.locationMatch = 0.3;
      }
    } else {
      score.locationMatch = 0.5;
    }

    // Factor de tipo
    if (criteria.preferredTypes && criteria.preferredTypes.length > 0) {
      const propertyType = property.type?.toLowerCase() || '';
      const typeMatch = criteria.preferredTypes.some(type => 
        propertyType.includes(type.toLowerCase())
      );
      
      if (typeMatch) {
        score.typeMatch = 1;
        score.explanations.push("🏠 Tipo de propiedad que buscas");
      } else {
        score.typeMatch = 0.2;
      }
    } else {
      score.typeMatch = 0.7;
    }

    // Factor de amenidades
    if (criteria.preferredAmenities && criteria.preferredAmenities.length > 0 && property.amenities) {
      // Since amenities is number[], we'll use a simple count-based approach
      const amenityCount = property.amenities.length;
      const criteriaCount = criteria.preferredAmenities.length;
      score.amenityMatch = Math.min(amenityCount / Math.max(criteriaCount, 1), 1);
      
      if (score.amenityMatch > 0.7) {
        score.explanations.push("✨ Tiene las amenidades que necesitas");
      }
    } else {
      score.amenityMatch = 0.5;
    }

    // Factor de urgencia
    score.urgency = (property.featured ? 0.3 : 0) + (property.premium ? 0.4 : 0) + 0.3;
    if (property.featured || property.premium) {
      score.explanations.push("🔥 Propiedad destacada");
    }

    // Factor de popularidad (sin simulación)
    // Si no hay señales reales disponibles, mantener neutral.
    score.popularity = 0.5;

    // Factor de potencial de inversión
    const pricePerM2 = property.price && property.area ? property.price / property.area : 0;
    const avgPricePerM2 = 1500;
    score.investmentPotential = pricePerM2 < avgPricePerM2 ? 0.8 : 0.4;
    
    if (score.investmentPotential > 0.7) {
      score.explanations.push("📈 Excelente potencial de inversión");
    }

    // Factor de tendencia del mercado (sin simulación)
    // Solo backend/serie histórica puede determinar esto. Neutral por defecto.
    score.marketTrend = 0.5;

    // Calcular score total
    score.totalScore = 
      score.priceMatch * 0.25 +
      score.locationMatch * 0.20 +
      score.typeMatch * 0.15 +
      score.amenityMatch * 0.10 +
      score.popularity * 0.10 +
      score.urgency * 0.08 +
      score.investmentPotential * 0.07 +
      score.marketTrend * 0.05;

    return score;
  }

  /**
   * Formatea el score como porcentaje
   */
  formatScore(score: number): string {
    return `${Math.round(score * 100)}%`;
  }

  /**
   * Obtiene el color del score
   */
  getScoreColor(score: number): string {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  }
}

// Exportar instancia singleton
export const recommendationService = new RecommendationService(); 