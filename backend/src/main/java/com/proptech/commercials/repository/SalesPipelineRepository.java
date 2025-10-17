package com.proptech.commercials.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.List;

import com.proptech.commercials.entity.SalesPipeline;

import java.math.BigDecimal;

@ApplicationScoped
public class SalesPipelineRepository implements PanacheRepository<SalesPipeline> {

    // Obtener pipeline por agente
    public List<SalesPipeline> findByAgentId(Long agentId) {
        return find("agentId", agentId).list();
    }

    // Obtener pipeline por etapa
    public List<SalesPipeline> findByStage(String stage) {
        return find("stage", stage).list();
    }

    // Obtener pipeline por agente y etapa
    public List<SalesPipeline> findByAgentIdAndStage(Long agentId, String stage) {
        return find("agentId = ?1 and stage = ?2", agentId, stage).list();
    }

    // Obtener pipeline activo (no cerrado)
    public List<SalesPipeline> findActivePipeline() {
        return find("stage not in ('CLOSED_WON', 'CLOSED_LOST')").list();
    }

    // Obtener pipeline por agente activo
    public List<SalesPipeline> findActivePipelineByAgent(Long agentId) {
        return find("agentId = ?1 and stage not in ('CLOSED_WON', 'CLOSED_LOST')", agentId).list();
    }

    // Obtener leads por fuente
    public List<SalesPipeline> findBySource(String source) {
        return find("source", source).list();
    }

    // Obtener leads por prioridad
    public List<SalesPipeline> findByPriority(String priority) {
        return find("priority", priority).list();
    }

    // Obtener leads que necesitan seguimiento (sin contacto reciente)
    public List<SalesPipeline> findLeadsNeedingFollowUp(int daysThreshold) {
        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(daysThreshold);
        return find("lastContactDate < ?1 or lastContactDate is null", thresholdDate).list();
    }

    // Obtener leads con próximas acciones
    public List<SalesPipeline> findLeadsWithUpcomingActions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        return find("nextActionDate between ?1 and ?2", now, tomorrow).list();
    }

    // Contar leads por etapa
    public Long countByStage(String stage) {
        return count("stage", stage);
    }

    // Contar leads por agente
    public Long countByAgentId(Long agentId) {
        return count("agentId", agentId);
    }

    // Obtener valor total del pipeline por agente
    public BigDecimal getTotalPipelineValueByAgent(Long agentId) {
        List<SalesPipeline> pipeline = findByAgentId(agentId);
        return pipeline.stream()
                .map(SalesPipeline::getExpectedValue)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Obtener valor total del pipeline por etapa
    public BigDecimal getTotalPipelineValueByStage(String stage) {
        List<SalesPipeline> pipeline = findByStage(stage);
        return pipeline.stream()
                .map(SalesPipeline::getExpectedValue)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Obtener leads cerrados en un período
    public List<SalesPipeline> findClosedLeadsInPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        return find("closedAt between ?1 and ?2", startDate, endDate).list();
    }

    // Obtener leads ganados en un período
    public List<SalesPipeline> findWonLeadsInPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        return find("stage = 'CLOSED_WON' and closedAt between ?1 and ?2", startDate, endDate).list();
    }

    // Obtener leads perdidos en un período
    public List<SalesPipeline> findLostLeadsInPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        return find("stage = 'CLOSED_LOST' and closedAt between ?1 and ?2", startDate, endDate).list();
    }

    // Obtener leads por propiedad
    public List<SalesPipeline> findByPropertyId(Long propertyId) {
        return find("propertyId", propertyId).list();
    }

    // Obtener leads con alta probabilidad
    public List<SalesPipeline> findHighProbabilityLeads(int minProbability) {
        return find("probability >= ?1", minProbability).list();
    }

    // Obtener leads urgentes
    public List<SalesPipeline> findUrgentLeads() {
        return find("priority = 'URGENT'").list();
    }

    // Obtener leads por tags (búsqueda en JSON)
    public List<SalesPipeline> findByTag(String tag) {
        return find("tags like ?1", "%" + tag + "%").list();
    }

    // Obtener estadísticas de conversión por agente
    public List<Object[]> getConversionStatsByAgent() {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        sp.agentId,
                        COUNT(sp.id) as totalLeads,
                        COUNT(CASE WHEN sp.stage = 'CLOSED_WON' THEN 1 END) as wonLeads,
                        COUNT(CASE WHEN sp.stage = 'CLOSED_LOST' THEN 1 END) as lostLeads,
                        AVG(sp.probability) as avgProbability,
                        SUM(sp.expectedValue) as totalValue
                    FROM SalesPipeline sp
                    GROUP BY sp.agentId
                    """, Object[].class)
                .getResultList();
    }

    // Obtener estadísticas de conversión por fuente
    public List<Object[]> getConversionStatsBySource() {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        sp.source,
                        COUNT(sp.id) as totalLeads,
                        COUNT(CASE WHEN sp.stage = 'CLOSED_WON' THEN 1 END) as wonLeads,
                        COUNT(CASE WHEN sp.stage = 'CLOSED_LOST' THEN 1 END) as lostLeads,
                        AVG(sp.probability) as avgProbability,
                        SUM(sp.expectedValue) as totalValue
                    FROM SalesPipeline sp
                    WHERE sp.source IS NOT NULL
                    GROUP BY sp.source
                    """, Object[].class)
                .getResultList();
    }

    // Obtener velocidad de etapas (días promedio por etapa)
    public List<Object[]> getStageVelocity() {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        sp.stage,
                        AVG(sp.daysInPipeline) as avgDays,
                        COUNT(sp.id) as leadCount
                    FROM SalesPipeline sp
                    WHERE sp.daysInPipeline IS NOT NULL
                    GROUP BY sp.stage
                    ORDER BY sp.stage
                    """, Object[].class)
                .getResultList();
    }

    // Métodos adicionales para el servicio
    public List<SalesPipeline> findByLastContactDateBefore(LocalDateTime date) {
        return find("lastContactDate < ?1 or lastContactDate is null", date).list();
    }

    public List<SalesPipeline> findByNextActionDateBefore(LocalDateTime date) {
        return find("nextActionDate < ?1", date).list();
    }

    public List<SalesPipeline> findByProbabilityGreaterThan(int probability) {
        return find("probability > ?1", probability).list();
    }
} 