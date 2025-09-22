"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, ArrowLeftIcon, PencilIcon, TrashIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { contactService } from "../services/contactService";
import { Contact, ContactType, ContactStatus } from "../types";
import DeleteContactDialog from "../components/DeleteContactDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ContactDetailsPage({ params }: PageProps) {
  const { id: contactId } = React.use(params);
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadContact();
  }, [contactId]);

  const loadContact = async () => {
    try {
      setLoading(true);
      const data = await contactService.getContactById(contactId);
      setContact(data || null);
    } catch (err) {
      setError("Error al cargar el contacto");
      console.error("Error loading contact:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contact) return;

    try {
      setIsDeleting(true);
      await contactService.deleteContact(contact.id);
      router.push("/contacts");
    } catch (err) {
      setError("Error al eliminar el contacto");
      console.error("Error deleting contact:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const getTypeLabel = (type: ContactType) => {
    const labels: Record<ContactType, string> = {
      client: "Cliente",
      prospect: "Interesado",
      buyer: "Comprador",
      seller: "Vendedor",
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: ContactStatus) => {
    const labels: Record<ContactStatus, string> = {
      active: "Activo",
      inactive: "Inactivo",
      lead: "Lead",
      qualified: "Calificado",
      converted: "Convertido",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: ContactStatus) => {
    const colors: Record<ContactStatus, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      lead: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      qualified: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      converted: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const getTypeColor = (type: ContactType) => {
    const colors: Record<ContactType, string> = {
      client: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      prospect: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      buyer: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      seller: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Contacto no encontrado"}</p>
          <Link
            href="/contacts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Contactos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {contact.firstName} {contact.lastName}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contacto creado el {new Date(contact.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/contacts/${contact.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            >
              <PencilIcon className="w-4 h-4" />
              Editar
            </Link>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Personal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre Completo
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {contact.firstName} {contact.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Contacto
                </label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(contact.type)}`}>
                  {getTypeLabel(contact.type)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                  {getStatusLabel(contact.status)}
                </span>
              </div>
              {contact.position && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cargo
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {contact.position}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información de Contacto
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono
                  </label>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {contact.company && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información de la Empresa
              </h2>
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Empresa
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {contact.company}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          {(contact.address || contact.city || contact.state) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dirección
              </h2>
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="space-y-1">
                  {contact.address && (
                    <p className="text-sm text-gray-900 dark:text-white">{contact.address}</p>
                  )}
                  {(contact.city || contact.state || contact.zip) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {[contact.city, contact.state, contact.zip].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {contact.country && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{contact.country}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notas
              </h2>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {contact.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Adicional
            </h2>
            <div className="space-y-4">
              {contact.source && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Origen
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {contact.source}
                  </p>
                </div>
              )}
              {contact.assignedTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Asignado a
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {contact.assignedTo}
                  </p>
                </div>
              )}
              {contact.tags && contact.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Etiquetas
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones Rápidas
            </h2>
            <div className="space-y-3">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <EnvelopeIcon className="w-4 h-4" />
                Enviar Email
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <PhoneIcon className="w-4 h-4" />
                Llamar
              </a>
            </div>
          </div>
        </div>
      </div>

      {showDeleteDialog && contact && (
        <DeleteContactDialog
          isOpen={showDeleteDialog}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          contactName={`${contact.firstName} ${contact.lastName}`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
} 