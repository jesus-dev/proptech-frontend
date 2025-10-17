package com.proptech.properties.entity;

import com.proptech.commons.entity.NearbyFacility;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_nearby_facilities", schema = "proptech", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"property_id", "nearby_facility_id"}))
public class PropertyNearbyFacility extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nearby_facility_id", nullable = false)
    private NearbyFacility nearbyFacility;
    
    @Column(name = "distance_km", precision = 8, scale = 2)
    private BigDecimal distanceKm;
    
    @Column(name = "walking_time_minutes")
    private Integer walkingTimeMinutes;
    
    @Column(name = "driving_time_minutes")
    private Integer drivingTimeMinutes;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    
    public NearbyFacility getNearbyFacility() { return nearbyFacility; }
    public void setNearbyFacility(NearbyFacility nearbyFacility) { this.nearbyFacility = nearbyFacility; }
    
    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    
    public Integer getWalkingTimeMinutes() { return walkingTimeMinutes; }
    public void setWalkingTimeMinutes(Integer walkingTimeMinutes) { this.walkingTimeMinutes = walkingTimeMinutes; }
    
    public Integer getDrivingTimeMinutes() { return drivingTimeMinutes; }
    public void setDrivingTimeMinutes(Integer drivingTimeMinutes) { this.drivingTimeMinutes = drivingTimeMinutes; }
    
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
