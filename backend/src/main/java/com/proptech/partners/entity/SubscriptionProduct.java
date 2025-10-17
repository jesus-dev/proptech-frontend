package com.proptech.partners.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.proptech.commons.entity.Currency;

@Entity
@Table(name = "subscription_products", schema = "proptech")
public class SubscriptionProduct extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    private BillingCycle billingCycle = BillingCycle.MONTHLY;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category = ProductCategory.BASIC;
    
    @ElementCollection
    @CollectionTable(name = "subscription_product_features", schema = "proptech", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "feature")
    private List<String> features;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "is_popular")
    private Boolean isPopular = false;
    
    @Column(name = "is_recommended")
    private Boolean isRecommended = false;
    
    @Column(name = "max_users")
    private Integer maxUsers;
    
    @Column(name = "max_properties")
    private Integer maxProperties;
    
    @Column(name = "max_contacts")
    private Integer maxContacts;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum BillingCycle {
        MONTHLY("Mensual"),
        QUARTERLY("Trimestral"),
        YEARLY("Anual");
        
        private final String displayName;
        
        BillingCycle(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum ProductCategory {
        BASIC("Básico"),
        PROFESSIONAL("Profesional"),
        ENTERPRISE("Empresarial"),
        CUSTOM("Personalizado"),
        TECHNOLOGY("Tecnología"),
        SERVICES("Servicios"),
        TRAINING("Capacitación"),
        NETWORKING("Networking"),
        SOCIAL_DUES("Cuotas Sociales"), // Nuevo plan genérico
        OTHER("Otros");
        
        private final String displayName;
        
        ProductCategory(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Constructors
    public SubscriptionProduct() {}
    
    public SubscriptionProduct(String name, String description, BigDecimal price, ProductCategory category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
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
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Currency getCurrency() {
        return currency;
    }
    
    public void setCurrency(Currency currency) {
        this.currency = currency;
    }
    
    public BillingCycle getBillingCycle() {
        return billingCycle;
    }
    
    public void setBillingCycle(BillingCycle billingCycle) {
        this.billingCycle = billingCycle;
    }
    
    public ProductCategory getCategory() {
        return category;
    }
    
    public void setCategory(ProductCategory category) {
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
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
