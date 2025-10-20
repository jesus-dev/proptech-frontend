"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { contractService } from "../services/contractService";
import { Contract } from "../components/types";
import { downloadContractDocument } from "../services/documentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { AlertCircle, Copy, Check, X } from "lucide-react";
import ContractPreview from "../components/ContractPreview";
import ContractExportActions from "../components/ContractExportActions";
import { formatDateLatino } from "../utils/dateUtils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContractDetailPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureToken, setSignatureToken] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<'client' | 'broker'>('client');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [contractStatus, setContractStatus] = useState({
    clientSigned: false,
    brokerSigned: false,
    clientSignatureDate: null as string | null,
    brokerSignatureDate: null as string | null
  });



  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const data = await contractService.getContractById(id);
        setContract(data || null);
        
        // Actualizar estado de firmas basado en datos reales del contrato
        if (data) {
          await updateSignatureStatus(data);
        }
        
        // Test directo de la API
        const response = await fetch(`http://localhost:8080/api/contracts/${id}`);
        const rawData = await response.json();
        
      } catch (err) {
        setError("Error al cargar el contrato");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  // Función para verificar documentos del contrato
  const checkContractDocuments = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/documents`);
      if (response.ok) {
        const documents = await response.json();
        return documents.length > 0;
      }
    } catch (error) {
      console.error('Error checking contract documents:', error);
    }
    return false;
  };

  // Función para actualizar el estado de las firmas
  const updateSignatureStatus = async (contractData: Contract) => {
    // Verificar si hay documentos adjuntos (firma física)
    const hasPhysicalDocument = !!contractData.scannedDocumentUrl;
    
    // Verificar documentos en la tabla contract_documents
    const hasContractDocuments = await checkContractDocuments(contractData.id.toString());
    
    // Verificar firmas digitales
    const hasDigitalClientSignature = !!contractData.clientSignature;
    const hasDigitalBrokerSignature = !!contractData.brokerSignature;
    
    // Si hay documento físico o documentos adjuntos, considerar como firmado
    const clientSigned = hasDigitalClientSignature || hasPhysicalDocument || hasContractDocuments;
    const brokerSigned = hasDigitalBrokerSignature || hasPhysicalDocument || hasContractDocuments;
    
    const newStatus = {
      clientSigned,
      brokerSigned,
      clientSignatureDate: contractData.clientSignatureAudit?.timestamp || 
                          contractData.scannedDocumentUploadDate ||
                          (clientSigned ? new Date().toISOString() : null),
      brokerSignatureDate: contractData.brokerSignatureAudit?.timestamp || 
                          contractData.scannedDocumentUploadDate ||
                          (brokerSigned ? new Date().toISOString() : null)
    };
    
    setContractStatus(newStatus);
  };

  // Función para refrescar el contrato y estado de firmas
  const refreshContract = async () => {
    try {
      setRefreshing(true);
      const data = await contractService.getContractById(id);
      if (data) {
        const previousStatus = { ...contractStatus };
        setContract(data);
        await updateSignatureStatus(data);
        setLastRefresh(new Date());
        
        // Mostrar notificación si hay cambios
        const hasPhysicalDocument = !!data.scannedDocumentUrl;
        const hasContractDocuments = await checkContractDocuments(data.id.toString());
        const newStatus = {
          clientSigned: !!data.clientSignature || hasPhysicalDocument || hasContractDocuments,
          brokerSigned: !!data.brokerSignature || hasPhysicalDocument || hasContractDocuments
        };
        
        if (previousStatus.clientSigned !== newStatus.clientSigned || 
            previousStatus.brokerSigned !== newStatus.brokerSigned) {
          setShowUpdateNotification(true);
          setTimeout(() => setShowUpdateNotification(false), 3000);
        }
        
      }
    } catch (error) {
      console.error('Error refreshing contract:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Regenerar token cuando cambie la selección del firmante
  useEffect(() => {
    if (showSignatureModal && contract?.id) {
      const contractId = contract.id.toString();
      const token = `${contractId}-${selectedSigner}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('Token regenerado:', token, 'para firmante:', selectedSigner);
      setSignatureToken(token);
    }
  }, [selectedSigner, showSignatureModal, contract?.id]);

  const generateSignatureToken = () => {
    // Verificar que el contrato esté cargado
    if (!contract || !contract.id) {
      console.error('No se puede generar token: contrato no cargado');
      return;
    }

    // Solo abrir el modal, el token se generará en el useEffect
    setShowSignatureModal(true);
  };

  const copySignatureLink = async () => {
    const signatureLink = `${window.location.origin}/contracts/sign/${signatureToken}`;
    try {
      await navigator.clipboard.writeText(signatureLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const getSignerLabel = () => {
    return selectedSigner === 'client' ? 'Cliente' : 'Corredor';
  };

  const getSignerInfo = () => {
    if (selectedSigner === 'client' && contract?.clientName) {
      return contract.clientName;
    }
    if (selectedSigner === 'broker' && contract?.brokerName) {
      return contract.brokerName;
    }
    return 'No asignado';
  };

  // Auditoría del corredor
  let brokerAudit = null;
  if (contract?.brokerSignatureAudit) {
    try {
      brokerAudit = typeof contract.brokerSignatureAudit === 'string' 
        ? JSON.parse(contract.brokerSignatureAudit) 
        : contract.brokerSignatureAudit;
    } catch (error) {
      console.error('Error parsing broker audit:', error);
      brokerAudit = contract.brokerSignatureAudit;
    }
  }

  // Auditoría del cliente (si aplica)
  let clientAudit = null;
  if (contract?.clientSignatureAudit) {
    try {
      clientAudit = typeof contract.clientSignatureAudit === 'string' 
        ? JSON.parse(contract.clientSignatureAudit) 
        : contract.clientSignatureAudit;
    } catch (error) {
      console.error('Error parsing client audit:', error);
      clientAudit = contract.clientSignatureAudit;
    }
  }

  // Debug del contrato completo

  // Debug cuando cambian los datos de auditoría
  useEffect(() => {
    if (clientAudit) {
    }
    if (brokerAudit) {
    }
  }, [clientAudit, brokerAudit]);

  const renderAudit = (audit: any) => {
    
    // Los datos ya vienen como objeto, no necesitamos parsear JSON
    return (
      <div className="p-4 border border-green-300 bg-green-50 rounded-md text-green-800">
        <div className="font-bold mb-2">✔ Firma Digital Validada</div>
        <div><b>Fecha:</b> {audit?.timestamp ? new Date(audit.timestamp).toLocaleString() : 'N/A'}</div>
        <div><b>IP:</b> {audit?.ipAddress || 'N/A'}</div>
        <div><b>Navegador:</b> {audit?.browser || 'N/A'}</div>
        <div><b>Versión:</b> {audit?.browserVersion || 'N/A'}</div>
        <div><b>Plataforma:</b> {audit?.platform || 'N/A'}</div>
        <div><b>Resolución:</b> {audit?.screenResolution || 'N/A'}</div>
        <div><b>Zona horaria:</b> {audit?.timezone || 'N/A'}</div>
        <div><b>Idioma:</b> {audit?.language || 'N/A'}</div>
        <div><b>Sesión:</b> {audit?.sessionId || 'N/A'}</div>
        <div><b>URL:</b> {audit?.pageUrl || 'N/A'}</div>
        <div><b>Canvas:</b> {audit?.canvasWidth && audit?.canvasHeight ? `${audit.canvasWidth}x${audit.canvasHeight}` : 'N/A'}</div>
        <div><b>Hash:</b> {audit?.signatureHash || 'N/A'}</div>
        <div><b>Longitud firma:</b> {audit?.signatureLength || 'N/A'}</div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner size="md" />;
  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Contrato no encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "No se pudo cargar el contrato solicitado."}</p>
          <button
            onClick={() => router.push("/contracts")}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Volver a contratos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex gap-4 justify-end">

          <button
            onClick={generateSignatureToken}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>📝</span>
            Solicitar firma
          </button>
          <button
            onClick={() => downloadContractDocument(contract)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Descargar contrato (Word)
          </button>
          <button
            onClick={() => router.push("/contracts")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver a contratos
          </button>
        </div>

        {/* Estado de firmas */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="font-semibold text-gray-900 dark:text-white">Cliente</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {contract.clientName || 'No asignado'}
                </p>
                {contractStatus.clientSignatureDate && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    📅 Firmado el {formatDateLatino(contractStatus.clientSignatureDate)}
                  </p>
                )}
                {contract.scannedDocumentUrl && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    📄 Documento físico adjunto
                  </p>
                )}
                {contractStatus.clientSigned && !contract.scannedDocumentUrl && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    📄 Documentos adjuntos verificados
                  </p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 ${
                contractStatus.clientSigned 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border border-green-200 dark:border-green-800' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
              }`}>
                {contractStatus.clientSigned ? (
                  <>
                    <span>✅</span>
                    <span>{contract.scannedDocumentUrl ? 'Firmado (Físico)' : 'Firmado'}</span>
                  </>
                ) : (
                  <>
                    <span>⏳</span>
                    <span>Pendiente</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <p className="font-semibold text-gray-900 dark:text-white">Corredor</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {contract.brokerName || 'No asignado'}
                </p>
                {contractStatus.brokerSignatureDate && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    📅 Firmado el {formatDateLatino(contractStatus.brokerSignatureDate)}
                  </p>
                )}
                {contract.scannedDocumentUrl && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    📄 Documento físico adjunto
                  </p>
                )}
                {contractStatus.brokerSigned && !contract.scannedDocumentUrl && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    📄 Documentos adjuntos verificados
                  </p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 ${
                contractStatus.brokerSigned 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border border-green-200 dark:border-green-800' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
              }`}>
                {contractStatus.brokerSigned ? (
                  <>
                    <span>✅</span>
                    <span>{contract.scannedDocumentUrl ? 'Firmado (Físico)' : 'Firmado'}</span>
                  </>
                ) : (
                  <>
                    <span>⏳</span>
                    <span>Pendiente</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Mensaje informativo mejorado */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  💡 Estado de firmas
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Haz clic en "Actualizar" para verificar el estado más reciente de las firmas del contrato.
                </p>
              </div>
            </div>
          </div>
          

        </div>

        <ContractPreview contract={contract} />

        {/* Gestión de Documentos */}
        <div className="mb-6">
          <ContractExportActions 
            contract={contract}
            onDocumentUploaded={(file) => {
              console.log('Documento subido:', file.name);
              // Aquí podrías actualizar el estado del contrato
            }}
            onStatusChange={(status) => {
              console.log('Estado cambiado a:', status);
              // Aquí podrías actualizar el estado del contrato
            }}
          />
        </div>

        {/* Modal de firma digital */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Solicitar firma digital
                </h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Estado de firmas */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Estado de firmas:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <span className={`px-2 py-1 rounded text-xs ${contractStatus.clientSigned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {contractStatus.clientSigned ? 'Firmado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Corredor:</span>
                    <span className={`px-2 py-1 rounded text-xs ${contractStatus.brokerSigned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {contractStatus.brokerSigned ? 'Firmado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selección de firmante */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar firmante:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="client"
                      checked={selectedSigner === 'client'}
                      onChange={(e) => setSelectedSigner(e.target.value as 'client' | 'broker')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Cliente {contract?.clientName && `(${contract.clientName})`}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="broker"
                      checked={selectedSigner === 'broker'}
                      onChange={(e) => setSelectedSigner(e.target.value as 'client' | 'broker')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Corredor {contract?.brokerName && `(${contract.brokerName})`}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Comparte este link con el <strong>{getSignerLabel().toLowerCase()}</strong> para que pueda firmar el contrato digitalmente:
                </p>
                
                {/* Indicador del firmante seleccionado */}
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📝 <strong>Firmante seleccionado:</strong> {getSignerInfo()} ({getSignerLabel()})
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                    {`${window.location.origin}/contracts/sign/${signatureToken}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copySignatureLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar link
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Notificación de actualización */}
      {showUpdateNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-in slide-in-from-bottom-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Estado de firmas actualizado</span>
        </div>
      )}
    </div>
  );
} 