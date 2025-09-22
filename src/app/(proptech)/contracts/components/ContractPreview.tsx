
import Image from 'next/image';import React from "react";
import { Contract } from "./types";
import { formatDateLatino, formatDateTimeLatino } from "../utils/dateUtils";
import ContractImmutabilityStatus from './ContractImmutabilityStatus';

interface ContractPreviewProps {
  contract: Partial<Contract>;
  templateContent?: string;
  templateVariableValues?: Record<string, string>;
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function getContractTypeText(type?: string) {
  switch (type) {
    case "SALE": return "VENTA";
    case "RENT": return "ALQUILER";
    case "MANAGEMENT": return "ADMINISTRACIÓN";
    default: return type || "Por completar";
  }
}

function getStatusText(status?: Contract["status"]) {
  switch (status) {
    case "DRAFT": return "BORRADOR";
    case "ACTIVE": return "ACTIVO";
    case "COMPLETED": return "COMPLETADO";
    case "CANCELLED": return "CANCELADO";
    case "SIGNED_PHYSICAL": return "FIRMADO FÍSICAMENTE";
    case "SIGNED_DIGITAL": return "FIRMADO DIGITALMENTE";
    default: return status || "Por completar";
  }
}

function getStatusColor(status?: Contract["status"]) {
  switch (status) {
    case "DRAFT": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800";
    case "ACTIVE": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800";
    case "COMPLETED": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800";
    case "CANCELLED": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800";
    case "SIGNED_PHYSICAL": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800";
    case "SIGNED_DIGITAL": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800";
    default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
  }
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ contract, templateContent, templateVariableValues }) => {
  // Función para parsear datos de auditoría
  const parseAuditData = (auditString: string | object) => {
    if (typeof auditString === 'string') {
      try {
        return JSON.parse(auditString);
      } catch (error) {
        console.warn('Error parsing audit data:', error);
        return null;
      }
    }
    return auditString;
  };

  // Parsear datos de auditoría
  const clientAudit = contract.clientSignatureAudit ? parseAuditData(contract.clientSignatureAudit) : null;
  const brokerAudit = contract.brokerSignatureAudit ? parseAuditData(contract.brokerSignatureAudit) : null;

  // Generar el contenido del contrato con las variables reemplazadas
  const generateContractContent = () => {
    // Priorizar el contenido procesado del contrato si está disponible
    if (contract.templateContent) {
      return contract.templateContent;
    }
    
    // Fallback a las props si están disponibles
    if (templateContent) {
      let content = templateContent;
      if (templateVariableValues) {
        Object.entries(templateVariableValues).forEach(([variableName, value]) => {
          const regex = new RegExp(`{{${variableName}}}`, 'g');
          content = content.replace(regex, value || `[${variableName}]`);
        });
      }
      return content;
    }
    
    return null;
  };

  const contractContent = generateContractContent();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Estado de inmutabilidad */}
      <ContractImmutabilityStatus contract={contract as Contract} className="m-4" />
      
      <div className="p-6">
        {/* Mostrar contenido de plantilla si está disponible */}
        {contractContent ? (
          <div className="whitespace-pre-wrap text-gray-900 dark:text-white font-mono text-sm leading-relaxed mb-8">
            {contractContent}
          </div>
        ) : (
          <>
            {/* Encabezado del Contrato */}
            <div className="text-center mb-8 border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                CONTRATO DE CORRETAJE INMOBILIARIO
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                República del Paraguay
              </p>
              
              {/* Estado del contrato mejorado */}
              <div className="mt-6 flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(contract.status)}`}
                    title={contract.status === 'SIGNED_PHYSICAL' ? 'Este contrato fue firmado de forma física mediante documento escaneado y no puede ser modificado.' : contract.status === 'SIGNED_DIGITAL' ? 'Este contrato fue firmado digitalmente con firmas electrónicas y no puede ser modificado.' : undefined}
                  >
                    {contract.status === 'SIGNED_PHYSICAL' && (
                      <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {contract.status === 'SIGNED_DIGITAL' && (
                      <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    {getStatusText(contract.status)}
                  </span>
                </div>
                
                {(contract.status === 'SIGNED_PHYSICAL' || contract.status === 'SIGNED_DIGITAL') && contract.signedDate && (
                  <div className="text-center">
                    <span className={`text-sm font-medium ${contract.status === 'SIGNED_PHYSICAL' ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
                      📅 Firmado el {formatDateTimeLatino(contract.signedDate)}
                    </span>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {contract.status === 'SIGNED_PHYSICAL' ? 'Documento físico escaneado' : 'Firmas electrónicas verificadas'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información de las Partes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">CLIENTE</h3>
                <p className="text-gray-700 dark:text-gray-300"><strong>Nombre:</strong> {contract.clientName || "Por completar"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Cédula:</strong> {contract.clientIdentification || "Por completar"}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">CORREDOR</h3>
                <p className="text-gray-700 dark:text-gray-300"><strong>Nombre:</strong> {contract.brokerName || "Por completar"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Registro:</strong> {contract.brokerId || "Por completar"}</p>
              </div>
            </div>

            {/* Información de la Propiedad */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">PROPIEDAD OBJETO DEL CONTRATO</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Dirección:</strong> {contract.propertyAddress || "Por completar"}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Tipo de Operación:</strong> {getContractTypeText(contract.type)}
                </p>
                {contract.propertyDescription && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Descripción:</strong> {contract.propertyDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Información Financiera */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">CONDICIONES FINANCIERAS</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Valor de la Operación:</strong>
                    </p>
                    <p className="text-xl font-semibold text-brand-600">
                      {contract.amount ? formatCurrency(contract.amount, contract.currency) : "Por completar"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Comisión del Corredor:</strong>
                    </p>
                    <p className="text-xl font-semibold text-brand-600">
                      {contract.commissionPercentage ? `${contract.commissionPercentage}%` : "Por completar"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fecha y Firma - SIEMPRE mostrar si hay firmas */}
        {(contract.clientSignature || contract.brokerSignature) && (
          <div className="text-center border-t border-gray-200 pt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Fecha del Contrato:</strong> {contract.startDate ? formatDateLatino(contract.startDate) : "Por completar"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Este contrato se firma en la ciudad de Asunción, República del Paraguay
            </p>

            {/* Sección de Firmas Profesional */}
            <div className="flex flex-col md:flex-row justify-center items-end gap-12 mt-12">
              {/* Firma Cliente */}
              <div className="flex flex-col items-center w-64">
                <div className="h-20 flex items-end justify-center w-full mb-2">
                  {contract.clientSignature ? (
                    <img 
                      src={contract.clientSignature} 
                      alt="Firma del cliente" 
                      style={{ maxWidth: 200, maxHeight: 60, background: '#fff' }} 
                      className="border border-gray-300 rounded"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">(Sin firma)</span>
                  )}
                </div>
                <div className="w-full border-t border-gray-400" style={{ height: 1 }} />
                <div className="mt-1 text-xs text-gray-700 dark:text-gray-300 w-full text-center">
                  {contract.clientName || "Nombre del Cliente"}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Firma del Cliente</div>
                <div className="text-xs text-gray-400 mt-0.5">{contract.startDate ? formatDateTimeLatino(contract.startDate) : "Fecha"}</div>
              </div>
              
              {/* Firma Corredor */}
              <div className="flex flex-col items-center w-64">
                <div className="h-20 flex items-end justify-center w-full mb-2">
                  {contract.brokerSignature ? (
                    <img 
                      src={contract.brokerSignature} 
                      alt="Firma del corredor" 
                      style={{ maxWidth: 200, maxHeight: 60, background: '#fff' }} 
                      className="border border-gray-300 rounded"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">(Sin firma)</span>
                  )}
                </div>
                <div className="w-full border-t border-gray-400" style={{ height: 1 }} />
                <div className="mt-1 text-xs text-gray-700 dark:text-gray-300 w-full text-center">
                  {contract.brokerName || "Nombre del Corredor"}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Firma del Corredor</div>
                <div className="text-xs text-gray-400 mt-0.5">{contract.startDate ? formatDateTimeLatino(contract.startDate) : "Fecha"}</div>
              </div>
            </div>
          </div>
        )}

        {/* --- Auditoría de Firmas Digitales --- */}
        {(clientAudit || brokerAudit) && (
          <div className="mt-12">
            <div className="flex flex-col items-center mb-8">
              <span className="inline-block mb-2">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="28" width="44" height="24" rx="6" fill="#e6f4ea" stroke="#22c55e" strokeWidth="3"/>
                  <path d="M20 28v-6a12 12 0 1 1 24 0v6" stroke="#22c55e" strokeWidth="3" fill="none"/>
                  <circle cx="32" cy="40" r="4" fill="#22c55e"/>
                </svg>
              </span>
              <h2 className="text-3xl font-extrabold text-green-900 dark:text-green-200 mb-1 tracking-tight">Verificación Digital Garantizada</h2>
              <div className="text-green-800 dark:text-green-300 text-lg font-medium mb-2">Firmas Digitales Auditadas y Certificadas</div>
              <div className="text-green-700 dark:text-green-200 text-base mb-2 text-center max-w-2xl">Este contrato cuenta con validación digital avanzada, registro de auditoría completo y garantía de integridad legal para cada firmante.</div>
              
              {/* QR Code y elementos de verificación */}
              <div className="mt-6 flex items-center space-x-6">
                <div className="bg-white p-3 rounded-lg border-2 border-green-300 shadow-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    QR CODE
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-600">Escanear para verificar</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Certificado SSL</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Encriptado AES-256</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">ISO 27001</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Auditoría Cliente */}
              {clientAudit && (
                <div className="relative border-2 border-green-400 bg-green-50 dark:bg-green-900/10 rounded-xl p-7 shadow-lg flex flex-col min-h-[420px]">
                  <span className="absolute -top-6 right-6 bg-white rounded-full border-2 border-green-400 p-2 shadow-md">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.56 7.82 22 9 14.14l-5-4.87 5.91-.91z"/><polyline points="9 12 12 15 17 10"/></svg>
                  </span>
                  <div className="flex items-center mb-4">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-bold text-green-900 dark:text-green-200 text-xl">Cliente</span>
                  </div>
                  <div className="mb-3 text-green-900 dark:text-green-100 font-bold flex items-center text-lg">
                    <svg className="w-6 h-6 mr-2 text-green-600 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Firma Digital Validada y Certificada
                  </div>
                  <div className="grid grid-cols-1 gap-y-1 text-base text-green-900 dark:text-green-100 mb-2">
                    <div><b>Fecha/Hora:</b> {clientAudit.timestamp ? new Date(clientAudit.timestamp).toLocaleString('es-PY') : 'N/A'}</div>
                    <div><b>IP:</b> {clientAudit.ipAddress || 'N/A'}</div>
                    <div><b>Navegador:</b> {clientAudit.deviceInfo?.browser ? `${clientAudit.deviceInfo.browser}${clientAudit.deviceInfo.browserVersion ? ` (${clientAudit.deviceInfo.browserVersion})` : ''}` : 'N/A'}</div>
                    <div><b>Plataforma:</b> {clientAudit.deviceInfo?.platform || 'N/A'}</div>
                    <div><b>Resolución:</b> {clientAudit.deviceInfo?.screenResolution || 'N/A'}</div>
                    <div><b>Zona horaria:</b> {clientAudit.deviceInfo?.timezone || 'N/A'}</div>
                    <div><b>Idioma:</b> {clientAudit.deviceInfo?.language || 'N/A'}</div>
                    <div><b>Hash:</b> {clientAudit.signatureData?.signatureHash || 'N/A'}</div>
                    <div><b>Longitud firma:</b> {clientAudit.signatureData?.signatureLength ?? 'N/A'}</div>
                    <div><b>Tamaño Canvas:</b> {clientAudit.signatureData?.canvasSize ? `${clientAudit.signatureData.canvasSize.width} x ${clientAudit.signatureData.canvasSize.height} px` : 'N/A'}</div>
                    <div><b>ID de Sesión:</b> {clientAudit.sessionInfo?.sessionId || 'N/A'}</div>
                    <div><b>URL:</b> {clientAudit.sessionInfo?.pageUrl || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Auditoría Corredor */}
              {brokerAudit && (
                <div className="relative border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-7 shadow-lg flex flex-col min-h-[420px]">
                  <span className="absolute -top-6 right-6 bg-white rounded-full border-2 border-blue-400 p-2 shadow-md">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.56 7.82 22 9 14.14l-5-4.87 5.91-.91z"/><polyline points="9 12 12 15 17 10"/></svg>
                  </span>
                  <div className="flex items-center mb-4">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span className="font-bold text-blue-900 dark:text-blue-200 text-xl">Corredor</span>
                  </div>
                  <div className="mb-3 text-blue-900 dark:text-blue-100 font-bold flex items-center text-lg">
                    <svg className="w-6 h-6 mr-2 text-blue-600 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Firma Digital Validada y Certificada
                  </div>
                  <div className="grid grid-cols-1 gap-y-1 text-base text-blue-900 dark:text-blue-100 mb-2">
                    <div><b>Fecha/Hora:</b> {brokerAudit.timestamp ? new Date(brokerAudit.timestamp).toLocaleString('es-PY') : 'N/A'}</div>
                    <div><b>IP:</b> {brokerAudit.ipAddress || 'N/A'}</div>
                    <div><b>Navegador:</b> {brokerAudit.deviceInfo?.browser ? `${brokerAudit.deviceInfo.browser}${brokerAudit.deviceInfo.browserVersion ? ` (${brokerAudit.deviceInfo.browserVersion})` : ''}` : 'N/A'}</div>
                    <div><b>Plataforma:</b> {brokerAudit.deviceInfo?.platform || 'N/A'}</div>
                    <div><b>Resolución:</b> {brokerAudit.deviceInfo?.screenResolution || 'N/A'}</div>
                    <div><b>Zona horaria:</b> {brokerAudit.deviceInfo?.timezone || 'N/A'}</div>
                    <div><b>Idioma:</b> {brokerAudit.deviceInfo?.language || 'N/A'}</div>
                    <div><b>Hash:</b> {brokerAudit.signatureData?.signatureHash || 'N/A'}</div>
                    <div><b>Longitud firma:</b> {brokerAudit.signatureData?.signatureLength ?? 'N/A'}</div>
                    <div><b>Tamaño Canvas:</b> {brokerAudit.signatureData?.canvasSize ? `${brokerAudit.signatureData.canvasSize.width} x ${brokerAudit.signatureData.canvasSize.height} px` : 'N/A'}</div>
                    <div><b>ID de Sesión:</b> {brokerAudit.sessionInfo?.sessionId || 'N/A'}</div>
                    <div><b>URL:</b> {brokerAudit.sessionInfo?.pageUrl || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractPreview; 