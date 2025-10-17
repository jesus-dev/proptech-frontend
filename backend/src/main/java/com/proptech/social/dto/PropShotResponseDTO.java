package com.proptech.social.dto;

import java.time.LocalDateTime;

public class PropShotResponseDTO {
    public Long id;
    public String title;
    public String description;
    public String mediaUrl;
    public String linkUrl;
    public Long agentId;
    public String agentFirstName;
    public String agentLastName;
    public String agentEmail;
    public String agentPhoto;
    public Integer likes;
    public Integer comments;
    public Integer shares;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public String status;
    
    // Constructor por defecto
    public PropShotResponseDTO() {}
    
    // Constructor con parámetros
    public PropShotResponseDTO(Long id, String title, String description, String mediaUrl, 
                          String linkUrl, Long agentId, String agentFirstName, String agentLastName,
                          String agentEmail, String agentPhoto, Integer likes, Integer comments, 
                          Integer shares, LocalDateTime createdAt, LocalDateTime updatedAt, String status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.mediaUrl = mediaUrl;
        this.linkUrl = linkUrl;
        this.agentId = agentId;
        this.agentFirstName = agentFirstName;
        this.agentLastName = agentLastName;
        this.agentEmail = agentEmail;
        this.agentPhoto = agentPhoto;
        this.likes = likes;
        this.comments = comments;
        this.shares = shares;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
    }
}
