package com.proptech.developments.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.proptech.commons.entity.Currency;
import com.proptech.commons.service.CurrencyService;
import com.proptech.developments.dto.DevelopmentUnitDTO;
import com.proptech.developments.entity.Development;
import com.proptech.developments.entity.DevelopmentUnit;
import com.proptech.developments.enums.UnitStatus;
import com.proptech.developments.enums.UnitType;
import com.proptech.developments.repository.DevelopmentUnitRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DevelopmentUnitService {

    @Inject
    DevelopmentUnitRepository developmentUnitRepository;

    @Inject
    CurrencyService currencyService;

    public List<DevelopmentUnitDTO> getAllUnits() {
        return developmentUnitRepository.listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentUnitDTO> getUnitsByDevelopmentId(Long developmentId) {
        return developmentUnitRepository.findByDevelopmentId(developmentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DevelopmentUnitDTO getUnitById(Long id) {
        DevelopmentUnit unit = developmentUnitRepository.findById(id);
        if (unit == null) {
            throw new RuntimeException("Unidad no encontrada con ID: " + id);
        }
        return toDTO(unit);
    }

    @Transactional
    public DevelopmentUnitDTO createUnit(DevelopmentUnitDTO dto) {
        DevelopmentUnit unit = toEntity(dto);
        unit.setCreatedAt(LocalDateTime.now());
        unit.setActive(true);
        developmentUnitRepository.persist(unit);
        return toDTO(unit);
    }

    @Transactional
    public DevelopmentUnitDTO updateUnit(Long id, DevelopmentUnitDTO dto) {
        DevelopmentUnit unit = developmentUnitRepository.findById(id);
        if (unit == null) {
            throw new RuntimeException("Unidad no encontrada con ID: " + id);
        }

        // Update fields
        unit.setUnitNumber(dto.getUnitNumber());
        unit.setUnitName(dto.getUnitName());
        unit.setType(dto.getType());
        unit.setStatus(dto.getStatus());
        unit.setPrice(dto.getPrice());
        unit.setOriginalPrice(dto.getOriginalPrice());
        unit.setDiscountPrice(dto.getDiscountPrice());
        
        // Set currency if currencyId is provided
        if (dto.getCurrencyId() != null) {
            com.proptech.commons.dto.CurrencyDTO currencyDTO = currencyService.getById(dto.getCurrencyId());
            if (currencyDTO != null) {
                Currency currency = new Currency();
                currency.setId(currencyDTO.getId());
                currency.setCode(currencyDTO.getCode());
                currency.setName(currencyDTO.getName());
                currency.setSymbol(currencyDTO.getSymbol());
                unit.setCurrency(currency);
            }
        }
        
        unit.setArea(dto.getArea());
        unit.setAreaUnit(dto.getAreaUnit());
        unit.setBedrooms(dto.getBedrooms());
        unit.setBathrooms(dto.getBathrooms());
        unit.setParkingSpaces(dto.getParkingSpaces());
        unit.setFloor(dto.getFloor());
        unit.setBlock(dto.getBlock());
        unit.setOrientation(dto.getOrientation());
        unit.setView(dto.getView());
        unit.setFeatured(dto.getFeatured());
        unit.setPremium(dto.getPremium());
        unit.setDescription(dto.getDescription());
        unit.setSpecifications(dto.getSpecifications());
        unit.setAmenities(dto.getAmenities());
        unit.setAvailableFrom(dto.getAvailableFrom());
        unit.setDeliveryDate(dto.getDeliveryDate());
        unit.setConstructionStatus(dto.getConstructionStatus());
        unit.setProgressPercentage(dto.getProgressPercentage() != null ? 
            new BigDecimal(dto.getProgressPercentage()) : null);
        unit.setImages(dto.getImages());
        unit.setFloorPlanUrl(dto.getFloorPlanUrl());
        unit.setVirtualTourUrl(dto.getVirtualTourUrl());
        unit.setVideoUrl(dto.getVideoUrl());
        unit.setNotes(dto.getNotes());
        unit.setInternalNotes(dto.getInternalNotes());
        unit.setActive(dto.getActive());
        unit.setUpdatedAt(LocalDateTime.now());

        return toDTO(unit);
    }

    @Transactional
    public void deleteUnit(Long id) {
        DevelopmentUnit unit = developmentUnitRepository.findById(id);
        if (unit == null) {
            throw new RuntimeException("Unidad no encontrada con ID: " + id);
        }
        developmentUnitRepository.delete(unit);
    }

    public List<DevelopmentUnitDTO> getUnitsByStatus(UnitStatus status) {
        return developmentUnitRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentUnitDTO> getUnitsByType(UnitType type) {
        return developmentUnitRepository.findByType(type).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentUnitDTO> getAvailableUnits() {
        return developmentUnitRepository.findAvailableUnits().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentUnitDTO> getFeaturedUnits() {
        return developmentUnitRepository.findFeaturedUnits().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentUnitDTO> getPremiumUnits() {
        return developmentUnitRepository.findPremiumUnits().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void incrementViews(Long id) {
        DevelopmentUnit unit = developmentUnitRepository.findById(id);
        if (unit != null) {
            unit.setViews(unit.getViews() != null ? unit.getViews() + 1 : 1);
        }
    }

    @Transactional
    public void incrementFavorites(Long id) {
        DevelopmentUnit unit = developmentUnitRepository.findById(id);
        if (unit != null) {
            unit.setFavoritesCount(unit.getFavoritesCount() != null ? unit.getFavoritesCount() + 1 : 1);
        }
    }

    @Transactional
    public void decrementFavorites(Long id) {
        DevelopmentUnit unit = developmentUnitRepository.findById(id);
        if (unit != null && unit.getFavoritesCount() != null && unit.getFavoritesCount() > 0) {
            unit.setFavoritesCount(unit.getFavoritesCount() - 1);
        }
    }

    @Transactional
    public void incrementInquiries(Long id) {
        DevelopmentUnit unit = developmentUnitRepository.findById(id);
        if (unit != null) {
            unit.setInquiriesCount(unit.getInquiriesCount() != null ? unit.getInquiriesCount() + 1 : 1);
        }
    }

    public long getTotalCount() {
        return developmentUnitRepository.count();
    }

    public long getAvailableCount() {
        return developmentUnitRepository.countByStatus(UnitStatus.AVAILABLE);
    }

    public long getCountByDevelopmentId(Long developmentId) {
        return developmentUnitRepository.countByDevelopmentId(developmentId);
    }

    public long getAvailableCountByDevelopmentId(Long developmentId) {
        return developmentUnitRepository.countAvailableByDevelopmentId(developmentId);
    }

    private DevelopmentUnitDTO toDTO(DevelopmentUnit unit) {
        DevelopmentUnitDTO dto = new DevelopmentUnitDTO();
        dto.setId(unit.getId());
        
        // Set developmentId from the relationship
        if (unit.getDevelopment() != null) {
            dto.setDevelopmentId(unit.getDevelopment().getId());
        }
        
        dto.setUnitNumber(unit.getUnitNumber());
        dto.setUnitName(unit.getUnitName());
        dto.setType(unit.getType());
        dto.setStatus(unit.getStatus());
        dto.setPrice(unit.getPrice());
        dto.setOriginalPrice(unit.getOriginalPrice());
        dto.setDiscountPrice(unit.getDiscountPrice());
        
        // Set currency info from the relationship
        if (unit.getCurrency() != null) {
            dto.setCurrencyId(unit.getCurrency().getId());
            // Note: We'll need to create a public method in CurrencyService to get DTO
            // For now, we'll set the currency DTO manually
            dto.setCurrency(new com.proptech.commons.dto.CurrencyDTO());
            dto.getCurrency().setId(unit.getCurrency().getId());
            dto.getCurrency().setCode(unit.getCurrency().getCode());
            dto.getCurrency().setName(unit.getCurrency().getName());
            dto.getCurrency().setSymbol(unit.getCurrency().getSymbol());
        }
        
        dto.setArea(unit.getArea());
        dto.setAreaUnit(unit.getAreaUnit());
        dto.setBedrooms(unit.getBedrooms());
        dto.setBathrooms(unit.getBathrooms());
        dto.setParkingSpaces(unit.getParkingSpaces());
        dto.setFloor(unit.getFloor());
        dto.setBlock(unit.getBlock());
        dto.setOrientation(unit.getOrientation());
        dto.setView(unit.getView());
        dto.setFeatured(unit.getFeatured());
        dto.setPremium(unit.getPremium());
        dto.setDescription(unit.getDescription());
        dto.setSpecifications(unit.getSpecifications());
        dto.setAmenities(unit.getAmenities());
        dto.setAvailableFrom(unit.getAvailableFrom());
        dto.setDeliveryDate(unit.getDeliveryDate());
        dto.setConstructionStatus(unit.getConstructionStatus());
        dto.setProgressPercentage(unit.getProgressPercentage() != null ? 
            unit.getProgressPercentage().intValue() : null);
        dto.setImages(unit.getImages());
        dto.setFloorPlanUrl(unit.getFloorPlanUrl());
        dto.setVirtualTourUrl(unit.getVirtualTourUrl());
        dto.setVideoUrl(unit.getVideoUrl());
        dto.setViews(unit.getViews());
        dto.setFavoritesCount(unit.getFavoritesCount());
        dto.setInquiriesCount(unit.getInquiriesCount());
        dto.setNotes(unit.getNotes());
        dto.setInternalNotes(unit.getInternalNotes());
        dto.setActive(unit.getActive());
        dto.setCreatedAt(unit.getCreatedAt());
        dto.setCreatedBy(unit.getCreatedBy());
        dto.setUpdatedAt(unit.getUpdatedAt());
        dto.setUpdatedBy(unit.getUpdatedBy());
        return dto;
    }

    private DevelopmentUnit toEntity(DevelopmentUnitDTO dto) {
        DevelopmentUnit unit = new DevelopmentUnit();
        unit.setId(dto.getId());
        
        // Set development relationship if developmentId is provided
        if (dto.getDevelopmentId() != null) {
            Development development = new Development();
            development.setId(dto.getDevelopmentId());
            unit.setDevelopment(development);
        }
        
        unit.setUnitNumber(dto.getUnitNumber());
        unit.setUnitName(dto.getUnitName());
        unit.setType(dto.getType());
        unit.setStatus(dto.getStatus());
        unit.setPrice(dto.getPrice());
        unit.setOriginalPrice(dto.getOriginalPrice());
        unit.setDiscountPrice(dto.getDiscountPrice());
        
        // Set currency relationship if currencyId is provided
        if (dto.getCurrencyId() != null) {
            Currency currency = new Currency();
            currency.setId(dto.getCurrencyId());
            unit.setCurrency(currency);
        }
        
        unit.setArea(dto.getArea());
        unit.setAreaUnit(dto.getAreaUnit());
        unit.setBedrooms(dto.getBedrooms());
        unit.setBathrooms(dto.getBathrooms());
        unit.setParkingSpaces(dto.getParkingSpaces());
        unit.setFloor(dto.getFloor());
        unit.setBlock(dto.getBlock());
        unit.setOrientation(dto.getOrientation());
        unit.setView(dto.getView());
        unit.setFeatured(dto.getFeatured());
        unit.setPremium(dto.getPremium());
        unit.setDescription(dto.getDescription());
        unit.setSpecifications(dto.getSpecifications());
        unit.setAmenities(dto.getAmenities());
        unit.setAvailableFrom(dto.getAvailableFrom());
        unit.setDeliveryDate(dto.getDeliveryDate());
        unit.setConstructionStatus(dto.getConstructionStatus());
        unit.setProgressPercentage(dto.getProgressPercentage() != null ? 
            new BigDecimal(dto.getProgressPercentage()) : null);
        unit.setImages(dto.getImages());
        unit.setFloorPlanUrl(dto.getFloorPlanUrl());
        unit.setVirtualTourUrl(dto.getVirtualTourUrl());
        unit.setVideoUrl(dto.getVideoUrl());
        unit.setViews(dto.getViews());
        unit.setFavoritesCount(dto.getFavoritesCount());
        unit.setInquiriesCount(dto.getInquiriesCount());
        unit.setNotes(dto.getNotes());
        unit.setInternalNotes(dto.getInternalNotes());
        unit.setActive(dto.getActive());
        unit.setCreatedAt(dto.getCreatedAt());
        unit.setCreatedBy(dto.getCreatedBy());
        unit.setUpdatedAt(dto.getUpdatedAt());
        unit.setUpdatedBy(dto.getUpdatedBy());
        return unit;
    }
} 