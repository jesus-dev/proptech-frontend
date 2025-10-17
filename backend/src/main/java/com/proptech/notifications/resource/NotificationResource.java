package com.proptech.notifications.resource;

import com.proptech.notifications.entity.Notification;
import com.proptech.notifications.service.NotificationService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationResource {

    /**
     * Endpoint de prueba para verificar que el servicio funciona
     */
    @GET
    @Path("/test")
    public Response test() {
        return Response.ok(Map.of("message", "Notification service is working")).build();
    }

    /**
     * Endpoint de debug para ver todas las notificaciones
     */
    @GET
    @Path("/debug/all")
    public Response debugAllNotifications() {
        try {
            List<Notification> allNotifications = notificationService.getAllNotifications(1L); // Usar userId 1 como prueba
            return Response.ok(Map.of(
                "total", allNotifications.size(),
                "notifications", allNotifications
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Endpoint de debug para ver todas las notificaciones sin filtro
     */
    @GET
    @Path("/debug/raw")
    public Response debugRawNotifications() {
        try {
            // Usar el repositorio directamente para ver todas las notificaciones
            List<Notification> allNotifications = Notification.listAll();
            return Response.ok(Map.of(
                "total", allNotifications.size(),
                "notifications", allNotifications
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Endpoint para migrar notificaciones de agentId a userId
     */
    @POST
    @Path("/migrate")
    @Transactional
    public Response migrateNotifications() {
        try {
            // Obtener todas las notificaciones que tienen agentId pero no userId
            List<Notification> notificationsToMigrate = Notification.find(
                "agentId IS NOT NULL AND userId IS NULL"
            ).list();
            
            int migratedCount = 0;
            for (Notification notification : notificationsToMigrate) {
                notification.setUserId(notification.getAgentId());
                notification.persist();
                migratedCount++;
            }
            
            return Response.ok(Map.of(
                "success", true,
                "message", "Migración completada",
                "migratedCount", migratedCount,
                "totalNotifications", Notification.count()
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al migrar notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    @Inject
    NotificationService notificationService;

    /**
     * Obtener notificaciones no leídas de un usuario
     */
    @GET
    @Path("/user/{userId}/unread")
    public Response getUnreadNotifications(@PathParam("userId") Long userId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            return Response.ok(notifications).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Endpoint de compatibilidad temporal (fallback)
     */
    @GET
    @Path("/agent/{agentId}/unread")
    public Response getUnreadNotificationsLegacy(@PathParam("agentId") Long agentId) {
        try {
            // Usar agentId como userId temporalmente
            List<Notification> notifications = notificationService.getUnreadNotifications(agentId);
            return Response.ok(notifications).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Obtener todas las notificaciones de un usuario
     */
    @GET
    @Path("/user/{userId}")
    public Response getAllNotifications(@PathParam("userId") Long userId) {
        try {
            List<Notification> notifications = notificationService.getAllNotifications(userId);
            return Response.ok(notifications).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Obtener notificaciones con conteo optimizado (una sola consulta)
     */
    @GET
    @Path("/user/{userId}/optimized")
    public Response getNotificationsOptimized(@PathParam("userId") Long userId, @QueryParam("limit") @DefaultValue("50") int limit) {
        try {
            Map<String, Object> result = notificationService.getNotificationsWithCount(userId, limit);
            return Response.ok(result).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Obtener notificaciones paginadas para scroll infinito
     */
    @GET
    @Path("/user/{userId}/paginated")
    public Response getNotificationsPaginated(@PathParam("userId") Long userId, 
                                            @QueryParam("page") @DefaultValue("0") int page,
                                            @QueryParam("limit") @DefaultValue("20") int limit) {
        try {
            Map<String, Object> result = notificationService.getNotificationsPaginated(userId, page, limit);
            return Response.ok(result).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Marcar notificación como leída
     */
    @PUT
    @Path("/{notificationId}/read")
    public Response markAsRead(@PathParam("notificationId") Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return Response.ok(Map.of("success", true)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al marcar notificación: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    @PUT
    @Path("/user/{userId}/read-all")
    public Response markAllAsRead(@PathParam("userId") Long userId) {
        try {
            notificationService.markAllAsRead(userId);
            return Response.ok(Map.of("success", true)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al marcar notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Obtener estadísticas de notificaciones
     */
    @GET
    @Path("/user/{userId}/stats")
    public Response getNotificationStats(@PathParam("userId") Long userId) {
        try {
            Map<String, Object> stats = notificationService.getNotificationStats(userId);
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener estadísticas: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Eliminar notificación
     */
    @DELETE
    @Path("/{notificationId}")
    public Response deleteNotification(@PathParam("notificationId") Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return Response.ok(Map.of("success", true)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al eliminar notificación: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Eliminar todas las notificaciones de un usuario
     */
    @DELETE
    @Path("/user/{userId}")
    public Response deleteAllNotifications(@PathParam("userId") Long userId) {
        try {
            notificationService.deleteAllNotifications(userId);
            return Response.ok(Map.of("success", true)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al eliminar notificaciones: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Crear notificaciones de prueba para un usuario
     */
    @POST
    @Path("/user/{userId}/seed")
    @Transactional
    public Response createTestNotifications(@PathParam("userId") Long userId) {
        try {
            notificationService.createTestNotifications(userId);
            return Response.ok(Map.of("success", true, "message", "Notificaciones de prueba creadas exitosamente")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al crear notificaciones de prueba: " + e.getMessage()))
                    .build();
        }
    }
} 