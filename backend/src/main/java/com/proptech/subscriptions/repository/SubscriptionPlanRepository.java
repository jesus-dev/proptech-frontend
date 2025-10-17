package com.proptech.subscriptions.repository;

import com.proptech.subscriptions.entity.SubscriptionPlan;
import com.proptech.subscriptions.enums.SubscriptionType;
import com.proptech.subscriptions.enums.SubscriptionTier;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para SubscriptionPlan
 */
@ApplicationScoped
public class SubscriptionPlanRepository implements PanacheRepository<SubscriptionPlan> {
    
    /**
     * Buscar planes activos
     */
    public List<SubscriptionPlan> findActivePlans() {
        return list("isActive", true);
    }
    
    /**
     * Buscar planes por tipo
     */
    public List<SubscriptionPlan> findByType(SubscriptionType type) {
        return list("type = ?1 and isActive = true", type);
    }
    
    /**
     * Buscar plan por tipo y tier
     */
    public Optional<SubscriptionPlan> findByTypeAndTier(SubscriptionType type, SubscriptionTier tier) {
        return find("type = ?1 and tier = ?2 and isActive = true", type, tier).firstResultOptional();
    }
    
    /**
     * Buscar planes de PropTech ordenados por precio
     */
    public List<SubscriptionPlan> findPropTechPlansOrderByPrice() {
        return find("type = ?1 and isActive = true order by price asc", SubscriptionType.PROPTECH).list();
    }
    
    /**
     * Buscar plan de Network
     */
    public Optional<SubscriptionPlan> findNetworkPlan() {
        return find("type = ?1 and isActive = true", SubscriptionType.NETWORK).firstResultOptional();
    }
    
    /**
     * Buscar plan por nombre
     */
    public Optional<SubscriptionPlan> findByName(String name) {
        return find("name = ?1", name).firstResultOptional();
    }
    
    /**
     * Contar planes activos por tipo
     */
    public long countByType(SubscriptionType type) {
        return count("type = ?1 and isActive = true", type);
    }
}
