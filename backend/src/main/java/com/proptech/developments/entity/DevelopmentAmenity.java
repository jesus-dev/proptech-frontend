package com.proptech.developments.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "development_amenities", schema = "proptech")
public class DevelopmentAmenity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String amenity;

    @Column(name = "development_id", nullable = false)
    private Long developmentId;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAmenity() { return amenity; }
    public void setAmenity(String amenity) { this.amenity = amenity; }

    public Long getDevelopmentId() { return developmentId; }
    public void setDevelopmentId(Long developmentId) { this.developmentId = developmentId; }
} 