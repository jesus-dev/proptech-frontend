package com.proptech.commons.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.proptech.commons.entity.SignatureAuditLog;
import com.proptech.contracts.dto.SignatureAuditLogDTO;
import com.proptech.contracts.repository.SignatureAuditLogRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class SignatureAuditLogService {
    
    @Inject
    SignatureAuditLogRepository signatureAuditLogRepository;
    
    /**
     * Guardar un nuevo log de auditoría
     */
    @Transactional
    public SignatureAuditLogDTO saveAuditLog(SignatureAuditLogDTO dto) {
        SignatureAuditLog entity = convertToEntity(dto);
        signatureAuditLogRepository.persist(entity);
        return convertToDTO(entity);
    }
    
    /**
     * Obtener todos los logs de auditoría
     */
    public List<SignatureAuditLogDTO> getAllAuditLogs() {
        List<SignatureAuditLog> entities = signatureAuditLogRepository.listAll();
        return entities.stream()
                .sorted(Comparator.comparing(SignatureAuditLog::getTimestamp).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener logs por contractId
     */
    public List<SignatureAuditLogDTO> getAuditLogsByContractId(String contractId) {
        List<SignatureAuditLog> entities = signatureAuditLogRepository.findByContractId(contractId);
        return entities.stream()
                .sorted(Comparator.comparing(SignatureAuditLog::getTimestamp).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener logs por contractId y tipo de firma
     */
    public List<SignatureAuditLogDTO> getAuditLogsByContractIdAndSignatureType(String contractId, String signatureType) {
        SignatureAuditLog.SignatureType type = SignatureAuditLog.SignatureType.valueOf(signatureType.toUpperCase());
        List<SignatureAuditLog> entities = signatureAuditLogRepository.findByContractIdAndSignatureType(contractId, type);
        return entities.stream()
                .sorted(Comparator.comparing(SignatureAuditLog::getTimestamp).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener logs por IP address
     */
    public List<SignatureAuditLogDTO> getAuditLogsByIpAddress(String ipAddress) {
        List<SignatureAuditLog> entities = signatureAuditLogRepository.findByIpAddress(ipAddress);
        return entities.stream()
                .sorted(Comparator.comparing(SignatureAuditLog::getTimestamp).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener logs por sessionId
     */
    public List<SignatureAuditLogDTO> getAuditLogsBySessionId(String sessionId) {
        List<SignatureAuditLog> entities = signatureAuditLogRepository.findBySessionId(sessionId);
        return entities.stream()
                .sorted(Comparator.comparing(SignatureAuditLog::getTimestamp).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener logs por rango de fechas
     */
    public List<SignatureAuditLogDTO> getAuditLogsByDateRange(String startDate, String endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime start = LocalDateTime.parse(startDate, formatter);
        LocalDateTime end = LocalDateTime.parse(endDate, formatter);
        
        List<SignatureAuditLog> entities = signatureAuditLogRepository.findByTimestampBetween(start, end);
        return entities.stream()
                .sorted(Comparator.comparing(SignatureAuditLog::getTimestamp).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener estadísticas de auditoría
     */
    public SignatureAuditStats getAuditStats(String contractId) {
        SignatureAuditStats stats = new SignatureAuditStats();
        stats.setContractId(contractId);
        stats.setTotalLogs(signatureAuditLogRepository.countByContractId(contractId));
        stats.setClientLogs(signatureAuditLogRepository.countByContractIdAndSignatureType(contractId, SignatureAuditLog.SignatureType.CLIENT));
        stats.setBrokerLogs(signatureAuditLogRepository.countByContractIdAndSignatureType(contractId, SignatureAuditLog.SignatureType.BROKER));
        
        // Obtener último log de cliente
        SignatureAuditLog lastClientLog = signatureAuditLogRepository.findFirstByContractIdAndSignatureType(
            contractId, SignatureAuditLog.SignatureType.CLIENT);
        if (lastClientLog != null) {
            stats.setLastClientSignature(lastClientLog.getTimestamp());
        }
        
        // Obtener último log de broker
        SignatureAuditLog lastBrokerLog = signatureAuditLogRepository.findFirstByContractIdAndSignatureType(
            contractId, SignatureAuditLog.SignatureType.BROKER);
        if (lastBrokerLog != null) {
            stats.setLastBrokerSignature(lastBrokerLog.getTimestamp());
        }
        
        return stats;
    }
    
    /**
     * Convertir DTO a Entity
     */
    private SignatureAuditLog convertToEntity(SignatureAuditLogDTO dto) {
        SignatureAuditLog entity = new SignatureAuditLog();
        entity.setContractId(dto.getContractId());
        entity.setSignatureType(SignatureAuditLog.SignatureType.valueOf(dto.getSignatureType().toUpperCase()));
        entity.setEventType(SignatureAuditLog.EventType.valueOf(dto.getEventType().toUpperCase()));
        entity.setTimestamp(dto.getTimestamp());
        entity.setIpAddress(dto.getIpAddress());
        entity.setUserAgent(dto.getUserAgent());
        entity.setPlatform(dto.getPlatform());
        entity.setBrowser(dto.getBrowser());
        entity.setBrowserVersion(dto.getBrowserVersion());
        entity.setScreenResolution(dto.getScreenResolution());
        entity.setTimezone(dto.getTimezone());
        entity.setLanguage(dto.getLanguage());
        entity.setSessionId(dto.getSessionId());
        entity.setPageUrl(dto.getPageUrl());
        entity.setReferrer(dto.getReferrer());
        entity.setCanvasWidth(dto.getCanvasWidth());
        entity.setCanvasHeight(dto.getCanvasHeight());
        entity.setSignatureHash(dto.getSignatureHash());
        entity.setSignatureLength(dto.getSignatureLength());
        entity.setLogTimestamp(dto.getLogTimestamp());
        
        return entity;
    }
    
    /**
     * Convertir Entity a DTO
     */
    private SignatureAuditLogDTO convertToDTO(SignatureAuditLog entity) {
        SignatureAuditLogDTO dto = new SignatureAuditLogDTO();
        dto.setId(entity.getId());
        dto.setContractId(entity.getContractId());
        dto.setSignatureType(entity.getSignatureType().name());
        dto.setEventType(entity.getEventType().name());
        dto.setTimestamp(entity.getTimestamp());
        dto.setIpAddress(entity.getIpAddress());
        dto.setUserAgent(entity.getUserAgent());
        dto.setPlatform(entity.getPlatform());
        dto.setBrowser(entity.getBrowser());
        dto.setBrowserVersion(entity.getBrowserVersion());
        dto.setScreenResolution(entity.getScreenResolution());
        dto.setTimezone(entity.getTimezone());
        dto.setLanguage(entity.getLanguage());
        dto.setSessionId(entity.getSessionId());
        dto.setPageUrl(entity.getPageUrl());
        dto.setReferrer(entity.getReferrer());
        dto.setCanvasWidth(entity.getCanvasWidth());
        dto.setCanvasHeight(entity.getCanvasHeight());
        dto.setSignatureHash(entity.getSignatureHash());
        dto.setSignatureLength(entity.getSignatureLength());
        dto.setLogTimestamp(entity.getLogTimestamp());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
    
    /**
     * Clase interna para estadísticas
     */
    public static class SignatureAuditStats {
        private String contractId;
        private long totalLogs;
        private long clientLogs;
        private long brokerLogs;
        private LocalDateTime lastClientSignature;
        private LocalDateTime lastBrokerSignature;
        
        // Getters and Setters
        public String getContractId() { return contractId; }
        public void setContractId(String contractId) { this.contractId = contractId; }
        
        public long getTotalLogs() { return totalLogs; }
        public void setTotalLogs(long totalLogs) { this.totalLogs = totalLogs; }
        
        public long getClientLogs() { return clientLogs; }
        public void setClientLogs(long clientLogs) { this.clientLogs = clientLogs; }
        
        public long getBrokerLogs() { return brokerLogs; }
        public void setBrokerLogs(long brokerLogs) { this.brokerLogs = brokerLogs; }
        
        public LocalDateTime getLastClientSignature() { return lastClientSignature; }
        public void setLastClientSignature(LocalDateTime lastClientSignature) { this.lastClientSignature = lastClientSignature; }
        
        public LocalDateTime getLastBrokerSignature() { return lastBrokerSignature; }
        public void setLastBrokerSignature(LocalDateTime lastBrokerSignature) { this.lastBrokerSignature = lastBrokerSignature; }
    }
} 