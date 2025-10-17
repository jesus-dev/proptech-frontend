package com.proptech.ownersproperty.entity;

import com.proptech.properties.entity.Property;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "owner_properties")
public class OwnerProperty extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    public Owner owner;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    public Property property;
    
    @Column(name = "ownership_percentage", precision = 5, scale = 2)
    public BigDecimal ownershipPercentage = BigDecimal.valueOf(100.00);
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ownership_type")
    public OwnershipType ownershipType = OwnershipType.FULL;
    
    @Column(name = "start_date")
    public LocalDate startDate;
    
    @Column(name = "end_date")
    public LocalDate endDate;
    
    @Column(name = "is_primary_owner")
    public boolean isPrimaryOwner = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    // Constructores
    public OwnerProperty() {}
    
    public OwnerProperty(Owner owner, Property property) {
        this.owner = owner;
        this.property = property;
    }
    
    // Métodos de negocio
    public boolean isActive() {
        LocalDate now = LocalDate.now();
        return (startDate == null || startDate.isBefore(now) || startDate.isEqual(now)) &&
               (endDate == null || endDate.isAfter(now) || endDate.isEqual(now));
    }
    
    public boolean isFullOwner() {
        return OwnershipType.FULL.equals(this.ownershipType);
    }
    
    public boolean isPartialOwner() {
        return OwnershipType.PARTIAL.equals(this.ownershipType);
    }
    
    public boolean isJointOwner() {
        return OwnershipType.JOINT.equals(this.ownershipType);
    }
    
    public String getPropertyTitle() {
        return property != null ? property.getTitle() : "Propiedad no encontrada";
    }
    
    public String getPropertyAddress() {
        return property != null ? property.getAddress() : "Dirección no disponible";
    }
    
    public BigDecimal getPropertyPrice() {
        return property != null ? property.getPrice() : BigDecimal.ZERO;
    }
    
    public String getPropertyStatus() {
        return property != null ? "FOR_SALE" : "Estado no disponible";
    }
    
    // Enums
    public enum OwnershipType {
        FULL("Propietario Completo"),
        PARTIAL("Propietario Parcial"),
        JOINT("Propietario Conjunto");
        
        private final String displayName;
        
        OwnershipType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
