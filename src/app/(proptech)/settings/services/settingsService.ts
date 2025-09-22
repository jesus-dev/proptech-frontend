import { AppSettings, PropertySettings } from "../types";

const SETTINGS_KEY = 'appSettings';

const getDefaultSettings = (): AppSettings => {
    return {
        companyInfo: {
            name: "ON Bienes Raíces",
            address: "Av. Principal 123",
            phone: "+54 9 11 1234-5678",
            email: "contacto@onbienesraices.com.py",
            website: "www.onbienesraices.com.py",
        },
        contacts: [
            { id: 'contact-1', name: 'Juan Pérez', phone: '+54 9 11 9876-5432', email: 'juan.perez@onbienesraices.com.py', position: 'Agente Principal' }
        ],
        propertySettings: {
            featured: {
                enabled: true,
                criteria: {
                    minAmenities: 3,
                    minRating: 4.0,
                    minViews: 150,
                    allowedCities: ['Asunción', 'San Bernardino', 'Areguá'],
                    minYearBuilt: 2010,
                    allowedTypes: ['Casa', 'Departamento', 'Casa Quinta', 'Casa de Campo']
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
                    luxuryAmenities: [
                        'Pileta infinita',
                        'Helipuerto',
                        'Cine en casa',
                        'Bodega',
                        'Ascensor privado',
                        'Chef privado',
                        'Concierge 24hs'
                    ],
                    premiumLocations: ['Villa Morra', 'Carmelitas', 'Recoleta'],
                    minPriceForQuinta: 300000
                },
                autoSelection: true,
                manualSelection: []
            }
        }
    };
};

const getSettings = (): Promise<AppSettings> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined') {
            const settingsStr = localStorage.getItem(SETTINGS_KEY);
            console.log('Settings from localStorage:', settingsStr);
            
            if (settingsStr) {
                try {
                    const parsedSettings = JSON.parse(settingsStr);
                    console.log('Parsed settings:', parsedSettings);
                    
                    // Verificar que la estructura es correcta
                    if (!parsedSettings.propertySettings || 
                        !parsedSettings.propertySettings.featured || 
                        !parsedSettings.propertySettings.premium) {
                        console.warn('Settings structure incomplete, using defaults');
                        const defaultSettings = getDefaultSettings();
                        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
                        resolve(defaultSettings);
                        return;
                    }
                    
                    resolve(parsedSettings);
                } catch (e) {
                    console.error("Failed to parse settings, using default.", e);
                    const defaultSettings = getDefaultSettings();
                    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
                    resolve(defaultSettings);
                }
            } else {
                console.log('No settings found in localStorage, creating defaults');
                const defaultSettings = getDefaultSettings();
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
                resolve(defaultSettings);
            }
        } else {
            // For SSR or environments without window
            console.log('Server-side: returning default settings');
            resolve(getDefaultSettings());
        }
    });
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
        const defaultSettings = getDefaultSettings();
        await saveSettings(defaultSettings);
        return defaultSettings;
    },
    async getPropertySettings(): Promise<PropertySettings> {
        const settings = await getSettings();
        return settings.propertySettings;
    }
}; 