package com.proptech.socialmedias.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SocialMediaPostDTO {
    public Long id;
    public String title;
    public String description;
    public String imageUrl;
    public String propertyUrl;
    public String price;
    public String location;
    public List<String> platforms; // "facebook", "instagram", "twitter"
    public String status; // "pending", "published", "failed"
    public String errorMessage;
    public LocalDateTime scheduledAt;
    public LocalDateTime publishedAt;
    public Long propertyId;
    
    // Facebook specific fields
    public String facebookPostId;
    public String instagramPostId;
    
    public SocialMediaPostDTO() {}
    
    public SocialMediaPostDTO(Long id, String title, String description, String imageUrl, 
                             String propertyUrl, String price, String location, 
                             List<String> platforms, String status, Long propertyId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.propertyUrl = propertyUrl;
        this.price = price;
        this.location = location;
        this.platforms = platforms;
        this.status = status;
        this.propertyId = propertyId;
    }
} 