"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, PencilIcon, TrashIcon, EnvelopeIcon, PhoneIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Contact, ContactType, ContactStatus } from "../types";
import { contactService } from "../services/contactService";
import DeleteConfirmationDialog from "../../contracts/components/DeleteConfirmationDialog";

interface ContactCardProps {
  contact: Contact;
  onUpdate: () => void;
}

export default function ContactCard({ contact, onUpdate }: ContactCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getTypeLabel = (type: ContactType) => {
    switch (type) {
      case "client": return "Cliente";
      case "prospect": return "Interesado";
      case "buyer": return "Comprador";
      case "seller": return "Vendedor";
      default: return type;
    }
  };

  const getTypeColor = (type: ContactType) => {
    switch (type) {
      case "client":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "prospect":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "buyer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "seller":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: ContactStatus) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "lead": return "Lead";
      case "qualified": return "Calificado";
      case "converted": return "Convertido";
      default: return status;
    }
  };

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "lead":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "qualified":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "converted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await contactService.deleteContact(contact.id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {contact.firstName} {contact.lastName}
            </h3>
            {contact.company && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contact.position && `${contact.position} en `}{contact.company}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/contacts/${contact.id}/edit`}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <PencilIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type and Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(contact.type)}`}>
            {getTypeLabel(contact.type)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
            {getStatusLabel(contact.status)}
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-4 space-y-3">
        {/* Email and Phone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
            <a 
              href={`mailto:${contact.email}`}
              className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              {contact.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PhoneIcon className="w-4 h-4 text-gray-400" />
            <a 
              href={`tel:${contact.phone}`}
              className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              {contact.phone}
            </a>
          </div>
        </div>

        {/* Address */}
        {contact.address && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{contact.address}</p>
            <p>{contact.city}, {contact.state} {contact.zip}</p>
          </div>
        )}

        {/* Budget */}
        {contact.budget && (
          <div className="text-sm">
            <p className="text-gray-600 dark:text-gray-400 mb-1">Presupuesto:</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {contact.budget.min && formatCurrency(contact.budget.min, contact.budget.currency)}
              {contact.budget.max && ` - ${formatCurrency(contact.budget.max, contact.budget.currency)}`}
            </p>
          </div>
        )}

        {/* Preferences */}
        {contact.preferences && (
          <div className="text-sm">
            <p className="text-gray-600 dark:text-gray-400 mb-1">Interesado en:</p>
            <div className="flex flex-wrap gap-1">
              {contact.preferences.propertyType?.map((type, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-800 dark:text-brand-400 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Assigned To */}
        {contact.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UserIcon className="w-4 h-4" />
            <span>Asignado a: {contact.assignedTo}</span>
          </div>
        )}

        {/* Follow-up */}
        {contact.nextFollowUp && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Próximo seguimiento: {formatDate(contact.nextFollowUp)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Creado: {formatDate(contact.createdAt)}</span>
          <Link
            href={`/contacts/${contact.id}`}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
          >
            Ver detalles
          </Link>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Contacto"
          message={`¿Estás seguro de que quieres eliminar el contacto "${contact.firstName} ${contact.lastName}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
} 