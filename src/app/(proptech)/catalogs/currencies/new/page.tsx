"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { currencyService } from "../services/currencyService";
import CurrencyForm from "../components/CurrencyForm";
import { useToast } from "@/components/ui/use-toast";
import { Currency } from "../services/types";

export default function NewCurrencyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<Currency>) => {
    setLoading(true);
    try {
      // Asegurar que los campos requeridos estén presentes
      const currencyData = {
        code: data.code || "",
        name: data.name || "",
        symbol: data.symbol || "",
        exchangeRate: data.exchangeRate || 1,
        isBase: data.isBase || false,
        isActive: data.isActive ?? true,
        decimalPlaces: data.decimalPlaces || 2,
        format: data.format || "",
        description: data.description || "",
      };
      
      await currencyService.create(currencyData);
      toast({
        title: "Moneda creada",
        description: "La moneda ha sido creada exitosamente.",
      });
      router.push("/catalogs/currencies");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la moneda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CurrencyForm
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
} 