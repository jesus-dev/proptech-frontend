package com.proptech.properties.dto;

import com.proptech.properties.entity.Appointment;
import java.time.LocalDateTime;

public class AppointmentDTO {
    
    private Long id;
    private String title;
    private String description;
    private LocalDateTime appointmentDate;
    private Integer durationMinutes;
    private String appointmentType;
    private String status;
    private String location;
    private String locationType;
    private Long agentId;
    private String agentName;
    private Long clientId;
    private String clientName;
    private Long propertyId;
    private String propertyTitle;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean reminderSent;
    private LocalDateTime reminderDate;
    
    // Constructors
    public AppointmentDTO() {}
    
    public AppointmentDTO(Appointment appointment) {
        this.id = appointment.getId();
        this.title = appointment.getTitle();
        this.description = appointment.getDescription();
        this.appointmentDate = appointment.getAppointmentDate();
        this.durationMinutes = appointment.getDurationMinutes();
        this.appointmentType = appointment.getAppointmentType() != null ? 
            appointment.getAppointmentType().getDisplayName() : null;
        this.status = appointment.getStatus() != null ? 
            appointment.getStatus().getDisplayName() : null;
        this.location = appointment.getLocation();
        this.locationType = appointment.getLocationType() != null ? 
            appointment.getLocationType().getDisplayName() : null;
        this.agentId = appointment.getAgentId();
        this.clientId = appointment.getClientId();
        this.propertyId = appointment.getPropertyId();
        this.notes = appointment.getNotes();
        this.createdAt = appointment.getCreatedAt();
        this.updatedAt = appointment.getUpdatedAt();
        this.reminderSent = appointment.getReminderSent();
        this.reminderDate = appointment.getReminderDate();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
    
    public String getAgentName() {
        return agentName;
    }
    
    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }
    
    public Long getClientId() {
        return clientId;
    }
    
    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
    
    public Long getPropertyId() {
        return propertyId;
    }
    
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
    
    public String getPropertyTitle() {
        return propertyTitle;
    }
    
    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Boolean getReminderSent() {
        return reminderSent;
    }
    
    public void setReminderSent(Boolean reminderSent) {
        this.reminderSent = reminderSent;
    }
    
    public LocalDateTime getReminderDate() {
        return reminderDate;
    }
    
    public void setReminderDate(LocalDateTime reminderDate) {
        this.reminderDate = reminderDate;
    }
}
