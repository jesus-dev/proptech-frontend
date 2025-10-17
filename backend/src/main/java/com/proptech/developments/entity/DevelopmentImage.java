package com.proptech.developments.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "development_images", schema = "proptech")
public class DevelopmentImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "development_id", nullable = false)
    private Long developmentId;

    @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
    private String imageUrl;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDevelopmentId() { return developmentId; }
    public void setDevelopmentId(Long developmentId) { this.developmentId = developmentId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
} 