package com.proptech.properties.mapper;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.commons.entity.Agent;
import com.proptech.commons.entity.Currency;
import com.proptech.commons.entity.Department;
import com.proptech.contacts.entity.Contact;
import com.proptech.properties.dto.AgentDTO;
import com.proptech.properties.dto.AmenityDTO;
import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.dto.ServiceDTO;
import com.proptech.properties.entity.Amenity;
import com.proptech.properties.entity.Property;
import com.proptech.properties.entity.PropertyType;
import com.proptech.properties.entity.Service;
import com.proptech.properties.entity.PropertyAuditLog;
import java.util.Objects;


public class PropertyMapper {

    public static PropertyDTO toDTO(Property entity) {
        if (entity == null) {
            return null;
        }

        PropertyDTO dto = new PropertyDTO();
        dto.id = entity.getId();
        dto.title = entity.getTitle();
        dto.slug = entity.getSlug();
        dto.description = entity.getDescription();
        dto.zone = entity.getZone();
        dto.address = entity.getAddress();
        dto.state = entity.getDepartment() != null ? entity.getDepartment().getName() : null;
        dto.countryId = entity.getCountry() != null ? entity.getCountry().getId() : null;
        dto.countryName = entity.getCountry() != null ? entity.getCountry().getName() : null;
        dto.neighborhoodId = entity.getNeighborhood() != null ? entity.getNeighborhood().getId() : null;
        dto.neighborhoodName = entity.getNeighborhood() != null ? entity.getNeighborhood().getName() : null;
        dto.locationDescription = entity.getLocationDescription();
        dto.latitude = entity.getLatitude();
        dto.longitude = entity.getLongitude();
        dto.bedrooms = entity.getBedrooms();
        dto.bathrooms = entity.getBathrooms();
        dto.parkingSpaces = entity.getParkingSpaces();
        dto.area = entity.getArea();
        dto.lotSize = entity.getLotSize();
        dto.rooms = entity.getRooms();
        dto.kitchens = entity.getKitchens();
        dto.floors = entity.getFloors();
        dto.yearBuilt = entity.getYearBuilt();
        dto.availableFrom = entity.getAvailableFrom();
        dto.additionalDetails = entity.getAdditionalDetails();
        dto.videoUrl = entity.getVideoUrl();
        dto.virtualTourUrl = entity.getVirtualTourUrl();
        dto.featuredImage = entity.getFeaturedImage();
        dto.featured = entity.getFeatured();
        dto.premium = entity.getPremium();
        dto.favorite = entity.getFavorite();
        dto.views = entity.getViews();
        dto.favoritesCount = entity.getFavoritesCount();
        dto.shares = entity.getShares();
        dto.propertyLabel = entity.getPropertyLabel();
        dto.agencyPropertyNumber = entity.getAgencyPropertyNumber();
        // Status and Labels
        dto.propertyStatus = entity.getPropertyStatus() != null ? entity.getPropertyStatus().getName() : null;
        dto.propertyStatusCode = entity.getPropertyStatus() != null ? entity.getPropertyStatus().getCode() : null; // Código interno
        dto.propertyStatusId = entity.getPropertyStatus() != null ? entity.getPropertyStatus().getId() : null;
        dto.propertyTypeName = entity.getPropertyType() != null ? entity.getPropertyType().getName() : null;
        dto.typeLabel = null; // Campo no existe en la entidad
        dto.statusLabel = null; // Campo no existe en la entidad
        dto.priceLabel = null; // Campo no existe en la entidad
        dto.operacion = entity.getOperacion();
        // Status ahora viene de la relación PropertyStatus
        dto.status = entity.getPropertyStatus() != null ? entity.getPropertyStatus().getCode() : null;
        
        // Amenities and Services (IDs for backward compatibility)
        dto.amenities = entity.getAmenities() != null ? entity.getAmenities().stream().map(a -> a.getId()).collect(java.util.stream.Collectors.toList()) : null;
        dto.services = entity.getServices() != null ? entity.getServices().stream().map(s -> s.getId()).collect(java.util.stream.Collectors.toList()) : null;
        
        // Amenities and Services (Complete objects)
        dto.amenitiesDetails = entity.getAmenities() != null ? entity.getAmenities().stream()
            .map(a -> new AmenityDTO(a.getId(), a.getName(), a.getDescription(), a.getCategory(), a.getIcon(), a.getActive()))
            .collect(java.util.stream.Collectors.toList()) : null;
        dto.servicesDetails = entity.getServices() != null ? entity.getServices().stream()
            .map(s -> new ServiceDTO(s.getId(), s.getName(), s.getDescription(), s.getType(), s.getIncludedInRent(), s.getIncludedInSale(), s.getActive()))
            .collect(java.util.stream.Collectors.toList()) : null;
        
        dto.privateFiles = entity.getPrivateFiles() != null ? entity.getPrivateFiles().stream().map(PrivateFileMapper::toDTO).collect(java.util.stream.Collectors.toList()) : null;
        dto.galleryImages = entity.getGalleryImages() != null ? entity.getGalleryImages().stream().map(GalleryImageMapper::toDTO).collect(java.util.stream.Collectors.toList()) : null;
        dto.floorPlans = entity.getFloorPlans() != null ? entity.getFloorPlans().stream().map(floorPlan -> new FloorPlanMapper().toDTO(floorPlan)).collect(java.util.stream.Collectors.toList()) : null;
        dto.price = entity.getPrice();
        dto.currency = toCurrencyDTO(entity.getCurrency());
        dto.currencyId = entity.getCurrency() != null ? entity.getCurrency().getId() : null;
        dto.currencyCode = entity.getCurrency() != null ? entity.getCurrency().getCode() : null;

        dto.createdAt = entity.getCreatedAt();
        dto.updatedAt = entity.getUpdatedAt();
        
        // Audit Information - Obtener información de auditoría
        try {
            // Obtener información del creador
            PropertyAuditLog creatorLog = PropertyAuditLog.find("property.id = ?1 AND action = ?2 ORDER BY changedAt ASC", entity.getId(), PropertyAuditLog.AuditAction.CREATE).firstResult();
            if (creatorLog != null && creatorLog.getChangedBy() != null) {
                dto.createdById = creatorLog.getChangedBy().getId();
                dto.createdByFullName = creatorLog.getChangedBy().getFullName();
                dto.createdByEmail = creatorLog.getChangedBy().getEmail();
            }
            
            // Obtener información del último modificador
            PropertyAuditLog lastModifierLog = PropertyAuditLog.find("property.id = ?1 AND action = ?2 ORDER BY changedAt DESC", entity.getId(), PropertyAuditLog.AuditAction.UPDATE).firstResult();
            if (lastModifierLog != null && lastModifierLog.getChangedBy() != null) {
                dto.modifiedById = lastModifierLog.getChangedBy().getId();
                dto.modifiedByFullName = lastModifierLog.getChangedBy().getFullName();
                dto.modifiedByEmail = lastModifierLog.getChangedBy().getEmail();
            }
        } catch (Exception e) {
            // Log error pero no fallar el mapeo
            System.err.println("Error getting audit information: " + e.getMessage());
        }

        // Relationship IDs
        if (entity.getPropertyType() != null) {
            dto.propertyTypeId = entity.getPropertyType().getId();
        } else {
            dto.propertyTypeId = null;
            dto.propertyTypeName = null;
        }
        dto.agencyId = entity.getAgency() != null ? entity.getAgency().getId() : null;
        dto.agencyPublicUrl = entity.getAgency() != null ? entity.getAgency().getPublicUrl() : null;
        dto.agentId = entity.getAgent() != null ? entity.getAgent().getId() : null;
        dto.propietarioId = entity.getPropietario() != null ? entity.getPropietario().getId() : null;
        
        // Additional Property Types
        if (entity.getAdditionalPropertyTypes() != null && !entity.getAdditionalPropertyTypes().isEmpty()) {
            dto.additionalPropertyTypeIds = entity.getAdditionalPropertyTypes().stream()
                .map(PropertyType::getId)
                .collect(Collectors.toList());
            dto.additionalPropertyTypeNames = entity.getAdditionalPropertyTypes().stream()
                .map(PropertyType::getName)
                .collect(Collectors.toList());
        } else {
            dto.additionalPropertyTypeIds = null;
            dto.additionalPropertyTypeNames = null;
        }
        if (entity.getPropertyStatus() != null) {
            dto.propertyStatusId = entity.getPropertyStatus().getId();
        }
        if (entity.getCity() != null) {
            dto.cityId = entity.getCity().getId();
        }
        if (entity.getDepartment() != null) {
            dto.departmentId = entity.getDepartment().getId();
        }
        if (entity.getAgency() != null) {
            dto.agencyId = entity.getAgency().getId();
        }
        if (entity.getAgent() != null) {
            dto.agent = new AgentDTO();
            dto.agent.setId(entity.getAgent().getId());
            dto.agent.setFirstName(entity.getAgent().getFirstName());
            dto.agent.setLastName(entity.getAgent().getLastName());
            dto.agent.setEmail(entity.getAgent().getEmail());
            dto.agent.setPhone(entity.getAgent().getPhone());
            dto.agent.setPhoto(entity.getAgent().getPhoto());
            
        }

        return dto;
    }

