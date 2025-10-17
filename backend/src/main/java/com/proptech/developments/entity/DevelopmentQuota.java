package com.proptech.developments.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.proptech.commons.entity.Currency;
import com.proptech.developments.enums.QuotaStatus;
import com.proptech.developments.enums.QuotaType;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "development_quotas", schema = "proptech")
public class DevelopmentQuota extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "development_id", nullable = false)
    private Development development;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private DevelopmentUnit unit;
    
    @Column(nullable = false)
    private String quotaNumber; // Número de cuota
    
    @Column(nullable = false)
    private String quotaName; // Nombre descriptivo de la cuota
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuotaType type; // INITIAL, MONTHLY, QUARTERLY, ANNUAL, FINAL
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuotaStatus status; // PENDING, PAID, OVERDUE, CANCELLED
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal paidAmount;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal discountAmount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;
    
    @Column(nullable = false)
    private LocalDate dueDate; // Fecha de vencimiento
    
    @Column
    private LocalDate paidDate; // Fecha de pago
    
    @Column
    private Integer installmentNumber; // Número de cuota (1, 2, 3, etc.)
    
    @Column
    private Integer totalInstallments; // Total de cuotas
    
    @Column
    private String description; // Descripción de la cuota
    
    @Column
    private String notes; // Notas adicionales
    
    @Column
    private String paymentMethod; // Método de pago
    
    @Column
    private String paymentReference; // Referencia de pago
    
    @Column
    private String processedBy; // Quien procesó el pago
    
    @Column
    private LocalDateTime processedAt; // Cuando se procesó
    
    @Column
    private Boolean active;
    
    @Column
    private LocalDateTime createdAt;
    
    @Column
    private String createdBy;
    
    @Column
    private LocalDateTime updatedAt;
    
    @Column
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
        if (status == null) {
            status = QuotaStatus.PENDING;
        }
        if (paidAmount == null) {
            paidAmount = BigDecimal.ZERO;
        }
        if (discountAmount == null) {
            discountAmount = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Development getDevelopment() { return development; }
    public void setDevelopment(Development development) { this.development = development; }
    
    public DevelopmentUnit getUnit() { return unit; }
    public void setUnit(DevelopmentUnit unit) { this.unit = unit; }
    
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
    
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    
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