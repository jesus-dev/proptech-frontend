import { useState, useCallback } from 'react';
import { SignatureAuditService, SignatureAuditData } from '../services/signatureAuditService';

interface UseSignatureWithAuditProps {
  signatureType: 'client' | 'broker';
  contractId?: string;
  initialValue?: string;
  initialAudit?: SignatureAuditData;
}

export const useSignatureWithAudit = ({ 
  signatureType, 
  contractId,
  initialValue = '', 
  initialAudit 
}: UseSignatureWithAuditProps) => {
  const [signature, setSignature] = useState(initialValue);
  const [auditData, setAuditData] = useState<SignatureAuditData | undefined>(initialAudit);

  const handleSignatureChange = useCallback(async (dataUrl: string) => {
    setSignature(dataUrl);
    
    if (dataUrl) {
      // Solo crear auditoría si hay una firma válida
      try {
        const audit = await SignatureAuditService.createAuditData(
          dataUrl, 
          400, // CANVAS_WIDTH
          120  // CANVAS_HEIGHT
        );
        
        setAuditData(audit);
        
        // Guardar en BD con contractId
        await SignatureAuditService.logSignatureEvent(
          audit, 
          'created',
          contractId,
          signatureType
        );
        
        console.log(`Firma ${signatureType} creada con auditoría:`, audit);
      } catch (error) {
        console.error('Error al crear auditoría de firma:', error);
      }
    } else {
      // Limpiar auditoría cuando se limpia la firma
      setAuditData(undefined);
      
      try {
        const audit = await SignatureAuditService.createAuditData(
          "", 
          400, 
          120
        );
        
        // Guardar en BD con contractId
        await SignatureAuditService.logSignatureEvent(
          audit, 
          'cleared',
          contractId,
          signatureType
        );
        
        console.log(`Firma ${signatureType} limpiada con auditoría:`, audit);
      } catch (error) {
        console.error('Error al crear auditoría de limpieza:', error);
      }
    }
  }, [signatureType, contractId]);

  const clearSignature = useCallback(async () => {
    setSignature('');
    setAuditData(undefined);
    
    try {
      const audit = await SignatureAuditService.createAuditData(
        "", 
        400, 
        120
      );
      
      // Guardar en BD con contractId
      await SignatureAuditService.logSignatureEvent(
        audit, 
        'cleared',
        contractId,
        signatureType
      );
      
      console.log(`Firma ${signatureType} limpiada con auditoría:`, audit);
    } catch (error) {
      console.error('Error al crear auditoría de limpieza:', error);
    }
  }, [signatureType, contractId]);

  return {
    signature,
    auditData,
    handleSignatureChange,
    clearSignature
  };
}; 