    // Métodos auxiliares para conversión de Currency
    private static CurrencyDTO toCurrencyDTO(Currency currency) {
        if (currency == null) return null;
        CurrencyDTO dto = new CurrencyDTO();
        dto.setId(currency.getId());
        dto.setCode(currency.getCode());
        dto.setName(currency.getName());
        dto.setSymbol(currency.getSymbol());
        dto.setExchangeRate(currency.getExchangeRate());
        dto.setIsBase(currency.getIsBase());
        dto.setIsActive(currency.getIsActive());
        dto.setDecimalPlaces(currency.getDecimalPlaces());
        dto.setFormat(currency.getFormat());
        dto.setDescription(currency.getDescription());
        dto.setCreatedAt(currency.getCreatedAt());
        dto.setCreatedBy(currency.getCreatedBy());
        dto.setUpdatedAt(currency.getUpdatedAt());
        dto.setUpdatedBy(currency.getUpdatedBy());
        return dto;
    }

    @SuppressWarnings("unused")
    private static Currency toCurrencyEntity(CurrencyDTO dto) {
        if (dto == null) return null;
        Currency currency = new Currency();
        currency.setId(dto.getId());
        currency.setCode(dto.getCode());
        currency.setName(dto.getName());
        currency.setSymbol(dto.getSymbol());
        currency.setExchangeRate(dto.getExchangeRate());
        currency.setIsBase(dto.getIsBase());
        currency.setIsActive(dto.getIsActive());
        currency.setDecimalPlaces(dto.getDecimalPlaces());
        currency.setFormat(dto.getFormat());
        currency.setDescription(dto.getDescription());
        currency.setCreatedAt(dto.getCreatedAt());
        currency.setCreatedBy(dto.getCreatedBy());
        currency.setUpdatedAt(dto.getUpdatedAt());
        currency.setUpdatedBy(dto.getUpdatedBy());
        return currency;
    }

