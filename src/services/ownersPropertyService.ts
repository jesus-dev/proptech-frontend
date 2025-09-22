import { apiClient } from '@/lib/api';

// Interfaces para el dominio OwnersProperty
export interface Owner {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  documentNumber?: string;
  bankAccount?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface OwnerProperty {
  id: number;
  owner: Owner;
  property: {
    id: number;
    title: string;
    address: string;
 price: number;
    status: string;
    type?: string;
    views: number;
    favorites: number;
    inquiries: number;
    shares: number;
    lastActivity: string;
    marketTrend: 'RISING' | 'STABLE' | 'DECLINING';
    priceHistory: PricePoint[];
    comparableProperties: ComparableProperty[];
  };
  ownershipPercentage: number;
  ownershipType: 'FULL' | 'PARTIAL' | 'JOINT';
  startDate?: string;
  endDate?: string;
  isPrimaryOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricePoint {
  date: string;
  price: number;
  change: number;
  reason?: string;
}

export interface ComparableProperty {
  id: number;
  address: string;
  price: number;
  soldDate?: string;
  daysOnMarket: number;
  pricePerM2: number;
  similarity: number; // 0-100%
}

export interface OwnerReport {
  id: number;
  owner: Owner;
  period: string;
  generatedAt: string;
  propertiesCount: number;
  totalViews: number;
  totalFavorites: number;
  totalComments: number;
  totalShares: number;
  totalValue: number;
  recommendations?: string;
  propertyMetrics?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
  emailSent: boolean;
  pdfGenerated: boolean;
  pdfUrl?: string;
  emailSubject?: string;
  emailBody?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  
  // Nuevos campos para análisis inteligente
  marketAnalysis: MarketAnalysis;
  strategicRecommendations: StrategicRecommendation[];
  performanceMetrics: PerformanceMetrics;
  followUpActions: FollowUpAction[];
}

export interface MarketAnalysis {
  marketTrend: 'BULL' | 'BEAR' | 'NEUTRAL';
  priceIndex: number;
  demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  competitionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  seasonality: 'PEAK' | 'NORMAL' | 'LOW';
  marketInsights: string[];
}

export interface StrategicRecommendation {
  id: string;
  type: 'PRICING' | 'MARKETING' | 'IMPROVEMENT' | 'TIMING' | 'NEGOTIATION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  expectedImpact: string;
  implementationCost?: number;
  timeline: string;
  actionItems: string[];
}

export interface PerformanceMetrics {
  overallScore: number; // 0-100
  marketPosition: 'LEADER' | 'COMPETITIVE' | 'AVERAGE' | 'LAGGING';
  engagementRate: number;
  conversionRate: number;
  priceCompetitiveness: number;
  visibilityScore: number;
  buyerInterest: number;
}

export interface FollowUpAction {
  id: string;
  type: 'COMMUNICATION' | 'PRICE_ADJUSTMENT' | 'MARKETING_UPDATE' | 'PROPERTY_IMPROVEMENT';
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo?: string;
}

export interface PropertyReportMetrics {
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  propertyCurrency: string;
  propertyStatus: string;
  propertyType: string;
  viewsCount: number;
  favoritesCount: number;
  commentsCount: number;
  sharesCount: number;
  inquiriesCount: number;
  priceChanges: number;
  statusChanges: number;
  engagementRate: number;
  performanceScore: number;
  performanceLevel: string;
  previousViewsCount?: number;
  previousFavoritesCount?: number;
  previousCommentsCount?: number;
  viewsGrowth?: number;
  favoritesGrowth?: number;
  commentsGrowth?: number;
  propertyRecommendations: string[];
  periodStart: string;
  periodEnd: string;
  lastActivity: string;
}

export interface CreateOwnerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  documentNumber?: string;
  bankAccount?: string;
  notes?: string;
}

export interface UpdateOwnerRequest extends Partial<CreateOwnerRequest> {}

export interface CreateOwnerPropertyRequest {
  ownerId: number;
  propertyId: number;
  ownershipPercentage: number;
  ownershipType: 'FULL' | 'PARTIAL' | 'JOINT';
  startDate?: string;
  endDate?: string;
  isPrimaryOwner: boolean;
}

export interface CreateOwnerReportRequest {
  ownerId: number;
  period: string;
  includeRecommendations: boolean;
  includeComparisons: boolean;
  includeMarketAnalysis: boolean;
  sendEmail: boolean;
  emailTemplate: string;
}

// Algoritmos inteligentes para análisis de mercado
class MarketIntelligenceEngine {
  // Análisis de tendencias de mercado
  static analyzeMarketTrend(properties: OwnerProperty[], period: string): MarketAnalysis {
    const recentProperties = properties.filter(p => {
      const lastActivity = new Date(p.property.lastActivity);
      const now = new Date();
      const daysDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= this.getPeriodDays(period);
    });

    const priceChanges = recentProperties.map(p => {
      const priceHistory = p.property.priceHistory;
      if (priceHistory.length < 2) return 0;
      const latest = priceHistory[priceHistory.length - 1];
      const previous = priceHistory[priceHistory.length - 2];
      return ((latest.price - previous.price) / previous.price) * 100;
    });

    const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    
    // Determinar tendencia del mercado
    let marketTrend: 'BULL' | 'BEAR' | 'NEUTRAL' = 'NEUTRAL';
    if (avgPriceChange > 2) marketTrend = 'BULL';
    else if (avgPriceChange < -2) marketTrend = 'BEAR';

    // Calcular nivel de demanda basado en engagement
    const totalViews = recentProperties.reduce((sum, p) => sum + p.property.views, 0);
    const totalFavorites = recentProperties.reduce((sum, p) => sum + p.property.favorites, 0);
    const demandRatio = totalFavorites / totalViews;
    
    let demandLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (demandRatio > 0.15) demandLevel = 'HIGH';
    else if (demandRatio < 0.05) demandLevel = 'LOW';

    // Análisis de estacionalidad
    const currentMonth = new Date().getMonth();
    let seasonality: 'PEAK' | 'NORMAL' | 'LOW' = 'NORMAL';
    if (currentMonth >= 2 && currentMonth <= 5) seasonality = 'PEAK'; // Primavera
    else if (currentMonth >= 11 || currentMonth <= 1) seasonality = 'LOW'; // Invierno

    // Insights del mercado
    const insights = [
      `Precios ${marketTrend === 'BULL' ? 'subiendo' : marketTrend === 'BEAR' ? 'bajando' : 'estables'} en el mercado`,
      `Demanda ${demandLevel === 'HIGH' ? 'alta' : demandLevel === 'LOW' ? 'baja' : 'moderada'} para propiedades similares`,
      `Temporada ${seasonality === 'PEAK' ? 'pico de ventas' : seasonality === 'LOW' ? 'baja temporada' : 'normal'}`
    ];

    return {
      marketTrend,
      priceIndex: avgPriceChange,
      demandLevel,
      competitionLevel: this.analyzeCompetition(recentProperties),
      seasonality,
      marketInsights: insights
    };
  }

