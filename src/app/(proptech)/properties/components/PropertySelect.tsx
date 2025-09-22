"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Property } from "../components/types";
import { propertyService } from "../services/propertyService";
interface PropertySelectProps {
  selectedPropertyId: string | undefined;
  onPropertySelect: (propertyId: string | undefined) => void;
}

export const PropertySelect: React.FC<PropertySelectProps> = ({
  selectedPropertyId,
  onPropertySelect,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  // Load properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertyService.getAllProperties();
        setProperties(response.data);
      } catch (err) {
        setError("Error al cargar las propiedades.");
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term if no property is selected on blur
        if (!selectedProperty) {
          setSearchTerm("");
        } else if (searchTerm !== selectedProperty.title) {
          setSearchTerm(selectedProperty.title); // Revert to selected title if different
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, selectedProperty, searchTerm]);

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = useCallback((propertyId: string | undefined) => {
    onPropertySelect(propertyId);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
    // Update searchTerm to reflect selected property or clear it
    setSearchTerm(propertyId ? properties.find(p => p.id === propertyId)?.title || "" : "");
  }, [onPropertySelect, properties]);

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from opening/closing
    handleSelect(undefined);
    setSearchTerm(""); // Clear search term as well
    if (inputRef.current) {
      inputRef.current.focus(); // Keep focus on input after clearing
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    // Clear selected property only if the user is actively typing and the input value doesn't match the selected property's title
    if (selectedProperty && e.target.value !== selectedProperty.title) {
      onPropertySelect(undefined);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // When focusing, if a property is selected, show its title in the input for editing/searching
    if (selectedProperty && searchTerm === "") {
      setSearchTerm(selectedProperty.title);
    }
  };

  if (loading) {
    return (
      <div className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
        Cargando propiedades...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-1 block w-full rounded-md border border-red-500 bg-white px-3 py-2 text-red-500 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 text-left text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:ring-brand-500"
          placeholder="Buscar propiedad..."
          value={isOpen ? searchTerm : (selectedProperty ? selectedProperty.title : searchTerm)}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              if (inputRef.current) inputRef.current.blur();
              if (selectedProperty) setSearchTerm(selectedProperty.title);
            }
          }}
        />
        {selectedPropertyId && ( // Show clear button only if a property is selected
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute inset-y-0 right-7 flex items-center pr-2 focus:outline-none text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Limpiar selección"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (filteredProperties.length > 0 || searchTerm !== "") && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
          {filteredProperties.length === 0 && searchTerm !== "" ? (
            <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
              No se encontraron propiedades.
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => handleSelect(property.id)}
                className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-brand-600 hover:text-white dark:text-gray-200 dark:hover:bg-brand-500"
              >
                <span className="block truncate">
                  {property.title} ({property.address})
                </span>
                {selectedPropertyId === property.id ? (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-600 dark:text-brand-300">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
            ))
          )}
          <div
            onClick={() => handleSelect(undefined)}
            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-100 border-t border-gray-200 dark:border-gray-600"
          >
            <span className="block truncate">Limpiar selección</span>
          </div>
        </div>
      )}
    </div>
  );
};