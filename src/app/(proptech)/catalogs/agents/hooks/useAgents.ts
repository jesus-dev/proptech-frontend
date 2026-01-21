"use client";

import { useState, useEffect, useCallback } from 'react';
import { Agent, AgentFormData, AgentFilters as AgentFiltersType, AgentStats } from '../types';
import {
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  searchAgents,
  getAgentStats,
  getAllAgencies,
} from '../services/agentService';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [agencies, setAgencies] = useState<Array<{id: string, name: string, active: boolean}>>([]);
  const [stats, setStats] = useState<AgentStats>({ 
    total: 0, 
    active: 0, 
    inactive: 0, 
    withAgency: 0, 
    withoutAgency: 0,
    canLogin: 0,
    locked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all agents
  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAgents();
      setAgents(data);
      
      // Update stats
      const statsData = await getAgentStats();
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar los agentes');
      console.error('Error loading agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load agencies
  const loadAgencies = useCallback(async () => {
    try {
      const agenciesData = await getAllAgencies();
      setAgencies(agenciesData);
    } catch (err) {
      console.error('Error loading agencies:', err);
    }
  }, []);

  // Create new agent
  const createNewAgent = useCallback(async (data: AgentFormData) => {
    try {
      setError(null);
      await createAgent(data);
      await loadAgents();
      return true;
    } catch (err) {
      setError('Error al crear el agente');
      console.error('Error creating agent:', err);
      return false;
    }
  }, [loadAgents]);

  // Update existing agent
  const updateExistingAgent = useCallback(async (id: string, data: Partial<AgentFormData>) => {
    try {
      setError(null);
      await updateAgent(id, data);
      await loadAgents();
      return true;
    } catch (err) {
      setError('Error al actualizar el agente');
      console.error('Error updating agent:', err);
      return false;
    }
  }, [loadAgents]);

  // Delete existing agent
  const deleteExistingAgent = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteAgent(id);
      await loadAgents();
      return true;
    } catch (err) {
      setError('Error al eliminar el agente');
      console.error('Error deleting agent:', err);
      return false;
    }
  }, [loadAgents]);

  // Filter agents
  const filterAgents = useCallback((filters: AgentFiltersType) => {
    let filtered = agents;

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(agent =>
        (agent.nombre || agent.firstName || '').toLowerCase().includes(searchTerm) ||
        (agent.apellido || agent.lastName || '').toLowerCase().includes(searchTerm) ||
        (agent.nombreCompleto || '').toLowerCase().includes(searchTerm) ||
        agent.email.toLowerCase().includes(searchTerm) ||
        (agent.telefono || agent.phone || '').includes(searchTerm) ||
        (agent.username || '').toLowerCase().includes(searchTerm) ||
        (agent.position || '').toLowerCase().includes(searchTerm) ||
        (agent.agencyName || '').toLowerCase().includes(searchTerm)
      );
    }

    // Apply active filter
    if (filters.active !== null) {
      filtered = filtered.filter(agent => agent.active === filters.active);
    }

    // Apply agency filter
    if (filters.agencyId) {
      filtered = filtered.filter(agent => agent.agencyId === filters.agencyId);
    }

    // Apply isActive filter
    if (filters.isActive !== null) {
      filtered = filtered.filter(agent => agent.isActive === filters.isActive);
    }

    // Apply tenant filter (solo para super admin)
    if (filters.tenantId !== null && filters.tenantId !== undefined) {
      filtered = filtered.filter(agent => agent.tenantId === filters.tenantId);
    }

    setFilteredAgents(filtered);
  }, [agents]);

  // Get agent by ID
  const getAgentById = useCallback((id: string) => {
    return agents.find(agent => agent.id === id) || null;
  }, [agents]);

  // Load initial data
  useEffect(() => {
    loadAgents();
    loadAgencies();
  }, [loadAgents, loadAgencies]);

  // Update filtered agents when agents change
  useEffect(() => {
    setFilteredAgents(agents);
  }, [agents]);

  return {
    // State
    agents,
    filteredAgents,
    agencies,
    stats,
    loading,
    error,
    
    // Actions
    loadAgents,
    createNewAgent,
    updateExistingAgent,
    deleteExistingAgent,
    filterAgents,
    getAgentById,
    
    // Utilities
    clearError: () => setError(null),
  };
} 