package com.proptech.developments.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.proptech.commons.entity.Currency;
import com.proptech.developments.enums.ConstructionStatus;
import com.proptech.developments.enums.DevelopmentStatus;
import com.proptech.developments.enums.DevelopmentType;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
@Table(name = "developments", schema = "proptech")
public class Development extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DevelopmentType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DevelopmentStatus status;
    
    @Column(nullable = false)
    private String address;
    
    @Column(nullable = false)
    private String city;
    
    @Column
    private String state;
    
    @Column
    private String zipCode;
    
    @Column(nullable = false)
    private String country;
    
    @Column(precision = 10, scale = 6)
    private BigDecimal latitude;
    
    @Column(precision = 10, scale = 6)
    private BigDecimal longitude;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal originalPrice;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal discountPrice;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;
    
    @Column
    private Integer totalUnits;
    
    @Column
    private Integer availableUnits;
    
    @Column
    private Integer soldUnits;
    
    @Column
    private Integer reservedUnits;
    
    @Column
    private Integer bedrooms;
    
    @Column
    private Integer bathrooms;
    
    @Column(precision = 8, scale = 2)
    private BigDecimal area;
    
    @Column
    private String areaUnit; // m2, ft2, etc.
    
    @ElementCollection
    @CollectionTable(name = "development_images", joinColumns = @JoinColumn(name = "development_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images;
    
    @ElementCollection
    @CollectionTable(name = "development_amenities", joinColumns = @JoinColumn(name = "development_id"))
    @Column(name = "amenity")
    private List<String> amenities;
    
    @Column
    private String developer;
    
    @Column
    private String constructionCompany;
    
    @Column
    private LocalDateTime constructionStartDate;
    
    @Column
    private LocalDateTime constructionEndDate;
    
    @Column
    private LocalDateTime deliveryDate;
    
    @Enumerated(EnumType.STRING)
    @Column
    private ConstructionStatus constructionStatus;
    
    @Column(precision = 3, scale = 1)
    private BigDecimal progressPercentage;
    
    @Column
    private Boolean featured;
    
    @Column
    private Boolean premium;
    
    @Column
    private Integer views;
    
    @Column
    private Integer favoritesCount;
    
    @Column
    private Integer sharesCount;
    
    @Column
    private Integer inquiriesCount;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal rating;
    
    @Column
    private Integer totalReviews;
    
    @Column
    private String financingOptions;
    
    @Column
    private String paymentPlans;
    
    @Column
    private String legalStatus;
    
    @Column
    private String permits;
    
    @Column
    private String utilities;
    
    @Column
    private String infrastructure;
    
    @Column
    private String environmentalImpact;
    
    @Column
    private String sustainabilityFeatures;
    
    @Column
    private String securityFeatures;
    
    @Column
    private String parkingSpaces;
    
    @Column
    private String storageSpaces;
    
    @Column
    private String petPolicy;
    
    @Column
    private String rentalPolicy;
    
    @Column
    private String maintenanceFee;
    
    @Column
    private String propertyTax;
    
    @Column
    private String insurance;
    
    @Column
    private String hoaFees;
    
    @Column
    private String hoaRules;
    
    @Column
    private String hoaContact;
    
    @Column
    private String propertyManager;
    
    @Column
    private String managerContact;
    
    @Column
    private String emergencyContact;
    
    @Column
    private String virtualTourUrl;
    
    @Column
    private String videoUrl;
    
    @Column
    private String brochureUrl;
    
    @Column
    private String floorPlanUrl;
    
    @Column
    private String sitePlanUrl;
    
    @Column
    private String masterPlanUrl;
    
    @Column
    private String specificationsUrl;
    
    @Column
    private String warrantyInfo;
    
    @Column
    private String warrantyPeriod;
    
    @Column
    private String warrantyCoverage;
    
    @Column
    private String warrantyContact;
    
    @Column
    private String notes;
    
    @Column
    private String internalNotes;
    
    @Column
    private String tags;
    
    @Column
    private String seoTitle;
    
    @Column
    private String seoDescription;
    
    @Column
    private String seoKeywords;
    
    @Column
    private String metaTags;
    
    @Column
    private Boolean active;
    
    @Column
    private Boolean published;
    
    @Column
    private LocalDateTime publishedAt;
    
    @Column
    private String publishedBy;
    
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
        if (views == null) views = 0;
        if (favoritesCount == null) favoritesCount = 0;
        if (sharesCount == null) sharesCount = 0;
        if (inquiriesCount == null) inquiriesCount = 0;
        if (totalReviews == null) totalReviews = 0;
        if (featured == null) featured = false;
        if (premium == null) premium = false;
        if (active == null) active = true;
        if (published == null) published = false;
        if (availableUnits == null) availableUnits = totalUnits;
        if (soldUnits == null) soldUnits = 0;
        if (reservedUnits == null) reservedUnits = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public DevelopmentType getType() {
        return type;
    }
    
    public void setType(DevelopmentType type) {
        this.type = type;
    }
    
    public DevelopmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(DevelopmentStatus status) {
        this.status = status;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getZipCode() {
        return zipCode;
    }
    
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public BigDecimal getLatitude() {
        return latitude;
    }
    
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }
    
    public BigDecimal getLongitude() {
        return longitude;
    }
    
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }
    
    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }
    
    public BigDecimal getDiscountPrice() {
        return discountPrice;
    }
    
    public void setDiscountPrice(BigDecimal discountPrice) {
        this.discountPrice = discountPrice;
    }
    
    public Currency getCurrency() {
        return currency;
    }
    
    public void setCurrency(Currency currency) {
        this.currency = currency;
    }
    
    public Integer getTotalUnits() {
        return totalUnits;
    }
    
    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }
    
    public Integer getAvailableUnits() {
        return availableUnits;
    }
    
    public void setAvailableUnits(Integer availableUnits) {
        this.availableUnits = availableUnits;
    }
    
    public Integer getSoldUnits() {
        return soldUnits;
    }
    
    public void setSoldUnits(Integer soldUnits) {
        this.soldUnits = soldUnits;
    }
    
    public Integer getReservedUnits() {
        return reservedUnits;
    }
    
    public void setReservedUnits(Integer reservedUnits) {
        this.reservedUnits = reservedUnits;
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
    
    public BigDecimal getArea() {
        return area;
    }
    
    public void setArea(BigDecimal area) {
        this.area = area;
    }
    
    public String getAreaUnit() {
        return areaUnit;
    }
    
    public void setAreaUnit(String areaUnit) {
        this.areaUnit = areaUnit;
    }
    
    public List<String> getImages() {
        return images;
    }
    
    public void setImages(List<String> images) {
        this.images = images;
    }
    
    public List<String> getAmenities() {
        return amenities;
    }
    
    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }
    
    public String getDeveloper() {
        return developer;
    }
    
    public void setDeveloper(String developer) {
        this.developer = developer;
    }
    
    public String getConstructionCompany() {
        return constructionCompany;
    }
    
    public void setConstructionCompany(String constructionCompany) {
        this.constructionCompany = constructionCompany;
    }
    
    public LocalDateTime getConstructionStartDate() {
        return constructionStartDate;
    }
    
    public void setConstructionStartDate(LocalDateTime constructionStartDate) {
        this.constructionStartDate = constructionStartDate;
    }
    
    public LocalDateTime getConstructionEndDate() {
        return constructionEndDate;
    }
    
    public void setConstructionEndDate(LocalDateTime constructionEndDate) {
        this.constructionEndDate = constructionEndDate;
    }
    
    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }
    
    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
    
    public ConstructionStatus getConstructionStatus() {
        return constructionStatus;
    }
    
    public void setConstructionStatus(ConstructionStatus constructionStatus) {
        this.constructionStatus = constructionStatus;
    }
    
    public BigDecimal getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(BigDecimal progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public Boolean getFeatured() {
        return featured;
    }
    
    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }
    
    public Boolean getPremium() {
        return premium;
    }
    
    public void setPremium(Boolean premium) {
        this.premium = premium;
    }
    
    public Integer getViews() {
        return views;
    }
    
    public void setViews(Integer views) {
        this.views = views;
    }
    
    public Integer getFavoritesCount() {
        return favoritesCount;
    }
    
    public void setFavoritesCount(Integer favoritesCount) {
        this.favoritesCount = favoritesCount;
    }
    
    public Integer getSharesCount() {
        return sharesCount;
    }
    
    public void setSharesCount(Integer sharesCount) {
        this.sharesCount = sharesCount;
    }
    
    public Integer getInquiriesCount() {
        return inquiriesCount;
    }
    
    public void setInquiriesCount(Integer inquiriesCount) {
        this.inquiriesCount = inquiriesCount;
    }
    
    public BigDecimal getRating() {
        return rating;
    }
    
    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }
    
    public Integer getTotalReviews() {
        return totalReviews;
    }
    
    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }
    
    public String getFinancingOptions() {
        return financingOptions;
    }
    
    public void setFinancingOptions(String financingOptions) {
        this.financingOptions = financingOptions;
    }
    
    public String getPaymentPlans() {
        return paymentPlans;
    }
    
    public void setPaymentPlans(String paymentPlans) {
        this.paymentPlans = paymentPlans;
    }
    
    public String getLegalStatus() {
        return legalStatus;
    }
    
    public void setLegalStatus(String legalStatus) {
        this.legalStatus = legalStatus;
    }
    
    public String getPermits() {
        return permits;
    }
    
    public void setPermits(String permits) {
        this.permits = permits;
    }
    
    public String getUtilities() {
        return utilities;
    }
    
    public void setUtilities(String utilities) {
        this.utilities = utilities;
    }
    
    public String getInfrastructure() {
        return infrastructure;
    }
    
    public void setInfrastructure(String infrastructure) {
        this.infrastructure = infrastructure;
    }
    
    public String getEnvironmentalImpact() {
        return environmentalImpact;
    }
    
    public void setEnvironmentalImpact(String environmentalImpact) {
        this.environmentalImpact = environmentalImpact;
    }
    
    public String getSustainabilityFeatures() {
        return sustainabilityFeatures;
    }
    
    public void setSustainabilityFeatures(String sustainabilityFeatures) {
        this.sustainabilityFeatures = sustainabilityFeatures;
    }
    
    public String getSecurityFeatures() {
        return securityFeatures;
    }
    
    public void setSecurityFeatures(String securityFeatures) {
        this.securityFeatures = securityFeatures;
    }
    
    public String getParkingSpaces() {
        return parkingSpaces;
    }
    
    public void setParkingSpaces(String parkingSpaces) {
        this.parkingSpaces = parkingSpaces;
    }
    
    public String getStorageSpaces() {
        return storageSpaces;
    }
    
    public void setStorageSpaces(String storageSpaces) {
        this.storageSpaces = storageSpaces;
    }
    
    public String getPetPolicy() {
        return petPolicy;
    }
    
    public void setPetPolicy(String petPolicy) {
        this.petPolicy = petPolicy;
    }
    
    public String getRentalPolicy() {
        return rentalPolicy;
    }
    
    public void setRentalPolicy(String rentalPolicy) {
        this.rentalPolicy = rentalPolicy;
    }
    
    public String getMaintenanceFee() {
        return maintenanceFee;
    }
    
    public void setMaintenanceFee(String maintenanceFee) {
        this.maintenanceFee = maintenanceFee;
    }
    
    public String getPropertyTax() {
        return propertyTax;
    }
    
    public void setPropertyTax(String propertyTax) {
        this.propertyTax = propertyTax;
    }
    
    public String getInsurance() {
        return insurance;
    }
    
    public void setInsurance(String insurance) {
        this.insurance = insurance;
    }
    
    public String getHoaFees() {
        return hoaFees;
    }
    
    public void setHoaFees(String hoaFees) {
        this.hoaFees = hoaFees;
    }
    
    public String getHoaRules() {
        return hoaRules;
    }
    
    public void setHoaRules(String hoaRules) {
        this.hoaRules = hoaRules;
    }
    
    public String getHoaContact() {
        return hoaContact;
    }
    
    public void setHoaContact(String hoaContact) {
        this.hoaContact = hoaContact;
    }
    
    public String getPropertyManager() {
        return propertyManager;
    }
    
    public void setPropertyManager(String propertyManager) {
        this.propertyManager = propertyManager;
    }
    
    public String getManagerContact() {
        return managerContact;
    }
    
    public void setManagerContact(String managerContact) {
        this.managerContact = managerContact;
    }
    
    public String getEmergencyContact() {
        return emergencyContact;
    }
    
    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }
    
    public String getVirtualTourUrl() {
        return virtualTourUrl;
    }
    
    public void setVirtualTourUrl(String virtualTourUrl) {
        this.virtualTourUrl = virtualTourUrl;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public String getBrochureUrl() {
        return brochureUrl;
    }
    
    public void setBrochureUrl(String brochureUrl) {
        this.brochureUrl = brochureUrl;
    }
    
    public String getFloorPlanUrl() {
        return floorPlanUrl;
    }
    
    public void setFloorPlanUrl(String floorPlanUrl) {
        this.floorPlanUrl = floorPlanUrl;
    }
    
    public String getSitePlanUrl() {
        return sitePlanUrl;
    }
    
    public void setSitePlanUrl(String sitePlanUrl) {
        this.sitePlanUrl = sitePlanUrl;
    }
    
    public String getMasterPlanUrl() {
        return masterPlanUrl;
    }
    
    public void setMasterPlanUrl(String masterPlanUrl) {
        this.masterPlanUrl = masterPlanUrl;
    }
    
    public String getSpecificationsUrl() {
        return specificationsUrl;
    }
    
    public void setSpecificationsUrl(String specificationsUrl) {
        this.specificationsUrl = specificationsUrl;
    }
    
    public String getWarrantyInfo() {
        return warrantyInfo;
    }
    
    public void setWarrantyInfo(String warrantyInfo) {
        this.warrantyInfo = warrantyInfo;
    }
    
    public String getWarrantyPeriod() {
        return warrantyPeriod;
    }
    
    public void setWarrantyPeriod(String warrantyPeriod) {
        this.warrantyPeriod = warrantyPeriod;
    }
    
    public String getWarrantyCoverage() {
        return warrantyCoverage;
    }
    
    public void setWarrantyCoverage(String warrantyCoverage) {
        this.warrantyCoverage = warrantyCoverage;
    }
    
    public String getWarrantyContact() {
        return warrantyContact;
    }
    
    public void setWarrantyContact(String warrantyContact) {
        this.warrantyContact = warrantyContact;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getInternalNotes() {
        return internalNotes;
    }
    
    public void setInternalNotes(String internalNotes) {
        this.internalNotes = internalNotes;
    }
    
    public String getTags() {
        return tags;
    }
    
    public void setTags(String tags) {
        this.tags = tags;
    }
    
    public String getSeoTitle() {
        return seoTitle;
    }
    
    public void setSeoTitle(String seoTitle) {
        this.seoTitle = seoTitle;
    }
    
    public String getSeoDescription() {
        return seoDescription;
    }
    
    public void setSeoDescription(String seoDescription) {
        this.seoDescription = seoDescription;
    }
    
    public String getSeoKeywords() {
        return seoKeywords;
    }
    
    public void setSeoKeywords(String seoKeywords) {
        this.seoKeywords = seoKeywords;
    }
    
    public String getMetaTags() {
        return metaTags;
    }
    
    public void setMetaTags(String metaTags) {
        this.metaTags = metaTags;
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public Boolean getPublished() {
        return published;
    }
    
    public void setPublished(Boolean published) {
        this.published = published;
    }
    
    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }
    
    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }
    
    public String getPublishedBy() {
        return publishedBy;
    }
    
    public void setPublishedBy(String publishedBy) {
        this.publishedBy = publishedBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
} 