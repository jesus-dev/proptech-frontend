package com.proptech.properties.dto;

import java.time.LocalDateTime;

public class PublicAppointmentRequest {
    private String title;
    private String description;
    private LocalDateTime appointmentDate;
    private Integer durationMinutes;
    private Long propertyId;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String notes;

    // Constructors
    public PublicAppointmentRequest() {}

    public PublicAppointmentRequest(String title, String description, LocalDateTime appointmentDate,
                                  Integer durationMinutes, Long propertyId, String clientName,
                                  String clientEmail, String clientPhone, String notes) {
        this.title = title;
        this.description = description;
        this.appointmentDate = appointmentDate;
        this.durationMinutes = durationMinutes;
        this.propertyId = propertyId;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.clientPhone = clientPhone;
        this.notes = notes;
    }

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

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Validation
    public boolean isValid() {
        return title != null && !title.trim().isEmpty() &&
               appointmentDate != null &&
               durationMinutes != null && durationMinutes > 0 &&
               propertyId != null &&
               clientName != null && !clientName.trim().isEmpty() &&
               clientEmail != null && !clientEmail.trim().isEmpty();
    }

    public String getValidationError() {
        if (title == null || title.trim().isEmpty()) {
            return "El título es requerido";
        }
        if (appointmentDate == null) {
            return "La fecha y hora son requeridas";
        }
        if (durationMinutes == null || durationMinutes <= 0) {
            return "La duración debe ser mayor a 0";
        }
        if (propertyId == null) {
            return "La propiedad es requerida";
        }
        if (clientName == null || clientName.trim().isEmpty()) {
            return "El nombre del cliente es requerido";
        }
        if (clientEmail == null || clientEmail.trim().isEmpty()) {
            return "El email del cliente es requerido";
        }
        return null;
    }
}
