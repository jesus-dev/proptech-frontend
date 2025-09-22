"use client";
import React, { useState, useRef, useEffect } from 'react';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({ options, selected, onChange, placeholder = "Seleccionar..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
  const handleSelect = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const getOptionName = (id: string) => options.find(opt => opt.id === id)?.name || id;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-center"
      >
        <span className="text-gray-900 dark:text-white">
          {selected.length > 0 ? `${selected.length} seleccionados` : placeholder}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
            >
              <input
                type="checkbox"
                readOnly
                checked={selected.includes(option.id)}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">{option.name}</span>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map(id => (
            <div key={id} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-1 text-sm">
              <span className="text-gray-900 dark:text-white">{getOptionName(id)}</span>
              <button
                type="button"
                onClick={() => handleSelect(id)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 