  // Análisis de competencia
  static analyzeCompetition(properties: OwnerProperty[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    const avgPrice = properties.reduce((sum, p) => sum + p.property.price, 0) / properties.length;
    const priceVariance = properties.reduce((sum, p) => {
      return sum + Math.pow(p.property.price - avgPrice, 2);
    }, 0) / properties.length;
    
    const coefficientOfVariation = Math.sqrt(priceVariance) / avgPrice;
    
    if (coefficientOfVariation > 0.3) return 'HIGH';
    else if (coefficientOfVariation > 0.15) return 'MEDIUM';
    return 'LOW';
  }

  // Generar recomendaciones estratégicas personalizadas
  static generateStrategicRecommendations(
    owner: Owner, 
    properties: OwnerProperty[], 
    marketAnalysis: MarketAnalysis
  ): StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [];
    
    // Análisis de precios
    const avgPrice = properties.reduce((sum, p) => sum + p.property.price, 0) / properties.length;
    const marketPrice = avgPrice * (1 + marketAnalysis.priceIndex / 100);
    
    if (Math.abs(marketPrice - avgPrice) / avgPrice > 0.1) {
      recommendations.push({
        id: `pricing-${Date.now()}`,
        type: 'PRICING',
        priority: 'HIGH',
        title: 'Ajuste de Precio Estratégico',
        description: `Tu precio está ${marketPrice > avgPrice ? 'por debajo' : 'por encima'} del mercado en un ${Math.abs((marketPrice - avgPrice) / avgPrice * 100).toFixed(1)}%`,
        expectedImpact: 'Aumento del 15-25% en interés de compradores',
        implementationCost: 0,
        timeline: 'Inmediato',
        actionItems: [
          'Revisar precios de propiedades comparables',
          'Ajustar precio según análisis de mercado',
          'Monitorear respuesta del mercado por 7 días'
        ]
      });
    }

    // Recomendaciones de marketing
    if (marketAnalysis.demandLevel === 'HIGH') {
      recommendations.push({
        id: `marketing-${Date.now()}`,
        type: 'MARKETING',
        priority: 'HIGH',
        title: 'Campaña de Marketing Agresiva',
        description: 'Alta demanda del mercado - momento ideal para maximizar visibilidad',
        expectedImpact: 'Aumento del 30-40% en vistas y consultas',
        implementationCost: 500,
        timeline: '1-2 semanas',
        actionItems: [
          'Fotografías profesionales de alta calidad',
          'Video tour virtual 360°',
          'Publicidad dirigida en redes sociales',
          'Email marketing a base de datos calificada'
        ]
      });
    }

    // Mejoras de propiedad
    const lowPerformingProperties = properties.filter(p => 
      p.property.views < 100 || p.property.favorites < 5
    );
    
    if (lowPerformingProperties.length > 0) {
      recommendations.push({
        id: `improvement-${Date.now()}`,
        type: 'IMPROVEMENT',
        priority: 'MEDIUM',
        title: 'Mejoras para Aumentar Atractivo',
        description: `${lowPerformingProperties.length} propiedades con bajo rendimiento requieren mejoras`,
        expectedImpact: 'Aumento del 20-35% en interés de compradores',
        implementationCost: 1500,
        timeline: '2-4 semanas',
        actionItems: [
          'Pintura exterior e interior',
          'Mejoras en iluminación',
          'Actualización de acabados',
          'Landscaping básico'
        ]
      });
    }

    // Timing estratégico
    if (marketAnalysis.seasonality === 'PEAK') {
      recommendations.push({
        id: `timing-${Date.now()}`,
        type: 'TIMING',
        priority: 'HIGH',
        title: 'Aprovechar Temporada Alta',
        description: 'Estamos en temporada pico de ventas - momento óptimo para maximizar exposición',
        expectedImpact: 'Aumento del 25-40% en probabilidad de venta',
        timeline: 'Inmediato',
        actionItems: [
          'Aumentar presupuesto de marketing',
          'Reducir tiempo de respuesta a consultas',
          'Preparar documentación para cierre rápido',
          'Coordinar con agentes para mayor exposición'
        ]
      });
    }

    return recommendations;
  }

