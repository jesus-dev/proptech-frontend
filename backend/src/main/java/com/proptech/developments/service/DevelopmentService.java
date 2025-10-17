package com.proptech.developments.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.commons.entity.Currency;
import com.proptech.developments.dto.DevelopmentDTO;
import com.proptech.developments.entity.Development;
import com.proptech.developments.enums.DevelopmentStatus;
import com.proptech.developments.enums.DevelopmentType;
import com.proptech.developments.repository.DevelopmentRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class DevelopmentService {

    @Inject
    DevelopmentRepository developmentRepository;

    // Convertir entidad a DTO
    private DevelopmentDTO toDTO(Development development) {
        DevelopmentDTO dto = new DevelopmentDTO();
        dto.setId(development.getId());
        dto.setTitle(development.getTitle());
        dto.setDescription(development.getDescription());
        dto.setType(development.getType());
        dto.setStatus(development.getStatus());
        dto.setAddress(development.getAddress());
        dto.setCity(development.getCity());
        dto.setState(development.getState());
        dto.setZipCode(development.getZipCode());
        dto.setCountry(development.getCountry());
        dto.setLatitude(development.getLatitude());
        dto.setLongitude(development.getLongitude());
        dto.setPrice(development.getPrice());
        dto.setOriginalPrice(development.getOriginalPrice());
        dto.setDiscountPrice(development.getDiscountPrice());
        dto.setCurrency(toCurrencyDTO(development.getCurrency()));
        dto.setTotalUnits(development.getTotalUnits());
        dto.setAvailableUnits(development.getAvailableUnits());
        dto.setSoldUnits(development.getSoldUnits());
        dto.setReservedUnits(development.getReservedUnits());
        dto.setBedrooms(development.getBedrooms());
        dto.setBathrooms(development.getBathrooms());
        dto.setArea(development.getArea());
        dto.setAreaUnit(development.getAreaUnit());
        dto.setImages(development.getImages());
        dto.setAmenities(development.getAmenities());
        dto.setDeveloper(development.getDeveloper());
        dto.setConstructionCompany(development.getConstructionCompany());
        dto.setConstructionStartDate(development.getConstructionStartDate());
        dto.setConstructionEndDate(development.getConstructionEndDate());
        dto.setDeliveryDate(development.getDeliveryDate());
        dto.setConstructionStatus(development.getConstructionStatus());
        dto.setProgressPercentage(development.getProgressPercentage());
        dto.setFeatured(development.getFeatured());
        dto.setPremium(development.getPremium());
        dto.setViews(development.getViews());
        dto.setFavoritesCount(development.getFavoritesCount());
        dto.setSharesCount(development.getSharesCount());
        dto.setInquiriesCount(development.getInquiriesCount());
        dto.setRating(development.getRating());
        dto.setTotalReviews(development.getTotalReviews());
        dto.setFinancingOptions(development.getFinancingOptions());
        dto.setPaymentPlans(development.getPaymentPlans());
        dto.setLegalStatus(development.getLegalStatus());
        dto.setPermits(development.getPermits());
        dto.setUtilities(development.getUtilities());
        dto.setInfrastructure(development.getInfrastructure());
        dto.setEnvironmentalImpact(development.getEnvironmentalImpact());
        dto.setSustainabilityFeatures(development.getSustainabilityFeatures());
        dto.setSecurityFeatures(development.getSecurityFeatures());
        dto.setParkingSpaces(development.getParkingSpaces());
        dto.setStorageSpaces(development.getStorageSpaces());
        dto.setPetPolicy(development.getPetPolicy());
        dto.setRentalPolicy(development.getRentalPolicy());
        dto.setMaintenanceFee(development.getMaintenanceFee());
        dto.setPropertyTax(development.getPropertyTax());
        dto.setInsurance(development.getInsurance());
        dto.setHoaFees(development.getHoaFees());
        dto.setHoaRules(development.getHoaRules());
        dto.setHoaContact(development.getHoaContact());
        dto.setPropertyManager(development.getPropertyManager());
        dto.setManagerContact(development.getManagerContact());
        dto.setEmergencyContact(development.getEmergencyContact());
        dto.setVirtualTourUrl(development.getVirtualTourUrl());
        dto.setVideoUrl(development.getVideoUrl());
        dto.setBrochureUrl(development.getBrochureUrl());
        dto.setFloorPlanUrl(development.getFloorPlanUrl());
        dto.setSitePlanUrl(development.getSitePlanUrl());
        dto.setMasterPlanUrl(development.getMasterPlanUrl());
        dto.setSpecificationsUrl(development.getSpecificationsUrl());
        dto.setWarrantyInfo(development.getWarrantyInfo());
        dto.setWarrantyPeriod(development.getWarrantyPeriod());
        dto.setWarrantyCoverage(development.getWarrantyCoverage());
        dto.setWarrantyContact(development.getWarrantyContact());
        dto.setNotes(development.getNotes());
        dto.setInternalNotes(development.getInternalNotes());
        dto.setTags(development.getTags());
        dto.setSeoTitle(development.getSeoTitle());
        dto.setSeoDescription(development.getSeoDescription());
        dto.setSeoKeywords(development.getSeoKeywords());
        dto.setMetaTags(development.getMetaTags());
        dto.setActive(development.getActive());
        dto.setPublished(development.getPublished());
        dto.setPublishedAt(development.getPublishedAt());
        dto.setPublishedBy(development.getPublishedBy());
        dto.setCreatedAt(development.getCreatedAt());
        dto.setCreatedBy(development.getCreatedBy());
        dto.setUpdatedAt(development.getUpdatedAt());
        dto.setUpdatedBy(development.getUpdatedBy());
        return dto;
    }

    // Métodos auxiliares para conversión de Currency
    private CurrencyDTO toCurrencyDTO(Currency currency) {
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

    private Currency toCurrencyEntity(CurrencyDTO dto) {
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

    // Convertir DTO a entidad
    private Development toEntity(DevelopmentDTO dto) {
        Development development = new Development();
        // Don't set ID for new entities - Panache manages it automatically
        development.setTitle(dto.getTitle());
        development.setDescription(dto.getDescription());
        development.setType(dto.getType());
        development.setStatus(dto.getStatus());
        development.setAddress(dto.getAddress());
        development.setCity(dto.getCity());
        development.setState(dto.getState());
        development.setZipCode(dto.getZipCode());
        development.setCountry(dto.getCountry());
        development.setLatitude(dto.getLatitude());
        development.setLongitude(dto.getLongitude());
        development.setPrice(dto.getPrice());
        development.setOriginalPrice(dto.getOriginalPrice());
        development.setDiscountPrice(dto.getDiscountPrice());
        development.setCurrency(toCurrencyEntity(dto.getCurrency()));
        development.setTotalUnits(dto.getTotalUnits());
        development.setAvailableUnits(dto.getAvailableUnits());
        development.setSoldUnits(dto.getSoldUnits());
        development.setReservedUnits(dto.getReservedUnits());
        development.setBedrooms(dto.getBedrooms());
        development.setBathrooms(dto.getBathrooms());
        development.setArea(dto.getArea());
        development.setAreaUnit(dto.getAreaUnit());
        development.setImages(dto.getImages());
        development.setAmenities(dto.getAmenities());
        development.setDeveloper(dto.getDeveloper());
        development.setConstructionCompany(dto.getConstructionCompany());
        development.setConstructionStartDate(dto.getConstructionStartDate());
        development.setConstructionEndDate(dto.getConstructionEndDate());
        development.setDeliveryDate(dto.getDeliveryDate());
        development.setConstructionStatus(dto.getConstructionStatus());
        development.setProgressPercentage(dto.getProgressPercentage());
        development.setFeatured(dto.getFeatured());
        development.setPremium(dto.getPremium());
        development.setViews(dto.getViews());
        development.setFavoritesCount(dto.getFavoritesCount());
        development.setSharesCount(dto.getSharesCount());
        development.setInquiriesCount(dto.getInquiriesCount());
        development.setRating(dto.getRating());
        development.setTotalReviews(dto.getTotalReviews());
        development.setFinancingOptions(dto.getFinancingOptions());
        development.setPaymentPlans(dto.getPaymentPlans());
        development.setLegalStatus(dto.getLegalStatus());
        development.setPermits(dto.getPermits());
        development.setUtilities(dto.getUtilities());
        development.setInfrastructure(dto.getInfrastructure());
        development.setEnvironmentalImpact(dto.getEnvironmentalImpact());
        development.setSustainabilityFeatures(dto.getSustainabilityFeatures());
        development.setSecurityFeatures(dto.getSecurityFeatures());
        development.setParkingSpaces(dto.getParkingSpaces());
        development.setStorageSpaces(dto.getStorageSpaces());
        development.setPetPolicy(dto.getPetPolicy());
        development.setRentalPolicy(dto.getRentalPolicy());
        development.setMaintenanceFee(dto.getMaintenanceFee());
        development.setPropertyTax(dto.getPropertyTax());
        development.setInsurance(dto.getInsurance());
        development.setHoaFees(dto.getHoaFees());
        development.setHoaRules(dto.getHoaRules());
        development.setHoaContact(dto.getHoaContact());
        development.setPropertyManager(dto.getPropertyManager());
        development.setManagerContact(dto.getManagerContact());
        development.setEmergencyContact(dto.getEmergencyContact());
        development.setVirtualTourUrl(dto.getVirtualTourUrl());
        development.setVideoUrl(dto.getVideoUrl());
        development.setBrochureUrl(dto.getBrochureUrl());
        development.setFloorPlanUrl(dto.getFloorPlanUrl());
        development.setSitePlanUrl(dto.getSitePlanUrl());
        development.setMasterPlanUrl(dto.getMasterPlanUrl());
        development.setSpecificationsUrl(dto.getSpecificationsUrl());
        development.setWarrantyInfo(dto.getWarrantyInfo());
        development.setWarrantyPeriod(dto.getWarrantyPeriod());
        development.setWarrantyCoverage(dto.getWarrantyCoverage());
        development.setWarrantyContact(dto.getWarrantyContact());
        development.setNotes(dto.getNotes());
        development.setInternalNotes(dto.getInternalNotes());
        development.setTags(dto.getTags());
        development.setSeoTitle(dto.getSeoTitle());
        development.setSeoDescription(dto.getSeoDescription());
        development.setSeoKeywords(dto.getSeoKeywords());
        development.setMetaTags(dto.getMetaTags());
        development.setActive(dto.getActive());
        development.setPublished(dto.getPublished());
        development.setPublishedAt(dto.getPublishedAt());
        development.setPublishedBy(dto.getPublishedBy());
        development.setCreatedAt(dto.getCreatedAt());
        development.setCreatedBy(dto.getCreatedBy());
        development.setUpdatedAt(dto.getUpdatedAt());
        development.setUpdatedBy(dto.getUpdatedBy());
        return development;
    }

    // Obtener todos los desarrollos
    public List<DevelopmentDTO> getAllDevelopments() {
        return developmentRepository.findAll().list()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener desarrollo por ID
    public DevelopmentDTO getDevelopmentById(Long id) {
        Development development = developmentRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Desarrollo no encontrado con ID: " + id));
        return toDTO(development);
    }

    // Crear nuevo desarrollo
    @Transactional
    public DevelopmentDTO createDevelopment(DevelopmentDTO dto) {
        // Validar que el título no exista
        if (developmentRepository.existsByTitle(dto.getTitle())) {
            throw new IllegalArgumentException("Ya existe un desarrollo con el título: " + dto.getTitle());
        }

        Development development = toEntity(dto);
        development.setCreatedAt(LocalDateTime.now());
        development.setUpdatedAt(LocalDateTime.now());
        development.setActive(true);
        development.setPublished(false);
        development.setViews(0);
        development.setFavoritesCount(0);
        development.setSharesCount(0);
        development.setInquiriesCount(0);
        development.setTotalReviews(0);

        developmentRepository.persist(development);
        return toDTO(development);
    }

    // Actualizar desarrollo
    @Transactional
    public DevelopmentDTO updateDevelopment(Long id, DevelopmentDTO dto) {
        Development development = developmentRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Desarrollo no encontrado con ID: " + id));

        // Validar que el título no exista en otro desarrollo
        if (!development.getTitle().equals(dto.getTitle()) && developmentRepository.existsByTitle(dto.getTitle())) {
            throw new IllegalArgumentException("Ya existe un desarrollo con el título: " + dto.getTitle());
        }

        // Actualizar campos
        development.setTitle(dto.getTitle());
        development.setDescription(dto.getDescription());
        development.setType(dto.getType());
        development.setStatus(dto.getStatus());
        development.setAddress(dto.getAddress());
        development.setCity(dto.getCity());
        development.setState(dto.getState());
        development.setZipCode(dto.getZipCode());
        development.setCountry(dto.getCountry());
        development.setLatitude(dto.getLatitude());
        development.setLongitude(dto.getLongitude());
        development.setPrice(dto.getPrice());
        development.setOriginalPrice(dto.getOriginalPrice());
        development.setDiscountPrice(dto.getDiscountPrice());
        development.setCurrency(toCurrencyEntity(dto.getCurrency()));
        development.setTotalUnits(dto.getTotalUnits());
        development.setAvailableUnits(dto.getAvailableUnits());
        development.setSoldUnits(dto.getSoldUnits());
        development.setReservedUnits(dto.getReservedUnits());
        development.setBedrooms(dto.getBedrooms());
        development.setBathrooms(dto.getBathrooms());
        development.setArea(dto.getArea());
        development.setAreaUnit(dto.getAreaUnit());
        development.setImages(dto.getImages());
        development.setAmenities(dto.getAmenities());
        development.setDeveloper(dto.getDeveloper());
        development.setConstructionCompany(dto.getConstructionCompany());
        development.setConstructionStartDate(dto.getConstructionStartDate());
        development.setConstructionEndDate(dto.getConstructionEndDate());
        development.setDeliveryDate(dto.getDeliveryDate());
        development.setConstructionStatus(dto.getConstructionStatus());
        development.setProgressPercentage(dto.getProgressPercentage());
        development.setFeatured(dto.getFeatured());
        development.setPremium(dto.getPremium());
        development.setFinancingOptions(dto.getFinancingOptions());
        development.setPaymentPlans(dto.getPaymentPlans());
        development.setLegalStatus(dto.getLegalStatus());
        development.setPermits(dto.getPermits());
        development.setUtilities(dto.getUtilities());
        development.setInfrastructure(dto.getInfrastructure());
        development.setEnvironmentalImpact(dto.getEnvironmentalImpact());
        development.setSustainabilityFeatures(dto.getSustainabilityFeatures());
        development.setSecurityFeatures(dto.getSecurityFeatures());
        development.setParkingSpaces(dto.getParkingSpaces());
        development.setStorageSpaces(dto.getStorageSpaces());
        development.setPetPolicy(dto.getPetPolicy());
        development.setRentalPolicy(dto.getRentalPolicy());
        development.setMaintenanceFee(dto.getMaintenanceFee());
        development.setPropertyTax(dto.getPropertyTax());
        development.setInsurance(dto.getInsurance());
        development.setHoaFees(dto.getHoaFees());
        development.setHoaRules(dto.getHoaRules());
        development.setHoaContact(dto.getHoaContact());
        development.setPropertyManager(dto.getPropertyManager());
        development.setManagerContact(dto.getManagerContact());
        development.setEmergencyContact(dto.getEmergencyContact());
        development.setVirtualTourUrl(dto.getVirtualTourUrl());
        development.setVideoUrl(dto.getVideoUrl());
        development.setBrochureUrl(dto.getBrochureUrl());
        development.setFloorPlanUrl(dto.getFloorPlanUrl());
        development.setSitePlanUrl(dto.getSitePlanUrl());
        development.setMasterPlanUrl(dto.getMasterPlanUrl());
        development.setSpecificationsUrl(dto.getSpecificationsUrl());
        development.setWarrantyInfo(dto.getWarrantyInfo());
        development.setWarrantyPeriod(dto.getWarrantyPeriod());
        development.setWarrantyCoverage(dto.getWarrantyCoverage());
        development.setWarrantyContact(dto.getWarrantyContact());
        development.setNotes(dto.getNotes());
        development.setInternalNotes(dto.getInternalNotes());
        development.setTags(dto.getTags());
        development.setSeoTitle(dto.getSeoTitle());
        development.setSeoDescription(dto.getSeoDescription());
        development.setSeoKeywords(dto.getSeoKeywords());
        development.setMetaTags(dto.getMetaTags());
        development.setActive(dto.getActive());
        development.setPublished(dto.getPublished());
        development.setPublishedBy(dto.getPublishedBy());
        development.setUpdatedAt(LocalDateTime.now());
        development.setUpdatedBy(dto.getUpdatedBy());

        developmentRepository.persist(development);
        return toDTO(development);
    }

    // Eliminar desarrollo
    @Transactional
    public void deleteDevelopment(Long id) {
        Development development = developmentRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Desarrollo no encontrado con ID: " + id));
        developmentRepository.delete(development);
    }

    // Buscar por tipo
    public List<DevelopmentDTO> getDevelopmentsByType(DevelopmentType type) {
        return developmentRepository.findByType(type)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar por estado
    public List<DevelopmentDTO> getDevelopmentsByStatus(DevelopmentStatus status) {
        return developmentRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ciudad
    public List<DevelopmentDTO> getDevelopmentsByCity(String city) {
        return developmentRepository.findByCity(city)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar por rango de precio
    public List<DevelopmentDTO> getDevelopmentsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return developmentRepository.findByPriceRange(minPrice, maxPrice)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar desarrollos destacados
    public List<DevelopmentDTO> getFeaturedDevelopments() {
        return developmentRepository.findFeatured()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar desarrollos premium
    public List<DevelopmentDTO> getPremiumDevelopments() {
        return developmentRepository.findPremium()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar desarrollos disponibles
    public List<DevelopmentDTO> getAvailableDevelopments() {
        return developmentRepository.findAvailable()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar desarrollos vendidos
    public List<DevelopmentDTO> getSoldDevelopments() {
        return developmentRepository.findSold()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar desarrollos reservados
    public List<DevelopmentDTO> getReservedDevelopments() {
        return developmentRepository.findReserved()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar por desarrollador
    public List<DevelopmentDTO> getDevelopmentsByDeveloper(String developer) {
        return developmentRepository.findByDeveloper(developer)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar por texto
    public List<DevelopmentDTO> searchDevelopments(String searchTerm) {
        return developmentRepository.searchByText(searchTerm)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar por criterios múltiples
    public List<DevelopmentDTO> getDevelopmentsByCriteria(DevelopmentType type, DevelopmentStatus status, 
                                                         String city, BigDecimal minPrice, BigDecimal maxPrice, 
                                                         Boolean featured, Boolean premium) {
        return developmentRepository.findByCriteria(type, status, city, minPrice, maxPrice, featured, premium)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener desarrollos más vistos
    public List<DevelopmentDTO> getMostViewedDevelopments(int limit) {
        return developmentRepository.findMostViewed(limit)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener desarrollos más favoritos
    public List<DevelopmentDTO> getMostFavoritedDevelopments(int limit) {
        return developmentRepository.findMostFavorited(limit)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener desarrollos recientes
    public List<DevelopmentDTO> getRecentDevelopments(int limit) {
        return developmentRepository.findRecent(limit)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Incrementar vistas
    @Transactional
    public void incrementViews(Long id) {
        developmentRepository.incrementViews(id);
    }

    // Incrementar favoritos
    @Transactional
    public void incrementFavorites(Long id) {
        developmentRepository.incrementFavorites(id);
    }

    // Decrementar favoritos
    @Transactional
    public void decrementFavorites(Long id) {
        developmentRepository.decrementFavorites(id);
    }

    // Incrementar compartidos
    @Transactional
    public void incrementShares(Long id) {
        developmentRepository.incrementShares(id);
    }

    // Incrementar consultas
    @Transactional
    public void incrementInquiries(Long id) {
        developmentRepository.incrementInquiries(id);
    }

    // Marcar como destacado
    @Transactional
    public void setFeatured(Long id, boolean featured) {
        developmentRepository.setFeatured(id, featured);
    }

    // Marcar como premium
    @Transactional
    public void setPremium(Long id, boolean premium) {
        developmentRepository.setPremium(id, premium);
    }

    // Publicar/despublicar
    @Transactional
    public void setPublished(Long id, boolean published) {
        developmentRepository.setPublished(id, published);
    }

    // Activar/desactivar
    @Transactional
    public void setActive(Long id, boolean active) {
        developmentRepository.setActive(id, active);
    }

    // Obtener estadísticas
    public long getTotalCount() {
        return developmentRepository.getTotalCount();
    }

    public long getActiveCount() {
        return developmentRepository.getActiveCount();
    }

    public long getPublishedCount() {
        return developmentRepository.getPublishedCount();
    }

    public long getAvailableCount() {
        return developmentRepository.getAvailableCount();
    }

    public long getSoldCount() {
        return developmentRepository.getSoldCount();
    }

    public long getReservedCount() {
        return developmentRepository.getReservedCount();
    }
} 