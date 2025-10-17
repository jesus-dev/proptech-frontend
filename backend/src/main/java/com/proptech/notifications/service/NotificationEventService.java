package com.proptech.notifications.service;

import com.proptech.notifications.entity.Notification;
import com.proptech.notifications.repository.NotificationRepository;
import com.proptech.properties.entity.Property;
import com.proptech.properties.service.PropertyService;
import com.proptech.commons.entity.Agent;
import com.proptech.commons.repository.AgentRepository;
import com.proptech.auth.entity.User;
import com.proptech.auth.service.UserService;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@ApplicationScoped
public class NotificationEventService {

    @Inject
    NotificationRepository notificationRepository;

    @Inject
    PropertyService propertyService;

    @Inject
    AgentRepository agentRepository;

    @Inject
    UserService userService;

    /**
     * Notificar cuando se crea un comentario en una propiedad
     */
    @Transactional
    public void notifyCommentCreated(Long propertyId, Long commentAuthorId, String commentAuthorName, String commentContent) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            if (property == null) return;

            // Buscar el agente propietario de la propiedad
            Agent agent = property.getAgent();
            if (agent == null) return;

            // No notificar si el comentario es del mismo agente
            if (agent.getId().equals(commentAuthorId)) return;

            // Crear notificación
            Notification notification = new Notification();
            notification.setAgentId(agent.getId());
            notification.setPropertyId(propertyId);
            notification.setType(Notification.NotificationType.PROPERTY_CONTACT);
            notification.setChannel(Notification.NotificationChannel.DASHBOARD);
            notification.setTitle("Nuevo comentario en tu propiedad");
            notification.setMessage(String.format(
                "%s comentó en tu propiedad \"%s\": \"%s\"",
                commentAuthorName,
                property.getTitle(),
                commentContent.length() > 100 ? commentContent.substring(0, 100) + "..." : commentContent
            ));

            // Crear metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("propertyTitle", property.getTitle());
            metadata.put("propertyImage", property.getFeaturedImage());
            metadata.put("commentAuthorName", commentAuthorName);
            metadata.put("commentAuthorId", commentAuthorId);
            metadata.put("commentContent", commentContent);
            metadata.put("commentId", null); // Se puede agregar después si es necesario
            metadata.put("clickable", true);
            metadata.put("url", "/properties/" + propertyId);
            metadata.put("action", "view_property");

