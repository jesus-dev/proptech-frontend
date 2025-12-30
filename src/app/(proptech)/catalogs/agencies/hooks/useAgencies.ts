"use client";

import { useState, useEffect, useCallback } from 'react';
import { Agency, AgencyFormData, AgencyFilters, AgencyStats } from '../types';
import {
  getAllAgencies,
  createAgency,
  updateAgency,
  deleteAgency,
  searchAgencies,
  getAgencyStats,
  clearAllAgencies,
} from '../services/agencyService';

export function useAgencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [stats, setStats] = useState<AgencyStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all agencies
  const loadAgencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAgencies();
      setAgencies(data);
      
      // Update stats
      const statsData = await getAgencyStats();
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar las agencias');
      console.error('Error loading agencies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create agency
  const createNewAgency = useCallback(async (data: AgencyFormData) => {
    try {
      setError(null);
      await createAgency(data);
      // Recargar agencias después de crear
      const updatedData = await getAllAgencies();
      setAgencies(updatedData);
      
      // Actualizar stats
      const statsData = await getAgencyStats();
      setStats(statsData);
      return true;
    } catch (err) {
      setError('Error al crear la agencia');
      console.error('Error creating agency:', err);
      return false;
    }
  }, []);

  // Update agency
  const updateExistingAgency = useCallback(async (id: number, data: Partial<AgencyFormData>) => {
    try {
      setError(null);
      await updateAgency(id, data);
      // Recargar agencias después de actualizar
      const updatedData = await getAllAgencies();
      setAgencies(updatedData);
      
      // Actualizar stats
      const statsData = await getAgencyStats();
      setStats(statsData);
      return true;
    } catch (err) {
      setError('Error al actualizar la agencia');
      console.error('Error updating agency:', err);
      return false;
    }
  }, []);

  // Delete agency
  const deleteExistingAgency = useCallback(async (id: number) => {
    try {
      setError(null);
      await deleteAgency(id);
      // Recargar agencias después de eliminar
      const updatedData = await getAllAgencies();
      setAgencies(updatedData);
      
      // Actualizar stats
      const statsData = await getAgencyStats();
      setStats(statsData);
      return true;
    } catch (err) {
      setError('Error al eliminar la agencia');
      console.error('Error deleting agency:', err);
      return false;
    }
  }, []);

  // Filter agencies
  const filterAgencies = useCallback((filters: AgencyFilters) => {
    let filtered = agencies;

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(agency =>
        agency.name.toLowerCase().includes(searchTerm) ||
        (agency.address || '').toLowerCase().includes(searchTerm) ||
        (agency.email || '').toLowerCase().includes(searchTerm) ||
        (agency.phone || '').includes(searchTerm) ||
        (agency.website || '').toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.active !== null) {
      filtered = filtered.filter(agency => agency.active === filters.active);
    }

    setFilteredAgencies(filtered);
  }, [agencies]);

  // Get agency by ID
  const getAgencyById = useCallback((id: number) => {
    return agencies.find(agency => agency.id === id) || null;
  }, [agencies]);

  // Clear all data
  const clearAllData = useCallback(async () => {
    try {
      setError(null);
      await clearAllAgencies();
      // Recargar agencias después de limpiar
      const updatedData = await getAllAgencies();
      setAgencies(updatedData);
      
      // Actualizar stats
      const statsData = await getAgencyStats();
      setStats(statsData);
      return true;
    } catch (err) {
      setError('Error al limpiar datos');
      console.error('Error clearing data:', err);
      return false;
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadAgencies();
  }, []); // Solo se ejecuta al montar

  // Update filtered agencies when agencies change
  useEffect(() => {
    setFilteredAgencies(agencies);
  }, [agencies]);

  return {
    // State
    agencies,
    filteredAgencies,
    stats,
    loading,
    error,
    
    // Actions
    loadAgencies,
    createNewAgency,
    updateExistingAgency,
    deleteExistingAgency,
    filterAgencies,
    getAgencyById,
    clearAllData,
    
    // Utilities
    clearError: () => setError(null),
  };
} 