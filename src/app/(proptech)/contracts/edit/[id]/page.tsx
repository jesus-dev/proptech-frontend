"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ContractForm from "../../components/ContractForm";
import { Contract } from "../../components/types";
import { contractService } from "../../services/contractService";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface EditContractPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditContractPage({ params }: EditContractPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const [contractData, setContractData] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const contract = await contractService.getContractById(id);
        
        if (contract) {
          // Verificar si el contrato puede ser modificado
          try {
            const modificationCheck = await contractService.canModifyContract(id);
            if (!modificationCheck.canModify) {
              setError(`No se puede editar este contrato: ${modificationCheck.reason}`);
              return;
            }
          } catch (modError) {
            console.warn('No se pudo verificar si el contrato puede ser modificado:', modError);
            // Continuar con la carga del contrato
          }
          
          setContractData(contract);
        } else {
          setError("Contrato no encontrado.");
        }
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError("Error al cargar el contrato.");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleUpdateContract = async (formData: Omit<Contract, "id" | "generatedDocumentUrl">) => {
    try {
      setSaving(true);
      // Filtra solo los campos válidos de contrato
      const allowedFields = [
        "title", "description", "contractNumber", "status", "type", "propertyId", "clientId", "agentId", "startDate", "endDate", "signedDate", "amount", "currency", "paymentTerms", "terms", "conditions", "createdAt", "updatedAt", "clientName", "clientIdentification", "brokerName", "brokerId", "commissionPercentage", "propertyAddress", "propertyDescription", "templateContent", "clientSignature", "brokerSignature", "clientSignatureAudit", "brokerSignatureAudit"
      ];
      const cleanedData: any = {};
      for (const key of allowedFields) {
        if (formData.hasOwnProperty(key)) {
          cleanedData[key] = (formData as any)[key];
        }
      }
      // Validar campos obligatorios
      const requiredFields = [
        "title", "status", "type", "propertyId", "clientId", "agentId", "startDate", "amount", "currency"
      ];
      for (const field of requiredFields) {
        if (cleanedData[field] === undefined || cleanedData[field] === null || cleanedData[field] === "") {
          alert(`El campo obligatorio '${field}' está vacío o no definido.`);
          setSaving(false);
          return;
        }
      }
      // Imprime el payload para depuración
      console.log("Payload enviado al backend:", cleanedData);
      await contractService.updateContract(id, cleanedData);
      alert("Contrato actualizado exitosamente!");
      router.push("/contracts");
    } catch (error) {
      console.error("Error al actualizar el contrato:", error);
      alert("Error al actualizar el contrato. Por favor, intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/contracts");
  };

  if (loading) {
    return <LoadingSpinner size="md" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar el contrato
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
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

  if (!contractData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Contrato no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se pudo cargar el contrato solicitado.
          </p>
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Editar Contrato
            </h1>
            {saving && (
              <div className="flex items-center text-brand-600 dark:text-brand-400">
                <LoadingSpinner size="md" />
                <span className="text-sm ml-2">Guardando...</span>
              </div>
            )}
          </div>
          <ContractForm
            initialData={contractData}
            onSubmit={handleUpdateContract}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
} 