"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AgencyForm from "../components/AgencyForm";
import { AgencyFormData } from "../types";
import { createAgency } from "../services/agencyService";
import { ChevronLeft } from 'lucide-react';

export default function NewAgencyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AgencyFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    description: '',
    active: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createAgency(formData);
      router.push('/catalogs/agencies');
    } catch (error) {
      alert('Error al crear la agencia');
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
            onClick={() => router.push('/catalogs/agencies')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nueva Agencia
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crea una nueva agencia inmobiliaria
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <AgencyForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/catalogs/agencies')}
          isEditing={false}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 