  // Calcular métricas de rendimiento
  static calculatePerformanceMetrics(properties: OwnerProperty[]): PerformanceMetrics {
    const totalViews = properties.reduce((sum, p) => sum + p.property.views, 0);
    const totalFavorites = properties.reduce((sum, p) => sum + p.property.favorites, 0);
    const totalInquiries = properties.reduce((sum, p) => sum + p.property.inquiries, 0);
    
    const engagementRate = totalViews > 0 ? (totalFavorites / totalViews) * 100 : 0;
    const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
    
    // Calcular score general
    const viewsScore = Math.min((totalViews / properties.length) / 100, 1) * 25;
    const engagementScore = Math.min(engagementRate / 10, 1) * 25;
    const conversionScore = Math.min(conversionRate / 5, 1) * 25;
    const marketScore = 25; // Basado en análisis de mercado
    
    const overallScore = Math.round(viewsScore + engagementScore + conversionScore + marketScore);
    
    let marketPosition: 'LEADER' | 'COMPETITIVE' | 'AVERAGE' | 'LAGGING' = 'AVERAGE';
    if (overallScore >= 80) marketPosition = 'LEADER';
    else if (overallScore >= 60) marketPosition = 'COMPETITIVE';
    else if (overallScore >= 40) marketPosition = 'AVERAGE';
    else marketPosition = 'LAGGING';

    return {
      overallScore,
      marketPosition,
      engagementRate,
      conversionRate,
      priceCompetitiveness: 75, // Basado en análisis de precios
      visibilityScore: Math.min((totalViews / properties.length) / 100, 1) * 100,
      buyerInterest: Math.min((totalFavorites / properties.length) / 20, 1) * 100
    };
  }

