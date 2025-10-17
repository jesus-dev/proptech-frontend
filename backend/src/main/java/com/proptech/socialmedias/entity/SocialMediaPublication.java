package com.proptech.socialmedias.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_media_publication", schema = "proptech")
public class SocialMediaPublication extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "property_title")
    private String propertyTitle;

    @Column(name = "platform")
    private String platform;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "status")
    private String status;

    @Column(name = "message")
    private String message;
    
    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    
    public String getPropertyTitle() { return propertyTitle; }
    public void setPropertyTitle(String propertyTitle) { this.propertyTitle = propertyTitle; }
    
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    /**
     * Verifica si una propiedad fue publicada recientemente (en los últimos N días)
     */
    public static boolean wasPublishedRecently(Long propertyId, int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return count("propertyId = ?1 and publishedAt > ?2", propertyId, cutoffDate) > 0;
    }
} 