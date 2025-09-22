"use client";

import React, { useState, useEffect } from "react";
import { 
  DocumentIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Contract } from "./types";
import { downloadContractDocument } from "../services/documentService";
import { uploadSignedContract, deleteScannedDocument } from "../services/documentUploadService";
import { contractService } from "../services/contractService";

// Servicio PDF mejorado con firmas digitales
const generatePDFWithDigitalSignatures = async (contract: Contract): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(16);
  doc.text('CONTRATO DE CORRETAJE INMOBILIARIO', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Contrato: ${contract.contractNumber || contract.id}`, 20, 40);
  doc.text(`Cliente: ${contract.clientName || 'No especificado'}`, 20, 50);
  doc.text(`Corredor: ${contract.brokerName || 'No especificado'}`, 20, 60);
  doc.text(`Propiedad: ${contract.propertyAddress || 'No especificada'}`, 20, 70);
  
  // Contenido del contrato
  let yPosition = 90;
  if (contract.templateContent) {
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(contract.templateContent, 170);
    doc.text(lines, 20, yPosition);
    // Calcular la posición Y final después del texto
    yPosition += lines.length * 7; // 7px por línea aprox
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  }

  // Espacio antes de las firmas
  yPosition += 15;
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Línea separadora antes de las firmas
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  // Título de la sección de firmas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FIRMAS DIGITALES VALIDADAS', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 15;

  // Firma del cliente
  if (contract.clientSignature) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Firma del Cliente:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`Nombre: ${contract.clientName || 'No especificado'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Identificación: ${contract.clientIdentification || 'No especificada'}`, 20, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setTextColor(0, 128, 0);
    doc.text('✓ Firma digital validada', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
    if (contract.clientSignatureAudit) {
      const audit = contract.clientSignatureAudit;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de validación: ${audit.timestamp ? new Date(audit.timestamp).toLocaleString() : 'N/A'}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Dirección IP: ${audit.ipAddress || 'N/A'}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Hash de firma: ${audit.signatureData?.signatureHash || 'N/A'}`, 20, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
    }
    yPosition += 10;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  }

  // Firma del corredor
  if (contract.brokerSignature) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Firma del Corredor:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`Nombre: ${contract.brokerName || 'No especificado'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Identificación: ${contract.brokerId || 'No especificada'}`, 20, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setTextColor(0, 128, 0);
    doc.text('✓ Firma digital validada', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
    if (contract.brokerSignatureAudit) {
      const audit = contract.brokerSignatureAudit;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de validación: ${audit.timestamp ? new Date(audit.timestamp).toLocaleString() : 'N/A'}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Dirección IP: ${audit.ipAddress || 'N/A'}`, 20, yPosition);
      yPosition += 4;
      doc.text(`Hash de firma: ${audit.signatureData?.signatureHash || 'N/A'}`, 20, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
    }
    yPosition += 10;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  }

  // Nota final
  yPosition += 10;
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Este documento contiene firmas digitales validadas con auditoría completa.', 20, yPosition);
  yPosition += 4;
  doc.text('Las firmas digitales son legalmente equivalentes a las firmas manuscritas.', 20, yPosition);
  doc.setTextColor(0, 0, 0);

  return doc.output('blob');
};

// Servicio PDF básico para impresión manual
const generatePDFForManualPrint = async (contract: Contract): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  
  // Contenido básico del PDF para impresión manual
  doc.setFontSize(16);
  doc.text('CONTRATO DE CORRETAJE INMOBILIARIO', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Contrato: ${contract.contractNumber || contract.id}`, 20, 40);
  doc.text(`Cliente: ${contract.clientName || 'No especificado'}`, 20, 50);
  doc.text(`Corredor: ${contract.brokerName || 'No especificado'}`, 20, 60);
  doc.text(`Propiedad: ${contract.propertyAddress || 'No especificada'}`, 20, 70);
  
  if (contract.templateContent) {
    const lines = doc.splitTextToSize(contract.templateContent, 170);
    doc.text(lines, 20, 90);
  }
  
  // Espacios para firmas manuales
  doc.text('Firma del Cliente: _________________', 20, 200);
  doc.text('Firma del Corredor: _________________', 20, 220);
  
  return doc.output('blob');
};

interface ContractExportActionsProps {
  contract: Contract;
  onDocumentUploaded?: (file: File) => void;
  onStatusChange?: (status: string) => void;
  onContractUpdated?: (contract: Contract) => void;
}

