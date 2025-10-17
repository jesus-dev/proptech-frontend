package com.proptech.properties.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.proptech.properties.entity.PropertyAuditLog;
import com.proptech.properties.entity.PropertyAuditLog.AuditAction;

public class PropertyAuditLogDTO {
    
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private AuditAction action;
    private Long changedById;
    private String changedByFullName;
    private String changedByEmail;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime changedAt;
    
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private String additionalInfo;

    // Constructors
    public PropertyAuditLogDTO() {}

    public PropertyAuditLogDTO(PropertyAuditLog auditLog) {
        this.id = auditLog.getId();
        this.propertyId = auditLog.getProperty().getId();
        this.propertyTitle = auditLog.getProperty().getTitle();
        this.action = auditLog.getAction();
        this.changedAt = auditLog.getChangedAt();
        this.fieldName = auditLog.getFieldName();
        this.oldValue = auditLog.getOldValue();
        this.newValue = auditLog.getNewValue();
        this.ipAddress = auditLog.getIpAddress();
        this.userAgent = auditLog.getUserAgent();
        this.additionalInfo = auditLog.getAdditionalInfo();
        
        if (auditLog.getChangedBy() != null) {
            this.changedById = auditLog.getChangedBy().getId();
            this.changedByFullName = auditLog.getChangedBy().getFullName();
            this.changedByEmail = auditLog.getChangedBy().getEmail();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getPropertyTitle() { return propertyTitle; }
    public void setPropertyTitle(String propertyTitle) { this.propertyTitle = propertyTitle; }

    public AuditAction getAction() { return action; }
    public void setAction(AuditAction action) { this.action = action; }

    public Long getChangedById() { return changedById; }
    public void setChangedById(Long changedById) { this.changedById = changedById; }

    public String getChangedByFullName() { return changedByFullName; }
    public void setChangedByFullName(String changedByFullName) { this.changedByFullName = changedByFullName; }

    public String getChangedByEmail() { return changedByEmail; }
    public void setChangedByEmail(String changedByEmail) { this.changedByEmail = changedByEmail; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }
} 