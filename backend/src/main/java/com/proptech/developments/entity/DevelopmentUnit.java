package com.proptech.developments.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.proptech.commons.entity.Currency;
import com.proptech.developments.enums.UnitStatus;
import com.proptech.developments.enums.UnitType;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "development_units", schema = "proptech")
public class DevelopmentUnit extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "development_id", nullable = false)
    private Development development;
    
    @Column(nullable = false)
    private String unitNumber; // Número de lote/unidad
    
    @Column
    private String unitName; // Nombre descriptivo
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType type; // LOT, APARTMENT, HOUSE, OFFICE, etc.
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitStatus status; // AVAILABLE, RESERVED, SOLD, UNDER_CONSTRUCTION
    
    @Column(precision = 15, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal originalPrice;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal discountPrice;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;
    
    @Column(precision = 8, scale = 2)
    private BigDecimal area; // Área del lote/unidad
    
    @Column
    private String areaUnit; // m2, ft2, etc.
    
    @Column
    private Integer bedrooms;
    
    @Column
    private Integer bathrooms;
    
    @Column
    private Integer parkingSpaces;
    
    @Column
    private String floor; // Piso (para edificios)
    
    @Column
    private String block; // Bloque (para condominios)
    
    @Column
    private String orientation; // Norte, Sur, Este, Oeste
    
    @Column
    private String view; // Vista: ciudad, mar, montaña, etc.
    
    @Column
    private Boolean featured; // Destacado
    
    @Column
    private Boolean premium; // Premium
    
    @Column
    private String description;
    
    @Column
    private String specifications; // Especificaciones técnicas
    
    @Column
    private String amenities; // Amenities específicos de la unidad
    
    @Column
    private LocalDateTime availableFrom; // Disponible desde
    
    @Column
    private LocalDateTime deliveryDate; // Fecha de entrega
    
    @Column
    private String constructionStatus; // Estado de construcción
    
    @Column(precision = 3, scale = 1)
    private BigDecimal progressPercentage; // Porcentaje de avance
    
    @Column
    private String images; // URLs de imágenes separadas por coma
    
    @Column
    private String floorPlanUrl; // URL del plano de la unidad
    
    @Column
    private String virtualTourUrl; // URL del tour virtual
    
    @Column
    private String videoUrl; // URL del video
    
    @Column
    private Integer views; // Número de vistas
    
    @Column
    private Integer favoritesCount; // Número de favoritos
    
    @Column
    private Integer inquiriesCount; // Número de consultas
    
    @Column
    private String notes; // Notas internas
    
    @Column
    private String internalNotes; // Notas internas para el equipo
    
    @Column
    private Boolean active;
    
    @Column
    private LocalDateTime createdAt;
    
    @Column
    private String createdBy;
    
    @Column
    private LocalDateTime updatedAt;
    
    @Column
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
        if (status == null) {
            status = UnitStatus.AVAILABLE;
        }
        if (views == null) {
            views = 0;
        }
        if (favoritesCount == null) {
            favoritesCount = 0;
        }
        if (inquiriesCount == null) {
            inquiriesCount = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Development getDevelopment() { return development; }
    public void setDevelopment(Development development) { this.development = development; }
    
    public String getUnitNumber() { return unitNumber; }
    public void setUnitNumber(String unitNumber) { this.unitNumber = unitNumber; }
    
    public String getUnitName() { return unitName; }
    public void setUnitName(String unitName) { this.unitName = unitName; }
    
    public UnitType getType() { return type; }
    public void setType(UnitType type) { this.type = type; }
    
    public UnitStatus getStatus() { return status; }
    public void setStatus(UnitStatus status) { this.status = status; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    
    public BigDecimal getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(BigDecimal discountPrice) { this.discountPrice = discountPrice; }
    
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    
    public BigDecimal getArea() { return area; }
    public void setArea(BigDecimal area) { this.area = area; }
    
    public String getAreaUnit() { return areaUnit; }
    public void setAreaUnit(String areaUnit) { this.areaUnit = areaUnit; }
    
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    
    public Integer getParkingSpaces() { return parkingSpaces; }
    public void setParkingSpaces(Integer parkingSpaces) { this.parkingSpaces = parkingSpaces; }
    
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    
    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }
    
    public String getOrientation() { return orientation; }
    public void setOrientation(String orientation) { this.orientation = orientation; }
    
    public String getView() { return view; }
    public void setView(String view) { this.view = view; }
    
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    
    public Boolean getPremium() { return premium; }
    public void setPremium(Boolean premium) { this.premium = premium; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }
    
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }
    
    public LocalDateTime getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDateTime deliveryDate) { this.deliveryDate = deliveryDate; }
    
    public String getConstructionStatus() { return constructionStatus; }
    public void setConstructionStatus(String constructionStatus) { this.constructionStatus = constructionStatus; }
    
    public BigDecimal getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(BigDecimal progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    
    public String getFloorPlanUrl() { return floorPlanUrl; }
    public void setFloorPlanUrl(String floorPlanUrl) { this.floorPlanUrl = floorPlanUrl; }
    
    public String getVirtualTourUrl() { return virtualTourUrl; }
    public void setVirtualTourUrl(String virtualTourUrl) { this.virtualTourUrl = virtualTourUrl; }
    
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
    
    public Integer getFavoritesCount() { return favoritesCount; }
    public void setFavoritesCount(Integer favoritesCount) { this.favoritesCount = favoritesCount; }
    
    public Integer getInquiriesCount() { return inquiriesCount; }
    public void setInquiriesCount(Integer inquiriesCount) { this.inquiriesCount = inquiriesCount; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
} 