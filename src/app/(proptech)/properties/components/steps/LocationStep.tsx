"use client";
import React, { useState, useEffect, useMemo } from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { getAllCountries, Country } from "@/app/(proptech)/catalogs/countries/services/countryService";
import { getDepartmentsByCountry } from "@/app/(proptech)/catalogs/departments/services/departmentService";
import { getAllCities, City, createCity } from "@/app/(proptech)/catalogs/cities/services/cityService";
import { getAllNeighborhoods, Neighborhood, createNeighborhood } from "@/app/(proptech)/catalogs/neighborhoods/services/neighborhoodService";
import ValidatedInput from "@/components/form/input/ValidatedInput";
import ValidatedTextArea from "@/components/form/input/ValidatedTextArea";
import { Search, MapPin, ChevronDown, X, Plus, Building, Home } from "lucide-react";
import { Department } from "@/app/(proptech)/catalogs/departments/types";

interface LocationStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: PropertyFormErrors;
}

interface SearchResult {
  id: string;
  name: string;
  type: 'city' | 'neighborhood';
  cityName?: string;
  departmentName?: string;
  countryName?: string;
}

export default function LocationStep({ formData, handleChange, errors }: LocationStepProps) {
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  
  // Estados para el buscador inteligente
  const [searchMode, setSearchMode] = useState<'city' | 'neighborhood'>('city');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedNeighborhoodName, setSelectedNeighborhoodName] = useState<string>('');

  // Estados para el popup de registro
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerMode, setRegisterMode] = useState<'city' | 'neighborhood'>('city');
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    countryId: '',
    departmentId: '',
    cityId: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.cityId) {
      setSelectedCityId(String(formData.cityId));
      // Cargar datos de la ciudad seleccionada para mostrar país y departamento
      const city = allCities.find(c => c.id === formData.cityId);
      if (city) {
        loadCityContext(city);
      }
    } else {
      // Si no hay ciudad seleccionada, limpiar el searchTerm del barrio
      setSearchTerm('');
    }
  }, [formData.cityId, allCities]);

  // Manejar cuando se carga un barrio existente
  useEffect(() => {
    if (formData.neighborhood && formData.neighborhood.trim() !== '' && selectedCityId) {
      // Si hay un barrio cargado y una ciudad seleccionada, establecer el nombre del barrio
      setSelectedNeighborhoodName(formData.neighborhood);
    } else if (!formData.neighborhood || formData.neighborhood.trim() === '') {
      // Si no hay barrio, limpiar el nombre del barrio
      setSelectedNeighborhoodName('');
    }
  }, [formData.neighborhood, selectedCityId]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.location-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [countriesData, citiesData, neighborhoodsData] = await Promise.all([
        getAllCountries(),
        getAllCities(),
        getAllNeighborhoods()
      ]);
      setCountries(countriesData);
      setAllCities(citiesData);
      setAllNeighborhoods(neighborhoodsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCityContext = async (city: City) => {
    try {
      if (!city.countryId) {
        console.warn('City has no countryId:', city);
        return;
      }
      
      const departmentsData = await getDepartmentsByCountry(city.countryId);
      setDepartments(departmentsData);
      
      const country = countries.find(c => c.id === city.countryId);
      if (country) {
        setSelectedCountry(country);
      }
      
      const department = departmentsData.find(d => d.id === city.departmentId);
      if (department) {
        setSelectedDepartment(department);
      }
    } catch (error) {
      console.error("Error loading city context:", error);
    }
  };

  const handleCountryChange = async (country: Country) => {
    setSelectedCountry(country);
    setSelectedDepartment(null);
    setSearchTerm("");
    
    try {
      const departmentsData = await getDepartmentsByCountry(country.id);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const handleDepartmentChange = (department: Department) => {
    setSelectedDepartment(department);
    setSearchTerm("");
  };

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'city') {
      const cityId = result.id.replace('city-', '');
      const city = allCities.find(c => c.id === Number(cityId));
      if (city) {
        setSelectedCityId(cityId);
        setSearchTerm(city.name);
        
        // Update form data with cityId
        const cityIdEvent = {
          target: {
            name: "cityId",
            value: city.id,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleChange(cityIdEvent);
        
        // Limpiar barrio al cambiar de ciudad
        const neighborhoodEvent = {
          target: {
            name: "neighborhood",
            value: "",
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleChange(neighborhoodEvent);
        
        // Limpiar searchTerm del barrio y nombre del barrio
        setSearchTerm('');
        setSelectedNeighborhoodName('');
      }
    } else {
      const neighborhoodId = result.id.replace('neighborhood-', '');
      const neighborhood = allNeighborhoods.find(n => n.id === Number(neighborhoodId));
      if (neighborhood) {
        setSearchTerm(neighborhood.name);
        setSelectedNeighborhoodName(neighborhood.name);
        
        // Update form data with neighborhood name
        const neighborhoodEvent = {
          target: {
            name: "neighborhood",
            value: neighborhood.name,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleChange(neighborhoodEvent);
      }
    }
    
    setShowDropdown(false);
  };

  const clearFilters = () => {
    setSelectedCountry(null);
    setSelectedDepartment(null);
    setSearchTerm("");
  };

  const handleRegisterNew = () => {
    setRegisterMode(searchMode);
    setRegisterFormData({
      name: searchTerm,
      countryId: selectedCountry?.id?.toString() || '',
      departmentId: selectedDepartment?.id?.toString() || '',
      cityId: searchMode === 'neighborhood' ? selectedCityId : ''
    });
    setShowRegisterModal(true);
    setShowDropdown(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);

    try {
      if (registerMode === 'city') {
        if (!registerFormData.name.trim() || !registerFormData.departmentId) {
          setRegisterError('Nombre y departamento son obligatorios');
          return;
        }

        const newCity = await createCity({
          name: registerFormData.name.trim(),
          departmentId: Number(registerFormData.departmentId)
        });

        // Actualizar la lista de ciudades
        setAllCities(prev => [...prev, newCity]);
        
        // Seleccionar automáticamente la nueva ciudad
        setSelectedCityId(String(newCity.id));
        setSearchTerm(newCity.name);
        
        const cityIdEvent = {
          target: {
            name: "cityId",
            value: newCity.id,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleChange(cityIdEvent);

      } else {
        if (!registerFormData.name.trim() || !registerFormData.cityId) {
          setRegisterError('Nombre y ciudad son obligatorios');
          return;
        }

        const newNeighborhood = await createNeighborhood({
          name: registerFormData.name.trim(),
          cityId: Number(registerFormData.cityId)
        });

        // Actualizar la lista de barrios
        setAllNeighborhoods(prev => [...prev, newNeighborhood]);
        
        // Seleccionar automáticamente el nuevo barrio
        setSelectedNeighborhoodName(newNeighborhood.name);
        setSearchTerm(newNeighborhood.name);
        
        const neighborhoodEvent = {
          target: {
            name: "neighborhood",
            value: newNeighborhood.name,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleChange(neighborhoodEvent);
      }

      setShowRegisterModal(false);
      setRegisterFormData({ name: '', countryId: '', departmentId: '', cityId: '' });

    } catch (error) {
      console.error('Error registering new item:', error);
      setRegisterError(error instanceof Error ? error.message : 'Error al registrar');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterCancel = () => {
    setShowRegisterModal(false);
    setRegisterFormData({ name: '', countryId: '', departmentId: '', cityId: '' });
    setRegisterError(null);
  };

  const startSearch = (mode: 'city' | 'neighborhood') => {
    setSearchMode(mode);
    setShowDropdown(true);
    setSearchTerm('');
    
    // Si es búsqueda de barrio, filtrar automáticamente por la ciudad seleccionada
    if (mode === 'neighborhood' && selectedCityId) {
      // Buscar la ciudad seleccionada para obtener su país y departamento
      const selectedCityData = allCities.find(c => c.id === Number(selectedCityId));
      if (selectedCityData) {
        const cityDepartment = departments.find(d => d.id === selectedCityData.departmentId);
        const cityCountry = countries.find(c => c.id === selectedCityData.countryId);
        
        if (cityCountry) {
          setSelectedCountry(cityCountry);
        }
        if (cityDepartment) {
          setSelectedDepartment(cityDepartment);
        }
      }
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const selectedCity = allCities.find(c => String(c.id) === String(formData.cityId));
  const departmentName = selectedCity?.departmentName || '';
  const countryName = selectedCity?.countryName || '';

  // Filtrar resultados según el modo de búsqueda
  const filteredResults = useMemo(() => {
    if (searchMode === 'city') {
      return allCities
        .filter(city => {
          // Filtrar por país si está seleccionado
          if (selectedCountry && city.countryId !== selectedCountry.id) return false;
          
          // Filtrar por departamento si está seleccionado
          if (selectedDepartment && city.departmentId !== selectedDepartment.id) return false;
          
          // Filtrar por término de búsqueda
          if (searchTerm) {
            return city.name.toLowerCase().includes(searchTerm.toLowerCase());
          }
          
          return true;
        })
        .map(city => {
          const department = departments.find(d => d.id === city.departmentId);
          const country = countries.find(c => c.id === city.countryId);
          return {
            id: `city-${city.id}`,
            name: city.name,
            departmentName: department?.name,
            countryName: country?.name,
            type: 'city' as const
          };
        });
    } else {
      // Búsqueda de barrios - filtrar automáticamente por ciudad seleccionada
      return allNeighborhoods
        .filter(neighborhood => {
          // Filtrar por ciudad seleccionada (obligatorio para barrios)
          if (selectedCityId && neighborhood.cityId !== Number(selectedCityId)) return false;
          
          // Filtrar por país si está seleccionado
          if (selectedCountry) {
            const neighborhoodCity = allCities.find(c => c.id === neighborhood.cityId);
            if (neighborhoodCity && neighborhoodCity.countryId !== selectedCountry.id) return false;
          }
          
          // Filtrar por departamento si está seleccionado
          if (selectedDepartment) {
            const neighborhoodCity = allCities.find(c => c.id === neighborhood.cityId);
            if (neighborhoodCity && neighborhoodCity.departmentId !== selectedDepartment.id) return false;
          }
          
          // Filtrar por término de búsqueda
          if (searchTerm) {
            return neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase());
          }
          
          return true;
        })
        .map(neighborhood => {
          const city = allCities.find(c => c.id === neighborhood.cityId);
          const department = city ? departments.find(d => d.id === city.departmentId) : null;
          const country = city ? countries.find(c => c.id === city.countryId) : null;
          return {
            id: `neighborhood-${neighborhood.id}`,
            name: neighborhood.name,
            cityName: city?.name,
            departmentName: department?.name,
            countryName: country?.name,
            type: 'neighborhood' as const
          };
        });
    }
  }, [searchMode, allCities, allNeighborhoods, departments, countries, selectedCountry, selectedDepartment, searchTerm, selectedCityId]);

  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <ValidatedInput
          type="text"
          id="address"
          name="address"
          label="Dirección"
          value={formData.address}
          onChange={handleChange}
          placeholder="Ej: Av. Principal 123"
          error={errors.address}
          required={true}
        />
      </div>

      {/* Smart Location Search */}
      <div className="space-y-4 location-search-container">
        {/* Campo Ciudad (Obligatorio) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-600" />
              <input
                type="text"
                value={selectedCity?.name || ""}
                onClick={() => startSearch('city')}
                readOnly
                placeholder="Haz clic para buscar ciudad..."
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer ${errors.city ? "border-red-500" : "border-gray-300"}`}
              />
            </div>

            {/* Dropdown de ciudades */}
            {showDropdown && searchMode === 'city' && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                {/* Filtros dentro del dropdown */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Filtro País */}
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={selectedCountry?.id || ""}
                        onChange={(e) => {
                          const country = countries.find(c => c.id === Number(e.target.value));
                          if (country) handleCountryChange(country);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      >
                        <option value="">Todos los países</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>{country.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro Departamento */}
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={selectedDepartment?.id || ""}
                        onChange={(e) => {
                          const department = departments.find(d => d.id === Number(e.target.value));
                          if (department) handleDepartmentChange(department);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        disabled={!selectedCountry}
                      >
                        <option value="">{selectedCountry ? "Todos los departamentos" : "Seleccione país primero"}</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>{department.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Botón limpiar filtros */}
                    {(selectedCountry || selectedDepartment) && (
                      <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Campo de búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      placeholder="Buscar ciudad..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                
                {/* Resultados */}
                {filteredResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto">
                    {filteredResults.slice(0, 10).map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultSelect(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <Building className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{result.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {result.departmentName && `${result.departmentName}`}
                            {result.countryName && result.departmentName && ", "}
                            {result.countryName && result.countryName}
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredResults.length > 10 && (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-100 dark:border-gray-700">
                        Mostrando 10 de {filteredResults.length} ciudades. Refina tu búsqueda para ver más.
                      </div>
                    )}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {searchTerm && filteredResults.length === 0 && (
                  <div className="p-4 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-3">
                      No se encontraron ciudades que coincidan con "{searchTerm}"
                    </div>
                    <button
                      onClick={handleRegisterNew}
                      className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Registrar nueva ciudad
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {errors.city && (
            <div className="flex items-center mt-1.5 space-x-1">
              <p className="text-sm text-red-500">{errors.city}</p>
            </div>
          )}
        </div>

        {/* Campo Barrio (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Barrio <span className="text-gray-500 text-xs">(opcional)</span>
          </label>
          <div className="relative">
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
              <input
                type="text"
                value={selectedNeighborhoodName || ""}
                onClick={() => startSearch('neighborhood')}
                readOnly
                placeholder={selectedCityId ? "Haz clic para buscar barrio..." : "Selecciona una ciudad primero"}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${selectedCityId ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                disabled={!selectedCityId}
              />
            </div>

            {/* Dropdown de barrios */}
            {showDropdown && searchMode === 'neighborhood' && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                {/* Campo de búsqueda */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      placeholder="Buscar barrio..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                
                {/* Resultados */}
                {filteredResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto">
                    {filteredResults.slice(0, 10).map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultSelect(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <Home className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {result.name}
                            {result.type === 'neighborhood' && result.cityName && (
                              <span className="text-sm text-gray-500 ml-2">({result.cityName})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {result.departmentName && `${result.departmentName}`}
                            {result.countryName && result.departmentName && ", "}
                            {result.countryName && result.countryName}
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredResults.length > 10 && (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-100 dark:border-gray-700">
                        Mostrando 10 de {filteredResults.length} barrios. Refina tu búsqueda para ver más.
                      </div>
                    )}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {searchTerm && filteredResults.length === 0 && (
                  <div className="p-4 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-3">
                      No se encontraron barrios que coincidan con "{searchTerm}"
                    </div>
                    <button
                      onClick={handleRegisterNew}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Registrar nuevo barrio
                    </button>
                  </div>
                )}

                {/* Mensaje cuando no hay barrios para la ciudad seleccionada */}
                {!searchTerm && filteredResults.length === 0 && (
                  <div className="p-4 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-3">
                      No hay barrios registrados para esta ciudad
                    </div>
                    <button
                      onClick={handleRegisterNew}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Registrar nuevo barrio
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info de selección */}
        {formData.cityId && (departmentName || countryName) && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
              <MapPin className="w-4 h-4" />
              <span><b>Ciudad seleccionada:</b> {selectedCity?.name}</span>
            </div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-300">
              {departmentName && <span><b>Departamento:</b> {departmentName}</span>}
              {countryName && <span className="ml-4"><b>País:</b> {countryName}</span>}
            </div>
            {formData.neighborhood && (
              <div className="mt-1 text-xs text-green-600 dark:text-green-300">
                <span><b>Barrio:</b> {formData.neighborhood}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Description */}
      <div>
        <ValidatedTextArea
          id="locationDescription"
          name="locationDescription"
          label="Descripción de la Ubicación"
          value={formData.locationDescription}
          onChange={handleChange}
          rows={3}
          error={errors.locationDescription}
          placeholder="Describe puntos de referencia cercanos, accesos principales, etc."
        />
      </div>

      {/* Popup de Registro de Ciudad/Barrio */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo degradado con blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-brand-900/30 backdrop-blur-sm"></div>
          
          {/* Contenido del popup */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {registerMode === 'city' ? '🏙️ Nueva Ciudad' : '🏘️ Nuevo Barrio'}
                </h2>
                <button
                  onClick={handleRegisterCancel}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">
                {registerMode === 'city' 
                  ? 'Registra una nueva ciudad en el sistema' 
                  : 'Registra un nuevo barrio para la ciudad seleccionada'
                }
              </p>
            </div>

            {/* Contenido del formulario */}
            <div className="p-6">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={registerFormData.name}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    placeholder={registerMode === 'city' ? 'Ej: Asunción' : 'Ej: Villa Morra'}
                    required
                  />
                </div>

                {/* País (solo para ciudades) */}
                {registerMode === 'city' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      País *
                    </label>
                    <select
                      value={registerFormData.countryId}
                      onChange={(e) => {
                        setRegisterFormData({ 
                          ...registerFormData, 
                          countryId: e.target.value,
                          departmentId: '' // Reset department when country changes
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      required
                    >
                      <option value="">🌍 Seleccionar país</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Departamento (solo para ciudades) */}
                {registerMode === 'city' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Departamento *
                    </label>
                    <select
                      value={registerFormData.departmentId}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, departmentId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      required
                      disabled={!registerFormData.countryId}
                    >
                      <option value="">🏛️ {registerFormData.countryId ? 'Seleccionar departamento' : 'Seleccione país primero'}</option>
                      {registerFormData.countryId && departments
                        .filter(d => d.countryId === Number(registerFormData.countryId))
                        .map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Ciudad (solo para barrios) */}
                {registerMode === 'neighborhood' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Ciudad *
                    </label>
                    <select
                      value={registerFormData.cityId}
                      onChange={(e) => setRegisterFormData({ ...registerFormData, cityId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      required
                    >
                      <option value="">🏙️ Seleccionar ciudad</option>
                      {allCities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error */}
                {registerError && (
                  <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">⚠️</span>
                      {registerError}
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleRegisterCancel}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
                    disabled={registerLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        Registrar
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 