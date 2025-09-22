"use client";

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { contactService } from "../services/contactService";
import { ContactFormData, ContactStatus, ContactType } from "../types";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, XMarkIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ImportContactsModal({ isOpen, onClose, onUpdate }: ImportContactsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "text/csv") {
        setError("Por favor, selecciona un archivo CSV.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = useCallback(async () => {
    if (!file) {
      setError("No se ha seleccionado ningún archivo.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setMessage(null);

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, errors } = results;

        if (errors.length > 0) {
          setError(`Error al procesar el archivo CSV: ${errors[0].message}`);
          setIsProcessing(false);
          return;
        }

        if (data.length === 0) {
          setError("El archivo CSV está vacío o no tiene el formato correcto.");
          setIsProcessing(false);
          return;
        }
        
        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
          try {
            const contactData: ContactFormData = {
              firstName: row.firstName || "",
              lastName: row.lastName || "",
              email: row.email || "",
              phone: row.phone || "",
              type: (row.type as ContactType) || "prospect",
              status: (row.status as ContactStatus) || "lead",
              company: row.company,
              position: row.position,
              address: row.address,
              city: row.city,
              state: row.state,
              zip: row.zip,
              country: row.country,
              notes: row.notes,
              source: row.source,
              tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
              assignedTo: row.assignedTo,
            };
            
            // Basic validation
            if (!contactData.firstName || !contactData.lastName || !contactData.email) {
                console.warn("Fila omitida por falta de datos básicos:", row);
                errorCount++;
                continue;
            }

            await contactService.createContact(contactData);
            successCount++;

          } catch (e) {
            console.error("Error al importar fila:", row, e);
            errorCount++;
          }
        }
        
        setMessage(`Importación completada. ${successCount} contactos importados, ${errorCount} errores.`);
        onUpdate(); // Refresh the contacts list
        setIsProcessing(false);
        setFile(null);
        setTimeout(() => {
            onClose();
        }, 3000);
      },
      error: (err) => {
        setError(`Error al leer el archivo: ${err.message}`);
        setIsProcessing(false);
      },
    });
  }, [file, onUpdate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Importar Contactos desde CSV
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona un archivo CSV para importar tus contactos. Asegúrate de que el archivo tenga las siguientes columnas: 
            <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded">firstName</code>, <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded">lastName</code>, <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded">email</code>, <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded">phone</code>, etc.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Archivo CSV
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ArrowUpOnSquareIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"/>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file ? file.name : "CSV (MAX. 5MB)"}
                  </p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </label>
            </div> 
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {message && (
            <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
            >
              {isProcessing ? "Importando..." : "Importar Contactos"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 