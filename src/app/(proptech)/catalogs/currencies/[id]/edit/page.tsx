"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { currencyService } from "../../services/currencyService";
import CurrencyForm from "../../components/CurrencyForm";
import { useToast } from "@/components/ui/use-toast";
import { Currency } from "../../services/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function EditCurrencyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currencyId = Number(params.id);

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

  const handleSubmit = async (data: Partial<Currency>) => {
    setSubmitting(true);
    try {
      await currencyService.update(currencyId, data);
      toast({
        title: "Moneda actualizada",
        description: "La moneda ha sido actualizada exitosamente.",
      });
      router.push("/catalogs/currencies");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la moneda",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
          <button
            onClick={() => router.push("/catalogs/currencies")}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <CurrencyForm
      initialData={currency}
      onSubmit={handleSubmit}
      loading={submitting}
    />
  );
} 