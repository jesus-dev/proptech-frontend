import React from 'react';
import { DevelopmentFormData } from '../../hooks/useDevelopmentForm';

interface TypeStepProps {
  formData: DevelopmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
}

const TypeStep: React.FC<TypeStepProps> = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Emprendimiento
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <div className="relative">
            <input
              type="radio"
              id="loteamiento"
              name="type"
              value="loteamiento"
              checked={formData.type === 'loteamiento'}
              onChange={handleChange}
              className="peer sr-only"
            />
            <label
              htmlFor="loteamiento"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-3 sm:p-4 hover:bg-gray-50 peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <svg
                className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Loteamiento</span>
            </label>
          </div>

          <div className="relative">
            <input
              type="radio"
              id="edificio"
              name="type"
              value="edificio"
              checked={formData.type === 'edificio'}
              onChange={handleChange}
              className="peer sr-only"
            />
            <label
              htmlFor="edificio"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-3 sm:p-4 hover:bg-gray-50 peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <svg
                className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Edificio</span>
            </label>
          </div>

          <div className="relative">
            <input
              type="radio"
              id="condominio"
              name="type"
              value="condominio"
              checked={formData.type === 'condominio'}
              onChange={handleChange}
              className="peer sr-only"
            />
            <label
              htmlFor="condominio"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-3 sm:p-4 hover:bg-gray-50 peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <svg
                className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Condominio</span>
            </label>
          </div>

          <div className="relative">
            <input
              type="radio"
              id="barrio_cerrado"
              name="type"
              value="barrio_cerrado"
              checked={formData.type === 'barrio_cerrado'}
              onChange={handleChange}
              className="peer sr-only"
            />
            <label
              htmlFor="barrio_cerrado"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-3 sm:p-4 hover:bg-gray-50 peer-checked:border-brand-500 peer-checked:ring-2 peer-checked:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <svg
                className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Barrio Cerrado</span>
            </label>
          </div>
        </div>
        {errors.type && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
        )}
      </div>
    </div>
  );
};

export default TypeStep; 