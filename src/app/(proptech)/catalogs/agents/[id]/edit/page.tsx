"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAgentById, getAllAgencies } from '../../services/agentService';
import EditAgentClient from './EditAgentClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Agent } from '../../types';

export default function EditAgentPage() {
  const params = useParams();
  const agentId = params?.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agencies, setAgencies] = useState<Array<{id: string, name: string, active: boolean}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [agentData, agenciesData] = await Promise.all([
          getAgentById(agentId),
          getAllAgencies()
        ]);
        
        setAgent(agentData);
        setAgencies(agenciesData);
      } catch (err) {
        console.error('Error loading agent:', err);
        setError('Error al cargar el agente');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      loadData();
    }
  }, [agentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando agente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <EditAgentClient 
      agent={agent} 
      agencies={agencies} 
      agentId={agentId}
    />
  );
}