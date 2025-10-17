package com.proptech.ownersproperty.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
// import jakarta.validation.constraints.Email;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "owners")
public class Owner extends PanacheEntity {
    
    // @NotBlank(message = "El nombre es obligatorio")
    // @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
    @Column(nullable = false)
    public String name;
    
    // @NotBlank(message = "El email es obligatorio")
    // @Email(message = "El formato del email no es válido")
    @Column(unique = true, nullable = false)
    public String email;
    
    // @Size(max = 50, message = "El teléfono no puede exceder 50 caracteres")
    public String phone;
    
    @Column(columnDefinition = "TEXT")
    public String address;
    
    @Column(name = "document_number")
    // @Size(max = 50, message = "El número de documento no puede exceder 50 caracteres")
    public String documentNumber;
    
    @Column(name = "bank_account")
    // @Size(max = 100, message = "La cuenta bancaria no puede exceder 100 caracteres")
    public String bankAccount;
    
    @Column(columnDefinition = "TEXT")
    public String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public OwnerStatus status = OwnerStatus.ACTIVE;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    public Long createdBy;
    
    @Column(name = "updated_by")
    public Long updatedBy;
    
    // Relaciones
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<OwnerProperty> ownerProperties;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<OwnerReport> reports;
    
    // Relaciones - Comentadas hasta que se implementen las entidades
    // @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // public List<OwnerNotification> notifications;
    
    // @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // public List<OwnerRecommendation> recommendations;
    
    // Constructores
    public Owner() {}
    
    public Owner(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    // Métodos de negocio
    public int getPropertiesCount() {
        return ownerProperties != null ? ownerProperties.size() : 0;
    }
    
    public double getTotalValue() {
        if (ownerProperties == null) return 0.0;
        return ownerProperties.stream()
                .mapToDouble(op -> op.property != null ? op.property.getPrice().doubleValue() : 0.0)
                .sum();
    }
    
    public boolean isActive() {
        return OwnerStatus.ACTIVE.equals(this.status);
    }
    
    // Enums
    public enum OwnerStatus {
        ACTIVE("Activo"),
        INACTIVE("Inactivo"),
        PENDING("Pendiente");
        
        private final String displayName;
        
        OwnerStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
