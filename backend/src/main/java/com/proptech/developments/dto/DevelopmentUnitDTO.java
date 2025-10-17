package com.proptech.developments.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.developments.enums.UnitStatus;
import com.proptech.developments.enums.UnitType;

public class DevelopmentUnitDTO {
    
    private Long id;
    private Long developmentId;
    private String unitNumber;
    private String unitName;
    private UnitType type;
    private UnitStatus status;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal discountPrice;
    private Long currencyId;
    private CurrencyDTO currency;
    private BigDecimal area;
    private String areaUnit;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer parkingSpaces;
    private String floor;
    private String block;
    private String orientation;
    private String view;
    private Boolean featured;
    private Boolean premium;
    private String description;
    private String specifications;
    private String amenities;
    private LocalDateTime availableFrom;
    private LocalDateTime deliveryDate;
    private String constructionStatus;
    private Integer progressPercentage;
    private String images;
    private String floorPlanUrl;
    private String virtualTourUrl;
    private String videoUrl;
    private Integer views;
    private Integer favoritesCount;
    private Integer inquiriesCount;
    private String notes;
    private String internalNotes;
    private Boolean active;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;

    // Constructors
    public DevelopmentUnitDTO() {}

    public DevelopmentUnitDTO(Long id, Long developmentId, String unitNumber, UnitType type, UnitStatus status, BigDecimal price) {
        this.id = id;
        this.developmentId = developmentId;
        this.unitNumber = unitNumber;
        this.type = type;
        this.status = status;
        this.price = price;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDevelopmentId() { return developmentId; }
    public void setDevelopmentId(Long developmentId) { this.developmentId = developmentId; }

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

    public Long getCurrencyId() { return currencyId; }
    public void setCurrencyId(Long currencyId) { this.currencyId = currencyId; }

    public CurrencyDTO getCurrency() { return currency; }
    public void setCurrency(CurrencyDTO currency) { this.currency = currency; }

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

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

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