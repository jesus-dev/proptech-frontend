"use client";
import Image from 'next/image';
import React from 'react';
// Iconos reemplazados con SVG inline para evitar problemas de tipos
import { Agency } from '../types';
interface AgencyTableProps {
  agencies: Agency[];
  onView: (agency: Agency) => void;
  onEdit: (agency: Agency) => void;
  onDelete: (agency: Agency) => void;
}

export default function AgencyTable({
  agencies,
  onView,
  onEdit,
  onDelete,
}: AgencyTableProps) {
  if (agencies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No hay agencias registradas</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Comienza creando tu primera agencia</p>
      </div>
    );
  }

  return (
    <div className="card-modern overflow-hidden">
      <div className="px-6 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-gradient">
          Lista de Agencias ({agencies.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Web
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {agencies.map((agency) => (
              <tr key={agency.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-all duration-300">
                {/* Nombre y Logo */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {agency.logoUrl ? (
                      <img 
                        className="h-10 w-10 rounded-full mr-3" 
                        src={agency.logoUrl} 
                        alt={agency.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {agency.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {agency.name}
                      </div>
                      {agency.address && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {agency.address}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contacto */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {agency.email || 'Sin email'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {agency.phone || 'Sin teléfono'}
                  </div>
                </td>

                {/* Website */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {agency.website ? (
                    <a 
                      href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-600 hover:underline"
                    >
                      {agency.website}
                    </a>
                  ) : (
                    <span className="text-gray-400">Sin web</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                    agency.active
                      ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300"
                  }`}>
                    {agency.active ? "Activa" : "Inactiva"}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(agency)}
                      className="p-2 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400 hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      title="Ver detalles"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(agency)}
                      className="p-2 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-600 dark:text-yellow-400 hover:from-yellow-200 hover:to-yellow-300 dark:hover:from-yellow-800/50 dark:hover:to-yellow-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(agency)}
                      className="p-2 rounded-xl bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-600 dark:text-red-400 hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/50 dark:hover:to-red-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 