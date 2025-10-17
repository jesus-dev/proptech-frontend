package com.proptech.properties.mapper;

import com.proptech.properties.dto.FloorPlanDTO;
import com.proptech.properties.entity.FloorPlan;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class FloorPlanMapper {

    public FloorPlanDTO toDTO(FloorPlan entity) {
        if (entity == null) {
            return null;
        }

        FloorPlanDTO dto = new FloorPlanDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setBedrooms(entity.getBedrooms());
        dto.setBathrooms(entity.getBathrooms());
        dto.setPrice(entity.getPrice());
        dto.setPriceSuffix(entity.getPriceSuffix());
        dto.setSize(entity.getSize());
        dto.setImage(entity.getImage());
        dto.setDescription(entity.getDescription());
        dto.setPropertyId(entity.getProperty() != null ? entity.getProperty().getId() : null);
        
        return dto;
    }

    public FloorPlan toEntity(FloorPlanDTO dto) {
        if (dto == null) {
            return null;
        }

        FloorPlan entity = new FloorPlan();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setBedrooms(dto.getBedrooms());
        entity.setBathrooms(dto.getBathrooms());
        entity.setPrice(dto.getPrice());
        entity.setPriceSuffix(dto.getPriceSuffix());
        entity.setSize(dto.getSize());
        entity.setImage(dto.getImage());
        entity.setDescription(dto.getDescription());
        
        return entity;
    }
} 