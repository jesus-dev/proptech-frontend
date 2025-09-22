import React from 'react';
import { getAgentById, getAllAgencies } from '../../services/agentService';
import EditAgentClient from './EditAgentClient';

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditAgentPage({ params }: PageProps) {
  const { id: agentId } = await params;
  
  // Fetch data server-side
  const [agent, agencies] = await Promise.all([
    getAgentById(agentId),
    getAllAgencies()
  ]);

  return (
    <EditAgentClient 
      agent={agent} 
      agencies={agencies} 
      agentId={agentId}
    />
  );
}