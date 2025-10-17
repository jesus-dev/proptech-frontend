package com.proptech.properties.service;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.proptech.commons.service.FileStorageService;
import com.proptech.properties.dto.GalleryImageDTO;
import com.proptech.properties.entity.GalleryImage;
import com.proptech.properties.entity.Property;
import com.proptech.properties.mapper.GalleryImageMapper;
import com.proptech.properties.repository.GalleryImageRepository;
import com.proptech.properties.repository.PropertyRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class GalleryImageService {

    @Inject
    GalleryImageRepository galleryImageRepository;

    @Inject
    PropertyRepository propertyRepository;

    @Inject
    FileStorageService fileStorageService;

    public List<GalleryImageDTO> findByPropertyId(Long propertyId) {
        return galleryImageRepository.find("property.id", propertyId).list().stream()
                .map(GalleryImageMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public GalleryImageDTO saveImage(Long propertyId, InputStream file, String fileName) {
        Property property = propertyRepository.findById(propertyId);
        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        // Guardar archivo localmente
        String fileUrl = fileStorageService.storeFile(file, fileName, "gallery/" + propertyId);

        GalleryImage image = new GalleryImage();
        image.setAltText(fileName);
        image.setUrl(fileUrl);
        image.setOrderIndex(0);
        image.setProperty(property);

        galleryImageRepository.persist(image);
        return GalleryImageMapper.toDTO(image);
    }

    @Transactional
    public void deleteImage(Long imageId) {
        GalleryImage image = galleryImageRepository.findById(imageId);
        if (image == null) {
            throw new RuntimeException("Gallery image not found");
        }

        // Eliminar archivo del sistema de archivos
        fileStorageService.deleteFile(image.getUrl());

        // Eliminar registro de la base de datos
        galleryImageRepository.delete(image);
    }

    public Optional<GalleryImageDTO> findById(Long imageId) {
        GalleryImage image = galleryImageRepository.findById(imageId);
        return image != null ? Optional.of(GalleryImageMapper.toDTO(image)) : Optional.empty();
    }

    @Transactional
    public GalleryImageDTO updateOrder(Long imageId, Integer orderIndex) {
        GalleryImage image = galleryImageRepository.findById(imageId);
        if (image == null) {
            throw new RuntimeException("Gallery image not found");
        }

        image.setOrderIndex(orderIndex);
        return GalleryImageMapper.toDTO(image);
    }
} 