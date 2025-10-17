package com.proptech.developments.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.developments.enums.QuotaStatus;
import com.proptech.developments.enums.QuotaType;

public class DevelopmentQuotaDTO {
    
    private Long id;
    private Long developmentId;
    private Long unitId;
    private String quotaNumber;
    private String quotaName;
    private QuotaType type;
    private QuotaStatus status;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private BigDecimal discountAmount;
    private Long currencyId;
    private CurrencyDTO currency;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private Integer installmentNumber;
    private Integer totalInstallments;
    private String description;
    private String notes;
    private String paymentMethod;
    private String paymentReference;
    private String processedBy;
    private LocalDateTime processedAt;
    private Boolean active;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;

    // Constructors
    public DevelopmentQuotaDTO() {}

    public DevelopmentQuotaDTO(Long id, Long developmentId, String quotaNumber, String quotaName, QuotaType type, QuotaStatus status, BigDecimal amount) {
        this.id = id;
        this.developmentId = developmentId;
        this.quotaNumber = quotaNumber;
        this.quotaName = quotaName;
        this.type = type;
        this.status = status;
        this.amount = amount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDevelopmentId() { return developmentId; }
    public void setDevelopmentId(Long developmentId) { this.developmentId = developmentId; }

    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }

    public String getQuotaNumber() { return quotaNumber; }
    public void setQuotaNumber(String quotaNumber) { this.quotaNumber = quotaNumber; }

    public String getQuotaName() { return quotaName; }
    public void setQuotaName(String quotaName) { this.quotaName = quotaName; }

    public QuotaType getType() { return type; }
    public void setType(QuotaType type) { this.type = type; }

    public QuotaStatus getStatus() { return status; }
    public void setStatus(QuotaStatus status) { this.status = status; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public Long getCurrencyId() { return currencyId; }
    public void setCurrencyId(Long currencyId) { this.currencyId = currencyId; }

    public CurrencyDTO getCurrency() { return currency; }
    public void setCurrency(CurrencyDTO currency) { this.currency = currency; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }

    public Integer getInstallmentNumber() { return installmentNumber; }
    public void setInstallmentNumber(Integer installmentNumber) { this.installmentNumber = installmentNumber; }

    public Integer getTotalInstallments() { return totalInstallments; }
    public void setTotalInstallments(Integer totalInstallments) { this.totalInstallments = totalInstallments; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
} 