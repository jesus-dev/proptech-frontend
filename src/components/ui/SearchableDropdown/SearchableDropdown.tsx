"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
interface SearchableDropdownProps<T extends { id: string; name: string }> {
  label: string;
  placeholder?: string;
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
  fetchOptions: () => Promise<T[]>;
}

export const SearchableDropdown = <T extends { id: string; name: string }>({
  label,
  placeholder = "Buscar...",
  selectedId,
  onSelect,
  fetchOptions,
}: SearchableDropdownProps<T>) => {
  const [options, setOptions] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.id === selectedId);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const data = await fetchOptions();
        setOptions(data);
      } catch (err) {
        setError("Error al cargar opciones.");
        console.error("Error fetching options:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, [fetchOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!selectedOption) {
          setSearchTerm("");
        } else if (searchTerm !== selectedOption.name) {
          setSearchTerm(selectedOption.name);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, selectedOption, searchTerm]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = useCallback((id: string | undefined) => {
    onSelect(id);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
    setSearchTerm(id ? options.find(o => o.id === id)?.name || "" : "");
  }, [onSelect, options]);

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect(undefined);
    setSearchTerm("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (selectedOption && e.target.value !== selectedOption.name) {
      onSelect(undefined);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedOption && searchTerm === "") {
      setSearchTerm(selectedOption.name);
    }
  };

  if (loading) {
    return (
      <div className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
        Cargando...
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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 text-left text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:ring-brand-500"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (selectedOption ? selectedOption.name : searchTerm)}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              if (inputRef.current) inputRef.current.blur();
              if (selectedOption) setSearchTerm(selectedOption.name);
            }
          }}
        />
        {selectedId && (
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

      {isOpen && (filteredOptions.length > 0 || searchTerm !== "") && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
          {filteredOptions.length === 0 && searchTerm !== "" ? (
            <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
              No se encontraron resultados.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-brand-600 hover:text-white dark:text-gray-200 dark:hover:bg-brand-500"
              >
                <span className="block truncate">
                  {option.name}
                </span>
                {selectedId === option.id ? (
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