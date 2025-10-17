package com.proptech.properties.service;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.proptech.commons.service.FileStorageService;
import com.proptech.properties.dto.PrivateFileDTO;
import com.proptech.properties.entity.PrivateFile;
import com.proptech.properties.entity.Property;
import com.proptech.properties.mapper.PrivateFileMapper;
import com.proptech.properties.repository.PrivateFileRepository;
import com.proptech.properties.repository.PropertyRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PrivateFileService {

    @Inject
    PrivateFileRepository privateFileRepository;

    @Inject
    PropertyRepository propertyRepository;

    @Inject
    FileStorageService fileStorageService;

    public List<PrivateFileDTO> findByPropertyId(Long propertyId) {
        return privateFileRepository.find("property.id", propertyId).list().stream()
                .map(PrivateFileMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PrivateFileDTO saveFile(Long propertyId, InputStream file, String fileName) {
        Property property = propertyRepository.findById(propertyId);
        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        // Guardar archivo localmente
        String fileUrl = fileStorageService.storeFile(file, fileName, "private/" + propertyId);

        PrivateFile privateFile = new PrivateFile();
        privateFile.setFileName(fileName);
        privateFile.setUrl(fileUrl);
        privateFile.setFileType(getFileType(fileName));
        privateFile.setFileSize(fileStorageService.getFileSize(fileUrl));
        privateFile.setProperty(property);

        privateFileRepository.persist(privateFile);
        return PrivateFileMapper.toDTO(privateFile);
    }

    @Transactional
    public void deleteFile(Long fileId) {
        PrivateFile file = privateFileRepository.findById(fileId);
        if (file == null) {
            throw new RuntimeException("Private file not found");
        }

        // Eliminar archivo del sistema de archivos
        fileStorageService.deleteFile(file.getUrl());

        // Eliminar registro de la base de datos
        privateFileRepository.delete(file);
    }

    public Optional<PrivateFileDTO> findById(Long fileId) {
        PrivateFile file = privateFileRepository.findById(fileId);
        return file != null ? Optional.of(PrivateFileMapper.toDTO(file)) : Optional.empty();
    }

    private String getFileType(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return fileName.substring(lastDotIndex + 1).toLowerCase();
        }
        return "unknown";
    }
} 