package com.proptech.social.mapper;

import com.proptech.social.dto.PropShotDTO;
import com.proptech.social.dto.PropShotCreateRequestDTO;
import com.proptech.social.dto.PropShotResponseDTO;
import com.proptech.social.entity.PropShot;
import com.proptech.commons.entity.Agent;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PropShotMapper {
    
    /**
     * Convierte entidad a DTO
     */
    public PropShotDTO toDTO(PropShot propShot) {
        if (propShot == null) {
            return null;
        }
        
        PropShotDTO dto = new PropShotDTO();
        dto.id = propShot.getId();
        dto.title = propShot.getTitle();
        dto.description = propShot.getDescription();
        dto.mediaUrl = propShot.getMediaUrl();
        dto.linkUrl = propShot.getLinkUrl();
        dto.agentId = propShot.getAgent() != null ? propShot.getAgent().getId() : null;
        dto.socialId = propShot.getAgency() != null ? propShot.getAgency().getId() : null;
        dto.likes = propShot.getLikes();
        dto.comments = propShot.getComments();
        dto.shares = propShot.getShares();
        dto.createdAt = propShot.getCreatedAt();
        dto.updatedAt = propShot.getUpdatedAt();
        dto.status = propShot.getStatus();
        
        return dto;
    }
    
    /**
     * Convierte DTO a entidad
     */
    public PropShot toEntity(PropShotDTO dto) {
        if (dto == null) {
            return null;
        }
        
        PropShot propShot = new PropShot();
        propShot.setId(dto.id);
        propShot.setTitle(dto.title);
        propShot.setDescription(dto.description);
        propShot.setMediaUrl(dto.mediaUrl);
        propShot.setLinkUrl(dto.linkUrl);

        propShot.setLikes(dto.likes);
        propShot.setComments(dto.comments);
        propShot.setShares(dto.shares);
        propShot.setCreatedAt(dto.createdAt);
        propShot.setUpdatedAt(dto.updatedAt);
        propShot.setStatus(dto.status);
        
        return propShot;
    }
    
    /**
     * Convierte PropShotCreateRequestDTO a entidad PropShot
     */
    public PropShot toEntityFromCreateRequest(PropShotCreateRequestDTO createRequest, Agent agent) {
        if (createRequest == null) {
            return null;
        }
        
        PropShot propShot = new PropShot();
        propShot.setTitle(createRequest.title);
        propShot.setDescription(createRequest.description);
        propShot.setMediaUrl(createRequest.videoUrl); // Mapear videoUrl a mediaUrl
        propShot.setLinkUrl(createRequest.link);
        propShot.setAgent(agent);
        propShot.setLikes(0);
        propShot.setComments(0);
        propShot.setShares(0);
        propShot.setStatus("active");
        
        return propShot;
    }
    
    /**
     * Convierte entidad PropShot a PropShotResponseDTO (para evitar lazy loading issues)
     */
    public PropShotResponseDTO toResponseDTO(PropShot propShot) {
        if (propShot == null) {
            return null;
        }
        
        PropShotResponseDTO dto = new PropShotResponseDTO();
        dto.id = propShot.getId();
        dto.title = propShot.getTitle();
        dto.description = propShot.getDescription();
        dto.mediaUrl = propShot.getMediaUrl();
        dto.linkUrl = propShot.getLinkUrl();
        
        // Información del agente (accediendo de forma segura)
        if (propShot.getAgent() != null) {
            dto.agentId = propShot.getAgent().getId();
            dto.agentFirstName = propShot.getAgent().getFirstName();
            dto.agentLastName = propShot.getAgent().getLastName();
            dto.agentEmail = propShot.getAgent().getEmail();
            dto.agentPhoto = propShot.getAgent().getPhoto();
        }
        
        dto.likes = propShot.getLikes();
        dto.comments = propShot.getComments();
        dto.shares = propShot.getShares();
        dto.createdAt = propShot.getCreatedAt();
        dto.updatedAt = propShot.getUpdatedAt();
        dto.status = propShot.getStatus();
        
        return dto;
    }
}
