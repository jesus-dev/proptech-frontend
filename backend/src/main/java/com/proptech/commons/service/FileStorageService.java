package com.proptech.commons.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class FileStorageService {

    @ConfigProperty(name = "file.upload.path", defaultValue = "uploads")
    String uploadPath;

    @ConfigProperty(name = "file.upload.url.base", defaultValue = "/api/files")
    String baseUrl;

    public String storeFile(InputStream inputStream, String originalFileName, String subDirectory) {
        try {
            // Crear directorio si no existe
            Path uploadDir = Paths.get(uploadPath, subDirectory);
            Files.createDirectories(uploadDir);

            // Generar nombre único para el archivo
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Guardar archivo
            Path filePath = uploadDir.resolve(uniqueFileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);

            // Retornar URL relativa para acceder al archivo
            return baseUrl + "/" + subDirectory + "/" + uniqueFileName;

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            // Extraer la ruta del archivo de la URL
            String relativePath = fileUrl.replace(baseUrl + "/", "");
            Path filePath = Paths.get(uploadPath, relativePath);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar el archivo: " + e.getMessage(), e);
        }
    }

    public Path getFilePath(String fileUrl) {
        String relativePath = fileUrl.replace(baseUrl + "/", "");
        return Paths.get(uploadPath, relativePath);
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : "";
    }

    public boolean isValidImageFile(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return extension.matches("\\.(jpg|jpeg|png|gif|webp)$");
    }

    public long getFileSize(String fileUrl) {
        try {
            Path filePath = getFilePath(fileUrl);
            return Files.exists(filePath) ? Files.size(filePath) : 0;
        } catch (IOException e) {
            return 0;
        }
    }
} 