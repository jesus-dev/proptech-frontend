package com.proptech.contracts.service;

import java.time.LocalDateTime;
import java.util.List;

import com.proptech.contracts.entity.Contract;
import com.proptech.contracts.respository.ContractRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class ContractService {
    @Inject
    ContractRepository contractRepository;

    public List<Contract> listAll() {
        return contractRepository.listAll();
    }

    public Contract findById(Long id) {
        return contractRepository.findById(id);
    }

    public Contract create(Contract contract) {
        contract.setCreatedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());
        contractRepository.persist(contract);
        return contract;
    }

    public Contract update(Long id, Contract updated) {
        Contract contract = contractRepository.findById(id);
        if (contract == null) return null;
        
        // Validar que el contrato no esté firmado
        if (isContractSigned(contract)) {
            throw new IllegalStateException("No se puede modificar un contrato que ya ha sido firmado. El contrato tiene estado: " + contract.getStatus() + 
                (contract.getSignedDate() != null ? " y fecha de firma: " + contract.getSignedDate() : ""));
        }
        
        contract.setTitle(updated.getTitle());
        contract.setDescription(updated.getDescription());
        contract.setContractNumber(updated.getContractNumber());
        contract.setStatus(updated.getStatus());
        contract.setType(updated.getType());
        contract.setPropertyId(updated.getPropertyId());
        contract.setClientId(updated.getClientId());
        contract.setAgentId(updated.getAgentId());
        contract.setStartDate(updated.getStartDate());
        contract.setEndDate(updated.getEndDate());
        contract.setSignedDate(updated.getSignedDate());
        contract.setAmount(updated.getAmount());
        contract.setCurrency(updated.getCurrency());
        contract.setPaymentTerms(updated.getPaymentTerms());
        contract.setTerms(updated.getTerms());
        contract.setConditions(updated.getConditions());
        
        // Campos de firmas digitales
        contract.setClientName(updated.getClientName());
        contract.setClientIdentification(updated.getClientIdentification());
        contract.setBrokerName(updated.getBrokerName());
        contract.setBrokerId(updated.getBrokerId());
        contract.setCommissionPercentage(updated.getCommissionPercentage());
        contract.setPropertyAddress(updated.getPropertyAddress());
        contract.setPropertyDescription(updated.getPropertyDescription());
        contract.setTemplateContent(updated.getTemplateContent());
        
        // Firmas digitales y auditoría
        if (updated.getClientSignature() != null) {
            contract.setClientSignature(updated.getClientSignature());
        }
        if (updated.getBrokerSignature() != null) {
            contract.setBrokerSignature(updated.getBrokerSignature());
        }
        if (updated.getClientSignatureAudit() != null) {
            contract.setClientSignatureAudit(updated.getClientSignatureAudit());
        }
        if (updated.getBrokerSignatureAudit() != null) {
            contract.setBrokerSignatureAudit(updated.getBrokerSignatureAudit());
        }
        
        contract.setUpdatedAt(LocalDateTime.now());
        
        return contract;
    }

    /**
     * Verifica si un contrato está firmado y no puede ser modificado
     */
    private boolean isContractSigned(Contract contract) {
        // Un contrato se considera firmado si:
        // 1. Tiene estado ACTIVE, COMPLETED o CANCELLED
        // 2. Tiene fecha de firma
        // 3. Tiene firmas digitales (cliente o corredor)
        
        boolean hasSignedStatus = "ACTIVE".equals(contract.getStatus()) || 
                                 "COMPLETED".equals(contract.getStatus()) || 
                                 "CANCELLED".equals(contract.getStatus());
        
        boolean hasSignedDate = contract.getSignedDate() != null;
        
        boolean hasDigitalSignatures = (contract.getClientSignature() != null && !contract.getClientSignature().trim().isEmpty()) ||
                                      (contract.getBrokerSignature() != null && !contract.getBrokerSignature().trim().isEmpty());
        
        return hasSignedStatus || hasSignedDate || hasDigitalSignatures;
    }

    /**
     * Verifica si un contrato puede ser modificado
     */
    public boolean canContractBeModified(Long id) {
        Contract contract = contractRepository.findById(id);
        if (contract == null) return false;
        return !isContractSigned(contract);
    }

    /**
     * Obtiene información sobre por qué un contrato no puede ser modificado
     */
    public String getContractModificationReason(Long id) {
        Contract contract = contractRepository.findById(id);
        if (contract == null) return "Contrato no encontrado";
        
        if (!isContractSigned(contract)) {
            return "El contrato puede ser modificado";
        }
        
        StringBuilder reason = new StringBuilder("El contrato no puede ser modificado porque: ");
        
        if ("ACTIVE".equals(contract.getStatus()) || "COMPLETED".equals(contract.getStatus()) || "CANCELLED".equals(contract.getStatus())) {
            reason.append("tiene estado ").append(contract.getStatus()).append(", ");
        }
        
        if (contract.getSignedDate() != null) {
            reason.append("tiene fecha de firma (").append(contract.getSignedDate()).append("), ");
        }
        
        if ((contract.getClientSignature() != null && !contract.getClientSignature().trim().isEmpty()) ||
            (contract.getBrokerSignature() != null && !contract.getBrokerSignature().trim().isEmpty())) {
            reason.append("tiene firmas digitales, ");
        }
        
        // Remover la última coma y espacio
        String finalReason = reason.toString();
        if (finalReason.endsWith(", ")) {
            finalReason = finalReason.substring(0, finalReason.length() - 2);
        }
        
        return finalReason;
    }

    /**
     * Guarda una firma digital en el contrato (bypasea la validación de inmutabilidad para contratos en DRAFT)
     */
    public Contract saveSignature(Long id, String signature, String auditData, String signerType) {
        Contract contract = contractRepository.findById(id);
        if (contract == null) return null;
        
        // Solo permitir guardar firmas en contratos DRAFT o si no tiene firmas previas
        if (!"DRAFT".equals(contract.getStatus()) && 
            (contract.getClientSignature() != null || contract.getBrokerSignature() != null)) {
            throw new IllegalStateException("No se puede agregar firmas a un contrato que ya está firmado o tiene estado: " + contract.getStatus());
        }
        
        if ("client".equalsIgnoreCase(signerType)) {
            contract.setClientSignature(signature);
            contract.setClientSignatureAudit(auditData);
        } else if ("broker".equalsIgnoreCase(signerType)) {
            contract.setBrokerSignature(signature);
            contract.setBrokerSignatureAudit(auditData);
        }
        
        contract.setUpdatedAt(LocalDateTime.now());
        return contract;
    }

    public boolean delete(Long id) {
        return contractRepository.deleteById(id);
    }

    /**
     * Actualiza el estado de un contrato
     */
    public Contract updateStatus(Long id, String newStatus) {
        Contract contract = contractRepository.findById(id);
        if (contract == null) return null;
        
        // Validar el nuevo estado
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("El estado del contrato no puede estar vacío");
        }
        
        // Validar que el estado sea válido
        String validStatuses = "DRAFT, ACTIVE, COMPLETED, CANCELLED, SIGNED, SIGNED_PHYSICAL, SIGNED_DIGITAL";
        if (!validStatuses.contains(newStatus.toUpperCase())) {
            throw new IllegalArgumentException("Estado inválido. Estados válidos: " + validStatuses);
        }
        
        // Actualizar el estado
        contract.setStatus(newStatus.toUpperCase());
        contract.setUpdatedAt(LocalDateTime.now());
        
        return contract;
    }
} 