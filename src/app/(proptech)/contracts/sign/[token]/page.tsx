"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
const ImageComponent = Image as any;
import { useRouter } from "next/navigation";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import SignaturePad from "../../components/SignaturePad";
import { contractService } from "../../services/contractService";
import { Contract } from "../../components/types";
import { SignatureAuditService } from "../../services/signatureAuditService";

export default function ContractSignPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = React.use(params) as { token: string };
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [signerType, setSignerType] = useState<'client' | 'broker'>('client');
  const [loading, setLoading] = useState(true);
  const [contractId, setContractId] = useState<string>('');

  useEffect(() => {
    const loadContract = async () => {
      try {
        // Extraer información del token: contractId-signerType-timestamp-random
        const tokenParts = token.split('-');
        if (tokenParts.length >= 2) {
          const extractedContractId = tokenParts[0];
          const extractedSignerType = tokenParts[1] as 'client' | 'broker';
          
          setContractId(extractedContractId);
          setSignerType(extractedSignerType);
          
          console.log('Cargando contrato:', extractedContractId, 'para firmante:', extractedSignerType);
          
          // Cargar el contrato real desde el backend
          const contractData = await contractService.getContractById(extractedContractId);
          if (contractData) {
            setContract(contractData);
            console.log('Contrato cargado:', contractData);
          } else {
            setError("Contrato no encontrado");
          }
        } else {
          setError("Token inválido");
        }
      } catch (err) {
        console.error('Error cargando contrato:', err);
        setError("Error al cargar el contrato");
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      setError("Por favor, dibuje su firma antes de continuar.");
      return;
    }
    if (!contractId || !contract) {
      setError("Error: información del contrato no válida.");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Usar SignatureAuditService para crear los datos de auditoría
      const auditData = await SignatureAuditService.createAuditData(
        signature, 
        400, // CANVAS_WIDTH
        200  // CANVAS_HEIGHT
      );
      
      
      // Guardar la auditoría en la base de datos
      await SignatureAuditService.logSignatureEvent(
        auditData,
        'created',
        contractId,
        signerType
      );
      
      const signaturePayload = {
        contractId: contractId,
        signerType: signerType,
        signature: signature,
        token: token,
        timestamp: new Date().toISOString(),
        ipAddress: auditData.ipAddress,
        deviceInfo: auditData.deviceInfo,
        signatureData: auditData.signatureData,
        sessionInfo: auditData.sessionInfo
      };
      
      await contractService.saveSignature(signaturePayload);
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      console.error('❌ Error guardando firma:', err);
      setError("Error al guardar la firma. Intente nuevamente.");
      setSubmitting(false);
    }
  };

  const getSignerInfo = () => {
    if (!contract) return "Cargando...";
    return signerType === 'client' ? contract.clientName : contract.brokerName;
  };

  const getSignerRole = () => {
    return signerType === 'client' ? 'Cliente' : 'Corredor';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contrato...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contrato firmado!</h2>
          <p className="text-gray-600 mb-4">
            La firma digital de {getSignerInfo()} ({getSignerRole()}) se ha guardado correctamente.
          </p>
          <div className="animate-pulse text-sm text-gray-500">Redirigiendo...</div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link inválido</h2>
          <p className="text-gray-600 mb-4">El link de firma no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
        {/* Branding */}
        <div className="flex items-center mb-6">
          <ImageComponent src="/images/logo/proptech.png" alt="Proptech" className="h-10 mr-4" width={500} height={150} style={{ width: 'auto', height: '40px' }} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Firma Digital de Contrato</h1>
            <p className="text-sm text-gray-600">
              Firmante: {getSignerInfo()} ({getSignerRole()})
            </p>
          </div>
        </div>
        
        {/* Instrucciones */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Por favor, revise el contrato y firme digitalmente en el recuadro inferior. 
            Su firma como {getSignerRole().toLowerCase()} tendrá validez legal y quedará registrada con fecha y hora.
          </p>
        </div>
        
        {/* Contrato */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-gray-900 text-sm">
            {contract.templateContent || contract.title || 'Contenido del contrato no disponible'}
          </pre>
        </div>
        
        {/* Firma */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <SignaturePad
            value={signature}
            onChange={setSignature}
            label={`Dibuje su firma como ${getSignerRole().toLowerCase()}`}
            error={error || undefined}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Guardando firma..." : `Firmar como ${getSignerRole()}`}
          </button>
        </form>
      </div>
    </div>
  );
} 