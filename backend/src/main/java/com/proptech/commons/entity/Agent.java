package com.proptech.commons.entity;

import com.proptech.auth.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agents", schema = "proptech")
public class Agent extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con User para datos básicos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Campos específicos del agente (no duplicados con User)
    private String documento;
    private String license;
    private String position;
    private String bio;
    private String photo;

    @ManyToOne
    @JoinColumn(name = "agency_id", insertable = false, updatable = false)
    private Agency agency;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private AgentRole role = AgentRole.AGENTE;

    public enum AgentRole {
        ADMIN, AGENTE, SUPERVISOR
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Métodos delegados para acceder a datos del usuario
    public String getFirstName() { 
        return user != null ? user.getFirstName() : null; 
    }

    public String getLastName() { 
        return user != null ? user.getLastName() : null; 
    }

    public String getEmail() { 
        return user != null ? user.getEmail() : null; 
    }

    public String getPhone() { 
        return user != null ? user.getPhone() : null; 
    }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }

    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public AgentRole getRole() { return role; }
    public void setRole(AgentRole role) { this.role = role; }
}
