package com.proptech.commercials.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.List;

import com.proptech.commercials.entity.SalesAnalytics;

@ApplicationScoped
public class SalesAnalyticsRepository implements PanacheRepository<SalesAnalytics> {

    // Obtener analytics por agente
    public List<SalesAnalytics> findByAgentId(Long agentId) {
        return find("agentId", agentId).list();
    }

    // Obtener analytics por fecha
    public List<SalesAnalytics> findByDate(LocalDateTime date) {
        return find("date", date).list();
    }

    // Obtener analytics por período
    public List<SalesAnalytics> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return find("date between ?1 and ?2", startDate, endDate).list();
    }

    // Obtener analytics por agente y período
    public List<SalesAnalytics> findByAgentIdAndDateRange(Long agentId, LocalDateTime startDate, LocalDateTime endDate) {
        return find("agentId = ?1 and date between ?2 and ?3", agentId, startDate, endDate).list();
    }

    // Obtener analytics por etapa
    public List<SalesAnalytics> findByStage(String stage) {
        return find("stage", stage).list();
    }

    // Obtener analytics por agente y etapa
    public List<SalesAnalytics> findByAgentIdAndStage(Long agentId, String stage) {
        return find("agentId = ?1 and stage = ?2", agentId, stage).list();
    }

    // Obtener analytics más recientes
    public List<SalesAnalytics> findLatestAnalytics(int limit) {
        return find("order by date desc").range(0, limit - 1).list();
    }

    // Obtener analytics más recientes por agente
    public List<SalesAnalytics> findLatestAnalyticsByAgent(Long agentId, int limit) {
        return find("agentId = ?1 order by date desc", agentId).range(0, limit - 1).list();
    }

    // Obtener analytics diarios por período
    public List<SalesAnalytics> findDailyAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        return find("date between ?1 and ?2 order by date", startDate, endDate).list();
    }

    // Obtener analytics semanales por período
    public List<Object[]> findWeeklyAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        YEAR(sa.date) as year,
                        WEEK(sa.date) as week,
                        AVG(sa.leadsCount) as avgLeadsCount,
                        AVG(sa.conversionRate) as avgConversionRate,
                        AVG(sa.avgDealSize) as avgDealSize,
                        SUM(sa.totalPipelineValue) as totalPipelineValue,
                        SUM(sa.closedWonCount) as totalClosedWon,
                        SUM(sa.closedLostCount) as totalClosedLost,
                        AVG(sa.avgDaysToClose) as avgDaysToClose,
                        AVG(sa.winRate) as avgWinRate,
                        SUM(sa.revenueGenerated) as totalRevenue,
                        SUM(sa.commissionGenerated) as totalCommission
                    FROM SalesAnalytics sa
                    WHERE sa.date between ?1 and ?2
                    GROUP BY YEAR(sa.date), WEEK(sa.date)
                    ORDER BY year, week
                    """, Object[].class)
                .setParameter(1, startDate)
                .setParameter(2, endDate)
                .getResultList();
    }

    // Obtener analytics mensuales por período
    public List<Object[]> findMonthlyAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        YEAR(sa.date) as year,
                        MONTH(sa.date) as month,
                        AVG(sa.leadsCount) as avgLeadsCount,
                        AVG(sa.conversionRate) as avgConversionRate,
                        AVG(sa.avgDealSize) as avgDealSize,
                        SUM(sa.totalPipelineValue) as totalPipelineValue,
                        SUM(sa.closedWonCount) as totalClosedWon,
                        SUM(sa.closedLostCount) as totalClosedLost,
                        AVG(sa.avgDaysToClose) as avgDaysToClose,
                        AVG(sa.winRate) as avgWinRate,
                        SUM(sa.revenueGenerated) as totalRevenue,
                        SUM(sa.commissionGenerated) as totalCommission
                    FROM SalesAnalytics sa
                    WHERE sa.date between ?1 and ?2
                    GROUP BY YEAR(sa.date), MONTH(sa.date)
                    ORDER BY year, month
                    """, Object[].class)
                .setParameter(1, startDate)
                .setParameter(2, endDate)
                .getResultList();
    }

    // Obtener top performers por período
    public List<Object[]> findTopPerformers(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        sa.agentId,
                        SUM(sa.leadsCount) as totalLeads,
                        AVG(sa.conversionRate) as avgConversionRate,
                        SUM(sa.closedWonCount) as totalWon,
                        SUM(sa.revenueGenerated) as totalRevenue,
                        SUM(sa.commissionGenerated) as totalCommission,
                        AVG(sa.winRate) as avgWinRate
                    FROM SalesAnalytics sa
                    WHERE sa.date between ?1 and ?2
                    GROUP BY sa.agentId
                    ORDER BY totalRevenue DESC
                    """, Object[].class)
                .setParameter(1, startDate)
                .setParameter(2, endDate)
                .setMaxResults(limit)
                .getResultList();
    }

    // Obtener tendencias de conversión
    public List<Object[]> findConversionTrends(LocalDateTime startDate, LocalDateTime endDate) {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        DATE(sa.date) as date,
                        AVG(sa.conversionRate) as avgConversionRate,
                        AVG(sa.winRate) as avgWinRate,
                        SUM(sa.closedWonCount) as totalWon,
                        SUM(sa.closedLostCount) as totalLost
                    FROM SalesAnalytics sa
                    WHERE sa.date between ?1 and ?2
                    GROUP BY DATE(sa.date)
                    ORDER BY date
                    """, Object[].class)
                .setParameter(1, startDate)
                .setParameter(2, endDate)
                .getResultList();
    }

    // Obtener análisis de fuentes
    public List<Object[]> findSourceAnalysis(LocalDateTime startDate, LocalDateTime endDate) {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        sp.source,
                        COUNT(sp.id) as totalLeads,
                        COUNT(CASE WHEN sp.stage = 'CLOSED_WON' THEN 1 END) as wonLeads,
                        COUNT(CASE WHEN sp.stage = 'CLOSED_LOST' THEN 1 END) as lostLeads,
                        AVG(sp.probability) as avgProbability,
                        SUM(sp.expectedValue) as totalValue,
                        AVG(sp.daysInPipeline) as avgDaysInPipeline
                    FROM SalesPipeline sp
                    WHERE sp.createdAt between ?1 and ?2 and sp.source IS NOT NULL
                    GROUP BY sp.source
                    ORDER BY totalLeads DESC
                    """, Object[].class)
                .setParameter(1, startDate)
                .setParameter(2, endDate)
                .getResultList();
    }

    // Obtener análisis de etapas
    public List<Object[]> findStageAnalysis(LocalDateTime startDate, LocalDateTime endDate) {
        return getEntityManager()
                .createQuery("""
                    SELECT 
                        sp.stage,
                        COUNT(sp.id) as leadCount,
                        AVG(sp.probability) as avgProbability,
                        SUM(sp.expectedValue) as totalValue,
                        AVG(sp.daysInPipeline) as avgDaysInPipeline,
                        COUNT(CASE WHEN sp.priority = 'HIGH' OR sp.priority = 'URGENT' THEN 1 END) as highPriorityCount
                    FROM SalesPipeline sp
                    WHERE sp.createdAt between ?1 and ?2
                    GROUP BY sp.stage
                    ORDER BY sp.stage
                    """, Object[].class)
                .setParameter(1, startDate)
                .setParameter(2, endDate)
                .getResultList();
    }
} 