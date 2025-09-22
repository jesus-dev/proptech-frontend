import { Country, City, Neighborhood } from "../types";
import { getEndpoint } from '../../../../lib/api-config';

// --- API Types ---
interface ApiCountry {
  id: number;
  name: string;
  code: string;
}

interface ApiCity {
  id: number;
  name: string;
  state: string;
  countryId: number;
  countryName: string;
  countryCode: string;
  active: boolean;
}

interface ApiNeighborhood {
  id: number;
  name: string;
  description: string;
  cityId?: number;
  cityName?: string;
}

// --- Helper Functions ---
const handleApiError = (response: Response, operation: string) => {
  if (!response.ok) {
    throw new Error(`Error al ${operation}: ${response.status} ${response.statusText}`);
  }
};

// --- Country Service ---
export const getCountries = async (): Promise<Country[]> => {
  try {
    const res = await fetch(getEndpoint('/api/countries'));
    handleApiError(res, 'obtener países');
    const apiCountries: ApiCountry[] = await res.json();
    
    return apiCountries.map(country => ({
      id: country.id.toString(),
      name: country.name
    }));
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const addCountry = async (name: string): Promise<Country> => {
  try {
    const res = await fetch(getEndpoint('/api/countries'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code: name.substring(0, 2).toUpperCase() })
    });
    handleApiError(res, 'crear país');
    const apiCountry: ApiCountry = await res.json();
    
    return {
      id: apiCountry.id.toString(),
      name: apiCountry.name
    };
  } catch (error) {
    console.error('Error creating country:', error);
    throw error;
  }
};

export const updateCountry = async (id: string, name: string): Promise<Country> => {
  try {
    const res = await fetch(getEndpoint(`/api/countries/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code: name.substring(0, 2).toUpperCase() })
    });
    handleApiError(res, 'actualizar país');
    const apiCountry: ApiCountry = await res.json();
    
    return {
      id: apiCountry.id.toString(),
      name: apiCountry.name
    };
  } catch (error) {
    console.error('Error updating country:', error);
    throw error;
  }
};

export const deleteCountry = async (id: string): Promise<void> => {
  try {
    const res = await fetch(getEndpoint(`/api/countries/${id}`), {
      method: 'DELETE'
    });
    handleApiError(res, 'eliminar país');
  } catch (error) {
    console.error('Error deleting country:', error);
    throw error;
  }
};

// --- City Service ---
export const getCities = async (): Promise<City[]> => {
  try {
    const res = await fetch(getEndpoint('/api/cities'));
    handleApiError(res, 'obtener ciudades');
    const apiCities: ApiCity[] = await res.json();
    
    return apiCities.map(city => ({
      id: city.id.toString(),
      name: city.name,
      countryId: city.countryId.toString()
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const getCitiesByCountry = async (countryId: string): Promise<City[]> => {
  try {
    const cities = await getCities();
    return cities.filter(city => city.countryId === countryId);
  } catch (error) {
    console.error('Error fetching cities by country:', error);
    throw error;
  }
};

export const addCity = async (name: string, countryId: string): Promise<City> => {
  try {
    const res = await fetch(getEndpoint('/api/cities'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        countryId: parseInt(countryId),
        active: true 
      })
    });
    handleApiError(res, 'crear ciudad');
    const apiCity: ApiCity = await res.json();
    
    return {
      id: apiCity.id.toString(),
      name: apiCity.name,
      countryId: apiCity.countryId.toString()
    };
  } catch (error) {
    console.error('Error creating city:', error);
    throw error;
  }
};

export const updateCity = async (id: string, name: string, countryId: string): Promise<City> => {
  try {
    const res = await fetch(getEndpoint(`/api/cities/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        countryId: parseInt(countryId),
        active: true 
      })
    });
    handleApiError(res, 'actualizar ciudad');
    const apiCity: ApiCity = await res.json();
    
    return {
      id: apiCity.id.toString(),
      name: apiCity.name,
      countryId: apiCity.countryId.toString()
    };
  } catch (error) {
    console.error('Error updating city:', error);
    throw error;
  }
};

export const deleteCity = async (id: string): Promise<void> => {
  try {
    const res = await fetch(getEndpoint(`/api/cities/${id}`), {
      method: 'DELETE'
    });
    handleApiError(res, 'eliminar ciudad');
  } catch (error) {
    console.error('Error deleting city:', error);
    throw error;
  }
};

// --- Neighborhood Service ---
// Note: The backend now supports full CRUD operations for neighborhoods
export const getNeighborhoods = async (): Promise<Neighborhood[]> => {
  try {
    const res = await fetch(getEndpoint('/api/neighborhoods'));
    handleApiError(res, 'obtener barrios');
    const apiNeighborhoods: ApiNeighborhood[] = await res.json();
    
    return apiNeighborhoods.map(neighborhood => ({
      id: neighborhood.id.toString(),
      name: neighborhood.name,
      cityId: neighborhood.cityId ? neighborhood.cityId.toString() : ''
    }));
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    throw error;
  }
};

export const getNeighborhoodsByCity = async (cityId: string): Promise<Neighborhood[]> => {
  try {
    const neighborhoods = await getNeighborhoods();
    return neighborhoods.filter(neighborhood => neighborhood.cityId === cityId);
  } catch (error) {
    console.error('Error fetching neighborhoods by city:', error);
    throw error;
  }
};

export const addNeighborhood = async (name: string, cityId: string): Promise<Neighborhood> => {
  try {
    const res = await fetch(getEndpoint('/api/neighborhoods'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name,
        description: `Barrio en la ciudad ${cityId}`,
        cityId: parseInt(cityId)
      })
    });
    handleApiError(res, 'crear barrio');
    const apiNeighborhood: ApiNeighborhood = await res.json();
    
    return {
      id: apiNeighborhood.id.toString(),
      name: apiNeighborhood.name,
      cityId: apiNeighborhood.cityId ? apiNeighborhood.cityId.toString() : cityId
    };
  } catch (error) {
    console.error('Error creating neighborhood:', error);
    throw error;
  }
};

export const updateNeighborhood = async (id: string, name: string, cityId: string): Promise<Neighborhood> => {
  try {
    const res = await fetch(getEndpoint(`/api/neighborhoods/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name,
        description: `Barrio en la ciudad ${cityId}`,
        cityId: parseInt(cityId)
      })
    });
    handleApiError(res, 'actualizar barrio');
    const apiNeighborhood: ApiNeighborhood = await res.json();
    
    return {
      id: apiNeighborhood.id.toString(),
      name: apiNeighborhood.name,
      cityId: apiNeighborhood.cityId ? apiNeighborhood.cityId.toString() : cityId
    };
  } catch (error) {
    console.error('Error updating neighborhood:', error);
    throw error;
  }
};

export const deleteNeighborhood = async (id: string): Promise<void> => {
  try {
    const res = await fetch(getEndpoint(`/api/neighborhoods/${id}`), {
      method: 'DELETE'
    });
    handleApiError(res, 'eliminar barrio');
  } catch (error) {
    console.error('Error deleting neighborhood:', error);
    throw error;
  }
};

// --- Export the service object ---
export const locationService = {
  getCountries,
  addCountry,
  updateCountry,
  deleteCountry,
  getCities,
  getCitiesByCountry,
  addCity,
  updateCity,
  deleteCity,
  getNeighborhoods,
  getNeighborhoodsByCity,
  addNeighborhood,
  updateNeighborhood,
  deleteNeighborhood,
}; 