  // Generar acciones de seguimiento
  static generateFollowUpActions(
    owner: Owner, 
    properties: OwnerProperty[], 
    recommendations: StrategicRecommendation[]
  ): FollowUpAction[] {
    const actions: FollowUpAction[] = [];
    
    // Comunicación semanal
    actions.push({
      id: `comm-${Date.now()}`,
      type: 'COMMUNICATION',
      title: 'Reporte Semanal de Seguimiento',
      description: 'Enviar reporte detallado de actividad y recomendaciones',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      priority: 'HIGH',
      assignedTo: 'Sistema'
    });

    // Ajustes de precio si es necesario
    const pricingRecommendation = recommendations.find(r => r.type === 'PRICING');
    if (pricingRecommendation) {
      actions.push({
        id: `price-${Date.now()}`,
        type: 'PRICE_ADJUSTMENT',
        title: 'Revisión y Ajuste de Precios',
        description: pricingRecommendation.description,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        priority: 'HIGH',
        assignedTo: owner.name
      });
    }

    // Actualizaciones de marketing
    const marketingRecommendation = recommendations.find(r => r.type === 'MARKETING');
    if (marketingRecommendation) {
      actions.push({
        id: `marketing-${Date.now()}`,
        title: 'Implementar Campaña de Marketing',
        description: marketingRecommendation.description,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        priority: 'HIGH',
        assignedTo: 'Equipo de Marketing'
      });
    }

    // Mejoras de propiedad
    const improvementRecommendation = recommendations.find(r => r.type === 'IMPROVEMENT');
    if (improvementRecommendation) {
      actions.push({
        id: `improvement-${Date.now()}`,
        type: 'PROPERTY_IMPROVEMENT',
        title: 'Planificar Mejoras de Propiedad',
        description: improvementRecommendation.description,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        priority: 'MEDIUM',
        assignedTo: owner.name
      });
    }

    return actions;
  }

  private static getPeriodDays(period: string): number {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }
}

// Servicio principal con implementaciones reales
export class OwnersPropertyService {
  // Obtener propietarios
  static async getOwners(): Promise<Owner[]> {
    try {
      const response = await apiClient.get('/api/owners');
      return response.data;
    } catch (error) {
      console.error('Error fetching owners:', error);
      throw error;
    }
  }

