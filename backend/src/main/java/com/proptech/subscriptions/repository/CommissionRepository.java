package com.proptech.subscriptions.repository;

import com.proptech.subscriptions.entity.Commission;
import com.proptech.subscriptions.enums.CommissionStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para Commission
 */
@ApplicationScoped
public class CommissionRepository implements PanacheRepository<Commission> {
    
    /**
     * Buscar comisiones por agente de ventas
     */
    public List<Commission> findBySalesAgentId(Long salesAgentId) {
        return list("salesAgent.id = ?1 order by saleDate desc", salesAgentId);
    }
    
    /**
     * Buscar comisiones por agente y estado
     */
    public List<Commission> findBySalesAgentIdAndStatus(Long salesAgentId, CommissionStatus status) {
        return list("salesAgent.id = ?1 and status = ?2 order by saleDate desc", salesAgentId, status);
    }
    
    /**
     * Buscar comisiones pendientes por agente
     */
    public List<Commission> findPendingBySalesAgentId(Long salesAgentId) {
        return findBySalesAgentIdAndStatus(salesAgentId, CommissionStatus.PENDING);
    }
    
    /**
     * Buscar comisiones por suscripción
     */
    public Optional<Commission> findByUserSubscriptionId(Long userSubscriptionId) {
        return find("userSubscription.id", userSubscriptionId).firstResultOptional();
    }
    
    /**
     * Buscar comisiones por estado
     */
    public List<Commission> findByStatus(CommissionStatus status) {
        return list("status = ?1 order by saleDate desc", status);
    }
    
    /**
     * Buscar comisiones pendientes
     */
    public List<Commission> findPendingCommissions() {
        return findByStatus(CommissionStatus.PENDING);
    }
    
    /**
     * Buscar comisiones en un rango de fechas
     */
    public List<Commission> findBySaleDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return find("saleDate >= ?1 and saleDate <= ?2 order by saleDate desc", startDate, endDate).list();
    }
    
    /**
     * Buscar comisiones del agente en un rango de fechas
     */
    public List<Commission> findBySalesAgentAndDateRange(Long salesAgentId, LocalDateTime startDate, LocalDateTime endDate) {
        return find("salesAgent.id = ?1 and saleDate >= ?2 and saleDate <= ?3 order by saleDate desc", 
                   salesAgentId, startDate, endDate).list();
    }
    
    /**
     * Calcular total de comisiones pendientes por agente
     */
    public BigDecimal calculatePendingCommissionsBySalesAgent(Long salesAgentId) {
        Object result = find("select sum(commissionAmount) from Commission where salesAgent.id = ?1 and status = ?2", 
                           salesAgentId, CommissionStatus.PENDING)
                .project(BigDecimal.class)
                .firstResult();
        return result != null ? (BigDecimal) result : BigDecimal.ZERO;
    }
    
    /**
     * Calcular total de comisiones pagadas por agente
     */
    public BigDecimal calculatePaidCommissionsBySalesAgent(Long salesAgentId) {
        Object result = find("select sum(commissionAmount) from Commission where salesAgent.id = ?1 and status = ?2", 
                           salesAgentId, CommissionStatus.PAID)
                .project(BigDecimal.class)
                .firstResult();
        return result != null ? (BigDecimal) result : BigDecimal.ZERO;
    }
    
    /**
     * Contar comisiones por agente
     */
    public long countBySalesAgentId(Long salesAgentId) {
        return count("salesAgent.id", salesAgentId);
    }
    
    /**
     * Contar comisiones pendientes
     */
    public long countPendingCommissions() {
        return count("status", CommissionStatus.PENDING);
    }
}
