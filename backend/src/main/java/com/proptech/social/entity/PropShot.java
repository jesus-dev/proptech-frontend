package com.proptech.social.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.proptech.commons.entity.Agency;
import com.proptech.commons.entity.Agent;

/**
 * Entidad para PropShots (anteriormente Reels)
 */
@Entity
@Table(name = "social_prop_shots", schema = "proptech")
public class PropShot extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", length = 255, nullable = false)
    private String title;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "media_url", length = 500, nullable = false)
    private String mediaUrl;
    
    @Column(name = "link_url", length = 500)
    private String linkUrl;
    

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;
    
    @Column(name = "likes")
    private Integer likes = 0;
    
    @Column(name = "comments")
    private Integer comments = 0;
    
    @Column(name = "shares")
    private Integer shares = 0;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "status", length = 20)
    private String status = "active";
    
    // Constructor por defecto
    public PropShot() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    
    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }
    

    
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    
    public Integer getLikes() { return likes; }
    public void setLikes(Integer likes) { this.likes = likes; }
    
    public Integer getComments() { return comments; }
    public void setComments(Integer comments) { this.comments = comments; }
    
    public Integer getShares() { return shares; }
    public void setShares(Integer shares) { this.shares = shares; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    // Helper methods para contadores
    public void incrementLikes() {
        this.likes = (this.likes != null ? this.likes : 0) + 1;
    }
    
    public void decrementLikes() {
        this.likes = Math.max(0, (this.likes != null ? this.likes : 0) - 1);
    }
    
    public void incrementComments() {
        this.comments = (this.comments != null ? this.comments : 0) + 1;
    }
    
    public void incrementShares() {
        this.shares = (this.shares != null ? this.shares : 0) + 1;
    }
    
    // Helper methods para validación
    public boolean isActive() {
        return "active".equals(this.status);
    }
    
    public boolean isDeleted() {
        return "deleted".equals(this.status);
    }
    
    public void markAsDeleted() {
        this.status = "deleted";
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean hasValidMediaUrl() {
        return this.mediaUrl != null && !this.mediaUrl.trim().isEmpty();
    }
    
    public boolean hasValidLinkUrl() {
        return this.linkUrl != null && !this.linkUrl.trim().isEmpty();
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
