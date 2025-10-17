package com.proptech.subscriptions.entity;

import com.proptech.auth.entity.User;
import com.proptech.subscriptions.enums.SalesAgentStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa un agente de ventas de suscripciones
 */
@Entity
@Table(name = "subscription_sales_agents", schema = "proptech")
public class SalesAgent extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
    
    @Column(name = "agent_code", unique = true, nullable = false, length = 20)
    private String agentCode;
    
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;
    
    @Column(length = 100)
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "commission_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionPercentage; // Ej: 15.50 para 15.5%
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalesAgentStatus status;
    
    @Column(name = "hire_date", nullable = false)
    private LocalDateTime hireDate;
    
    @Column(name = "termination_date")
    private LocalDateTime terminationDate;
    
    @Column(name = "total_sales", precision = 15, scale = 2)
    private BigDecimal totalSales = BigDecimal.ZERO;
    
    @Column(name = "total_commissions", precision = 15, scale = 2)
    private BigDecimal totalCommissions = BigDecimal.ZERO;
    
    @Column(name = "pending_commissions", precision = 15, scale = 2)
    private BigDecimal pendingCommissions = BigDecimal.ZERO;
    
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
    public SalesAgent() {
        this.createdAt = LocalDateTime.now();
        this.status = SalesAgentStatus.ACTIVE;
        this.hireDate = LocalDateTime.now();
        this.totalSales = BigDecimal.ZERO;
        this.totalCommissions = BigDecimal.ZERO;
        this.pendingCommissions = BigDecimal.ZERO;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getAgentCode() {
        return agentCode;
    }
    
    public void setAgentCode(String agentCode) {
        this.agentCode = agentCode;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public BigDecimal getCommissionPercentage() {
        return commissionPercentage;
    }
    
    public void setCommissionPercentage(BigDecimal commissionPercentage) {
        this.commissionPercentage = commissionPercentage;
    }
    
    public SalesAgentStatus getStatus() {
        return status;
    }
    
    public void setStatus(SalesAgentStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getHireDate() {
        return hireDate;
    }
    
    public void setHireDate(LocalDateTime hireDate) {
        this.hireDate = hireDate;
    }
    
    public LocalDateTime getTerminationDate() {
        return terminationDate;
    }
    
    public void setTerminationDate(LocalDateTime terminationDate) {
        this.terminationDate = terminationDate;
    }
    
    public BigDecimal getTotalSales() {
        return totalSales;
    }
    
    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }
    
    public BigDecimal getTotalCommissions() {
        return totalCommissions;
    }
    
    public void setTotalCommissions(BigDecimal totalCommissions) {
        this.totalCommissions = totalCommissions;
    }
    
    public BigDecimal getPendingCommissions() {
        return pendingCommissions;
    }
    
    public void setPendingCommissions(BigDecimal pendingCommissions) {
        this.pendingCommissions = pendingCommissions;
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
    public boolean isActive() {
        return status == SalesAgentStatus.ACTIVE;
    }
    
    public void addSale(BigDecimal saleAmount) {
        this.totalSales = this.totalSales.add(saleAmount);
    }
    
    public void addCommission(BigDecimal commissionAmount) {
        this.pendingCommissions = this.pendingCommissions.add(commissionAmount);
    }
    
    public void payCommission(BigDecimal commissionAmount) {
        this.pendingCommissions = this.pendingCommissions.subtract(commissionAmount);
        this.totalCommissions = this.totalCommissions.add(commissionAmount);
    }
}
