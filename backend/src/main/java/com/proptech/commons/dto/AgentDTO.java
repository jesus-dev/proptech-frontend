package com.proptech.commons.dto;

import com.proptech.commons.entity.Agent;
import com.proptech.commons.entity.Agent.AgentRole;
import java.time.LocalDateTime;

/**
 * DTO que combina información del agente con datos básicos del usuario
 */
public class AgentDTO {
    
    private Long id;
    private Long userId;
    
    // Datos del usuario
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    
    // Datos específicos del agente
    private String documento;
    private String license;
    private String position;
    private String bio;
    private String photo;
    
    private Long agencyId;
    private String agencyName;
    private Boolean isActive;
    private AgentRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor por defecto
    public AgentDTO() {}
    
    // Constructor que combina Agent con User
    public AgentDTO(Agent agent) {
        this.id = agent.getId();
        this.userId = agent.getUser().getId();
        
        // Datos del usuario
        this.firstName = agent.getFirstName();
        this.lastName = agent.getLastName();
        this.email = agent.getEmail();
        this.phone = agent.getPhone();
        
        // Datos específicos del agente
        this.documento = agent.getDocumento();
        this.license = agent.getLicense();
        this.position = agent.getPosition();
        this.bio = agent.getBio();
        this.photo = agent.getPhoto();
        
        this.agencyId = agent.getAgency() != null ? agent.getAgency().getId() : null;
        this.agencyName = agent.getAgency() != null ? agent.getAgency().getName() : null;
        this.isActive = agent.getIsActive();
        this.role = agent.getRole();
        this.createdAt = agent.getCreatedAt();
        this.updatedAt = agent.getUpdatedAt();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
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
    
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public AgentRole getRole() { return role; }
    public void setRole(AgentRole role) { this.role = role; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
