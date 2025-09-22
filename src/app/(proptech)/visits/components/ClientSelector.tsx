"use client";
import React, { useState, useEffect } from 'react';
import { clientService } from '../../developments/services/clientService';
import { Client } from '../../developments/components/types';
import ModernPopup from '@/components/ui/ModernPopup';
import { User, Plus, Search, X } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  onClientDataChange?: (clientData: Partial<Client>) => void;
  required?: boolean;
  className?: string;
}

export default function ClientSelector({ 
  value, 
  onChange, 
  onClientDataChange,
  required = false,
  className = ""
}: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: ''
  });

  // Cargar clientes
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes basado en búsqueda
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.dni.includes(searchTerm)
    );
  });

  // Crear cliente rápidamente
  const handleCreateClient = async () => {
    if (!newClientData.firstName || !newClientData.lastName || !newClientData.email) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    setCreatingClient(true);
    try {
      const newClient = await clientService.createClient({
        ...newClientData,
        address: '',
        city: '',
        state: '',
        zip: ''
      });

      // Actualizar lista de clientes
      setClients(prev => [...prev, newClient]);
      
      // Seleccionar el nuevo cliente
      onChange(newClient.id);
      
      // Pasar datos del cliente al formulario padre
      if (onClientDataChange) {
        onClientDataChange({
          firstName: newClient.firstName,
          lastName: newClient.lastName,
          email: newClient.email,
          phone: newClient.phone,
          dni: newClient.dni
        });
      }

      // Cerrar modal y limpiar datos
      setShowCreateModal(false);
      setNewClientData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dni: ''
      });
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error al crear el cliente');
    } finally {
      setCreatingClient(false);
    }
  };

  // Obtener cliente seleccionado
  const selectedClient = clients.find(c => c.id === value);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Cliente {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {/* Campo de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            title="Crear nuevo cliente"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de clientes filtrados */}
        {searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="py-1">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      onChange(client.id);
                      setSearchTerm(`${client.firstName} ${client.lastName}`);
                      if (onClientDataChange) {
                        onClientDataChange({
                          firstName: client.firstName,
                          lastName: client.lastName,
                          email: client.email,
                          phone: client.phone,
                          dni: client.dni
                        });
                      }
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {client.email} • {client.dni}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No se encontraron clientes</p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm"
                >
                  Crear nuevo cliente
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cliente seleccionado */}
        {selectedClient && !searchTerm && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedClient.email} • {selectedClient.phone}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setSearchTerm('');
                  if (onClientDataChange) {
                    onClientDataChange({});
                  }
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear cliente rápidamente */}
      <ModernPopup
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Cliente Rápidamente"
        subtitle="Complete los datos básicos del cliente"
        icon={<User className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateClient(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={newClientData.firstName}
                onChange={(e) => setNewClientData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                placeholder="Juan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={newClientData.lastName}
                onChange={(e) => setNewClientData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={newClientData.email}
              onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              placeholder="juan.perez@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={newClientData.phone}
                onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                placeholder="+595 981 123-456"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                DNI
              </label>
              <input
                type="text"
                value={newClientData.dni}
                onChange={(e) => setNewClientData(prev => ({ ...prev, dni: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                placeholder="12345678"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-all duration-200"
              disabled={creatingClient}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creatingClient}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 border border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {creatingClient ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  Crear Cliente
                </div>
              )}
            </button>
          </div>
        </form>
      </ModernPopup>
    </div>
  );
} 