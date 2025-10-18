import { AppSettings, PropertySettings } from "../types";
import { apiClient } from '@/lib/api';

const SETTINGS_KEY = 'appSettings';

// Función para obtener la configuración por defecto con datos dinámicos del backend
const getDefaultSettings = async (): Promise<AppSettings> => {
    try {
        // Obtener datos dinámicos desde el backend
        const [cities, cityZones, amenities, propertyTypes, agencies] = await Promise.all([
            apiClient.get('/api/cities').catch(() => ({ data: [] })),
            apiClient.get('/api/city-zones').catch(() => ({ data: [] })),
            apiClient.get('/api/amenities').catch(() => ({ data: [] })),
            apiClient.get('/api/property-types').catch(() => ({ data: [] })),
            apiClient.get('/api/agencies').catch(() => ({ data: [] }))
        ]);

        // Extraer solo los nombres de las ciudades activas
        const allCities = (cities.data || [])
            .filter((city: any) => city.active !== false)
            .map((city: any) => city.name);

        // Extraer nombres de zonas urbanas premium (todas las disponibles en city-zones)
        const premiumLocations = (cityZones.data || [])
            .filter((zone: any) => zone.active !== false)
            .map((zone: any) => zone.name);

        // Extraer amenidades de lujo (todas las amenidades activas)
        const luxuryAmenities = (amenities.data || [])
            .filter((amenity: any) => amenity.active !== false)
            .map((amenity: any) => amenity.name);

        // Extraer tipos de propiedades activas
        const allowedTypes = (propertyTypes.data || [])
            .filter((type: any) => type.active !== false)
            .map((type: any) => type.name);

        // Obtener información de la compañía desde la primera agencia activa
        const firstAgency = (agencies.data || []).find((agency: any) => agency.active !== false);
        const companyInfo = firstAgency ? {
            name: firstAgency.name || "PropTech",
            address: firstAgency.address || "",
            phone: firstAgency.phone || "",
            email: firstAgency.email || "",
            website: firstAgency.website || "",
            logoUrl: firstAgency.logoUrl || ""
        } : {
            name: "PropTech",
            address: "",
            phone: "",
            email: "",
            website: "",
            logoUrl: ""
        };

        return {
            companyInfo,
            contacts: [], // Los contactos se cargarán dinámicamente
            propertySettings: {
                featured: {
                    enabled: true,
                    criteria: {
                        minAmenities: 3,
                        minRating: 4.0,
                        minViews: 150,
                        allowedCities: allCities.slice(0, 10), // Usar hasta 10 ciudades del backend
                        minYearBuilt: 2010,
                        allowedTypes: allowedTypes.slice(0, 10) // Usar hasta 10 tipos del backend
                    },
                    autoSelection: true,
                    manualSelection: []
                },
                premium: {
                    enabled: true,
                    criteria: {
                        minPrice: 500000,
                        minArea: 250,
                        minBedrooms: 4,
                        luxuryAmenities: luxuryAmenities.slice(0, 20), // Usar hasta 20 amenidades del backend
                        premiumLocations: premiumLocations.slice(0, 10), // Usar hasta 10 ubicaciones del backend
                        minPriceForQuinta: 300000
                    },
                    autoSelection: true,
                    manualSelection: []
                }
            }
        };
    } catch (error) {
        console.error('Error loading default settings from backend:', error);
        // Fallback en caso de error - valores mínimos sin datos hardcodeados
        return {
            companyInfo: {
                name: "PropTech",
                address: "",
                phone: "",
                email: "",
                website: "",
                logoUrl: ""
            },
            contacts: [],
            propertySettings: {
                featured: {
                    enabled: true,
                    criteria: {
                        minAmenities: 3,
                        minRating: 4.0,
                        minViews: 150,
                        allowedCities: [],
                        minYearBuilt: 2010,
                        allowedTypes: []
                    },
                    autoSelection: true,
                    manualSelection: []
                },
                premium: {
                    enabled: true,
                    criteria: {
                        minPrice: 500000,
                        minArea: 250,
                        minBedrooms: 4,
                        luxuryAmenities: [],
                        premiumLocations: [],
                        minPriceForQuinta: 300000
                    },
                    autoSelection: true,
                    manualSelection: []
                }
            }
        };
    }
};

const loadContactsFromBackend = async (): Promise<any[]> => {
    try {
        // Verificar si hay token de autenticación antes de llamar al endpoint privado
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (!token) {
                // No hay autenticación, no cargar contactos
                return [];
            }
        }
        
        const response = await apiClient.get('/api/agents');
        const agents = response.data || [];
        
        // Convertir agentes a formato de contacto
        return agents.map((agent: any) => ({
            id: agent.id || 'agent-' + agent.id,
            name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Sin nombre',
            phone: agent.phone || 'Sin teléfono',
            email: agent.email || 'Sin email',
            position: agent.position || 'Agente'
        }));
    } catch (error) {
        // Silenciar el error 401 (no autenticado) - es esperado para usuarios no logueados
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401) {
                return []; // Usuario no autenticado, retornar array vacío sin error
            }
        }
        console.error('Error loading contacts from backend:', error);
        return [];
    }
};

const getSettings = async (): Promise<AppSettings> => {
    if (typeof window !== 'undefined') {
        const settingsStr = localStorage.getItem(SETTINGS_KEY);
        console.log('Settings from localStorage:', settingsStr);
        
        let settings: AppSettings;
        
        if (settingsStr) {
            try {
                const parsedSettings = JSON.parse(settingsStr);
                console.log('Parsed settings:', parsedSettings);
                
                // Verificar que la estructura es correcta
                if (!parsedSettings.propertySettings || 
                    !parsedSettings.propertySettings.featured || 
                    !parsedSettings.propertySettings.premium) {
                    console.warn('Settings structure incomplete, using defaults');
                    settings = await getDefaultSettings();
                } else {
                    settings = parsedSettings;
                }
            } catch (e) {
                console.error("Failed to parse settings, using default.", e);
                settings = await getDefaultSettings();
            }
        } else {
            console.log('No settings found in localStorage, creating defaults');
            settings = await getDefaultSettings();
        }
        
        // Cargar contactos dinámicamente del backend
        const contacts = await loadContactsFromBackend();
        settings.contacts = contacts;
        
        // Guardar los settings actualizados
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        
        return settings;
    } else {
        // For SSR or environments without window
        console.log('Server-side: returning default settings');
        return await getDefaultSettings();
    }
};

const saveSettings = (settings: AppSettings): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
        resolve();
    });
};

export const settingsService = {
    getSettings,
    saveSettings,
    async resetToDefaults(): Promise<AppSettings> {
        const defaultSettings = await getDefaultSettings();
        await saveSettings(defaultSettings);
        return defaultSettings;
    },
    async getPropertySettings(): Promise<PropertySettings> {
        const settings = await getSettings();
        return settings.propertySettings;
    }
}; 