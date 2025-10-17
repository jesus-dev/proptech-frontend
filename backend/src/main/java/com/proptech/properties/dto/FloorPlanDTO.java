package com.proptech.properties.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FloorPlanDTO {
    private Long id;
    private String title;
    private Integer bedrooms;
    private Integer bathrooms;
    private BigDecimal price;
    private String priceSuffix;
    private Double size;
    private String image;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long propertyId;

    // Constructors
    public FloorPlanDTO() {}

    public FloorPlanDTO(Long id, String title, Integer bedrooms, Integer bathrooms, 
                       BigDecimal price, String priceSuffix, Double size, 
                       String image, String description, Long propertyId) {
        this.id = id;
        this.title = title;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.price = price;
        this.priceSuffix = priceSuffix;
        this.size = size;
        this.image = image;
        this.description = description;
        this.propertyId = propertyId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getPriceSuffix() {
        return priceSuffix;
    }

    public void setPriceSuffix(String priceSuffix) {
        this.priceSuffix = priceSuffix;
    }

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
} 