"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgentForm from "../components/AgentForm";
import { AgentFormData } from "../types";
import { createAgent, getAllAgencies } from "../services/agentService";
import { ChevronLeft } from 'lucide-react';

export default function NewAgentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AgentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    license: '',
    position: '',
    bio: '',
    photo: '',
    agencyId: '',
    username: '',
    password: '',
    isActive: true,
    active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState<Array<{id: string, name: string, active: boolean}>>([]);

  useEffect(() => {
    const loadAgencies = async () => {
      try {
        const agenciesData = await getAllAgencies();
        setAgencies(agenciesData);
      } catch (error) {
        console.error('Error loading agencies:', error);
      }
    };
    loadAgencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createAgent(formData);
      router.push('/catalogs/agents');
    } catch (error) {
      alert('Error al crear el agente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/catalogs/agents')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nuevo Agente
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crea un nuevo agente inmobiliario
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <AgentForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/catalogs/agents')}
          isEditing={false}
          isLoading={isLoading}
          agencies={agencies}
        />
      </div>
    </div>
  );
}
