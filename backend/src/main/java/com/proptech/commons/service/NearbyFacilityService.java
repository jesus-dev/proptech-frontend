package com.proptech.commons.service;

import com.proptech.commons.entity.NearbyFacility;
import com.proptech.commons.repository.NearbyFacilityRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class NearbyFacilityService {
    
    @Inject
    NearbyFacilityRepository nearbyFacilityRepository;
    
    public List<NearbyFacility> getAll() {
        return nearbyFacilityRepository.listAll();
    }
    
    public List<NearbyFacility> getActive() {
        return nearbyFacilityRepository.findActive();
    }
    
    public Optional<NearbyFacility> getById(Long id) {
        return nearbyFacilityRepository.findByIdOptional(id);
    }
    
    public List<NearbyFacility> getByType(NearbyFacility.FacilityType type) {
        return nearbyFacilityRepository.findByType(type);
    }
    
    public List<NearbyFacility> searchByName(String name) {
        return nearbyFacilityRepository.findByNameContaining(name);
    }
    
    public List<NearbyFacility> getNearbyFacilities(BigDecimal latitude, BigDecimal longitude, BigDecimal radiusKm) {
        return nearbyFacilityRepository.findNearbyFacilities(latitude, longitude, radiusKm);
    }
    
    @Transactional
    public NearbyFacility create(NearbyFacility nearbyFacility) {
        nearbyFacilityRepository.persist(nearbyFacility);
        return nearbyFacility;
    }
    
    @Transactional
    public NearbyFacility update(Long id, NearbyFacility updatedFacility) {
        NearbyFacility existingFacility = nearbyFacilityRepository.findById(id);
        if (existingFacility == null) {
            throw new RuntimeException("Facilidad cercana no encontrada con ID: " + id);
        }
        
        // Actualizar campos
        existingFacility.setName(updatedFacility.getName());
        existingFacility.setDescription(updatedFacility.getDescription());
        existingFacility.setType(updatedFacility.getType());
        existingFacility.setAddress(updatedFacility.getAddress());
        existingFacility.setLatitude(updatedFacility.getLatitude());
        existingFacility.setLongitude(updatedFacility.getLongitude());
        existingFacility.setPhone(updatedFacility.getPhone());
        existingFacility.setWebsite(updatedFacility.getWebsite());
        existingFacility.setEmail(updatedFacility.getEmail());
        existingFacility.setOpeningHours(updatedFacility.getOpeningHours());
        existingFacility.setDistanceKm(updatedFacility.getDistanceKm());
        existingFacility.setWalkingTimeMinutes(updatedFacility.getWalkingTimeMinutes());
        existingFacility.setDrivingTimeMinutes(updatedFacility.getDrivingTimeMinutes());
        existingFacility.setActive(updatedFacility.getActive());
        
        nearbyFacilityRepository.persist(existingFacility);
        return existingFacility;
    }
    
    @Transactional
    public boolean delete(Long id) {
        return nearbyFacilityRepository.deleteById(id);
    }
    
    @Transactional
    public boolean toggleActive(Long id) {
        NearbyFacility facility = nearbyFacilityRepository.findById(id);
        if (facility != null) {
            facility.setActive(!facility.getActive());
            nearbyFacilityRepository.persist(facility);
            return true;
        }
        return false;
    }
    
    public List<NearbyFacility.FacilityType> getAllTypes() {
        return List.of(NearbyFacility.FacilityType.values());
    }
}