    public static Property toEntity(PropertyDTO dto) {
        if (dto == null) {
            return null;
        }

        Property entity = new Property();
        entity.setId(dto.id);
        entity.setTitle(dto.title);
        entity.setSlug(dto.slug);
        entity.setDescription(dto.description);
        entity.setZone(dto.zone);
        entity.setAddress(dto.address);
        // Department se maneja por ID, no por nombre
        if (dto.departmentId != null) {
            Department department = Department.findById(dto.departmentId);
            entity.setDepartment(department);
        }
        entity.setCountry(null);
        entity.setNeighborhood(null);
        entity.setLocationDescription(dto.locationDescription);
        entity.setLatitude(dto.latitude);
        entity.setLongitude(dto.longitude);
        entity.setBedrooms(dto.bedrooms);
        entity.setBathrooms(dto.bathrooms);
        entity.setParkingSpaces(dto.parkingSpaces);
        entity.setArea(dto.area);
        entity.setLotSize(dto.lotSize);
        entity.setRooms(dto.rooms);
        entity.setKitchens(dto.kitchens);
        entity.setFloors(dto.floors);
        entity.setYearBuilt(dto.yearBuilt);
        entity.setAvailableFrom(dto.availableFrom);
        entity.setAdditionalDetails(dto.additionalDetails);
        entity.setVideoUrl(dto.videoUrl);
        entity.setVirtualTourUrl(dto.virtualTourUrl);
        entity.setFeaturedImage(dto.featuredImage);
        entity.setFeatured(dto.featured);
        entity.setPremium(dto.premium);
        entity.setFavorite(dto.favorite);
        entity.setPropertyLabel(dto.propertyLabel);
        entity.setOperacion(dto.operacion);
        entity.setAgencyPropertyNumber(dto.agencyPropertyNumber);
        if (dto.amenities != null) {
            Amenity[] amenitiesArr = dto.amenities.stream()
                .map(id -> (Amenity) Amenity.findById(id))
                .filter(Objects::nonNull)
                .toArray(Amenity[]::new);
            entity.setAmenities(Arrays.asList(amenitiesArr));
        }
        if (dto.services != null) {
            List<Service> services = dto.services.stream()
                .map(id -> (Service) Service.findById(id))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            entity.setServices(services);
        }
        entity.setPrivateFiles(dto.privateFiles != null ? dto.privateFiles.stream().map(PrivateFileMapper::toEntity).collect(Collectors.toList()) : null);
        entity.setGalleryImages(dto.galleryImages != null ? dto.galleryImages.stream().map(GalleryImageMapper::toEntity).collect(Collectors.toList()) : null);
        entity.setPrice(dto.price);
        // Mapeo simple de currency por ID usando findById
        if (dto.currencyId != null) {
            Currency currency = Currency.findById(dto.currencyId);
            if (currency != null) {
                entity.setCurrency(currency);
            }
        }
        // Asignar PropertyType por ID
        if (dto.propertyTypeId != null) {
            PropertyType type = new PropertyType();
            type.setId(dto.propertyTypeId);
            entity.setPropertyType(type);
        }
        
        if (dto.agentId != null) {
            Agent agent = new Agent();
            agent.setId(dto.agentId);
            entity.setAgent(agent);
        }
        
        if (dto.propietarioId != null) {
            Contact propietario = new Contact();
            propietario.setId(dto.propietarioId);
            entity.setPropietario(propietario);
        }

        return entity;
    }

