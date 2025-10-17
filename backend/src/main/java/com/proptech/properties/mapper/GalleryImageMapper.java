package com.proptech.properties.mapper;

import com.proptech.properties.dto.GalleryImageDTO;
import com.proptech.properties.entity.GalleryImage;

public class GalleryImageMapper {
    public static GalleryImageDTO toDTO(GalleryImage entity) {
        if (entity == null) return null;
        GalleryImageDTO dto = new GalleryImageDTO();
        dto.id = entity.getId();
        dto.propertyId = entity.getProperty() != null ? entity.getProperty().getId() : null;
        dto.url = entity.getUrl();
        dto.altText = entity.getAltText();
        dto.orderIndex = entity.getOrderIndex();
        return dto;
    }
    public static GalleryImage toEntity(GalleryImageDTO dto) {
        if (dto == null) return null;
        GalleryImage entity = new GalleryImage();
        entity.setId(dto.id);
        entity.setUrl(dto.url);
        entity.setAltText(dto.altText);
        entity.setOrderIndex(dto.orderIndex);
        return entity;
    }
} 