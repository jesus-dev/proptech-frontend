"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Client } from "../developments/components/types";
import { clientService } from "../developments/services/clientService";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.dni.includes(searchTerm) ||
      client.phone.includes(searchTerm)
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este cliente?")) {
      try {
        await clientService.deleteClient(clientId);
        await loadClients();
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-cyan-900 dark:from-white dark:via-teal-200 dark:to-cyan-200 bg-clip-text text-transparent">
                  Gestión de Clientes
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Gestiona tu base de datos de clientes
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/clients/new">
                <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-500/30">
                  <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                  Nuevo Cliente
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email, DNI o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Content */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {client.firstName} {client.lastName}
                  </h3>
                  <div className="flex space-x-2">
                    <Link
                      href={`/clients/${client.id}/edit`}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{client.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{client.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">DNI:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{client.dni}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Dirección:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {client.address}, {client.city}, {client.state} {client.zip}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Creado: {new Date(client.createdAt).toLocaleDateString('es-ES')}</span>
                    <span>Actualizado: {new Date(client.updatedAt).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "No se encontraron clientes que coincidan con la búsqueda." : "No hay clientes registrados."}
          </p>
          {!searchTerm && (
            <Link
              href="/clients/new"
              className="mt-4 inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Agregar Primer Cliente
            </Link>
          )}
        </div>
      )}
      </div>
    </div>
  );
} 