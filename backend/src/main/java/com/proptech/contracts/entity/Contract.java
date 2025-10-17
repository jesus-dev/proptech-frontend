package com.proptech.contracts.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "contracts", schema = "proptech")
public class Contract extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "contract_number")
    private String contractNumber;
    
    @Column(name = "status")
    private String status; // DRAFT, ACTIVE, COMPLETED, CANCELLED
    
    @Column(name = "type")
    private String type; // SALE, RENT, MANAGEMENT
    
    @Column(name = "property_id")
    private Long propertyId;
    
    @Column(name = "client_id")
    private Long clientId;
    
    @Column(name = "agent_id")
    private Long agentId;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "signed_date")
    private LocalDateTime signedDate;
    
    @Column(name = "amount")
    private BigDecimal amount;
    
    @Column(name = "currency")
    private String currency;
    
    @Column(name = "payment_terms", columnDefinition = "TEXT")
    private String paymentTerms;
    
    @Column(name = "terms", columnDefinition = "TEXT")
    private String terms;
    
    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Campos adicionales para compatibilidad con el frontend
    @Column(name = "client_name")
    private String clientName;
    
    @Column(name = "client_identification")
    private String clientIdentification;
    
    @Column(name = "broker_name")
    private String brokerName;
    
    @Column(name = "broker_id")
    private String brokerId;
    
    @Column(name = "commission_percentage")
    private BigDecimal commissionPercentage;
    
    @Column(name = "property_address")
    private String propertyAddress;
    
    @Column(name = "property_description")
    private String propertyDescription;
    
    @Column(name = "template_content", columnDefinition = "TEXT")
    private String templateContent;
    
    @Column(name = "generated_document_url")
    private String generatedDocumentUrl;

    // Campos para firmas digitales
    @Column(name = "client_signature", columnDefinition = "TEXT")
    private String clientSignature; // base64 PNG
    
    @Column(name = "broker_signature", columnDefinition = "TEXT")
    private String brokerSignature; // base64 PNG
    
    @Column(name = "client_signature_audit", columnDefinition = "TEXT")
    private String clientSignatureAudit; // JSON string con datos de auditoría
    
    @Column(name = "broker_signature_audit", columnDefinition = "TEXT")
    private String brokerSignatureAudit; // JSON string con datos de auditoría

    // Getters y setters básicos
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public LocalDateTime getSignedDate() { return signedDate; }
    public void setSignedDate(LocalDateTime signedDate) { this.signedDate = signedDate; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    
    public String getTerms() { return terms; }
    public void setTerms(String terms) { this.terms = terms; }
    
    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Getters y setters para campos adicionales
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    
    public String getClientIdentification() { return clientIdentification; }
    public void setClientIdentification(String clientIdentification) { this.clientIdentification = clientIdentification; }
    
    public String getBrokerName() { return brokerName; }
    public void setBrokerName(String brokerName) { this.brokerName = brokerName; }
    
    public String getBrokerId() { return brokerId; }
    public void setBrokerId(String brokerId) { this.brokerId = brokerId; }
    
    public BigDecimal getCommissionPercentage() { return commissionPercentage; }
    public void setCommissionPercentage(BigDecimal commissionPercentage) { this.commissionPercentage = commissionPercentage; }
    
    public String getPropertyAddress() { return propertyAddress; }
    public void setPropertyAddress(String propertyAddress) { this.propertyAddress = propertyAddress; }
    
    public String getPropertyDescription() { return propertyDescription; }
    public void setPropertyDescription(String propertyDescription) { this.propertyDescription = propertyDescription; }
    
    public String getTemplateContent() { return templateContent; }
    public void setTemplateContent(String templateContent) { this.templateContent = templateContent; }
    
    public String getGeneratedDocumentUrl() { return generatedDocumentUrl; }
    public void setGeneratedDocumentUrl(String generatedDocumentUrl) { this.generatedDocumentUrl = generatedDocumentUrl; }

    // Getters y setters para firmas digitales
    public String getClientSignature() { return clientSignature; }
    public void setClientSignature(String clientSignature) { this.clientSignature = clientSignature; }
    
    public String getBrokerSignature() { return brokerSignature; }
    public void setBrokerSignature(String brokerSignature) { this.brokerSignature = brokerSignature; }
    
    public String getClientSignatureAudit() { return clientSignatureAudit; }
    public void setClientSignatureAudit(String clientSignatureAudit) { this.clientSignatureAudit = clientSignatureAudit; }
    
    public String getBrokerSignatureAudit() { return brokerSignatureAudit; }
    public void setBrokerSignatureAudit(String brokerSignatureAudit) { this.brokerSignatureAudit = brokerSignatureAudit; }
} 