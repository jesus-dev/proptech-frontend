"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contact, ContactFormData } from "../../types";
import { contactService } from "../../services/contactService";
import ContactForm from "../../components/ContactForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditContactPage({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    const loadContact = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const contactData = await contactService.getContactById(id);
        if (contactData) {
          setContact(contactData);
        } else {
          setError("Contacto no encontrado");
        }
      } catch (err) {
        console.error("Error loading contact:", err);
        setError("Error al cargar el contacto");
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id]);

  const handleSubmit = async (formData: ContactFormData) => {
    if (!id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await contactService.updateContact(id, formData);
      
      router.push(`/contacts/${id}`);
    } catch (err) {
      console.error("Error updating contact:", err);
      setError("Error al actualizar el contacto");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!id) return;
    router.push(`/contacts/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando contacto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar el contacto
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              Reintentar
            </button>
            <Link
              href="/contacts"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Volver a Contactos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Contacto no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se pudo cargar el contacto solicitado.
          </p>
          <Link
            href="/contacts"
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Volver a Contactos
          </Link>
        </div>
      </div>
    );
  }

  // Convertir el contacto a ContactFormData
  const initialFormData: ContactFormData = {
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    email: contact.email || "",
    phone: contact.phone || "",
    type: contact.type || "prospect",
    status: contact.status || "lead",
    company: contact.company || "",
    position: contact.position || "",
    address: contact.address || "",
    city: contact.city || "",
    state: contact.state || "",
    zip: contact.zip || "",
    country: contact.country || "Paraguay",
    notes: contact.notes || "",
    source: contact.source || "",
    budget: contact.budget || {
      min: undefined,
      max: undefined,
      currency: "USD"
    },
    preferences: contact.preferences || {
      propertyType: [],
      location: [],
      bedrooms: undefined,
      bathrooms: undefined,
      area: {
        min: undefined,
        max: undefined
      }
    },
    tags: contact.tags || [],
    assignedTo: contact.assignedTo || "",
    lastContact: contact.lastContact || "",
    nextFollowUp: contact.nextFollowUp || ""
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={id ? `/contacts/${id}` : '/contacts'}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Contacto
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {contact.firstName} {contact.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <ContactForm
              initialData={initialFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={true}
              isLoading={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 