"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { currencyService } from "../services/currencyService";
import { Currency } from "../services/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export default function CurrencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currencyId = Number(params?.id);

  useEffect(() => {
    if (currencyId) {
      loadCurrency();
    }
  }, [currencyId]);

  const loadCurrency = async () => {
    try {
      setLoading(true);
      const data = await currencyService.getById(currencyId);
      setCurrency(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar la moneda",
        variant: "destructive",
      });
      router.push("/catalogs/currencies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currency) return;
    
    if (!confirm("¿Estás seguro de que quieres eliminar esta moneda? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setActionLoading(true);
      await currencyService.delete(currency.id);
      toast({
        title: "Moneda eliminada",
        description: "La moneda ha sido eliminada exitosamente.",
      });
      router.push("/catalogs/currencies");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la moneda",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currency) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Moneda no encontrada
          </h2>
          <Link
            href="/catalogs/currencies"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/catalogs/currencies"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currency.name}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Moneda #{currency.id}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currency.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {currency.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  {currency.isBase && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      Moneda Base
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link
                    href={`/catalogs/currencies/${currency.id}/edit`}
                    className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Editar Moneda
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Eliminar Moneda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información Básica
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Código
                  </label>
                  <p className="text-lg font-mono text-gray-900 dark:text-white">
                    {currency.code}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Símbolo
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {currency.symbol}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tasa de Cambio
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {currency.exchangeRate ? currency.exchangeRate.toFixed(4) : '0.0000'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Decimales
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {currency.decimalPlaces}
                  </p>
                </div>

                {currency.format && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Formato de Visualización
                    </label>
                    <p className="text-lg font-mono text-gray-900 dark:text-white">
                      {currency.format}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            {currency.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Descripción
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currency.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estado
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Estado
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    currency.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {currency.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Moneda Base
                  </span>
                  {currency.isBase ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      Sí
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      No
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ejemplo de Formato */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ejemplo de Formato
              </h3>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Valor de ejemplo
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currency.symbol}1,234.56
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Con formato personalizado
                  </label>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {currency.format ? `Formato: ${currency.format}` : 'Sin formato personalizado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 