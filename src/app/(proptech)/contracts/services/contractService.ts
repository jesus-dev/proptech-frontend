import { Contract } from "../components/types";
import { contractApi } from "../../../../lib/api";

export const contractService = {
  async getAllContracts(): Promise<Contract[]> {
    try {
      console.log('🔍 ContractService: Fetching all contracts from API');
      const response = await contractApi.getAll();
      const data = response.data;
      const contracts = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ ContractService: Successfully fetched', contracts.length, 'contracts');
      return contracts;
    } catch (error) {
      console.error('❌ ContractService: Error fetching contracts:', error);
      throw new Error(`Error al cargar los contratos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getContractById(id: string): Promise<Contract | undefined> {
    try {
      console.log('🔍 ContractService: Fetching contract by ID:', id);
      const response = await contractApi.getById(id);
      const contract = response.data;
      // Parsear los campos de auditoría si vienen como string
      if (typeof contract?.clientSignatureAudit === 'string') {
        try {
          contract.clientSignatureAudit = JSON.parse(contract.clientSignatureAudit);
        } catch (e) {
          contract.clientSignatureAudit = undefined;
        }
      }
      if (typeof contract?.brokerSignatureAudit === 'string') {
        try {
          contract.brokerSignatureAudit = JSON.parse(contract.brokerSignatureAudit);
        } catch (e) {
          contract.brokerSignatureAudit = undefined;
        }
      }
      console.log('✅ ContractService: Successfully fetched contract:', contract);
      return contract;
    } catch (error) {
      console.error('❌ ContractService: Error fetching contract:', error);
      throw new Error(`Error al cargar el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async createContract(contractData: Omit<Contract, "id">): Promise<Contract> {
    try {
      console.log('🔍 ContractService: Creating new contract:', contractData);
      const response = await contractApi.create(contractData);
      console.log('✅ ContractService: Successfully created contract:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error creating contract:', error);
      throw new Error(`Error al crear el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async updateContract(id: string, contractData: Partial<Contract>): Promise<Contract | undefined> {
    try {
      console.log('🔍 ContractService: Updating contract with ID:', id, 'Data:', contractData);
      const response = await contractApi.update(id, contractData);
      console.log('✅ ContractService: Successfully updated contract:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ContractService: Error updating contract:', error);
      
      // Manejar específicamente el error de contrato ya firmado
      if (error.response?.status === 409 && error.response?.data?.error === 'CONTRACT_ALREADY_SIGNED') {
        throw new Error(`No se puede modificar el contrato: ${error.response.data.message}`);
      }
      
      throw new Error(`Error al actualizar el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async deleteContract(id: string): Promise<boolean> {
    try {
      console.log('🔍 ContractService: Deleting contract with ID:', id);
      await contractApi.delete(id);
      console.log('✅ ContractService: Successfully deleted contract');
      return true;
    } catch (error) {
      console.error('❌ ContractService: Error deleting contract:', error);
      throw new Error(`Error al eliminar el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async updateContractStatus(id: string, status: string): Promise<Contract> {
    try {
      console.log('🔍 ContractService: Updating contract status for ID:', id, 'New status:', status);
      const response = await contractApi.updateStatus(id, status);
      console.log('✅ ContractService: Successfully updated contract status:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error updating contract status:', error);
      throw new Error(`Error al actualizar el estado del contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async signContract(id: string, signedDate: string): Promise<Contract> {
    try {
      console.log('🔍 ContractService: Signing contract with ID:', id, 'Signed date:', signedDate);
      const response = await contractApi.sign(id, signedDate);
      console.log('✅ ContractService: Successfully signed contract:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error signing contract:', error);
      throw new Error(`Error al firmar el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async saveSignature(signatureData: {
    contractId: string;
    signerType: 'client' | 'broker';
    signature: string;
    token: string;
    timestamp: string;
    ipAddress?: string;
    deviceInfo?: unknown;
  }): Promise<any> {
    try {
      console.log('🔍 ContractService: Saving signature for contract:', signatureData.contractId, 'Signer:', signatureData.signerType);
      const response = await contractApi.saveSignature(signatureData);
      console.log('✅ ContractService: Successfully saved signature:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error saving signature:', error);
      throw new Error(`Error al guardar la firma: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async canModifyContract(id: string): Promise<{ canModify: boolean; reason: string }> {
    try {
      console.log('🔍 ContractService: Checking if contract can be modified:', id);
      const response = await contractApi.canModify(id);
      console.log('✅ ContractService: Contract modification check result:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error checking contract modification:', error);
      throw new Error(`Error al verificar si el contrato puede ser modificado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },
}; 