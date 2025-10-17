package com.proptech.subscriptions.repository;

import com.proptech.subscriptions.entity.SalesAgent;
import com.proptech.subscriptions.enums.SalesAgentStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para SalesAgent
 */
@ApplicationScoped
public class SalesAgentRepository implements PanacheRepository<SalesAgent> {
    
    /**
     * Buscar agentes activos
     */
    public List<SalesAgent> findActiveAgents() {
        return list("status", SalesAgentStatus.ACTIVE);
    }
    
    /**
     * Buscar agente por código
     */
    public Optional<SalesAgent> findByAgentCode(String agentCode) {
        return find("agentCode", agentCode).firstResultOptional();
    }
    
    /**
     * Buscar agente por usuario
     */
    public Optional<SalesAgent> findByUserId(Long userId) {
        return find("user.id", userId).firstResultOptional();
    }
    
    /**
     * Buscar agentes por estado
     */
    public List<SalesAgent> findByStatus(SalesAgentStatus status) {
        return list("status", status);
    }
    
    /**
     * Buscar agente por email
     */
    public Optional<SalesAgent> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
    
    /**
     * Buscar agentes ordenados por ventas totales
     */
    public List<SalesAgent> findTopPerformers(int limit) {
        return find("status = ?1 order by totalSales desc", SalesAgentStatus.ACTIVE)
                .page(0, limit)
                .list();
    }
    
    /**
     * Contar agentes activos
     */
    public long countActiveAgents() {
        return count("status", SalesAgentStatus.ACTIVE);
    }
    
    /**
     * Verificar si existe un agente con el código
     */
    public boolean existsByAgentCode(String agentCode) {
        return count("agentCode", agentCode) > 0;
    }
    
    /**
     * Verificar si existe un agente para el usuario
     */
    public boolean existsByUserId(Long userId) {
        return count("user.id", userId) > 0;
    }
}
