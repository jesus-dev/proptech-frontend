"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Sector {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

interface Agency {
  id: number;
  name: string;
  sectorId: number;
  sector: Sector;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface SectorContextType {
  // Estado actual
  currentSector: Sector | null;
  currentAgency: Agency | null;
  availableSectors: Sector[];
  availableAgencies: Agency[];
  
  // Estado de carga
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  setCurrentSector: (sector: Sector | null) => void;
  setCurrentAgency: (agency: Agency | null) => void;
  switchSector: (sectorId: number) => void;
  switchAgency: (agencyId: number) => void;
  refreshSectors: () => Promise<void>;
  clearError: () => void;
  
  // Utilidades
  isInSector: (sectorId: number) => boolean;
  isInAgency: (agencyId: number) => boolean;
  getUserSector: () => Sector | null;
  getUserAgency: () => Agency | null;
}

const SectorContext = createContext<SectorContextType | undefined>(undefined);

export const useSector = () => {
  const context = useContext(SectorContext);
  if (!context) {
    throw new Error('useSector must be used within a SectorProvider');
  }
  return context;
};

interface SectorProviderProps {
  children: ReactNode;
}

export const SectorProvider: React.FC<SectorProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Estado del contexto
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  const [availableSectors, setAvailableSectors] = useState<Sector[]>([]);
  const [availableAgencies, setAvailableAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar sectores y agencias disponibles
  const loadSectorsAndAgencies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simular carga de sectores (en producción esto vendría de una API)
      const mockSectors: Sector[] = [
        { id: 1, name: 'Residencial', description: 'Propiedades residenciales', color: '#3B82F6' },
        { id: 2, name: 'Comercial', description: 'Propiedades comerciales', color: '#10B981' },
        { id: 3, name: 'Industrial', description: 'Propiedades industriales', color: '#F59E0B' },
        { id: 4, name: 'Terrenos', description: 'Terrenos y lotes', color: '#8B5CF6' },
      ];

      const mockAgencies: Agency[] = [
        { id: 1, name: 'ON PropTech Central', sectorId: 1, sector: mockSectors[0], logoUrl: '/images/logo/proptech.png' },
        { id: 2, name: 'ON PropTech Norte', sectorId: 1, sector: mockSectors[0], logoUrl: '/images/logo/proptech.png' },
        { id: 3, name: 'ON PropTech Sur', sectorId: 2, sector: mockSectors[1], logoUrl: '/images/logo/proptech.png' },
        { id: 4, name: 'ON PropTech Este', sectorId: 3, sector: mockSectors[2], logoUrl: '/images/logo/proptech.png' },
      ];

      setAvailableSectors(mockSectors);
      setAvailableAgencies(mockAgencies);

      // Si el usuario está autenticado, establecer su sector/agencia por defecto
      if (isAuthenticated && user) {
        // Por ahora, asignar el primer sector como default
        // En producción esto vendría del perfil del usuario
        const defaultSector = mockSectors[0];
        const defaultAgency = mockAgencies.find(agency => agency.sectorId === defaultSector.id);
        
        setCurrentSector(defaultSector);
        if (defaultAgency) {
          setCurrentAgency(defaultAgency);
        }
      }

    } catch (err) {
      setError('Error al cargar sectores y agencias');
      console.error('Error loading sectors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar sector
  const switchSector = (sectorId: number) => {
    const sector = availableSectors.find(s => s.id === sectorId);
    if (sector) {
      setCurrentSector(sector);
      
      // Buscar una agencia en ese sector
      const agencyInSector = availableAgencies.find(a => a.sectorId === sectorId);
      if (agencyInSector) {
        setCurrentAgency(agencyInSector);
      } else {
        setCurrentAgency(null);
      }
      
      // Guardar en localStorage
      localStorage.setItem('currentSectorId', sectorId.toString());
      if (agencyInSector) {
        localStorage.setItem('currentAgencyId', agencyInSector.id.toString());
      }
    }
  };

  // Cambiar agencia
  const switchAgency = (agencyId: number) => {
    const agency = availableAgencies.find(a => a.id === agencyId);
    if (agency) {
      setCurrentAgency(agency);
      setCurrentSector(agency.sector);
      
      // Guardar en localStorage
      localStorage.setItem('currentAgencyId', agencyId.toString());
      localStorage.setItem('currentSectorId', agency.sectorId.toString());
    }
  };

  // Verificar si el usuario está en un sector específico
  const isInSector = (sectorId: number) => {
    return currentSector?.id === sectorId;
  };

  // Verificar si el usuario está en una agencia específica
  const isInAgency = (agencyId: number) => {
    return currentAgency?.id === agencyId;
  };

  // Obtener el sector del usuario
  const getUserSector = () => {
    return currentSector;
  };

  // Obtener la agencia del usuario
  const getUserAgency = () => {
    return currentAgency;
  };

  // Refrescar sectores
  const refreshSectors = async () => {
    await loadSectorsAndAgencies();
  };

  // Limpiar error
  const clearError = () => {
    setError(null);
  };

  // Cargar sector/agencia guardado en localStorage
  useEffect(() => {
    const savedSectorId = localStorage.getItem('currentSectorId');
    const savedAgencyId = localStorage.getItem('currentAgencyId');
    
    if (savedSectorId && savedAgencyId) {
      const sectorId = parseInt(savedSectorId);
      const agencyId = parseInt(savedAgencyId);
      
      const sector = availableSectors.find(s => s.id === sectorId);
      const agency = availableAgencies.find(a => a.id === agencyId);
      
      if (sector && agency) {
        setCurrentSector(sector);
        setCurrentAgency(agency);
      }
    }
  }, [availableSectors, availableAgencies]);

  // Cargar datos iniciales
  useEffect(() => {
    loadSectorsAndAgencies();
  }, [isAuthenticated]);

  const value: SectorContextType = {
    // Estado
    currentSector,
    currentAgency,
    availableSectors,
    availableAgencies,
    isLoading,
    error,
    
    // Acciones
    setCurrentSector,
    setCurrentAgency,
    switchSector,
    switchAgency,
    refreshSectors,
    clearError,
    
    // Utilidades
    isInSector,
    isInAgency,
    getUserSector,
    getUserAgency,
  };

  return (
    <SectorContext.Provider value={value}>
      {children}
    </SectorContext.Provider>
  );
};

