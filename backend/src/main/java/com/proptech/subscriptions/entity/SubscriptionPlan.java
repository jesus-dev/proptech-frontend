package com.proptech.subscriptions.entity;

import com.proptech.subscriptions.enums.SubscriptionType;
import com.proptech.subscriptions.enums.SubscriptionTier;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa un plan de suscripción
 */
@Entity
@Table(name = "subscription_plans", schema = "proptech")
public class SubscriptionPlan extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionTier tier;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "billing_cycle_days", nullable = false)
    private Integer billingCycleDays; // 30 para mensual, 365 para anual
    
    @Column(name = "max_properties")
    private Integer maxProperties; // -1 para ilimitado
    
    @Column(name = "max_agents")
    private Integer maxAgents; // -1 para ilimitado
    
    @Column(name = "has_analytics", nullable = false)
    private Boolean hasAnalytics = false;
    
    @Column(name = "has_crm", nullable = false)
    private Boolean hasCrm = false;
    
    @Column(name = "has_network_access", nullable = false)
    private Boolean hasNetworkAccess = false;
    
    @Column(name = "has_priority_support", nullable = false)
    private Boolean hasPrioritySupport = false;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public SubscriptionPlan() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public SubscriptionType getType() {
        return type;
    }
    
    public void setType(SubscriptionType type) {
        this.type = type;
    }
    
    public SubscriptionTier getTier() {
        return tier;
    }
    
    public void setTier(SubscriptionTier tier) {
        this.tier = tier;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getBillingCycleDays() {
        return billingCycleDays;
    }
    
    public void setBillingCycleDays(Integer billingCycleDays) {
        this.billingCycleDays = billingCycleDays;
    }
    
    public Integer getMaxProperties() {
        return maxProperties;
    }
    
    public void setMaxProperties(Integer maxProperties) {
        this.maxProperties = maxProperties;
    }
    
    public Integer getMaxAgents() {
        return maxAgents;
    }
    
    public void setMaxAgents(Integer maxAgents) {
        this.maxAgents = maxAgents;
    }
    
    public Boolean getHasAnalytics() {
        return hasAnalytics;
    }
    
    public void setHasAnalytics(Boolean hasAnalytics) {
        this.hasAnalytics = hasAnalytics;
    }
    
    public Boolean getHasCrm() {
        return hasCrm;
    }
    
    public void setHasCrm(Boolean hasCrm) {
        this.hasCrm = hasCrm;
    }
    
    public Boolean getHasNetworkAccess() {
        return hasNetworkAccess;
    }
    
    public void setHasNetworkAccess(Boolean hasNetworkAccess) {
        this.hasNetworkAccess = hasNetworkAccess;
    }
    
    public Boolean getHasPrioritySupport() {
        return hasPrioritySupport;
    }
    
    public void setHasPrioritySupport(Boolean hasPrioritySupport) {
        this.hasPrioritySupport = hasPrioritySupport;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
