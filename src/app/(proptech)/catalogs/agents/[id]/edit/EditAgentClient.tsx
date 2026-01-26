"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Agent, AgentFormData } from '../../types';
import { updateAgent } from '../../services/agentService';
import AgentForm from '../../components/AgentForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ChevronLeft } from 'lucide-react';

interface EditAgentClientProps {
  agent: Agent | null;
  agencies: Array<{id: string, name: string, active: boolean}>;
  agentId: string;
}

export default function EditAgentClient({ agent, agencies, agentId }: EditAgentClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    nombre: '',
    apellido: '',
    firstName: '',
    lastName: '',
    email: '',
    telefono: '',
    phone: '',
    dni: '',
    license: '',
    licenciaInmobiliaria: '',
    position: '',
    bio: '',
    photo: '',
    fotoPerfilUrl: '',
    agencyId: '',
    agencyName: '',
    isActive: true,
    active: true,
    role: 'agente'
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        // Usar tanto los campos nuevos como legacy
        nombre: agent.nombre || agent.firstName || '',
        apellido: agent.apellido || agent.lastName || '',
        firstName: agent.firstName || agent.nombre || '',
        lastName: agent.lastName || agent.apellido || '',
        email: agent.email || '',
        telefono: agent.telefono || agent.phone || '',
        phone: agent.phone || agent.telefono || '',
        dni: agent.dni || '',
        license: agent.license || agent.licenciaInmobiliaria || '',
        licenciaInmobiliaria: agent.licenciaInmobiliaria || agent.license || '',
        position: agent.position || '',
        bio: agent.bio || '',
        photo: agent.photo || agent.fotoPerfilUrl || '',
        fotoPerfilUrl: agent.fotoPerfilUrl || agent.photo || '',
        agencyId: agent.agencyId || '',
        agencyName: agent.agencyName || '',
        isActive: agent.isActive !== undefined ? agent.isActive : true,
        active: agent.active !== undefined ? agent.active : true,
        role: agent.role || 'agente'
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    
    setIsSubmitting(true);
    try {
      await updateAgent(agent.id, formData);
      // El backend sincroniza automáticamente la foto con el usuario en la base de datos
      // La BD es la fuente de verdad - no necesitamos actualizar localStorage manualmente
      router.push('/catalogs/agents');
    } catch (error) {
      console.error('Error updating agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/catalogs/agents');
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando agente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver a agentes
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editar Agente
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Modifica la información del agente {agent.firstName} {agent.lastName}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <AgentForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={true}
            isLoading={isSubmitting}
            agencies={agencies}
          />
        </div>
      </div>
    </div>
  );
}
