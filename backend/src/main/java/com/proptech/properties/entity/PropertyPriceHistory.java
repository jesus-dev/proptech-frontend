package com.proptech.properties.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_price_history", schema = "proptech")
public class PropertyPriceHistory extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal previousPrice;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal changeAmount;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal changePercent;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriceChangeReason reason;
    
    @Column(length = 255)
    private String source; // Portal Inmobiliario, Agencia Local, etc.
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum PriceChangeReason {
        MARKET_ADJUSTMENT("Ajuste de mercado"),
        PROPERTY_IMPROVEMENT("Mejora de la propiedad"),
        MARKET_DEMAND("Demanda del mercado"),
        SEASONAL_CHANGE("Cambio estacional"),
        PRICE_CORRECTION("Corrección de precio"),
        NEGOTIATION("Negociación"),
        APPRAISAL("Tasación"),
        OTHER("Otro");
        
        private final String description;
        
        PriceChangeReason(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // Constructors
    public PropertyPriceHistory() {}
    
    public PropertyPriceHistory(Property property, LocalDate date, BigDecimal price, 
                               PriceChangeReason reason, String source) {
        this.property = property;
        this.date = date;
        this.price = price;
        this.reason = reason;
        this.source = source;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Property getProperty() {
        return property;
    }
    
    public void setProperty(Property property) {
        this.property = property;
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
    
    public PriceChangeReason getReason() {
        return reason;
    }
    
    public void setReason(PriceChangeReason reason) {
        this.reason = reason;
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
