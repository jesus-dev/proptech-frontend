"use client";

import React from "react";
import { useCurrencySymbol } from "@/lib/currency-helpers";

interface CurrencySymbolProps {
  currencyCode: string | undefined;
  className?: string;
  fallback?: string;
}

/**
 * Componente que muestra el símbolo de una moneda desde el catálogo
 * Usa el hook useCurrencySymbol para obtener el símbolo dinámicamente
 */
export default function CurrencySymbol({ 
  currencyCode, 
  className = "",
  fallback = ""
}: CurrencySymbolProps) {
  const symbol = useCurrencySymbol(currencyCode);
  
  return (
    <span className={className}>
      {symbol || fallback || currencyCode || ""}
    </span>
  );
}

