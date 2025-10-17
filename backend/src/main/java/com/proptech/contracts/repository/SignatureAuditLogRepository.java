package com.proptech.contracts.repository;

import java.time.LocalDateTime;
import java.util.List;

import com.proptech.commons.entity.SignatureAuditLog;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SignatureAuditLogRepository implements PanacheRepository<SignatureAuditLog> {
    
    /**
     * Buscar logs por contractId
     */
    public List<SignatureAuditLog> findByContractId(String contractId) {
        return find("contractId", contractId).list();
    }
    
    /**
     * Buscar logs por contractId y tipo de firma
     */
    public List<SignatureAuditLog> findByContractIdAndSignatureType(
        String contractId, 
        SignatureAuditLog.SignatureType signatureType
    ) {
        return find("contractId = ?1 and signatureType = ?2", contractId, signatureType).list();
    }
    
    /**
     * Buscar logs por contractId y tipo de evento
     */
    public List<SignatureAuditLog> findByContractIdAndEventType(
        String contractId, 
        SignatureAuditLog.EventType eventType
    ) {
        return find("contractId = ?1 and eventType = ?2", contractId, eventType).list();
    }
    
    /**
     * Buscar logs por IP address
     */
    public List<SignatureAuditLog> findByIpAddress(String ipAddress) {
        return find("ipAddress", ipAddress).list();
    }
    
    /**
     * Buscar logs por sessionId
     */
    public List<SignatureAuditLog> findBySessionId(String sessionId) {
        return find("sessionId", sessionId).list();
    }
    
    /**
     * Buscar logs por rango de fechas
     */
    public List<SignatureAuditLog> findByTimestampBetween(
        LocalDateTime startDate,
        LocalDateTime endDate
    ) {
        return find("timestamp between ?1 and ?2", startDate, endDate).list();
    }
    
    /**
     * Contar logs por contractId
     */
    public long countByContractId(String contractId) {
        return count("contractId", contractId);
    }
    
    /**
     * Contar logs por contractId y tipo de firma
     */
    public long countByContractIdAndSignatureType(String contractId, SignatureAuditLog.SignatureType signatureType) {
        return count("contractId = ?1 and signatureType = ?2", contractId, signatureType);
    }
    
    /**
     * Obtener el primer log para un contractId y tipo de firma
     */
    public SignatureAuditLog findFirstByContractIdAndSignatureType(
        String contractId, 
        SignatureAuditLog.SignatureType signatureType
    ) {
        return find("contractId = ?1 and signatureType = ?2", contractId, signatureType).firstResult();
    }
} 