    public static void updateEntityFromDTO(PropertyDTO dto, Property entity) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setTitle(dto.title);
        entity.setSlug(dto.slug);
        entity.setDescription(dto.description);
        entity.setZone(dto.zone);
        entity.setAddress(dto.address);
        // Department se maneja por ID, no por nombre
        if (dto.departmentId != null) {
            Department department = Department.findById(dto.departmentId);
            entity.setDepartment(department);
        }
        entity.setLocationDescription(dto.locationDescription);
        entity.setLatitude(dto.latitude);
        entity.setLongitude(dto.longitude);
        entity.setBedrooms(dto.bedrooms);
        entity.setBathrooms(dto.bathrooms);
        entity.setParkingSpaces(dto.parkingSpaces);
        entity.setArea(dto.area);
        entity.setLotSize(dto.lotSize);
        entity.setRooms(dto.rooms);
        entity.setKitchens(dto.kitchens);
        entity.setFloors(dto.floors);
        entity.setYearBuilt(dto.yearBuilt);
        entity.setAvailableFrom(dto.availableFrom);
        entity.setAdditionalDetails(dto.additionalDetails);
        entity.setVideoUrl(dto.videoUrl);
        entity.setVirtualTourUrl(dto.virtualTourUrl);
        entity.setFeaturedImage(dto.featuredImage);
        entity.setFeatured(dto.featured);
        entity.setPremium(dto.premium);
        entity.setFavorite(dto.favorite);
        entity.setPropertyLabel(dto.propertyLabel);
        entity.setOperacion(dto.operacion);
        entity.setAgencyPropertyNumber(dto.agencyPropertyNumber);
        entity.setPrice(dto.price);
        // Mapeo simple de currency por ID usando findById
        if (dto.currencyId != null) {
            Currency currency = Currency.findById(dto.currencyId);
            if (currency != null) {
                entity.setCurrency(currency);
            }
        }

        // Asignar PropertyType por ID
        if (dto.propertyTypeId != null) {
            PropertyType type = new PropertyType();
            type.setId(dto.propertyTypeId);
            entity.setPropertyType(type);
        }
        
        if (dto.agentId != null) {
            Agent agent = new Agent();
            agent.setId(dto.agentId);
            entity.setAgent(agent);
        }
        
        if (dto.propietarioId != null) {
            Contact propietario = new Contact();
            propietario.setId(dto.propietarioId);
            entity.setPropietario(propietario);
        }
        if (dto.amenities != null) {
            List<Amenity> amenities = dto.amenities.stream()
                .map(id -> (Amenity) Amenity.findById(id))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            entity.setAmenities(amenities);
        }
        if (dto.services != null) {
            List<Service> services = dto.services.stream()
                .map(id -> (Service) Service.findById(id))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            entity.setServices(services);
        }
    }
    
    public static List<PropertyDTO> toDTOList(List<Property> properties) {
        if (properties == null) return null;
        return properties.stream().map(PropertyMapper::toDTO).collect(Collectors.toList());
    }
} 