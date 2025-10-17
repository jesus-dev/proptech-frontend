package com.proptech.partners.dto;

import com.proptech.partners.entity.SubscriptionProduct;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SubscriptionProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long currencyId;
    private String currencyCode;
    private String billingCycle;
    private String category;
    private List<String> features;
    private Boolean isActive;
    private Boolean isPopular;
    private Boolean isRecommended;
    private Integer maxUsers;
    private Integer maxProperties;
    private Integer maxContacts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public SubscriptionProductDTO() {}
    
    public SubscriptionProductDTO(Long id, String name, String description, BigDecimal price, String currencyCode) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.currencyCode = currencyCode;
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
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Long getCurrencyId() {
        return currencyId;
    }
    
    public void setCurrencyId(Long currencyId) {
        this.currencyId = currencyId;
    }
    
    public String getCurrencyCode() {
        return currencyCode;
    }
    
    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }
    
    public String getBillingCycle() {
        return billingCycle;
    }
    
    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public List<String> getFeatures() {
        return features;
    }
    
    public void setFeatures(List<String> features) {
        this.features = features;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIsPopular() {
        return isPopular;
    }
    
    public void setIsPopular(Boolean isPopular) {
        this.isPopular = isPopular;
    }
    
    public Boolean getIsRecommended() {
        return isRecommended;
    }
    
    public void setIsRecommended(Boolean isRecommended) {
        this.isRecommended = isRecommended;
    }
    
    public Integer getMaxUsers() {
        return maxUsers;
    }
    
    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }
    
    public Integer getMaxProperties() {
        return maxProperties;
    }
    
    public void setMaxProperties(Integer maxProperties) {
        this.maxProperties = maxProperties;
    }
    
    public Integer getMaxContacts() {
        return maxContacts;
    }
    
    public void setMaxContacts(Integer maxContacts) {
        this.maxContacts = maxContacts;
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
    
    // Helper method to convert from entity
    public static SubscriptionProductDTO fromEntity(SubscriptionProduct entity) {
        SubscriptionProductDTO dto = new SubscriptionProductDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        if (entity.getCurrency() != null) {
            dto.setCurrencyId(entity.getCurrency().getId());
            dto.setCurrencyCode(entity.getCurrency().getCode());
        }
        dto.setBillingCycle(entity.getBillingCycle().name());
        dto.setCategory(entity.getCategory().name());
        dto.setFeatures(entity.getFeatures());
        dto.setIsActive(entity.getIsActive());
        dto.setIsPopular(entity.getIsPopular());
        dto.setIsRecommended(entity.getIsRecommended());
        dto.setMaxUsers(entity.getMaxUsers());
        dto.setMaxProperties(entity.getMaxProperties());
        dto.setMaxContacts(entity.getMaxContacts());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
