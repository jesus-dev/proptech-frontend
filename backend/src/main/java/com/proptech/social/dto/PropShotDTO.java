package com.proptech.social.dto;

import java.time.LocalDateTime;

public class PropShotDTO {
    public Long id;
    public String title;
    public String description;
    public String mediaUrl;
    public String linkUrl;
    public Long propertyId;
    public Long agentId;
    public String agentName;
    public String agentImage;
    public Long socialId;
    public String socialName;
    public Integer likes;
    public Integer comments;
    public Integer shares;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public String status;
    
    // Constructor por defecto
    public PropShotDTO() {}
    
    // Constructor con parámetros
    public PropShotDTO(Long id, String title, String description, String mediaUrl, 
                   String linkUrl, Long propertyId, Long agentId, String agentName, 
                   String agentImage, Long socialId, String socialName, Integer likes, Integer comments, Integer shares, 
                   LocalDateTime createdAt, LocalDateTime updatedAt, String status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.mediaUrl = mediaUrl;
        this.linkUrl = linkUrl;
        this.propertyId = propertyId;
        this.agentId = agentId;
        this.agentName = agentName;
        this.agentImage = agentImage;
        this.socialId = socialId;
        this.socialName = socialName;
        this.likes = likes;
        this.comments = comments;
        this.shares = shares;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
    }
}
