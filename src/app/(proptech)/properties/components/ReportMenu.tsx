"use client";

import React, { useState } from 'react';
import { reportService } from '../services/reportService';

interface ReportMenuProps {
  onClose: () => void;
}

export default function ReportMenu({ onClose }: ReportMenuProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (type: 'inventory' | 'price' | 'status' | 'valuation') => {
    try {
      setIsGenerating(true);
      let report;
      
      switch (type) {
        case 'inventory':
          report = await reportService.generateInventoryReport();
          break;
        case 'price':
          report = await reportService.generatePriceAnalysisReport();
          break;
        case 'status':
          report = await reportService.generateStatusReport();
          break;
        case 'valuation':
          report = await reportService.generateValuationReport();
          break;
      }
      
      reportService.downloadReport(report);
      onClose();
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Error al generar el reporte. Por favor, intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
      <div className="p-2">
        <div className="mb-2 px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          Seleccione el tipo de reporte
        </div>
        <div className="space-y-1">
          <button
            onClick={() => handleGenerateReport('inventory')}
            disabled={isGenerating}
            className="w-full rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 disabled:opacity-50"
          >
            Inventario de Propiedades
          </button>
          <button
            onClick={() => handleGenerateReport('price')}
            disabled={isGenerating}
            className="w-full rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 disabled:opacity-50"
          >
            Análisis de Precios
          </button>
          <button
            onClick={() => handleGenerateReport('status')}
            disabled={isGenerating}
            className="w-full rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 disabled:opacity-50"
          >
            Estado de Propiedades
          </button>
          <button
            onClick={() => handleGenerateReport('valuation')}
            disabled={isGenerating}
            className="w-full rounded-lg px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 disabled:opacity-50"
          >
            Valoración Total
          </button>
        </div>
      </div>
    </div>
  );
} 