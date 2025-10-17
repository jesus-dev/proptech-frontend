package com.proptech.commons.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "nearby_facilities", schema = "proptech")
public class NearbyFacility extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityType type;
    
    @Column(nullable = false)
    private String address;
    
    @Column(precision = 10, scale = 6)
    private BigDecimal latitude;
    
    @Column(precision = 10, scale = 6)
    private BigDecimal longitude;
    
    private String phone;
    private String website;
    private String email;
    
    @Column(name = "opening_hours")
    private String openingHours;
    
    @Column(name = "distance_km")
    private BigDecimal distanceKm;
    
    @Column(name = "walking_time_minutes")
    private Integer walkingTimeMinutes;
    
    @Column(name = "driving_time_minutes")
    private Integer drivingTimeMinutes;
    
    private Boolean active = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum FacilityType {
        HOSPITAL("Hospital"),
        SCHOOL("Escuela"),
        UNIVERSITY("Universidad"),
        SHOPPING_CENTER("Centro Comercial"),
        SUPERMARKET("Supermercado"),
        RESTAURANT("Restaurante"),
        BANK("Banco"),
        PHARMACY("Farmacia"),
        GYM("Gimnasio"),
        PARK("Parque"),
        TRANSPORT_STATION("Estación de Transporte"),
        GAS_STATION("Gasolinera"),
        POLICE_STATION("Comisaría"),
        FIRE_STATION("Bomberos"),
        POST_OFFICE("Oficina de Correos"),
        LIBRARY("Biblioteca"),
        CINEMA("Cine"),
        THEATER("Teatro"),
        MUSEUM("Museo"),
        SPORTS_CENTER("Centro Deportivo"),
        CHURCH("Iglesia"),
        EMBASSY("Embajada"),
        GOVERNMENT_OFFICE("Oficina Gubernamental"),
        OTHER("Otro");
        
        private final String displayName;
        
        FacilityType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
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
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public FacilityType getType() { return type; }
    public void setType(FacilityType type) { this.type = type; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
    
    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    
    public Integer getWalkingTimeMinutes() { return walkingTimeMinutes; }
    public void setWalkingTimeMinutes(Integer walkingTimeMinutes) { this.walkingTimeMinutes = walkingTimeMinutes; }
    
    public Integer getDrivingTimeMinutes() { return drivingTimeMinutes; }
    public void setDrivingTimeMinutes(Integer drivingTimeMinutes) { this.drivingTimeMinutes = drivingTimeMinutes; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
