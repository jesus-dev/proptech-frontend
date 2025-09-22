"use client";

import { useState, useEffect, useCallback } from 'react';
import { Client } from '../components/types';
import { clientService } from '../services/clientService';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all clients
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new client
  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newClient = await clientService.createClient(clientData);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError('Error al crear el cliente');
      console.error('Error creating client:', err);
      throw err;
    }
  }, []);

  // Update client
  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    try {
      setError(null);
      const updatedClient = await clientService.updateClient(id, updates);
      if (updatedClient) {
        setClients(prev => prev.map(client => 
          client.id === id ? updatedClient : client
        ));
      }
      return updatedClient;
    } catch (err) {
      setError('Error al actualizar el cliente');
      console.error('Error updating client:', err);
      throw err;
    }
  }, []);

  // Delete client
  const deleteClient = useCallback(async (id: string) => {
    try {
      setError(null);
      const success = await clientService.deleteClient(id);
      if (success) {
        setClients(prev => prev.filter(client => client.id !== id));
      }
      return success;
    } catch (err) {
      setError('Error al eliminar el cliente');
      console.error('Error deleting client:', err);
      throw err;
    }
  }, []);

  // Search clients
  const searchClients = useCallback(async (query: string) => {
    try {
      setError(null);
      const results = await clientService.searchClients(query);
      return results;
    } catch (err) {
      setError('Error al buscar clientes');
      console.error('Error searching clients:', err);
      throw err;
    }
  }, []);

  // Get client by ID
  const getClientById = useCallback(async (id: string) => {
    try {
      setError(null);
      const client = await clientService.getClientById(id);
      return client;
    } catch (err) {
      setError('Error al obtener el cliente');
      console.error('Error getting client:', err);
      throw err;
    }
  }, []);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    clients,
    loading,
    error,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    getClientById,
  };
} 