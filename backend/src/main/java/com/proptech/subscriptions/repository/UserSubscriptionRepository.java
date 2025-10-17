package com.proptech.subscriptions.repository;

import com.proptech.subscriptions.entity.UserSubscription;
import com.proptech.subscriptions.enums.SubscriptionStatus;
import com.proptech.subscriptions.enums.SubscriptionType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para UserSubscription
 */
@ApplicationScoped
public class UserSubscriptionRepository implements PanacheRepository<UserSubscription> {
    
    /**
     * Buscar suscripción activa del usuario
     */
    public Optional<UserSubscription> findActiveSubscriptionByUserId(Long userId) {
        return find("user.id = ?1 and status = ?2", userId, SubscriptionStatus.ACTIVE)
                .firstResultOptional();
    }
    
    /**
     * Buscar suscripción activa del usuario por tipo
     */
    public Optional<UserSubscription> findActiveSubscriptionByUserIdAndType(Long userId, SubscriptionType type) {
        return find("user.id = ?1 and status = ?2 and subscriptionPlan.type = ?3", 
                   userId, SubscriptionStatus.ACTIVE, type)
                .firstResultOptional();
    }
    
    /**
     * Buscar todas las suscripciones del usuario
     */
    public List<UserSubscription> findByUserId(Long userId) {
        return list("user.id = ?1 order by createdAt desc", userId);
    }
    
    /**
     * Buscar suscripciones activas del usuario
     */
    public List<UserSubscription> findActiveSubscriptionsByUserId(Long userId) {
        return list("user.id = ?1 and status = ?2", userId, SubscriptionStatus.ACTIVE);
    }
    
    /**
     * Buscar suscripciones por estado
     */
    public List<UserSubscription> findByStatus(SubscriptionStatus status) {
        return list("status = ?1 order by createdAt desc", status);
    }
    
    /**
     * Buscar suscripciones que expiran pronto
     */
    public List<UserSubscription> findExpiringSubscriptions(LocalDateTime beforeDate) {
        return find("status = ?1 and endDate <= ?2 and endDate > ?3", 
                   SubscriptionStatus.ACTIVE, beforeDate, LocalDateTime.now())
                .list();
    }
    
    /**
     * Buscar suscripciones vencidas
     */
    public List<UserSubscription> findExpiredSubscriptions() {
        return find("status = ?1 and endDate < ?2", 
                   SubscriptionStatus.ACTIVE, LocalDateTime.now())
                .list();
    }
    
    /**
     * Buscar suscripciones para renovar automáticamente
     */
    public List<UserSubscription> findSubscriptionsForAutoRenewal(LocalDateTime beforeDate) {
        return find("status = ?1 and autoRenew = true and nextBillingDate <= ?2", 
                   SubscriptionStatus.ACTIVE, beforeDate)
                .list();
    }
    
    /**
     * Verificar si el usuario tiene suscripción activa
     */
    public boolean hasActiveSubscription(Long userId) {
        return count("user.id = ?1 and status = ?2", userId, SubscriptionStatus.ACTIVE) > 0;
    }
    
    /**
     * Verificar si el usuario tiene suscripción activa de un tipo específico
     */
    public boolean hasActiveSubscriptionOfType(Long userId, SubscriptionType type) {
        return count("user.id = ?1 and status = ?2 and subscriptionPlan.type = ?3", 
                    userId, SubscriptionStatus.ACTIVE, type) > 0;
    }
    
    /**
     * Contar suscripciones activas
     */
    public long countActiveSubscriptions() {
        return count("status = ?1", SubscriptionStatus.ACTIVE);
    }
    
    /**
     * Contar suscripciones activas por tipo
     */
    public long countActiveSubscriptionsByType(SubscriptionType type) {
        return count("status = ?1 and subscriptionPlan.type = ?2", SubscriptionStatus.ACTIVE, type);
    }
}