            notification.setMetadata(metadata.toString());
            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.persist(notification);

        } catch (Exception e) {
            System.err.println("Error creating comment notification: " + e.getMessage());
        }
    }

    /**
     * Notificar cuando se crea una vista en una propiedad
     */
    @Transactional
    public void notifyPropertyView(Long propertyId, Long viewerId, String viewerName) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            if (property == null) return;

            Agent agent = property.getAgent();
            if (agent == null) return;

            // No notificar si la vista es del mismo agente
            if (agent.getId().equals(viewerId)) return;

            // Crear notificación
            Notification notification = new Notification();
            notification.setAgentId(agent.getId());
            notification.setPropertyId(propertyId);
            notification.setType(Notification.NotificationType.PROPERTY_VIEW);
            notification.setChannel(Notification.NotificationChannel.DASHBOARD);
            notification.setTitle("Nueva vista en tu propiedad");
            notification.setMessage(String.format(
                "%s vio tu propiedad \"%s\"",
                viewerName != null ? viewerName : "Un usuario",
                property.getTitle()
            ));

            // Crear metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("propertyTitle", property.getTitle());
            metadata.put("propertyImage", property.getFeaturedImage());
            metadata.put("viewerName", viewerName);
            metadata.put("viewerId", viewerId);
            metadata.put("clickable", true);
            metadata.put("url", "/properties/" + propertyId);
            metadata.put("action", "view_property");

            notification.setMetadata(metadata.toString());
            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.persist(notification);

        } catch (Exception e) {
            System.err.println("Error creating property view notification: " + e.getMessage());
        }
    }

    /**
     * Notificar cuando se agrega una propiedad a favoritos
     */
    @Transactional
    public void notifyPropertyFavorite(Long propertyId, Long userId, String userName) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            if (property == null) return;

            Agent agent = property.getAgent();
            if (agent == null) return;

            // No notificar si el favorito es del mismo agente
            if (agent.getId().equals(userId)) return;

            // Crear notificación
            Notification notification = new Notification();
            notification.setAgentId(agent.getId());
            notification.setPropertyId(propertyId);
            notification.setType(Notification.NotificationType.PROPERTY_FAVORITE);
            notification.setChannel(Notification.NotificationChannel.DASHBOARD);
            notification.setTitle("Nueva favorita");
            notification.setMessage(String.format(
                "%s agregó tu propiedad \"%s\" a favoritos",
                userName != null ? userName : "Un usuario",
                property.getTitle()
            ));

            // Crear metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("propertyTitle", property.getTitle());
            metadata.put("propertyImage", property.getFeaturedImage());
            metadata.put("userName", userName);
            metadata.put("userId", userId);
            metadata.put("clickable", true);
            metadata.put("url", "/properties/" + propertyId);
            metadata.put("action", "view_property");

            notification.setMetadata(metadata.toString());
            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.persist(notification);

        } catch (Exception e) {
            System.err.println("Error creating property favorite notification: " + e.getMessage());
        }
    }

    /**
     * Notificar cuando se crea un nuevo contacto/inquiry
     */
    @Transactional
    public void notifyNewContact(Long propertyId, String contactName, String contactEmail, String contactMessage) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            if (property == null) return;

            Agent agent = property.getAgent();
            if (agent == null) return;

            // Crear notificación
            Notification notification = new Notification();
            notification.setAgentId(agent.getId());
            notification.setPropertyId(propertyId);
            notification.setType(Notification.NotificationType.PROPERTY_CONTACT);
            notification.setChannel(Notification.NotificationChannel.DASHBOARD);
            notification.setTitle("Nuevo contacto interesado");
            notification.setMessage(String.format(
                "%s está interesado en tu propiedad \"%s\"",
                contactName,
                property.getTitle()
            ));

            // Crear metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("propertyTitle", property.getTitle());
            metadata.put("propertyImage", property.getFeaturedImage());
            metadata.put("contactName", contactName);
            metadata.put("contactEmail", contactEmail);
            metadata.put("contactMessage", contactMessage);
            metadata.put("clickable", true);
            metadata.put("url", "/properties/" + propertyId);
            metadata.put("action", "view_property");

            notification.setMetadata(metadata.toString());
            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.persist(notification);

        } catch (Exception e) {
            System.err.println("Error creating new contact notification: " + e.getMessage());
        }
    }

    /**
     * Notificar cuando cambia el precio de una propiedad
     */
    @Transactional
    public void notifyPriceChange(Long propertyId, Double oldPrice, Double newPrice) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            if (property == null) return;

            Agent agent = property.getAgent();
            if (agent == null) return;

            // Crear notificación
            Notification notification = new Notification();
            notification.setAgentId(agent.getId());
            notification.setPropertyId(propertyId);
            notification.setType(Notification.NotificationType.PROPERTY_PRICE_CHANGE);
            notification.setChannel(Notification.NotificationChannel.DASHBOARD);
            notification.setTitle("Cambio de precio");
            notification.setMessage(String.format(
                "El precio de \"%s\" cambió de $%,.0f a $%,.0f",
                property.getTitle(),
                oldPrice,
                newPrice
            ));

            // Crear metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("propertyTitle", property.getTitle());
            metadata.put("propertyImage", property.getFeaturedImage());
            metadata.put("oldPrice", oldPrice);
            metadata.put("newPrice", newPrice);
            metadata.put("currency", "USD");
            metadata.put("clickable", true);
            metadata.put("url", "/properties/" + propertyId);
            metadata.put("action", "view_property");

            notification.setMetadata(metadata.toString());
            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.persist(notification);

        } catch (Exception e) {
            System.err.println("Error creating price change notification: " + e.getMessage());
        }
    }

    /**
     * Notificar cuando se programa una cita
     */
    @Transactional
    public void notifyAppointmentScheduled(Long propertyId, String clientName, String clientPhone, LocalDateTime appointmentDate) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            if (property == null) return;

            Agent agent = property.getAgent();
            if (agent == null) return;

            // Crear notificación
            Notification notification = new Notification();
            notification.setAgentId(agent.getId());
            notification.setPropertyId(propertyId);
            notification.setType(Notification.NotificationType.APPOINTMENT_SCHEDULED);
            notification.setChannel(Notification.NotificationChannel.DASHBOARD);
            notification.setTitle("Cita programada");
            notification.setMessage(String.format(
                "Nueva cita programada con %s para ver \"%s\"",
                clientName,
                property.getTitle()
            ));

            // Crear metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("propertyTitle", property.getTitle());
            metadata.put("propertyImage", property.getFeaturedImage());
            metadata.put("clientName", clientName);
            metadata.put("clientPhone", clientPhone);
            metadata.put("appointmentDate", appointmentDate.toString());
            metadata.put("clickable", true);
            metadata.put("url", "/properties/" + propertyId);
            metadata.put("action", "view_property");

            notification.setMetadata(metadata.toString());
            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.persist(notification);

        } catch (Exception e) {
            System.err.println("Error creating appointment notification: " + e.getMessage());
        }
    }

    /**
     * Notificar alertas del sistema
     */
    @Transactional
    public void notifySystemAlert(Long agentId, String title, String message, Map<String, Object> metadata) {
        try {
            Agent agent = agentRepository.findById(agentId);
            if (agent == null) return;

            // Crear notificación
            Notification notification = new Notification();
            notification.setAgentId(agentId);
            notification.setType(Notification.NotificationType.SYSTEM_ALERT);
            notification.setChannel(Notification.NotificationChannel.DASHBOARD);
            notification.setTitle(title);
            notification.setMessage(message);

            if (metadata != null) {
                notification.setMetadata(metadata.toString());
            }

            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setSentAt(LocalDateTime.now());

            notificationRepository.persist(notification);

        } catch (Exception e) {
            System.err.println("Error creating system alert notification: " + e.getMessage());
        }
    }
}
