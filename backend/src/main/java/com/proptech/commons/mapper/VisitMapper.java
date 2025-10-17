package com.proptech.commons.mapper;

import com.proptech.commons.entity.Visit;
import com.proptech.commons.dto.VisitDTO;
import java.util.List;
import java.util.stream.Collectors;

public class VisitMapper {
    public static VisitDTO toDTO(Visit entity) {
        if (entity == null) return null;
        VisitDTO dto = new VisitDTO();
        dto.id = entity.getId();
        dto.title = entity.getTitle();
        dto.description = entity.getDescription();
        dto.visitType = entity.getVisitType();
        dto.status = entity.getStatus();
        dto.propertyId = entity.getPropertyId();
        dto.scheduledDate = entity.getScheduledDate();
        dto.startTime = entity.getStartTime();
        dto.endTime = entity.getEndTime();
        dto.location = entity.getLocation();
        dto.visitorName = entity.getVisitorName();
        dto.assignedTo = entity.getAssignedTo();
        dto.visitorPhone = entity.getVisitorPhone();
        dto.visitorEmail = entity.getVisitorEmail();
        dto.clientId = entity.getClientId();
        dto.clientName = entity.getClientName();
        dto.clientEmail = entity.getClientEmail();
        dto.clientPhone = entity.getClientPhone();
        dto.reminders = entity.getReminders();
        dto.notes = entity.getNotes();
        dto.createdAt = entity.getCreatedAt();
        dto.updatedAt = entity.getUpdatedAt();
        return dto;
    }

    public static Visit toEntity(VisitDTO dto) {
        if (dto == null) return null;
        Visit entity = new Visit();
        entity.setId(dto.id);
        entity.setTitle(dto.title);
        entity.setDescription(dto.description);
        entity.setVisitType(dto.visitType);
        entity.setStatus(dto.status);
        entity.setPropertyId(dto.propertyId);
        entity.setScheduledDate(dto.scheduledDate);
        entity.setStartTime(dto.startTime);
        entity.setEndTime(dto.endTime);
        entity.setLocation(dto.location);
        entity.setVisitorName(dto.visitorName);
        entity.setAssignedTo(dto.assignedTo);
        entity.setVisitorPhone(dto.visitorPhone);
        entity.setVisitorEmail(dto.visitorEmail);
        entity.setClientId(dto.clientId);
        entity.setClientName(dto.clientName);
        entity.setClientEmail(dto.clientEmail);
        entity.setClientPhone(dto.clientPhone);
        entity.setReminders(dto.reminders);
        entity.setNotes(dto.notes);
        entity.setCreatedAt(dto.createdAt);
        entity.setUpdatedAt(dto.updatedAt);
        return entity;
    }

    public static List<VisitDTO> toDTOList(List<Visit> entities) {
        return entities.stream().map(VisitMapper::toDTO).collect(Collectors.toList());
    }
} 