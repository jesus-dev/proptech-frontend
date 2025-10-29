/**
 * Analytics Service
 * Tracking de eventos de negocio y comportamiento de usuario
 */

// Tipos de eventos de negocio
export enum AnalyticsEvent {
  // Propiedades
  PROPERTY_VIEW = 'property_view',
  PROPERTY_SEARCH = 'property_search',
  PROPERTY_FAVORITE = 'property_favorite',
  PROPERTY_SHARE = 'property_share',
  PROPERTY_CONTACT = 'property_contact',
  
  // Agentes
  AGENT_VIEW = 'agent_view',
  AGENT_CONTACT = 'agent_contact',
  
  // Conversiones
  FORM_SUBMIT = 'form_submit',
  LEAD_GENERATED = 'lead_generated',
  
  // Navegación
  PAGE_VIEW = 'page_view',
  SEARCH_EXECUTED = 'search_executed',
  FILTER_APPLIED = 'filter_applied',
  
  // Errores
  ERROR_OCCURRED = 'error_occurred',
}

interface AnalyticsEventData {
  event: AnalyticsEvent;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

class AnalyticsService {
  private isInitialized = false;
  
  /**
   * Inicializar servicios de analytics
   */
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    // Google Analytics 4
    if (process.env.NEXT_PUBLIC_GA_ID) {
      this.initGA4();
    }
    
    // Mixpanel para eventos de negocio
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      this.initMixpanel();
    }
    
    this.isInitialized = true;
    console.log('✅ Analytics inicializado');
  }
  
  /**
   * Inicializar Google Analytics 4
   */
  private initGA4() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return;
    
    // Cargar script de GA4
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);
    
    // Configurar GA4
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', gaId, {
      page_path: window.location.pathname,
    });
    
    (window as any).gtag = gtag;
  }
  
  /**
   * Inicializar Mixpanel
   */
  private initMixpanel() {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    if (!token) return;
    
    // Aquí iría la inicialización de Mixpanel
    console.log('Mixpanel configurado');
  }
  
  /**
   * Trackear evento
   */
  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (!this.isInitialized) this.init();
    
    const eventData: AnalyticsEventData = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
    };
    
    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
    
    // Mixpanel
    if ((window as any).mixpanel) {
      (window as any).mixpanel.track(event, properties);
    }
    
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventData);
    }
  }
  
  /**
   * Trackear vista de página
   */
  trackPageView(path: string, title?: string) {
    this.track(AnalyticsEvent.PAGE_VIEW, {
      page_path: path,
      page_title: title || document.title,
    });
  }
  
  /**
   * Trackear vista de propiedad
   */
  trackPropertyView(propertyId: string | number, propertyData?: Record<string, any>) {
    this.track(AnalyticsEvent.PROPERTY_VIEW, {
      property_id: propertyId,
      ...propertyData,
    });
  }
  
  /**
   * Trackear búsqueda
   */
  trackSearch(query: string, filters?: Record<string, any>) {
    this.track(AnalyticsEvent.SEARCH_EXECUTED, {
      search_query: query,
      filters,
    });
  }
  
  /**
   * Trackear contacto con agente
   */
  trackAgentContact(agentId: string | number, propertyId?: string | number) {
    this.track(AnalyticsEvent.AGENT_CONTACT, {
      agent_id: agentId,
      property_id: propertyId,
    });
  }
  
  /**
   * Trackear formulario enviado
   */
  trackFormSubmit(formName: string, formData?: Record<string, any>) {
    this.track(AnalyticsEvent.FORM_SUBMIT, {
      form_name: formName,
      ...formData,
    });
  }
  
  /**
   * Trackear error
   */
  trackError(error: Error | string, context?: Record<string, any>) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    this.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_message: errorMessage,
      ...context,
    });
  }
  
  /**
   * Identificar usuario
   */
  identifyUser(userId: string, traits?: Record<string, any>) {
    if ((window as any).gtag) {
      (window as any).gtag('set', 'user_properties', {
        user_id: userId,
        ...traits,
      });
    }
    
    if ((window as any).mixpanel) {
      (window as any).mixpanel.identify(userId);
      if (traits) {
        (window as any).mixpanel.people.set(traits);
      }
    }
  }
}

// Exportar instancia singleton
export const analytics = new AnalyticsService();

