package com.proptech.subscriptions.dto;

import com.proptech.subscriptions.enums.SubscriptionType;
import com.proptech.subscriptions.enums.SubscriptionTier;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para SubscriptionPlan
 */
public class SubscriptionPlanDTO {
    
    private Long id;
    private String name;
    private String description;
    private SubscriptionType type;
    private SubscriptionTier tier;
    private BigDecimal price;
    private Integer billingCycleDays;
    private Integer maxProperties;
    private Integer maxAgents;
    private Boolean hasAnalytics;
    private Boolean hasCrm;
    private Boolean hasNetworkAccess;
    private Boolean hasPrioritySupport;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> features; // Lista de características para mostrar en UI
    
    // Constructors
    public SubscriptionPlanDTO() {}
    
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
    
    public List<String> getFeatures() {
        return features;
    }
    
    public void setFeatures(List<String> features) {
        this.features = features;
    }
    
    // Helper methods
    public String getBillingCycleText() {
        if (billingCycleDays == null) return "N/A";
        if (billingCycleDays == 30) return "Mensual";
        if (billingCycleDays == 365) return "Anual";
        return billingCycleDays + " días";
    }
    
    public String getMaxPropertiesText() {
        if (maxProperties == null || maxProperties == -1) return "Ilimitado";
        return maxProperties.toString();
    }
    
    public String getMaxAgentsText() {
        if (maxAgents == null || maxAgents == -1) return "Ilimitado";
        return maxAgents.toString();
    }
}
