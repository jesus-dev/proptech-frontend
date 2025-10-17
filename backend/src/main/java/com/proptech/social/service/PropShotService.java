package com.proptech.social.service;

import com.proptech.social.entity.PropShot;
import com.proptech.social.repository.PropShotRepository;
import com.proptech.social.dto.PropShotCreateRequestDTO;
import com.proptech.social.dto.PropShotResponseDTO;
import com.proptech.social.mapper.PropShotMapper;
import com.proptech.commons.entity.Agent;
import com.proptech.commons.repository.AgentRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PropShotService {

    @Inject
    PropShotRepository propShotRepository;
    
    @Inject
    AgentRepository agentRepository;
    
    @Inject
    PropShotMapper propShotMapper;

    // Obtener todos los PropShots
    public List<PropShot> getAllPropShots() {
        return propShotRepository.findAll().list();
    }

    // Obtener PropShots por usuario
    public List<PropShotResponseDTO> getPropShotsByUser(Long userId) {
        List<PropShot> propShots = propShotRepository.findByUserId(userId);
        return propShots.stream()
                .map(propShotMapper::toResponseDTO)
                .toList();
    }

    // Obtener un PropShot por ID
    public PropShot getPropShotById(Long id) {
        PropShot propShot = propShotRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("PropShot no encontrado con ID: " + id));
        return propShot;
    }

    // Crear nuevo PropShot
    @Transactional
    public PropShot createPropShot(PropShot propShot) {
        // Establecer valores por defecto
        propShot.setLikes(0);
        propShot.setStatus("active");
        
        // Guardar en la base de datos
        propShotRepository.persist(propShot);
        return propShot;
    }
    
    // Crear nuevo PropShot desde DTO
    @Transactional
    public PropShotResponseDTO createPropShotFromDTO(PropShotCreateRequestDTO dto) {
        try {
            System.out.println("🔍 DEBUG: Creando PropShot desde DTO");
            System.out.println("🔍 DEBUG: userId: " + dto.userId);
            System.out.println("🔍 DEBUG: title: " + dto.title);
            System.out.println("🔍 DEBUG: videoUrl: " + dto.videoUrl);
            
            // Buscar el agente por userId
            Agent agent = agentRepository.findByUserId(dto.userId);
            if (agent == null) {
                throw new NotFoundException("Agente no encontrado con userId: " + dto.userId);
            }
            
            // Usar el mapper para convertir DTO a entidad
            PropShot propShot = propShotMapper.toEntityFromCreateRequest(dto, agent);
            
            // Guardar en la base de datos
            propShotRepository.persist(propShot);
            
            // Convertir a DTO de respuesta dentro de la transacción
            PropShotResponseDTO responseDTO = propShotMapper.toResponseDTO(propShot);
            
            System.out.println("✅ DEBUG: PropShot creado exitosamente con ID: " + propShot.getId());
            return responseDTO;
        } catch (Exception e) {
            System.err.println("❌ ERROR creando PropShot desde DTO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Actualizar PropShot
    @Transactional
    public PropShot updatePropShot(PropShot propShot) {
        PropShot existing = getPropShotById(propShot.getId());
        
        // Actualizar campos
        if (propShot.getTitle() != null) existing.setTitle(propShot.getTitle());
        if (propShot.getDescription() != null) existing.setDescription(propShot.getDescription());
        
        existing.setUpdatedAt(java.time.LocalDateTime.now());
        
        return existing;
    }

    // Eliminar PropShot
    @Transactional
    public void deletePropShot(Long id) {
        PropShot propShot = getPropShotById(id);
        propShotRepository.delete(propShot);
    }

    // Upload de video
    public String uploadVideo(InputStream videoStream, String fileName) throws IOException {
        // Crear directorio de uploads si no existe - respetando la estructura existente
        String uploadDir = "uploads/social/propshots";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String fileExtension = getFileExtension(fileName);
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFileName);

        // Guardar archivo
        Files.copy(videoStream, filePath, StandardCopyOption.REPLACE_EXISTING);

        // Devolver URL relativa - respetando la estructura existente
        return "/uploads/social/propshots/" + uniqueFileName;
    }

    // Upload de thumbnail
    public String uploadThumbnail(InputStream thumbnailStream, String fileName) throws IOException {
        // Crear directorio de uploads si no existe - respetando la estructura existente
        String uploadDir = "uploads/social/propshots";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String fileExtension = getFileExtension(fileName);
        String uniqueFileName = "thumb_" + UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFileName);

        // Guardar archivo
        Files.copy(thumbnailStream, filePath, StandardCopyOption.REPLACE_EXISTING);

        // Devolver URL relativa - respetando la estructura existente
        return "/uploads/social/propshots/" + uniqueFileName;
    }

    // Dar like a un PropShot
    @Transactional
    public void likePropShot(Long id) {
        PropShot propShot = getPropShotById(id);
        propShot.setLikes(propShot.getLikes() + 1);
    }

    // Incrementar vistas
    @Transactional
    public void incrementViews(Long id) {
        PropShot propShot = getPropShotById(id);

    }

    // Helper para obtener extensión del archivo
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
}
