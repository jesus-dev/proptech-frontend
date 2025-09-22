"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Agency, AgencyFormData } from '../../types';
import { getAgencyById, updateAgency } from '../../services/agencyService';
import AgencyForm from '../../components/AgencyForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditAgencyPage({ params }: PageProps) {
  const [agencyId, setAgencyId] = useState<string>('');
  
  useEffect(() => {
    params.then(({ id }) => setAgencyId(id));
  }, [params]);
  const router = useRouter();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState<AgencyFormData>({
    name: '',
    address: undefined,
    phone: undefined,
    email: undefined,
    website: undefined,
    logoUrl: undefined,
    description: undefined,
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        setLoading(true);
        const data = await getAgencyById(Number(agencyId));
        if (!data) {
          throw new Error('Agencia no encontrada');
        }
        setAgency(data);
      } catch (error) {
        console.error('Error fetching agency:', error);
        setError('Error al cargar la agencia');
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) {
      fetchAgency();
    }
  }, [agencyId]);

  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name,
        address: agency.address,
        phone: agency.phone,
        email: agency.email,
        website: agency.website,
        logoUrl: agency.logoUrl,
        description: agency.description,
        active: agency.active,
      });
    }
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateAgency(Number(agencyId), formData);
      router.push('/catalogs/agencies');
    } catch (error) {
      console.error('Error updating agency:', error);
      setError('Error al actualizar la agencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/catalogs/agencies');
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Agencia no encontrada'}
        </div>
      </div>
    );
  }

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
              Editar Agencia
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Modifica los datos de la agencia
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
          onCancel={handleCancel}
          isEditing={true}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
} 