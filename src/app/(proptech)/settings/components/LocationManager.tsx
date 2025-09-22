"use client";

import React, { useState, useEffect, useMemo } from "react";
import { locationService } from "../services/locationService";
import { Country, City, Neighborhood } from "../types";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";

type LocationType = "country" | "city" | "neighborhood";

export default function LocationManager() {
  const [activeTab, setActiveTab] = useState<LocationType>("country");
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  // State for forms
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [selectedParent, setSelectedParent] = useState<string>("");

  useEffect(() => {
    loadAllLocations();
  }, []);

  const loadAllLocations = async () => {
    setLoading(true);
    try {
      const [countriesData, citiesData, neighborhoodsData] = await Promise.all([
        locationService.getCountries(),
        locationService.getCities(),
        locationService.getNeighborhoods(),
      ]);
      setCountries(countriesData);
      setCities(citiesData);
      setNeighborhoods(neighborhoodsData);
    } catch (error) {
      console.error("Error loading locations:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddItem = async () => {
    if (!newItemName) return;
    try {
      switch (activeTab) {
        case "country":
          await locationService.addCountry(newItemName);
          break;
        case "city":
          if (!selectedParent) return;
          await locationService.addCity(newItemName, selectedParent);
          break;
        case "neighborhood":
          if (!selectedParent) return;
          await locationService.addNeighborhood(newItemName, selectedParent);
          break;
      }
      setNewItemName("");
      setSelectedParent("");
      await loadAllLocations();
    } catch (error) {
      console.error(`Error adding ${activeTab}:`, error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.name) return;
    try {
      switch (activeTab) {
        case "country":
          await locationService.updateCountry(editingItem.id, editingItem.name);
          break;
        case "city":
          await locationService.updateCity(editingItem.id, editingItem.name, editingItem.countryId);
          break;
        case "neighborhood":
          await locationService.updateNeighborhood(editingItem.id, editingItem.name, editingItem.cityId);
          break;
      }
      setEditingItem(null);
      await loadAllLocations();
    } catch (error) {
      console.error(`Error updating ${activeTab}:`, error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este elemento? Se eliminarán también sus elementos hijos.")) return;
    try {
      switch (activeTab) {
        case "country":
          await locationService.deleteCountry(id);
          break;
        case "city":
          await locationService.deleteCity(id);
          break;
        case "neighborhood":
          await locationService.deleteNeighborhood(id);
          break;
      }
      await loadAllLocations();
    } catch (error) {
      console.error(`Error deleting ${activeTab}:`, error);
    }
  };
  
  const parentOptions = useMemo(() => {
    if (activeTab === "city") return countries;
    if (activeTab === "neighborhood") return cities;
    return [];
  }, [activeTab, countries, cities]);

  const renderList = () => {
    let items: unknown[] = [];
    switch (activeTab) {
      case "country":
        items = countries;
        break;
      case "city":
        items = cities.map(city => ({
          ...city,
          countryName: countries.find(c => c.id === city.countryId)?.name || "N/A"
        }));
        break;
      case "neighborhood":
        items = neighborhoods.map(n => ({
          ...n,
          cityName: cities.find(c => c.id === n.cityId)?.name || "N/A"
        }));
        break;
    }

    return (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item: any) => (
          <li key={(item as any).id} className="py-3 flex items-center justify-between">
            {editingItem && editingItem.id === (item as any).id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={handleUpdateItem} className="px-3 py-1 bg-brand-500 text-white rounded-md">Guardar</button>
                <button onClick={() => setEditingItem(null)} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{(item as any).name}</p>
                  {(item as any).countryName && <p className="text-xs text-gray-500 dark:text-gray-400">País: {(item as any).countryName}</p>}
                  {(item as any).cityName && <p className="text-xs text-gray-500 dark:text-gray-400">Ciudad: {(item as any).cityName}</p>}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setEditingItem(item)} className="text-gray-500 hover:text-brand-600"><PencilIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDeleteItem((item as any).id)} className="text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    );
  };
  
  if (loading) return <div>Cargando ubicaciones...</div>;

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("country")}
            className={`${
              activeTab === "country"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Países ({countries.length})
          </button>
          <button
            onClick={() => setActiveTab("city")}
            className={`${
              activeTab === "city"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Ciudades ({cities.length})
          </button>
          <button
            onClick={() => setActiveTab("neighborhood")}
            className={`${
              activeTab === "neighborhood"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Barrios ({neighborhoods.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Añadir Nuevo {
            activeTab === 'country' ? 'País' :
            activeTab === 'city' ? 'Ciudad' : 'Barrio'
          }</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text"
              placeholder="Nombre del nuevo elemento"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {parentOptions.length > 0 && (
              <select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Seleccionar {activeTab === 'city' ? 'País' : 'Ciudad'}</option>
                {parentOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            )}
            <button onClick={handleAddItem} className="px-4 py-2 bg-brand-500 text-white rounded-md flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5"/> Añadir
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Lista de {
            activeTab === 'country' ? 'Países' :
            activeTab === 'city' ? 'Ciudades' : 'Barrios'
          }</h3>
          {renderList()}
        </div>
      </div>
    </div>
  );
} 