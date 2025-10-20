import { Contract } from "../components/types";
import { contractApi } from "../../../../lib/api";

export const contractService = {
  async getAllContracts(): Promise<Contract[]> {
    try {
      const response = await contractApi.getAll();
      const data = response.data;
      const contracts = Array.isArray(data) ? data : (data?.content || []);
      return contracts;
    } catch (error) {
      console.error('❌ ContractService: Error fetching contracts:', error);
      throw new Error(`Error al cargar los contratos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async getContractById(id: string): Promise<Contract | undefined> {
    try {
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
      return contract;
    } catch (error) {
      console.error('❌ ContractService: Error fetching contract:', error);
      throw new Error(`Error al cargar el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async createContract(contractData: Omit<Contract, "id">): Promise<Contract> {
    try {
      const response = await contractApi.create(contractData);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error creating contract:', error);
      throw new Error(`Error al crear el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async updateContract(id: string, contractData: Partial<Contract>): Promise<Contract | undefined> {
    try {
      const response = await contractApi.update(id, contractData);
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
      await contractApi.delete(id);
      return true;
    } catch (error) {
      console.error('❌ ContractService: Error deleting contract:', error);
      throw new Error(`Error al eliminar el contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async updateContractStatus(id: string, status: string): Promise<Contract> {
    try {
      const response = await contractApi.updateStatus(id, status);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error updating contract status:', error);
      throw new Error(`Error al actualizar el estado del contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async signContract(id: string, signedDate: string): Promise<Contract> {
    try {
      const response = await contractApi.sign(id, signedDate);
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
      const response = await contractApi.saveSignature(signatureData);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error saving signature:', error);
      throw new Error(`Error al guardar la firma: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  async canModifyContract(id: string): Promise<{ canModify: boolean; reason: string }> {
    try {
      const response = await contractApi.canModify(id);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService: Error checking contract modification:', error);
      throw new Error(`Error al verificar si el contrato puede ser modificado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },
}; 