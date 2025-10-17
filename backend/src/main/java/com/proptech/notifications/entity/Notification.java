package com.proptech.notifications.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", schema = "proptech", indexes = {
    @Index(name = "idx_notifications_agent_id", columnList = "agent_id"),
    @Index(name = "idx_notifications_user_id", columnList = "user_id"),
    @Index(name = "idx_notifications_status", columnList = "status"),
    @Index(name = "idx_notifications_created_at", columnList = "created_at"),
    @Index(name = "idx_notifications_agent_status", columnList = "agent_id, status"),
    @Index(name = "idx_notifications_agent_created", columnList = "agent_id, created_at")
})
public class Notification extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "agent_id")
    private Long agentId;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status;

    @Enumerated(EnumType.STRING)
    private NotificationChannel channel;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Datos adicionales en JSON
    @Column(columnDefinition = "TEXT")
    private String metadata;

    public enum NotificationType {
        PROPERTY_VIEW,           // Nueva vista en propiedad
        PROPERTY_FAVORITE,       // Nueva favorita
        PROPERTY_CONTACT,        // Nuevo contacto
        PROPERTY_PRICE_CHANGE,   // Cambio de precio
        NEW_PROPERTY_SIMILAR,    // Propiedad similar disponible
        MARKET_UPDATE,           // Actualización de mercado
        SYSTEM_ALERT,            // Alerta del sistema
        LEAD_SCORED,             // Lead calificado
        APPOINTMENT_SCHEDULED,   // Cita programada
        APPOINTMENT_REMINDER     // Recordatorio de cita
    }

    public enum NotificationStatus {
        PENDING,    // Pendiente de envío
        SENT,       // Enviada
        UNREAD,     // No leída
        READ,       // Leída
        FAILED      // Falló el envío
    }

    public enum NotificationChannel {
        EMAIL,      // Correo electrónico
        PUSH,       // Push notification
        SMS,        // Mensaje de texto
        WHATSAPP,   // WhatsApp
        DASHBOARD   // Solo en dashboard
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = NotificationStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationStatus getStatus() { return status; }
    public void setStatus(NotificationStatus status) { this.status = status; }

    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
} 