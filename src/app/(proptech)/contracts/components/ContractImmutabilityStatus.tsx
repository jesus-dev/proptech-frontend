import React from 'react';
import { Contract } from './types';

interface ContractImmutabilityStatusProps {
  contract: Contract;
  className?: string;
}

export default function ContractImmutabilityStatus({ contract, className = '' }: ContractImmutabilityStatusProps) {
  const isSigned = () => {
    // Un contrato se considera firmado si:
    // 1. Tiene ambas firmas digitales (cliente y corredor)
    // 2. O tiene un documento escaneado subido
    // 3. O el estado es SIGNED_PHYSICAL o SIGNED_DIGITAL
    const hasBothDigitalSignatures = Boolean(contract.clientSignature && contract.brokerSignature);
    const hasScannedDocument = Boolean(contract.scannedDocumentUrl);
    const isStatusSigned = contract.status === 'SIGNED_PHYSICAL' || contract.status === 'SIGNED_DIGITAL';
    return hasBothDigitalSignatures || hasScannedDocument || isStatusSigned;
  };

  const getImmutabilityReason = () => {
    const reasons = [];
    if (contract.clientSignature && contract.brokerSignature) {
      reasons.push('Firmas digitales de cliente y corredor presentes');
    }
    if (contract.scannedDocumentUrl) {
      reasons.push('Documento escaneado firmado subido');
    }
    return reasons;
  };

  if (!isSigned()) {
    return null; // No mostrar nada si el contrato no está firmado
  }

  const reasons = getImmutabilityReason();

  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Contrato Inmutable
          </h3>
          <div className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            <p className="mb-2">
              Este contrato no puede ser modificado porque ya ha sido firmado y es legalmente vinculante.
            </p>
            <div className="space-y-1">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/40 rounded text-xs text-amber-900 dark:text-amber-100">
            <strong>Importante:</strong> Para realizar cambios, debe crear una nueva versión del contrato o anular el actual y crear uno nuevo.
          </div>
        </div>
      </div>
    </div>
  );
} 