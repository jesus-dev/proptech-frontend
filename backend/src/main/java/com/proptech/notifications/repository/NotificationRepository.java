package com.proptech.notifications.repository;

import com.proptech.notifications.entity.Notification;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@ApplicationScoped
public class NotificationRepository implements PanacheRepository<Notification> {

    @Inject
    EntityManager entityManager;

    /**
     * Encontrar notificación por ID
     */
    public Notification findById(Long id) {
        return find("id", id).firstResult();
    }

    /**
     * Obtener notificaciones no leídas para un usuario
     */
    public List<Notification> findUnreadByUserId(Long userId) {
        return find("userId = ?1 and status != ?2 order by createdAt desc", 
                   userId, Notification.NotificationStatus.READ)
                   .page(0, 50) // Límite de 50 notificaciones
                   .list();
    }

    /**
     * Obtener todas las notificaciones de un usuario
     */
    public List<Notification> findByUserId(Long userId) {
        return find("userId = ?1 order by createdAt desc", userId)
                   .page(0, 100) // Límite de 100 notificaciones
                   .list();
    }

    /**
     * Obtener notificaciones de un agente por tipo
     */
    public List<Notification> findByAgentIdAndType(Long agentId, Notification.NotificationType type) {
        return find("agentId = ?1 and type = ?2 order by createdAt desc", agentId, type).list();
    }

    /**
     * Contar notificaciones totales de un usuario
     */
    public long countByUserId(Long userId) {
        return count("userId", userId);
    }

    /**
     * Contar notificaciones no leídas de un usuario
     */
    public long countUnreadByUserId(Long userId) {
        return count("userId = ?1 and status != ?2", userId, Notification.NotificationStatus.READ);
    }

    /**
     * Contar notificaciones de hoy de un usuario
     */
    public long countTodayByUserId(Long userId) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        return count("userId = ?1 and createdAt >= ?2", userId, today);
    }

    /**
     * Obtener notificaciones recientes (últimas 24 horas)
     */
    public List<Notification> findRecentByUserId(Long userId) {
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
        return find("userId = ?1 and createdAt >= ?2 order by createdAt desc", 
                   userId, yesterday).list();
    }

    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    public void markAllAsRead(Long userId) {
        entityManager.createQuery(
            "UPDATE Notification n SET n.status = :status, n.readAt = :readAt " +
            "WHERE n.userId = :userId AND n.status != :status")
            .setParameter("status", Notification.NotificationStatus.READ)
            .setParameter("readAt", LocalDateTime.now())
            .setParameter("userId", userId)
            .executeUpdate();
    }

    /**
     * Eliminar notificaciones antiguas (más de 30 días)
     */
    public void deleteOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        entityManager.createQuery(
            "DELETE FROM Notification n WHERE n.createdAt < :date")
            .setParameter("date", thirtyDaysAgo)
            .executeUpdate();
    }

    /**
     * Obtener estadísticas de notificaciones por tipo
     */
    public List<Object[]> getNotificationStatsByType(Long userId) {
        return entityManager.createQuery(
            "SELECT n.type, COUNT(n), COUNT(CASE WHEN n.status = 'READ' THEN 1 END) " +
            "FROM Notification n WHERE n.userId = :userId " +
            "GROUP BY n.type", Object[].class)
            .setParameter("userId", userId)
            .getResultList();
    }

    /**
     * Eliminar todas las notificaciones de un usuario
     */
    public void deleteAllByUserId(Long userId) {
        entityManager.createQuery(
            "DELETE FROM Notification n WHERE n.userId = :userId")
            .setParameter("userId", userId)
            .executeUpdate();
    }

    /**
     * Obtener notificaciones con conteo optimizado (una sola consulta)
     */
    public Map<String, Object> findNotificationsWithCount(Long userId, int limit) {
        // Obtener notificaciones no leídas
        List<Notification> unreadNotifications = find("userId = ?1 and status != ?2 order by createdAt desc", 
            userId, Notification.NotificationStatus.READ)
            .page(0, limit)
            .list();
        
        // Obtener todas las notificaciones para el conteo total
        List<Notification> allNotifications = find("userId = ?1 order by createdAt desc", userId)
            .page(0, limit)
            .list();
        
        // Contar no leídas
        long unreadCount = count("userId = ?1 and status != ?2", userId, Notification.NotificationStatus.READ);
        
        Map<String, Object> result = new HashMap<>();
        result.put("notifications", unreadNotifications); // Solo no leídas
        result.put("unreadCount", unreadCount);
        result.put("totalCount", allNotifications.size());
        
        return result;
    }

    /**
     * Obtener notificaciones paginadas
     */
    public Map<String, Object> findNotificationsPaginated(Long userId, int page, int limit) {
        // Obtener notificaciones paginadas
        List<Notification> notifications = find("userId = ?1 order by createdAt desc", userId)
            .page(page, limit)
            .list();
        
        // Contar total de notificaciones
        long totalCount = count("userId", userId);
        
        // Contar no leídas
        long unreadCount = count("userId = ?1 and status != ?2", userId, Notification.NotificationStatus.READ);
        
        // Calcular si hay más páginas
        boolean hasMore = (page + 1) * limit < totalCount;
        
        Map<String, Object> result = new HashMap<>();
        result.put("notifications", notifications);
        result.put("unreadCount", unreadCount);
        result.put("totalCount", totalCount);
        result.put("currentPage", page);
        result.put("hasMore", hasMore);
        result.put("nextPage", hasMore ? page + 1 : null);
        
        return result;
    }

    // Métodos para trabajar con agentId (agregados para compatibilidad con NotificationService)

    /**
     * Eliminar todas las notificaciones de un agente
     */
    public void deleteAllByAgentId(Long agentId) {
        entityManager.createQuery(
            "DELETE FROM Notification n WHERE n.agentId = :agentId")
            .setParameter("agentId", agentId)
            .executeUpdate();
    }

    /**
     * Contar notificaciones totales de un agente
     */
    public long countByAgentId(Long agentId) {
        return count("agentId", agentId);
    }

    /**
     * Contar notificaciones no leídas de un agente
     */
    public long countUnreadByAgentId(Long agentId) {
        return count("agentId = ?1 and status != ?2", agentId, Notification.NotificationStatus.READ);
    }

    /**
     * Contar notificaciones de hoy de un agente
     */
    public long countTodayByAgentId(Long agentId) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        return count("agentId = ?1 and createdAt >= ?2", agentId, today);
    }
}
