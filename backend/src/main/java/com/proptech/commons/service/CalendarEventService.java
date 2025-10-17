package com.proptech.commons.service;

import java.util.List;
import java.util.stream.Collectors;

import com.proptech.commons.dto.CalendarEventDTO;
import com.proptech.commons.entity.CalendarEvent;
import com.proptech.commons.repository.CalendarEventRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CalendarEventService {
    @Inject
    CalendarEventRepository repository;

    public List<CalendarEventDTO> listAll() {
        return repository.listAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CalendarEventDTO findById(Long id) {
        CalendarEvent event = repository.findById(id);
        return event != null ? toDTO(event) : null;
    }

    @Transactional
    public CalendarEventDTO create(CalendarEventDTO dto) {
        CalendarEvent event = fromDTO(dto);
        repository.persist(event);
        return toDTO(event);
    }

    @Transactional
    public CalendarEventDTO update(Long id, CalendarEventDTO dto) {
        CalendarEvent event = repository.findById(id);
        if (event == null) return null;
        event.setTitle(dto.title);
        event.setType(dto.type);
        event.setStart(dto.start);
        event.setEnd(dto.end);
        event.setPropertyId(dto.propertyId);
        event.setClientId(dto.clientId);
        event.setNotes(dto.notes);
        event.setColor(dto.color);
        event.setStatus(dto.status);
        return toDTO(event);
    }

    @Transactional
    public boolean delete(Long id) {
        return repository.deleteById(id);
    }

    // Mapping helpers
    private CalendarEventDTO toDTO(CalendarEvent e) {
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.id = e.getId();
        dto.title = e.getTitle();
        dto.type = e.getType();
        dto.start = e.getStart();
        dto.end = e.getEnd();
        dto.propertyId = e.getPropertyId();
        dto.clientId = e.getClientId();
        dto.notes = e.getNotes();
        dto.color = e.getColor();
        dto.status = e.getStatus();
        dto.createdAt = e.getCreatedAt();
        dto.updatedAt = e.getUpdatedAt();
        return dto;
    }
    private CalendarEvent fromDTO(CalendarEventDTO dto) {
        CalendarEvent e = new CalendarEvent();
        e.setTitle(dto.title);
        e.setType(dto.type);
        e.setStart(dto.start);
        e.setEnd(dto.end);
        e.setPropertyId(dto.propertyId);
        e.setClientId(dto.clientId);
        e.setNotes(dto.notes);
        e.setColor(dto.color);
        e.setStatus(dto.status);
        return e;
    }
} 