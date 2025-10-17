package com.proptech.properties.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.proptech.commons.entity.Agency;
import com.proptech.commons.entity.Agent;
import com.proptech.commons.entity.City;
import com.proptech.commons.entity.Country;
import com.proptech.commons.entity.Currency;
import com.proptech.commons.entity.Department;
import com.proptech.commons.entity.Neighborhood;
import com.proptech.contacts.entity.Contact;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "properties", schema = "proptech")
public class Property extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Information
    @Column(nullable = false)
    private String title;
    
    @Column(unique = true)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String zone;
    private String address;
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;
    @ManyToOne
    @JoinColumn(name = "neighborhood_id")
    private Neighborhood neighborhood;
    @Column(name = "location_description")
    private String locationDescription;
    
    // Coordinates
    private Double latitude;
    private Double longitude;

    // Main Characteristics
    private Integer bedrooms;
    private Integer bathrooms;
    @Column(name = "parking_spaces")
    private Integer parkingSpaces;
    private Double area;
    private Double lotSize;
    private Integer rooms;
    private Integer kitchens;
    private Integer floors;
    
    private Integer yearBuilt;
    private LocalDateTime availableFrom;

    // Additional Details
    @Column(name = "additional_details")
    private String additionalDetails;
    private String videoUrl;
    private String virtualTourUrl;
    @Column(name = "featured_image")
    private String featuredImage;
    
    // Visibility flags
    private Boolean featured = false;
    private Boolean premium = false;
    private Boolean favorite = false;
    
    // Statistics
    private Integer views = 0;
    private Integer favoritesCount = 0;
    private Integer shares = 0;
    
    // Status and Labels
    @Column(name = "property_label")
    private String propertyLabel;

    // Price and Currency
    @Column(nullable = false)
    private BigDecimal price;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Audit fields
    @ManyToOne
    @JoinColumn(name = "created_by")
    private Agent createdBy;
    
    @ManyToOne
    @JoinColumn(name = "modified_by")
    private Agent modifiedBy;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "property_type_id")
    private PropertyType propertyType;
    
    // Additional Property Types (ManyToMany)
    @ManyToMany
    @JoinTable(
        name = "property_additional_types",
        schema = "proptech",
        joinColumns = @JoinColumn(name = "property_id"),
        inverseJoinColumns = @JoinColumn(name = "property_type_id")
    )
    private List<PropertyType> additionalPropertyTypes;

    @ManyToOne
    @JoinColumn(name = "property_status_id")
    private PropertyStatus propertyStatus;

    @ManyToOne
    @JoinColumn(name = "city_id")
    private City city;

    @ManyToOne
    @JoinColumn(name = "agency_id")
    private Agency agency;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private Agent agent;

    // Propietario de la propiedad (relación con Contact)
    @ManyToOne
    @JoinColumn(name = "propietario_id")
    private Contact propietario;

    // Amenities (ManyToMany)
    @ManyToMany
    @JoinTable(
        name = "property_amenities",
        schema = "proptech",
        joinColumns = @JoinColumn(name = "property_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private List<Amenity> amenities;

    // Services (ManyToMany)
    @ManyToMany
    @JoinTable(
        name = "property_services",
        schema = "proptech",
        joinColumns = @JoinColumn(name = "property_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private List<Service> services;

    // Private Files (OneToMany)
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrivateFile> privateFiles;

    // Gallery Images (OneToMany)
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GalleryImage> galleryImages;

    // Floor Plans (OneToMany)
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FloorPlan> floorPlans;

    // Nearby Facilities (OneToMany)
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PropertyNearbyFacility> nearbyFacilities;

    // Nueva columna para operación (venta, alquiler, ambos)
    public enum OperacionType {
        SALE,      // Venta
        RENT,      // Alquiler
        BOTH       // Ambos
    }

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OperacionType operacion;

    public OperacionType getOperacion() {
        return operacion;
    }

    public void setOperacion(OperacionType operacion) {
        this.operacion = operacion;
    }

    private Integer agencyPropertyNumber;

    public Integer getAgencyPropertyNumber() { return agencyPropertyNumber; }
    public void setAgencyPropertyNumber(Integer agencyPropertyNumber) { this.agencyPropertyNumber = agencyPropertyNumber; }



    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        generateSlug();
        // Asignar agencyPropertyNumber autonumérico por agencia
        if (this.agency != null && this.agency.getId() != null) {
            Long agencyId = this.agency.getId();
            Integer maxNum = Property.find("SELECT MAX(p.agencyPropertyNumber) FROM Property p WHERE p.agency.id = ?1", agencyId).project(Integer.class).firstResult();
            this.agencyPropertyNumber = (maxNum == null ? 1 : maxNum + 1);
        } else if (this.agent != null && this.agent.getId() != null) {
            Long agentId = this.agent.getId();
            Integer maxNum = Property.find("SELECT MAX(p.agencyPropertyNumber) FROM Property p WHERE p.agent.id = ?1", agentId).project(Integer.class).firstResult();
            this.agencyPropertyNumber = (maxNum == null ? 1 : maxNum + 1);
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        generateSlug();
    }
    
    private void generateSlug() {
        if (this.title != null) {
            // Normalizar caracteres acentuados
            String normalizedTitle = this.title
                .toLowerCase()
                .replaceAll("á", "a")
                .replaceAll("é", "e")
                .replaceAll("í", "i")
                .replaceAll("ó", "o")
                .replaceAll("ú", "u")
                .replaceAll("ü", "u")
                .replaceAll("ñ", "n");
            
            String baseSlug = normalizedTitle
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-+|-+$", "");
            
            // Si el slug base está vacío, usar el ID
            if (baseSlug.isEmpty()) {
                baseSlug = "propiedad-" + this.id;
            }
            
            // Solo actualizar el slug si está vacío o si el título cambió significativamente
            if (this.slug == null || this.slug.isEmpty() || !this.slug.equals(baseSlug)) {
                this.slug = baseSlug;
            }
        }
    }

    // Getters y Setters para todos los campos
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Country getCountry() { return country; }
    public void setCountry(Country country) { this.country = country; }
    public Neighborhood getNeighborhood() { return neighborhood; }
    public void setNeighborhood(Neighborhood neighborhood) { this.neighborhood = neighborhood; }
    public String getLocationDescription() { return locationDescription; }
    public void setLocationDescription(String locationDescription) { this.locationDescription = locationDescription; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public Integer getParkingSpaces() { return parkingSpaces; }
    public void setParkingSpaces(Integer parkingSpaces) { this.parkingSpaces = parkingSpaces; }
    public Double getArea() { return area; }
    public void setArea(Double area) { this.area = area; }
    public Double getLotSize() { return lotSize; }
    public void setLotSize(Double lotSize) { this.lotSize = lotSize; }
    public Integer getRooms() { return rooms; }
    public void setRooms(Integer rooms) { this.rooms = rooms; }
    public Integer getKitchens() { return kitchens; }
    public void setKitchens(Integer kitchens) { this.kitchens = kitchens; }
    public Integer getFloors() { return floors; }
    public void setFloors(Integer floors) { this.floors = floors; }
    public Integer getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(Integer yearBuilt) { this.yearBuilt = yearBuilt; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }
    public String getAdditionalDetails() { return additionalDetails; }
    public void setAdditionalDetails(String additionalDetails) { this.additionalDetails = additionalDetails; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getVirtualTourUrl() { return virtualTourUrl; }
    public void setVirtualTourUrl(String virtualTourUrl) { this.virtualTourUrl = virtualTourUrl; }
    public String getFeaturedImage() { return featuredImage; }
    public void setFeaturedImage(String featuredImage) { this.featuredImage = featuredImage; }
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public Boolean getPremium() { return premium; }
    public void setPremium(Boolean premium) { this.premium = premium; }
    public Boolean getFavorite() { return favorite; }
    public void setFavorite(Boolean favorite) { this.favorite = favorite; }
    
    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }
    
    public Integer getFavoritesCount() { return favoritesCount; }
    public void setFavoritesCount(Integer favoritesCount) { this.favoritesCount = favoritesCount; }
    
    public Integer getShares() { return shares; }
    public void setShares(Integer shares) { this.shares = shares; }
    
    public String getPropertyLabel() { return propertyLabel; }
    public void setPropertyLabel(String propertyLabel) { this.propertyLabel = propertyLabel; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
     public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }
    
    public List<PropertyType> getAdditionalPropertyTypes() { return additionalPropertyTypes; }
    public void setAdditionalPropertyTypes(List<PropertyType> additionalPropertyTypes) { this.additionalPropertyTypes = additionalPropertyTypes; }
    public PropertyStatus getPropertyStatus() { return propertyStatus; }
    public void setPropertyStatus(PropertyStatus propertyStatus) { this.propertyStatus = propertyStatus; }
    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public Contact getPropietario() { return propietario; }
    public void setPropietario(Contact propietario) { this.propietario = propietario; }
    public List<Amenity> getAmenities() { return amenities; }
    public void setAmenities(List<Amenity> amenities) { this.amenities = amenities; }
    public List<Service> getServices() { return services; }
    public void setServices(List<Service> services) { this.services = services; }
    public List<PrivateFile> getPrivateFiles() { return privateFiles; }
    public void setPrivateFiles(List<PrivateFile> privateFiles) { this.privateFiles = privateFiles; }
    public List<GalleryImage> getGalleryImages() { return galleryImages; }
    public void setGalleryImages(List<GalleryImage> galleryImages) { this.galleryImages = galleryImages; }
    public List<FloorPlan> getFloorPlans() { return floorPlans; }
    public void setFloorPlans(List<FloorPlan> floorPlans) { this.floorPlans = floorPlans; }

    public List<PropertyNearbyFacility> getNearbyFacilities() { return nearbyFacilities; }
    public void setNearbyFacilities(List<PropertyNearbyFacility> nearbyFacilities) { this.nearbyFacilities = nearbyFacilities; }
} 