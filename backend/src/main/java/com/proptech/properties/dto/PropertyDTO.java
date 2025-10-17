package com.proptech.properties.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.properties.entity.Property.OperacionType;

public class PropertyDTO {
    public Integer agencyPropertyNumber;
    public Long id;

    // Basic Information
    public String title;
    public String slug;
    public String description;
    public String zone;
    public String address;
    public String cityName;
    public String state;
    public String status;
    public Long neighborhoodId;
    public String neighborhoodName;
    public String locationDescription;

    // Coordinates
    public Double latitude;
    public Double longitude;

    // Main Characteristics
    public Integer bedrooms;
    public Integer bathrooms;
    public Integer parkingSpaces;
    public Double area;
    public Double lotSize;
    public Integer rooms;
    public Integer kitchens;
    public Integer floors;
    public Integer yearBuilt;
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDateTime availableFrom;

    // Additional Details
    public String additionalDetails;
    public String videoUrl;
    public String virtualTourUrl;
    public String featuredImage;
    
    // Visibility flags
    public Boolean featured = false;
    public Boolean premium = false;
    public Boolean favorite = false;

    // Statistics
    public Integer views = 0;
    public Integer favoritesCount = 0;
    public Integer shares = 0;

    // Status and Labels
    public String propertyLabel;
    public String propertyStatus;
    public String propertyStatusCode; // Código interno que nunca cambia
    public String propertyTypeName;
    public String typeLabel;
    public String statusLabel;
    public String priceLabel;

    // Services and Amenities (IDs for backward compatibility)
    public java.util.List<Long> amenities;
    public java.util.List<Long> services;

    // Services and Amenities (Complete objects)
    public java.util.List<AmenityDTO> amenitiesDetails;
    public java.util.List<ServiceDTO> servicesDetails;

    // Private Files
    public java.util.List<PrivateFileDTO> privateFiles;

    // Gallery Images
    public java.util.List<GalleryImageDTO> galleryImages;

    // Floor Plans
    public java.util.List<FloorPlanDTO> floorPlans;

    // Price and Currency
    public BigDecimal price;
    public CurrencyDTO currency;
    public String currencyCode; // Código de la moneda (ej: "USD", "PYG")
    public Long currencyId; // ID de la moneda para el frontend

    // Relationship IDs
    public Long propertyTypeId;
    public Long propertyStatusId;
    public Long cityId;
    public Long departmentId;
    public Long agencyId;
    public String agencyPublicUrl;
    public Long agentId;
    public Long propietarioId; // ID del propietario (Contact)
    
    // Agent Information
    public AgentDTO agent;
    
    // Additional Property Types
    public java.util.List<Long> additionalPropertyTypeIds;
    public java.util.List<String> additionalPropertyTypeNames;

    // WordPress Sync Information
    public Long wordpressId;
    public String syncStatus;
    public String syncError;

    // Country Information
    public Long countryId;
    public String countryName;

    // Timestamps
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    
    // Audit Information
    public Long createdById;
    public String createdByFullName;
    public String createdByEmail;
    public Long modifiedById;
    public String modifiedByFullName;
    public String modifiedByEmail;

    public OperacionType operacion;

    public OperacionType getOperacion() {
        return operacion;
    }

    public void setOperacion(OperacionType operacion) {
        this.operacion = operacion;
    }

    public Long getPropertyTypeId() { return propertyTypeId; }
    public Long getPropertyStatusId() { return propertyStatusId; }
    public Long getCityId() { return cityId; }
    public Long getAgencyId() { return agencyId; }
    public Long getAgentId() { return agentId; }
    public Long getCountryId() { return countryId; }
    
    // Basic getters for recommendation service
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAddress() { return address; }
    public String getCity() { return cityName; }
    public String getType() { return propertyTypeName; }
    public BigDecimal getPrice() { return price; }
    public Double getArea() { return area; }
    public Integer getBedrooms() { return bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public Boolean getFeatured() { return featured; }
    public Boolean getPremium() { return premium; }
    public java.util.List<Long> getAmenities() { return amenities; }
    public Integer getAgencyPropertyNumber() { return agencyPropertyNumber; }
    public void setAgencyPropertyNumber(Integer agencyPropertyNumber) { this.agencyPropertyNumber = agencyPropertyNumber; }
} 