export default function ContractExportActions({ 
  contract, 
  onDocumentUploaded,
  onStatusChange,
  onContractUpdated
}: ContractExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<number | null>(null);
  const [updatingContractStatus, setUpdatingContractStatus] = useState(false);

  // Cargar documentos del contrato
  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await fetch(`/api/contracts/${contract.id}/documents`);
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      } else {
        console.error('Error fetching documents:', response.status);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [contract.id]);

  // Función para eliminar documento
  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      setDeletingDocument(documentId);
      const success = await deleteScannedDocument(contract.id, documentId);
      if (success) {
        alert('Documento eliminado exitosamente');
        await fetchDocuments(); // Refrescar la lista
      } else {
        alert('Error al eliminar el documento');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error al eliminar el documento');
    } finally {
      setDeletingDocument(null);
    }
  };

  // Determinar el tipo de firma
  const hasDigitalSignatures = contract.clientSignature && contract.brokerSignature;
  const hasPartialDigitalSignatures = (contract.clientSignature || contract.brokerSignature) && !hasDigitalSignatures;
  const hasScannedDocument = contract.scannedDocumentUrl || uploadedFile;
  const isFullySigned = hasDigitalSignatures || hasScannedDocument;
  const isPhysicallySigned = contract.status === 'SIGNED_PHYSICAL';
  const isDigitallySigned = contract.status === 'SIGNED_DIGITAL' || Boolean(contract.clientSignature && contract.brokerSignature);

  // Información detallada del estado
  const getSignatureDetails = () => {
    if (hasDigitalSignatures) {
      return {
        status: 'DIGITALLY_SIGNED',
        message: 'Contrato completamente firmado digitalmente',
        icon: '✅',
        color: 'blue'
      };
    }
    if (hasPartialDigitalSignatures) {
      return {
        status: 'PARTIALLY_SIGNED',
        message: 'Contrato parcialmente firmado digitalmente',
        icon: '⚠️',
        color: 'yellow'
      };
    }
    if (hasScannedDocument) {
      return {
        status: 'MANUALLY_SIGNED',
        message: 'Contrato firmado manualmente y escaneado',
        icon: '📄',
        color: 'green'
      };
    }
    return {
      status: 'PENDING',
      message: '',
      icon: '',
      color: 'gray'
    };
  };

  const signatureDetails = getSignatureDetails();

  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      await downloadContractDocument(contract);
    } catch (error) {
      console.error('Error exporting Word document:', error);
      alert('Error al exportar el documento Word');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      let pdfBlob: Blob;
      
      if (hasDigitalSignatures) {
        // Generar PDF con firmas digitales incluidas
        pdfBlob = await generatePDFWithDigitalSignatures(contract);
      } else {
        // Generar PDF para impresión manual
        pdfBlob = await generatePDFForManualPrint(contract);
      }
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-${contract.contractNumber || contract.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      let pdfBlob: Blob;
      
      if (hasDigitalSignatures) {
        // Imprimir PDF con firmas digitales
        pdfBlob = await generatePDFWithDigitalSignatures(contract);
      } else {
        // Imprimir PDF para firma manual
        pdfBlob = await generatePDFForManualPrint(contract);
      }
      
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            URL.revokeObjectURL(url);
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Error printing document:', error);
      alert('Error al imprimir el documento');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos PDF o imágenes (JPG, PNG)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadedFile(file);
      
      // SUBIR AL BACKEND
      const result = await uploadSignedContract(contract.id, file);
      if (result.success) {
        alert('Documento subido exitosamente');
        onDocumentUploaded?.(file);
        
        // ACTUALIZAR ESTADO DEL CONTRATO A FIRMADO
        try {
          setUpdatingContractStatus(true);
          const updatedContract = await contractService.updateContractStatus(contract.id.toString(), 'SIGNED');
          onStatusChange?.('SIGNED');
          onContractUpdated?.(updatedContract);
          alert('✅ Contrato marcado como firmado de forma física');
        } catch (error) {
          console.error('Error updating contract status:', error);
          alert('⚠️ Documento subido pero no se pudo actualizar el estado del contrato');
        } finally {
          setUpdatingContractStatus(false);
        }
        
        // Refrescar la lista de documentos
        await fetchDocuments();
      } else {
        alert(result.message);
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const getSignatureStatus = () => {
    if (hasDigitalSignatures) return 'DIGITALLY_SIGNED';
    if (hasScannedDocument) return 'MANUALLY_SIGNED';
    return 'PENDING';
  };

  const signatureStatus = getSignatureStatus();

  const formatDateTimeLatino = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'numeric' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${day}/${month}/${year} ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Gestión de Documentos
      </h3>
      
      {/* Estado de Firma */}
      

      
      {/* Acciones de Exportación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {!hasDigitalSignatures && (
          <button
            onClick={handleExportWord}
            disabled={isExporting}
            className="flex flex-col items-center justify-center space-y-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <DocumentIcon className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">{isExporting ? 'Exportando...' : 'Exportar Word'}</div>
              <div className="text-xs opacity-90">Formato editable</div>
            </div>
          </button>
        )}

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className={`flex flex-col items-center justify-center space-y-2 px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            hasDigitalSignatures 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <DocumentIcon className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium">{isExporting ? 'Exportando...' : hasDigitalSignatures ? 'PDF con Firmas' : 'PDF para Imprimir'}</div>
            <div className="text-xs opacity-90">
              {hasDigitalSignatures ? 'Documento final' : 'Para firma manual'}
            </div>
          </div>
        </button>

        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className={`flex flex-col items-center justify-center space-y-2 px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            hasDigitalSignatures 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          <PrinterIcon className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium">{isPrinting ? 'Imprimiendo...' : hasDigitalSignatures ? 'Imprimir Final' : 'Imprimir para Firmar'}</div>
            <div className="text-xs opacity-90">
              {hasDigitalSignatures ? 'Documento completo' : 'Con espacios en blanco'}
            </div>
          </div>
        </button>

        {!hasDigitalSignatures && (
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading || updatingContractStatus || isPhysicallySigned || isDigitallySigned}
            className="flex flex-col items-center justify-center space-y-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CloudArrowUpIcon className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {isUploading ? 'Subiendo...' : 
                 updatingContractStatus ? 'Actualizando estado...' : 
                 isPhysicallySigned ? 'Contrato firmado físicamente' :
                 isDigitallySigned ? 'Contrato firmado digitalmente' :
                 'Subir Firmado'}
              </div>
              <div className="text-xs opacity-90">
                {updatingContractStatus ? 'Marcando como firmado' : isPhysicallySigned ? 'No se puede adjuntar más documentos' : isDigitallySigned ? 'No se puede adjuntar más documentos' : 'Documento escaneado'}
              </div>
            </div>
          </button>
        )}

        {hasScannedDocument && !hasDigitalSignatures && (
          <button
            onClick={() => {/* Ver documento escaneado */}}
            className="flex flex-col items-center justify-center space-y-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <EyeIcon className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Ver Documento</div>
              <div className="text-xs opacity-90">Documento escaneado</div>
            </div>
          </button>
        )}
      </div>

      {/* Input oculto para subir archivo */}
      <input
        id="file-upload"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Lista de documentos subidos */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            📄 Documentos Adjuntos
          </h4>
          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
            {documents.length} documento{documents.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {loadingDocuments && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm text-gray-500">Cargando documentos...</span>
          </div>
        )}
        
        {!loadingDocuments && documents.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 mb-2">No hay documentos subidos</p>
            <p className="text-xs text-gray-400">Sube un documento firmado para comenzar</p>
          </div>
        )}
        
        {!loadingDocuments && documents.length > 0 && (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <DocumentIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                        >
                          {doc.fileName}
                        </a>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                          {doc.fileType}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>📤 {doc.uploadedBy}</span>
                        <span>🕒 {doc.uploadedAt && new Date(doc.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Ver documento"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={deletingDocument === doc.id}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar documento"
                    >
                      {deletingDocument === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archivo subido */}
      {uploadedFile && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Contrato firmado subido
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {(isPhysicallySigned || isDigitallySigned) && (
        <div className="mt-4 p-4 rounded-lg border-2">
          {isPhysicallySigned && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-green-700 dark:text-green-300 font-semibold">Contrato firmado físicamente</div>
                <div className="text-sm text-green-600 dark:text-green-400">No se pueden adjuntar más documentos</div>
                {contract.signedDate && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    📅 Firmado el {formatDateTimeLatino(contract.signedDate)}
                  </div>
                )}
              </div>
            </div>
          )}
          {isDigitallySigned && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-blue-700 dark:text-blue-300 font-semibold">Contrato firmado digitalmente</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">No se pueden adjuntar más documentos</div>
                {contract.signedDate && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    📅 Firmado el {formatDateTimeLatino(contract.signedDate)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 