package com.proptech.subscriptions.entity;

import com.proptech.subscriptions.enums.CommissionStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa una comisión de venta
 */
@Entity
@Table(name = "subscription_commissions", schema = "proptech")
public class Commission extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_agent_id", nullable = false)
    private SalesAgent salesAgent;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_subscription_id", nullable = false)
    private UserSubscription userSubscription;
    
    @Column(name = "sale_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal saleAmount;
    
    @Column(name = "commission_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionPercentage;
    
    @Column(name = "commission_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal commissionAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommissionStatus status;
    
    @Column(name = "sale_date", nullable = false)
    private LocalDateTime saleDate;
    
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    // Constructors
    public Commission() {
        this.createdAt = LocalDateTime.now();
        this.status = CommissionStatus.PENDING;
        this.saleDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public SalesAgent getSalesAgent() {
        return salesAgent;
    }
    
    public void setSalesAgent(SalesAgent salesAgent) {
        this.salesAgent = salesAgent;
    }
    
    public UserSubscription getUserSubscription() {
        return userSubscription;
    }
    
    public void setUserSubscription(UserSubscription userSubscription) {
        this.userSubscription = userSubscription;
    }
    
    public BigDecimal getSaleAmount() {
        return saleAmount;
    }
    
    public void setSaleAmount(BigDecimal saleAmount) {
        this.saleAmount = saleAmount;
    }
    
    public BigDecimal getCommissionPercentage() {
        return commissionPercentage;
    }
    
    public void setCommissionPercentage(BigDecimal commissionPercentage) {
        this.commissionPercentage = commissionPercentage;
    }
    
    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }
    
    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }
    
    public CommissionStatus getStatus() {
        return status;
    }
    
    public void setStatus(CommissionStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getSaleDate() {
        return saleDate;
    }
    
    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }
    
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
    
    public String getPaymentReference() {
        return paymentReference;
    }
    
    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public boolean isPending() {
        return status == CommissionStatus.PENDING;
    }
    
    public boolean isPaid() {
        return status == CommissionStatus.PAID;
    }
    
    public void markAsPaid(String paymentRef) {
        this.status = CommissionStatus.PAID;
        this.paymentDate = LocalDateTime.now();
        this.paymentReference = paymentRef;
    }
}
