"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { condominiumService, Condominium } from "@/services/condominiumService";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CondominiumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [loading, setLoading] = useState(true);
  const [condominium, setCondominium] = useState<Condominium | null>(null);

  useEffect(() => {
    loadCondominium();
  }, [id]);

  const loadCondominium = async () => {
    try {
      setLoading(true);
      const data = await condominiumService.getCondominiumById(id);
      setCondominium(data);
    } catch (error: any) {
      console.error("Error loading condominium:", error);
      toast.error(error?.message || "Error al cargar condominio");
      router.push("/condominiums");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este condominio? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await condominiumService.deleteCondominium(id);
      toast.success("Condominio eliminado exitosamente");
      router.push("/condominiums");
    } catch (error: any) {
      console.error("Error deleting condominium:", error);
      toast.error(error?.message || "Error al eliminar condominio");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!condominium) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/condominiums"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Condominios
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {condominium.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{condominium.city}{condominium.state && `, ${condominium.state}`}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/condominiums/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            {condominium.description && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Descripción
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {condominium.description}
                </p>
              </div>
            )}

            {/* Ubicación */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ubicación
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dirección</p>
                    <p className="text-gray-600 dark:text-gray-400">{condominium.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ciudad</p>
                    <p className="text-gray-900 dark:text-white">{condominium.city}</p>
                  </div>
                  {condominium.state && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                      <p className="text-gray-900 dark:text-white">{condominium.state}</p>
                    </div>
                  )}
                  {condominium.zip && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Código Postal</p>
                      <p className="text-gray-900 dark:text-white">{condominium.zip}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">País</p>
                    <p className="text-gray-900 dark:text-white">{condominium.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Administrador */}
            {(condominium.administratorName || condominium.administratorEmail || condominium.administratorPhone) && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Administrador
                </h2>
                <div className="space-y-3">
                  {condominium.administratorName && (
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{condominium.administratorName}</p>
                    </div>
                  )}
                  {condominium.administratorEmail && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`mailto:${condominium.administratorEmail}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {condominium.administratorEmail}
                      </a>
                    </div>
                  )}
                  {condominium.administratorPhone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`tel:${condominium.administratorPhone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {condominium.administratorPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información General */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Información
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                  <span className={`inline-flex px-2 py-1 rounded-md text-sm font-medium ${
                    condominium.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {condominium.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {condominium.createdAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(condominium.createdAt).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                )}
                {condominium.updatedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Última actualización</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(condominium.updatedAt).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