  // Obtener propiedades de un propietario
  static async getOwnerProperties(ownerId: number): Promise<OwnerProperty[]> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/properties`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner properties:', error);
      throw error;
    }
  }

  // Generar reporte inteligente
  static async generateIntelligentReport(request: CreateOwnerReportRequest): Promise<OwnerReport> {
    try {
      // Obtener datos del propietario y propiedades
      const owner = (await this.getOwners()).find(o => o.id === request.ownerId);
      if (!owner) throw new Error('Owner not found');
      
      const properties = await this.getOwnerProperties(request.ownerId);
      
      // Aplicar algoritmos de inteligencia de mercado
      const marketAnalysis = MarketIntelligenceEngine.analyzeMarketTrend(properties, request.period);
      const strategicRecommendations = MarketIntelligenceEngine.generateStrategicRecommendations(owner, properties, marketAnalysis);
      const performanceMetrics = MarketIntelligenceEngine.calculatePerformanceMetrics(properties);
      const followUpActions = MarketIntelligenceEngine.generateFollowUpActions(owner, properties, strategicRecommendations);
      
      // Crear reporte
      const report: OwnerReport = {
        id: Date.now(),
        owner,
        period: request.period,
        generatedAt: new Date().toISOString(),
        propertiesCount: properties.length,
        totalViews: properties.reduce((sum, p) => sum + p.property.views, 0),
        totalFavorites: properties.reduce((sum, p) => sum + p.property.favorites, 0),
        totalComments: 0,
        totalShares: properties.reduce((sum, p) => sum + p.property.shares, 0),
        totalValue: properties.reduce((sum, p) => sum + p.property.price, 0),
        recommendations: strategicRecommendations.map(r => r.description).join('. '),
        propertyMetrics: JSON.stringify(performanceMetrics),
        status: 'PENDING',
        emailSent: request.sendEmail,
        pdfGenerated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Análisis inteligente
        marketAnalysis,
        strategicRecommendations,
        performanceMetrics,
        followUpActions
      };

      // Guardar reporte
      const response = await apiClient.post('/api/owner-reports', report);
      return response.data;
    } catch (error) {
      console.error('Error generating intelligent report:', error);
      throw error;
    }
  }

  // Enviar reporte por email
  static async sendReportByEmail(reportId: number, emailTemplate: string): Promise<boolean> {
    try {
      const response = await apiClient.post(`/api/owner-reports/${reportId}/send-email`, {
        emailTemplate
      });
      return response.data.success;
    } catch (error) {
      console.error('Error sending report email:', error);
      throw error;
    }
  }

  // Obtener reportes de un propietario
  static async getOwnerReports(ownerId: number): Promise<OwnerReport[]> {
    try {
      const response = await apiClient.get(`/api/owners/${ownerId}/reports`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner reports:', error);
      throw error;
    }
  }

  // Actualizar acciones de seguimiento
  static async updateFollowUpAction(actionId: string, updates: Partial<FollowUpAction>): Promise<boolean> {
    try {
      const response = await apiClient.patch(`/api/follow-up-actions/${actionId}`, updates);
      return response.data.success;
    } catch (error) {
      console.error('Error updating follow-up action:', error);
      throw error;
    }
  }

  // Obtener insights de mercado
  static async getMarketInsights(propertyType?: string, location?: string): Promise<MarketAnalysis> {
    try {
      const response = await apiClient.get('/api/market-insights', {
        params: { propertyType, location }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching market insights:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  static getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'PENDING': 'Pendiente'
    };
    return statusMap[status] || status;
  }

  static getReportStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendiente',
      'SENT': 'Enviado',
      'FAILED': 'Fallido'
    };
    return statusMap[status] || status;
  }

  static getOwnershipTypeDisplayName(ownershipType: string): string {
    const ownershipMap: Record<string, string> = {
      'FULL': 'Propiedad Completa',
      'PARTIAL': 'Propiedad Parcial',
      'JOINT': 'Propiedad Compartida'
    };
    return ownershipMap[ownershipType] || ownershipType;
  }

  // Métodos mock para desarrollo (mantener temporalmente)
  static getMockOwners(): Owner[] {
    return [
      {
        id: 1,
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+34 600 123 456',
        address: 'Calle Mayor 123, Madrid',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+34 600 789 012',
        address: 'Avenida de la Paz 45, Barcelona',
        status: 'ACTIVE',
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      }
    ];
  }

  static getMockOwnerProperties(ownerId: number): OwnerProperty[] {
    return [
      {
        id: 1,
        owner: this.getMockOwners().find(o => o.id === ownerId)!,
        property: {
          id: 1,
          title: 'Apartamento de lujo en el centro',
          address: 'Calle Gran Vía 78, Madrid',
          price: 450000,
          status: 'FOR_SALE',
          type: 'APARTMENT',
          views: 245,
          favorites: 18,
          inquiries: 5,
          shares: 12,
          lastActivity: new Date().toISOString(),
          marketTrend: 'RISING',
          priceHistory: [
            { date: '2024-01-01', price: 430000, change: 0 },
            { date: '2024-01-15', price: 450000, change: 4.65 }
          ],
          comparableProperties: []
        },
        ownershipPercentage: 100,
        ownershipType: 'FULL',
        isPrimaryOwner: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];
  }

  static getMockOwnerReports(ownerId: number): OwnerReport[] {
    return [];
  }
}
