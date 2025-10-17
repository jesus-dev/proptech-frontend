package com.proptech.properties.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments", schema = "proptech")
public class Appointment extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;
    
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;
    
    @Column(name = "appointment_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AppointmentType appointmentType;
    
    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
    
    @Column(name = "location", length = 500)
    private String location;
    
    @Column(name = "location_type", length = 50)
    @Enumerated(EnumType.STRING)
    private LocationType locationType;
    
    @Column(name = "agent_id", nullable = false)
    private Long agentId;
    
    @Column(name = "client_id", nullable = false)
    private Long clientId;
    
    @Column(name = "property_id")
    private Long propertyId;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;
    
    @Column(name = "reminder_date")
    private LocalDateTime reminderDate;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "client_email")
    private String clientEmail;

    @Column(name = "client_phone")
    private String clientPhone;
    
    // Enums
    public enum AppointmentType {
        PROPERTY_VISIT("Visita a Propiedad"),
        CLIENT_MEETING("Reunión con Cliente"),
        PROPERTY_INSPECTION("Inspección Técnica"),
        CONTRACT_SIGNING("Firma de Contrato"),
        PROPERTY_VALUATION("Valuación"),
        DEVELOPMENT_TOUR("Tour de Desarrollo"),
        OTHER("Otro");
        
        private final String displayName;
        
        AppointmentType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum AppointmentStatus {
        SCHEDULED("Programada"),
        CONFIRMED("Confirmada"),
        IN_PROGRESS("En Progreso"),
        COMPLETED("Completada"),
        CANCELLED("Cancelada"),
        NO_SHOW("No Se Presentó"),
        RESCHEDULED("Reprogramada");
        
        private final String displayName;
        
        AppointmentStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum LocationType {
        PROPERTY_ADDRESS("Dirección de Propiedad"),
        OFFICE("Oficina"),
        CLIENT_HOME("Casa del Cliente"),
        NEUTRAL_LOCATION("Ubicación Neutral"),
        VIRTUAL("Virtual/Online"),
        OTHER("Otro");
        
        private final String displayName;
        
        LocationType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Constructors
    public Appointment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isPublic = false;
    }

    public Appointment(String title, String description, LocalDateTime appointmentDate, 
                     Integer durationMinutes, AppointmentType appointmentType, 
                     AppointmentStatus status, String location, LocationType locationType,
                     Long agentId, Long clientId, Long propertyId, String notes) {
        this();
        this.title = title;
        this.description = description;
        this.appointmentDate = appointmentDate;
        this.durationMinutes = durationMinutes;
        this.appointmentType = appointmentType;
        this.status = status;
        this.location = location;
        this.locationType = locationType;
        this.agentId = agentId;
        this.clientId = clientId;
        this.propertyId = propertyId;
        this.notes = notes;
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
    
    public AppointmentType getAppointmentType() {
        return appointmentType;
    }
    
    public void setAppointmentType(AppointmentType appointmentType) {
        this.appointmentType = appointmentType;
    }
    
    public AppointmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public LocationType getLocationType() {
        return locationType;
    }
    
    public void setLocationType(LocationType locationType) {
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

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
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
    
    // Utility methods
    public LocalDateTime getEndTime() {
        return appointmentDate.plusMinutes(durationMinutes);
    }
    
    public boolean isOverlapping(Appointment other) {
        return !(this.getEndTime().isBefore(other.getAppointmentDate()) || 
                other.getEndTime().isBefore(this.getAppointmentDate()));
    }
    
    public boolean isToday() {
        return appointmentDate.toLocalDate().equals(LocalDateTime.now().toLocalDate());
    }
    
    public boolean isUpcoming() {
        return appointmentDate.isAfter(LocalDateTime.now());
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
