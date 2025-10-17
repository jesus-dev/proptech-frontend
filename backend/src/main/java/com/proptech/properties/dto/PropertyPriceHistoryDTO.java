package com.proptech.properties.dto;

import com.proptech.properties.entity.PropertyPriceHistory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PropertyPriceHistoryDTO {
    
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private LocalDate date;
    private BigDecimal price;
    private BigDecimal previousPrice;
    private BigDecimal changeAmount;
    private BigDecimal changePercent;
    private PropertyPriceHistory.PriceChangeReason reason;
    private String reasonDescription;
    private String source;
    private String notes;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    
    // Constructors
    public PropertyPriceHistoryDTO() {}
    
    public PropertyPriceHistoryDTO(PropertyPriceHistory entity) {
        this.id = entity.getId();
        this.propertyId = entity.getProperty() != null ? entity.getProperty().getId() : null;
        this.propertyTitle = entity.getProperty() != null ? entity.getProperty().getTitle() : null;
        this.date = entity.getDate();
        this.price = entity.getPrice();
        this.previousPrice = entity.getPreviousPrice();
        this.changeAmount = entity.getChangeAmount();
        this.changePercent = entity.getChangePercent();
        this.reason = entity.getReason();
        this.reasonDescription = entity.getReason() != null ? entity.getReason().getDescription() : null;
        this.source = entity.getSource();
        this.notes = entity.getNotes();
        this.isActive = entity.getIsActive();
        this.createdAt = entity.getCreatedAt();
        this.createdBy = entity.getCreatedBy();
        this.updatedAt = entity.getUpdatedAt();
        this.updatedBy = entity.getUpdatedBy();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getPropertyId() {
        return propertyId;
    }
    
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
    
    public String getPropertyTitle() {
        return propertyTitle;
    }
    
    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getPreviousPrice() {
        return previousPrice;
    }
    
    public void setPreviousPrice(BigDecimal previousPrice) {
        this.previousPrice = previousPrice;
    }
    
    public BigDecimal getChangeAmount() {
        return changeAmount;
    }
    
    public void setChangeAmount(BigDecimal changeAmount) {
        this.changeAmount = changeAmount;
    }
    
    public BigDecimal getChangePercent() {
        return changePercent;
    }
    
    public void setChangePercent(BigDecimal changePercent) {
        this.changePercent = changePercent;
    }
    
    public PropertyPriceHistory.PriceChangeReason getReason() {
        return reason;
    }
    
    public void setReason(PropertyPriceHistory.PriceChangeReason reason) {
        this.reason = reason;
    }
    
    public String getReasonDescription() {
        return reasonDescription;
    }
    
    public void setReasonDescription(String reasonDescription) {
        this.reasonDescription = reasonDescription;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
