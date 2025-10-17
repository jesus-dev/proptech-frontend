package com.proptech.notifications.service;

import com.proptech.notifications.entity.Notification;
import com.proptech.notifications.repository.NotificationRepository;
import com.proptech.properties.entity.Property;
import com.proptech.properties.service.PropertyService;
import com.proptech.auth.service.UserService;
import com.proptech.auth.dto.UserDTO;
import com.proptech.commons.repository.AgentRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@ApplicationScoped
public class NotificationService {

    @Inject
    NotificationRepository notificationRepository;

    @Inject
    PropertyService propertyService;

    @Inject
    UserService userService;

    @Inject
    AgentRepository agentRepository;

    @Inject
    EmailService emailService;

    /**
     * Crear y enviar notificación de nueva vista en propiedad
     */
    @Transactional
    public void notifyPropertyView(Long propertyId, Long userId) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            UserDTO user = userService.getUserById(userId);
            
            if (property != null && user != null) {
                // Crear notificación
                Notification notification = new Notification();
                notification.setUserId(userId);
                notification.setPropertyId(propertyId);
                notification.setType(Notification.NotificationType.PROPERTY_VIEW);
                notification.setChannel(Notification.NotificationChannel.EMAIL);
                notification.setTitle("Nueva vista en tu propiedad");
                notification.setMessage(String.format(
                    "Tu propiedad '%s' en %s recibió una nueva vista. " +
                    "Total de vistas: %d", 
                    property.getTitle(),
                    property.getAddress(),
                    property.getViews()
                ));

                // Guardar notificación
                notificationRepository.persist(notification);

                // Enviar por email
                sendEmailNotification(notification, user.getEmail());
            }
        } catch (Exception e) {
            System.err.println("Error creating property view notification: " + e.getMessage());
        }
    }

    /**
     * Crear y enviar notificación de nuevo favorito
     */
    @Transactional
    public void notifyPropertyFavorite(Long propertyId, Long userId) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            UserDTO user = userService.getUserById(userId);
            
            if (property != null && user != null) {
                Notification notification = new Notification();
                notification.setUserId(userId);
                notification.setPropertyId(propertyId);
                notification.setType(Notification.NotificationType.PROPERTY_FAVORITE);
                notification.setChannel(Notification.NotificationChannel.EMAIL);
                notification.setTitle("¡Nuevo favorito!");
                notification.setMessage(String.format(
                    "Tu propiedad '%s' fue agregada a favoritos. " +
                    "Total de favoritos: %d", 
                    property.getTitle(),
                    property.getFavoritesCount()
                ));

                notificationRepository.persist(notification);
                sendEmailNotification(notification, user.getEmail());
            }
        } catch (Exception e) {
            System.err.println("Error creating property favorite notification: " + e.getMessage());
        }
    }

    /**
     * Crear y enviar notificación de nuevo contacto
     */
    @Transactional
    public void notifyPropertyContact(Long propertyId, Long userId, String contactName) {
        try {
            Property property = propertyService.findByIdEntity(propertyId);
            UserDTO user = userService.getUserById(userId);
            
            if (property != null && user != null) {
                Notification notification = new Notification();
                notification.setUserId(userId);
                notification.setPropertyId(propertyId);
                notification.setType(Notification.NotificationType.PROPERTY_CONTACT);
                notification.setChannel(Notification.NotificationChannel.EMAIL);
                notification.setTitle("¡Nuevo contacto interesado!");
                notification.setMessage(String.format(
                    "%s está interesado en tu propiedad '%s'. " +
                    "¡No pierdas esta oportunidad!", 
                    contactName,
                    property.getTitle()
                ));

                notificationRepository.persist(notification);
                sendEmailNotification(notification, user.getEmail());
            }
        } catch (Exception e) {
            System.err.println("Error creating property contact notification: " + e.getMessage());
        }
    }

    /**
     * Obtener notificaciones no leídas para un usuario
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByUserId(userId);
    }

    /**
     * Obtener todas las notificaciones de un usuario
     */
    public List<Notification> getAllNotifications(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    /**
     * Obtener notificaciones con conteo optimizado (una sola consulta)
     */
    public Map<String, Object> getNotificationsWithCount(Long userId, int limit) {
        return notificationRepository.findNotificationsWithCount(userId, limit);
    }

    /**
     * Obtener notificaciones paginadas
     */
    public Map<String, Object> getNotificationsPaginated(Long userId, int page, int limit) {
        return notificationRepository.findNotificationsPaginated(userId, page, limit);
    }

    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    /**
     * Eliminar notificación
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId);
        if (notification != null) {
            notificationRepository.delete(notification);
        }
    }

    /**
     * Eliminar todas las notificaciones de un usuario
     */
    @Transactional
    public void deleteAllNotifications(Long userId) {
        notificationRepository.deleteAllByUserId(userId);
    }

    /**
     * Marcar notificación como leída
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId);
        if (notification != null) {
            notification.setStatus(Notification.NotificationStatus.READ);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.persist(notification);
        }
    }

    /**
     * Obtener estadísticas de notificaciones
     */
    public Map<String, Object> getNotificationStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        long totalNotifications = notificationRepository.countByUserId(userId);
        long unreadNotifications = notificationRepository.countUnreadByUserId(userId);
        long todayNotifications = notificationRepository.countTodayByUserId(userId);
        
        stats.put("total", totalNotifications);
        stats.put("unread", unreadNotifications);
        stats.put("today", todayNotifications);
        
        return stats;
    }

    /**
     * Crear notificaciones de prueba para un usuario
     */
    @Transactional
    public void createTestNotifications(Long userId) {
        try {
            // Limpiar notificaciones existentes del usuario
            deleteAllNotifications(userId);
            
            LocalDateTime now = LocalDateTime.now();
            
            // Crear notificaciones de prueba
            createTestNotification(userId, 123L, "Nueva vista en propiedad", 
                "Tu propiedad \"Casa Moderna en Las Mercedes\" recibió una nueva vista",
                Notification.NotificationType.PROPERTY_VIEW, Notification.NotificationStatus.UNREAD,
                now.minusMinutes(30), "{\"propertyTitle\": \"Casa Moderna en Las Mercedes\", \"viewerName\": \"María González\"}");
            
            createTestNotification(userId, 124L, "Nueva favorita", 
                "Carlos Rodríguez agregó tu propiedad \"Apartamento Premium Centro\" a favoritos",
                Notification.NotificationType.PROPERTY_FAVORITE, Notification.NotificationStatus.UNREAD,
                now.minusHours(2), "{\"propertyTitle\": \"Apartamento Premium Centro\", \"userName\": \"Carlos Rodríguez\"}");
            
            createTestNotification(userId, 125L, "Nuevo contacto interesado", 
                "Ana Silva está interesada en tu propiedad \"Oficina Comercial Zona Este\" y solicitó información",
                Notification.NotificationType.PROPERTY_CONTACT, Notification.NotificationStatus.UNREAD,
                now.minusHours(4), "{\"propertyTitle\": \"Oficina Comercial Zona Este\", \"userName\": \"Ana Silva\", \"contactInfo\": \"ana.silva@email.com\"}");
            
            createTestNotification(userId, 124L, "Cambio de precio", 
                "El precio de \"Apartamento Premium Centro\" cambió de $180,000 a $175,000",
                Notification.NotificationType.PROPERTY_PRICE_CHANGE, Notification.NotificationStatus.UNREAD,
                now.minusHours(6), "{\"propertyTitle\": \"Apartamento Premium Centro\", \"oldPrice\": 180000, \"newPrice\": 175000}");
            
            createTestNotification(userId, 127L, "Propiedad similar disponible", 
                "Se agregó una nueva propiedad similar a tu catálogo: \"Casa Contemporánea en Villa Elisa\"",
                Notification.NotificationType.NEW_PROPERTY_SIMILAR, Notification.NotificationStatus.UNREAD,
                now.minusHours(8), "{\"propertyTitle\": \"Casa Contemporánea en Villa Elisa\", \"similarity\": 85}");
            
            createTestNotification(userId, null, "Actualización de mercado", 
                "El mercado inmobiliario en tu zona ha mostrado un crecimiento del 5.2% este mes",
                Notification.NotificationType.MARKET_UPDATE, Notification.NotificationStatus.UNREAD,
                now.minusHours(12), "{\"marketGrowth\": 5.2, \"period\": \"este mes\", \"zone\": \"Las Mercedes\"}");
            
            createTestNotification(userId, null, "Lead calificado", 
                "Nuevo lead de alta calidad: Roberto Martínez está buscando propiedades en el rango de $200,000-$300,000",
                Notification.NotificationType.LEAD_SCORED, Notification.NotificationStatus.UNREAD,
                now.minusHours(18), "{\"leadName\": \"Roberto Martínez\", \"leadScore\": 85, \"budgetRange\": \"$200,000-$300,000\"}");
            
            createTestNotification(userId, 123L, "Cita programada", 
                "Nueva cita programada para mañana a las 2:00 PM en \"Casa Moderna en Las Mercedes\"",
                Notification.NotificationType.APPOINTMENT_SCHEDULED, Notification.NotificationStatus.UNREAD,
                now.minusDays(1), "{\"propertyTitle\": \"Casa Moderna en Las Mercedes\", \"appointmentDate\": \"2024-01-16T14:00:00\", \"clientName\": \"Laura Fernández\"}");
            
            createTestNotification(userId, 125L, "Recordatorio de cita", 
                "Recordatorio: Tienes una cita mañana a las 10:00 AM en \"Oficina Comercial Zona Este\"",
                Notification.NotificationType.APPOINTMENT_REMINDER, Notification.NotificationStatus.UNREAD,
                now.minusDays(3), "{\"propertyTitle\": \"Oficina Comercial Zona Este\", \"appointmentDate\": \"2024-01-16T10:00:00\", \"clientName\": \"Miguel Torres\"}");
            
            createTestNotification(userId, null, "Alerta del sistema", 
                "El sistema estará en mantenimiento mañana de 2:00 AM a 4:00 AM",
                Notification.NotificationType.SYSTEM_ALERT, Notification.NotificationStatus.UNREAD,
                now.minusDays(2), "{\"maintenanceStart\": \"2024-01-16T02:00:00\", \"maintenanceEnd\": \"2024-01-16T04:00:00\"}");
            
            // Crear algunas notificaciones leídas (más antiguas)
            createTestNotification(userId, 126L, "Nueva vista en propiedad", 
                "Tu propiedad \"Casa Familiar en El Cafetal\" recibió una nueva vista",
                Notification.NotificationType.PROPERTY_VIEW, Notification.NotificationStatus.READ,
                now.minusDays(2), "{\"propertyTitle\": \"Casa Familiar en El Cafetal\", \"viewerName\": \"Pedro López\"}");
            
            createTestNotification(userId, 128L, "Nueva favorita", 
                "Sofía Herrera agregó tu propiedad \"Penthouse Vista al Mar\" a favoritos",
                Notification.NotificationType.PROPERTY_FAVORITE, Notification.NotificationStatus.READ,
                now.minusDays(3), "{\"propertyTitle\": \"Penthouse Vista al Mar\", \"userName\": \"Sofía Herrera\"}");
            
            createTestNotification(userId, null, "Actualización de mercado", 
                "Nuevo reporte de mercado disponible para tu zona",
                Notification.NotificationType.MARKET_UPDATE, Notification.NotificationStatus.READ,
                now.minusDays(4), "{\"reportType\": \"monthly\", \"zone\": \"El Cafetal\"}");
            
        } catch (Exception e) {
            System.err.println("Error creating test notifications: " + e.getMessage());
            throw new RuntimeException("Error creating test notifications", e);
        }
    }
    
    /**
     * Método auxiliar para crear una notificación de prueba
     */
    private void createTestNotification(Long userId, Long propertyId, String title, String message,
                                      Notification.NotificationType type, Notification.NotificationStatus status,
                                      LocalDateTime createdAt, String metadata) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setPropertyId(propertyId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(status);
        notification.setChannel(Notification.NotificationChannel.DASHBOARD);
        notification.setCreatedAt(createdAt);
        notification.setUpdatedAt(createdAt);
        notification.setSentAt(createdAt);
        // Agregar metadatos clicables si es una notificación de propiedad
        if (propertyId != null) {
            String enhancedMetadata = metadata.substring(0, metadata.length() - 1) + 
                ", \"clickable\": true, \"url\": \"/properties/" + propertyId + "\", \"action\": \"view_property\"}";
            notification.setMetadata(enhancedMetadata);
        } else {
            notification.setMetadata(metadata);
        }
        
        if (status == Notification.NotificationStatus.READ) {
            notification.setReadAt(createdAt.plusDays(1));
        }
        
        notificationRepository.persist(notification);
    }

    /**
     * Enviar notificación por email
     */
    private void sendEmailNotification(Notification notification, String email) {
        try {
            emailService.sendNotificationEmail(email, notification.getTitle(), notification.getMessage());
            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.persist(notification);
        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepository.persist(notification);
            System.err.println("Error sending email notification: " + e.getMessage());
        }
    }


}
