package com.proptech.properties.service;

import java.util.List;
import java.util.stream.Collectors;

import com.proptech.properties.dto.FloorPlanDTO;
import com.proptech.properties.entity.FloorPlan;
import com.proptech.properties.entity.Property;
import com.proptech.properties.mapper.FloorPlanMapper;
import com.proptech.properties.repository.FloorPlanRepository;
import com.proptech.properties.repository.PropertyRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FloorPlanService {

    @Inject
    FloorPlanRepository floorPlanRepository;

    @Inject
    PropertyRepository propertyRepository;

    @Inject
    FloorPlanMapper floorPlanMapper;

    public List<FloorPlanDTO> getFloorPlansByPropertyId(Long propertyId) {
        List<FloorPlan> floorPlans = floorPlanRepository.findByPropertyId(propertyId);
        return floorPlans.stream()
                .map(floorPlanMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveFloorPlans(Long propertyId, List<FloorPlanDTO> floorPlanDTOs) {
        // Delete existing floor plans for this property
        floorPlanRepository.deleteByPropertyId(propertyId);

        // Get the property
        Property property = propertyRepository.findById(propertyId);
        if (property == null) {
            throw new RuntimeException("Property not found with id: " + propertyId);
        }

        // Save new floor plans
        for (FloorPlanDTO dto : floorPlanDTOs) {
            FloorPlan floorPlan = floorPlanMapper.toEntity(dto);
            floorPlan.setProperty(property);
            floorPlanRepository.persist(floorPlan);
        }
    }

    @Transactional
    public void deleteFloorPlansByPropertyId(Long propertyId) {
        floorPlanRepository.deleteByPropertyId(propertyId);
    }
} 