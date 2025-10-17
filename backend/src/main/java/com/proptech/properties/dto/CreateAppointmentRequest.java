package com.proptech.properties.dto;

import java.time.LocalDateTime;

public class CreateAppointmentRequest {
    
    private String title;
    private String description;
    private LocalDateTime appointmentDate;
    private Integer durationMinutes;
    private String appointmentType;
    private String location;
    private String locationType;
    private Long agentId;
    private Long clientId;
    private Long propertyId;
    private String notes;
    
    // Constructors
    public CreateAppointmentRequest() {}
    
    // Getters and Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }
    
    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public String getAppointmentType() {
        return appointmentType;
    }
    
    public void setAppointmentType(String appointmentType) {
        this.appointmentType = appointmentType;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getLocationType() {
        return locationType;
    }
    
    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }
    
    public Long getAgentId() {
        return agentId;
    }
    
    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
    
    public Long getClientId() {
        return clientId;
    }
    
    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }
    
    public Long getPropertyId() {
        return propertyId;
    }
    
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    // Validation methods
    public boolean isValid() {
        return title != null && !title.trim().isEmpty() &&
               appointmentDate != null && appointmentDate.isAfter(LocalDateTime.now()) &&
               durationMinutes != null && durationMinutes > 0 &&
               agentId != null && clientId != null;
    }
    
    public String getValidationError() {
        if (title == null || title.trim().isEmpty()) {
            return "El título es requerido";
        }
        if (appointmentDate == null) {
            return "La fecha de la cita es requerida";
        }
        if (appointmentDate.isBefore(LocalDateTime.now())) {
            return "La fecha de la cita debe ser futura";
        }
        if (durationMinutes == null || durationMinutes <= 0) {
            return "La duración debe ser mayor a 0 minutos";
        }
        if (agentId == null) {
            return "El agente es requerido";
        }
        if (clientId == null) {
            return "El cliente es requerido";
        }
        return null;
    }
}
