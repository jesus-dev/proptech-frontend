"use client";
import Image from 'next/image';

import React from 'react';
import { Agent } from '../types';
// Iconos reemplazados con SVG inline para evitar problemas de tipos
interface AgentTableProps {
  agents: Agent[];
  onView: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export default function AgentTable({
  agents,
  onView,
  onEdit,
  onDelete,
}: AgentTableProps) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No hay agentes registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Lista de Agentes ({agents.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Agente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Agencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {/* Agente */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {agent.photo ? (
                      <img 
                        className="h-10 w-10 rounded-full mr-3" 
                        src={agent.photo} 
                        alt={`${agent.firstName} ${agent.lastName}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {(agent.nombre || agent.firstName || '').charAt(0)}
                          {(agent.apellido || agent.lastName || '').charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent.nombreCompleto || `${agent.nombre || agent.firstName || ''} ${agent.apellido || agent.lastName || ''}`.trim()}
                      </div>
                      {agent.position && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {agent.position}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {agent.email || '-'}
                  </div>
                </td>

                {/* Teléfono */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {agent.phone || '-'}
                  </div>
                </td>

                {/* Agencia */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {agent.agencyName ? (
                    <div className="text-sm text-gray-900 dark:text-white">
                      {agent.agencyName}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      Sin agencia
                    </span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {/* Estado del agente */}
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                        agent.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      }`}>
                        {agent.active ? "✓ Activo" : "○ Inactivo"}
                      </span>
                    </div>
                    
                    {/* Estado de acceso al sistema */}
                    {agent.username && (
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                          agent.isActive
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          {agent.isActive ? "🔓 Acceso habilitado" : "🔒 Acceso bloqueado"}
                        </span>
                      </div>
                    )}
                    
                    {/* Último acceso */}
                    {agent.lastLogin && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Últ. acceso: {new Date(agent.lastLogin).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </div>
                    )}
                    
                    {/* Show lock status if account is locked */}
                    {agent.lockedUntil && new Date(agent.lockedUntil) > new Date() && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Bloqueado hasta {new Date(agent.lockedUntil).toLocaleDateString('es-ES')}
                      </div>
                    )}
                    
                    {/* Show login attempts if > 0 */}
                    {agent.loginAttempts && agent.loginAttempts > 0 && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        ⚠️ {agent.loginAttempts} intentos fallidos
                      </div>
                    )}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(agent)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Ver detalles"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(agent)}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(agent)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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